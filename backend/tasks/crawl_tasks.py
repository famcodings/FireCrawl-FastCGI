"""Celery tasks for website crawling operations."""
import time
import json
import redis
from celery import current_task
from celery_app import celery_app
from services.firecrawl_service import firecrawl_service
from services.redis_service import redis_service
from config import config


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


@celery_app.task(bind=True, name='crawl_website')
def crawl_website_task(self, job_id: str, request_id: str, url: str, company_name: str):
    """Celery task for website crawling."""
    try:
        # Update task status
        self.update_state(state='PROGRESS', meta={'status': 'processing'})
        notify_websocket(request_id, 'status', {'status': 'processing'})
        
        # Poll Firecrawl status
        while True:
            status_result = firecrawl_service.get_extract_status(job_id)
            
            if not status_result["success"]:
                error_msg = status_result["error"]
                notify_websocket(request_id, 'error', error_msg)
                raise Exception(error_msg)
            
            status = status_result["status"]
            print(f"Status check for {job_id}: {status}")
            
            if status == "completed":
                extract_data = status_result["data"]
                if extract_data:
                    result = firecrawl_service.parse_extract_data(extract_data)
                    result_dict = result.dict()
                    
                    # Store result in Redis (async operation in sync context)
                    redis_service.store_result_sync(request_id, result_dict)
                    
                    # Notify WebSocket
                    notify_websocket(request_id, 'result', result_dict)
                    
                    return
                else:
                    error_msg = "No data returned from Firecrawl"
                    notify_websocket(request_id, 'error', error_msg)
                    raise Exception(error_msg)
            
            elif status == "failed":
                error_msg = status_result["error"] or "Unknown error"
                notify_websocket(request_id, 'error', error_msg)
                raise Exception(error_msg)
            
            # Update progress and notify WebSocket
            self.update_state(state='PROGRESS', meta={'status': status})
            notify_websocket(request_id, 'status', {'status': status})
            
            # Wait before next poll
            time.sleep(3)
            
    except Exception as exc:
        error_msg = str(exc)
        # Update task state with proper error format
        self.update_state(
            state='FAILURE', 
            meta={
                'error': error_msg,
                'exc_type': type(exc).__name__,
                'exc_message': error_msg
            }
        )
        notify_websocket(request_id, 'error', error_msg)
        
        # Store error in Redis
        try:
            redis_service.store_error_sync(request_id, error_msg)
        except Exception as e:
            print(f"Error storing error in Redis: {e}")
        
        # Don't return anything since we're ignoring results
        return


@celery_app.task(bind=True, name='poll_firecrawl_status')
def poll_firecrawl_status_task(self, job_id: str, request_id: str, max_attempts: int = 100):
    """Alternative task for polling Firecrawl status with retry logic."""
    try:
        for attempt in range(max_attempts):
            status_result = firecrawl_service.get_extract_status(job_id)
            
            if not status_result["success"]:
                error_msg = status_result["error"]
                notify_websocket(request_id, 'error', error_msg)
                raise Exception(error_msg)
            
            status = status_result["status"]
            
            # Update progress
            progress = (attempt + 1) / max_attempts * 100
            self.update_state(
                state='PROGRESS', 
                meta={
                    'status': status,
                    'progress': progress,
                    'attempt': attempt + 1
                }
            )
            notify_websocket(request_id, 'status', {'status': status, 'progress': progress})
            
            if status == "completed":
                extract_data = status_result["data"]
                if extract_data:
                    result = firecrawl_service.parse_extract_data(extract_data)
                    result_dict = result.dict()
                    
                    # Store result
                    redis_service.store_result_sync(request_id, result_dict)
                    
                    notify_websocket(request_id, 'result', result_dict)
                    return
            
            elif status == "failed":
                error_msg = status_result["error"] or "Unknown error"
                notify_websocket(request_id, 'error', error_msg)
                raise Exception(error_msg)
            
            # Wait before next attempt
            time.sleep(3)
        
        # Max attempts reached
        error_msg = f"Polling timeout after {max_attempts} attempts"
        notify_websocket(request_id, 'error', error_msg)
        raise Exception(error_msg)
        
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
        return
