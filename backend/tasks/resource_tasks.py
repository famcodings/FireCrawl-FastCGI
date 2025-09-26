"""Celery tasks for resource processing operations."""
import time
import json
import redis
from celery import current_task
from celery_app import celery_app
from services.firecrawl_service import firecrawl_service
from services.redis_service import redis_service
from config import config
from models import ResourceStatus
from database import get_db
from sqlalchemy.orm import Session
from datetime import datetime


def notify_websocket(request_id: str, message_type: str, payload: dict):
    """Notify WebSocket via Redis pub/sub."""
    try:
        redis_client = redis.from_url(config.REDIS_URL)
        message = {
            'request_id': request_id,
            'type': message_type,
            'payload': payload
        }
        redis_client.publish('websocket_notifications', json.dumps(message))
    except Exception as e:
        print(f"Error notifying WebSocket: {e}")


# Import database utility functions
from utils.database_utils import update_url_resource, update_document_resource


@celery_app.task(bind=True, name='process_url_resource')
def process_url_resource_task(self, job_id: str, request_id: str, url_id: int):
    """Celery task for processing URL resources."""
    try:
        # Update task status
        self.update_state(state='PROGRESS', meta={'status': 'processing'})
        notify_websocket(request_id, 'status', {'status': 'processing'})
        
        # Poll Firecrawl status
        while True:
            status_result = firecrawl_service.get_extract_status(job_id)
            
            if not status_result["success"]:
                error_msg = status_result["error"]
                update_url_resource(url_id, status=ResourceStatus.FAILED.value, set_last_analysis=True)
                notify_websocket(request_id, 'error', error_msg)
                raise Exception(error_msg)
            
            status = status_result["status"]
            
            if status == "completed":
                extract_data = status_result["data"]
                if extract_data:
                    result = firecrawl_service.parse_extract_data(extract_data)
                    result_dict = result.dict()
                    
                    # Update database
                    update_url_resource(url_id, status=ResourceStatus.READY.value, extracted_data=json.dumps(result_dict), set_last_analysis=True)
                    
                    # Store result in Redis
                    redis_service.store_result_sync(request_id, result_dict)
                    
                    # Notify WebSocket
                    notify_websocket(request_id, 'result', result_dict)
                    
                    return
                else:
                    error_msg = "No data returned from Firecrawl"
                    update_url_resource(url_id, status=ResourceStatus.FAILED.value, set_last_analysis=True)
                    notify_websocket(request_id, 'error', error_msg)
                    raise Exception(error_msg)
            
            elif status == "failed":
                error_msg = status_result["error"] or "Unknown error"
                update_url_resource(url_id, status=ResourceStatus.FAILED.value, set_last_analysis=True)
                notify_websocket(request_id, 'error', error_msg)
                raise Exception(error_msg)
            
            # Update progress and notify WebSocket
            self.update_state(state='PROGRESS', meta={'status': status})
            notify_websocket(request_id, 'status', {'status': status})
            
            # Wait before next poll
            time.sleep(3)
            
    except Exception as exc:
        error_msg = str(exc)
        self.update_state(
            state='FAILURE', 
            meta={
                'error': error_msg,
                'exc_type': type(exc).__name__,
                'exc_message': error_msg
            }
        )
        update_url_resource(url_id, status=ResourceStatus.FAILED.value, set_last_analysis=True)
        notify_websocket(request_id, 'error', error_msg)
        
        # Store error in Redis
        try:
            redis_service.store_error_sync(request_id, error_msg)
        except Exception as e:
            print(f"Error storing error in Redis: {e}")
        
        return


@celery_app.task(bind=True, name='process_document_resource')
def process_document_resource_task(self, document_id: int, request_id: str):
    """Celery task for processing document resources."""
    try:
        # Update task status
        self.update_state(state='PROGRESS', meta={'status': 'processing'})
        notify_websocket(request_id, 'status', {'status': 'processing'})
        
        # Import services
        from services.document_reader_service import document_reader_service
        from services.grok_service import grok_service
        from models import Document
        from database import SessionLocal
        import os
        
        # PDF Analysis Questions
        PDF_ANALYSIS_QUESTIONS = [
            "What products or services does the company offer?",
            "What is the company's mission or core purpose?",
            "What unique value proposition or differentiator does the company highlight?",
            "Where is the company located or which regions do they serve?",
            "Who appears to be the ideal customer profile based on the document?",
            "Which industry or industries does the company operate within?",
        ]
        
        # Fetch document from database
        session = SessionLocal()
        try:
            doc_obj = session.get(Document, document_id)
            if not doc_obj:
                raise Exception(f"Document with ID {document_id} not found")
            
            # Get file path
            if not doc_obj.file_path:
                raise Exception("Document file path not found")
            
            full_path = os.path.join("uploads", doc_obj.file_path)
            if not os.path.exists(full_path):
                raise Exception(f"Document file not found at {full_path}")
            
            # Read file bytes
            with open(full_path, "rb") as handle:
                file_bytes = handle.read()
            
            # Extract text from document
            reader_result = document_reader_service.process_files([
                (file_bytes, doc_obj.original_filename or doc_obj.name or doc_obj.file_path)
            ])
            
            if not reader_result.get("success"):
                raise Exception(reader_result.get("error", "Failed to read document"))
            
            documents = reader_result.get("documents", [])
            document_content = "\n\n".join(doc.get("text", "") for doc in documents).strip()
            
            if not document_content:
                raise Exception("No readable text found in the uploaded document")
            
            # Analyze document with Groq
            analysis = grok_service.analyze_documents_with_questions(
                document_content,
                PDF_ANALYSIS_QUESTIONS,
            )
            
            if not analysis.success:
                raise Exception(analysis.error or "Failed to analyze document")
            
            # Prepare result
            result = {
                'document_id': document_id,
                'status': 'processed',
                'extracted_data': {
                    "responses": analysis.responses,
                    "processed_files": reader_result.get("processed_files", []),
                }
            }
            
            # Update database with extracted data
            update_document_resource(
                document_id, 
                status=ResourceStatus.READY.value, 
                extracted_data=json.dumps(result['extracted_data']),
                set_last_analysis=True
            )
            
        finally:
            session.close()
        
        # Store result in Redis
        redis_service.store_result_sync(request_id, result)
        
        # Notify WebSocket
        notify_websocket(request_id, 'result', result)
        
        return
        
    except Exception as exc:
        error_msg = str(exc)
        self.update_state(
            state='FAILURE', 
            meta={
                'error': error_msg,
                'exc_type': type(exc).__name__,
                'exc_message': error_msg
            }
        )
        notify_websocket(request_id, 'error', error_msg)
        
        # Update database
        update_document_resource(document_id, status=ResourceStatus.FAILED.value, set_last_analysis=True)
        
        # Store error in Redis
        try:
            redis_service.store_error_sync(request_id, error_msg)
        except Exception as e:
            print(f"Error storing error in Redis: {e}")
        
        return
