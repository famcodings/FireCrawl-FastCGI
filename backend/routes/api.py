"""API routes for the Infobud PoC application."""
import asyncio
import uuid
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List
from models import CrawlRequest, CrawlStatus
from config import config
from constants import ResourceStatus
from utils.file_handler import get_file_url
from services.redis_service import redis_service
from services.firecrawl_service import firecrawl_service
from services.websocket_service import websocket_service
from services.websocket_bridge import websocket_bridge
from services.resource_service import (
    create_url_resource,
    create_pdf_resource,
    format_url_resource,
    format_document_resource,
)
from tasks.crawl_tasks import crawl_website_task
from tasks.resource_tasks import process_url_resource_task, process_document_resource_task
import models, schemas
from database import get_db

router = APIRouter()


@router.post("/crawl", response_model=CrawlStatus)
async def start_crawl(request: CrawlRequest):
    """Start a new crawl request."""
    if not config.FIRECRAWL_API_KEY:
        raise HTTPException(status_code=500, detail="Firecrawl API key not configured")
    
    request_id = str(uuid.uuid4())
    
    try:
        # Start Firecrawl extraction
        extract_result = firecrawl_service.start_extract(str(request.url))
        
        if not extract_result["success"]:
            raise HTTPException(status_code=500, detail=f"Firecrawl error: {extract_result['error']}")
        
        response = extract_result["response"]
        
        if extract_result["is_direct"]:
            # Direct response - process immediately
            result = firecrawl_service.parse_extract_data(response.data)
            
            # Store request info in Redis
            await redis_service.store_request_data(request_id, {
                "status": "completed",
                "result": json.dumps(result.dict()),
                "url": str(request.url),
                "company_name": request.company_name
            })
            
            # Send result via WebSocket if connection exists
            await websocket_service.send_result(request_id, result.dict())
            
            return CrawlStatus(
                request_id=request_id,
                status="completed",
                message="Crawl completed successfully",
                result=result
            )
        else:
            # Async job - get job ID
            job_id = extract_result["job_id"]
            
            if not job_id:
                raise HTTPException(status_code=500, detail="No job ID returned from Firecrawl")
            
            # Start Celery task
            task = crawl_website_task.delay(job_id, request_id, str(request.url), request.company_name)
            
            # Store request info in Redis
            await redis_service.store_request_data(request_id, {
                "status": "processing",
                "job_id": job_id,
                "task_id": task.id,
                "url": str(request.url),
                "company_name": request.company_name
            })
            
            return CrawlStatus(
                request_id=request_id,
                status="started",
                message="Crawl started successfully",
                task_id=task.id
            )
                
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.websocket("/ws/{request_id}")
async def websocket_endpoint(websocket: WebSocket, request_id: str):
    """WebSocket endpoint for real-time updates."""
    await websocket_service.connect(request_id, websocket)
    
    try:
        await websocket_service.keep_alive(request_id)
    except WebSocketDisconnect:
        await websocket_service.disconnect(request_id)

@router.get("/status/{request_id}")
async def get_status(request_id: str):
    """Get the status of a crawl request."""
    request_data = await redis_service.get_request_data(request_id)
    if not request_data:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Parse result if it exists
    if "result" in request_data:
        request_data["result"] = json.loads(request_data["result"])
    
    return request_data


@router.get("/task-status/{task_id}")
async def get_task_status(task_id: str):
    """Get Celery task status."""
    from celery_app import celery_app
    task = celery_app.AsyncResult(task_id)
    return {
        'task_id': task_id,
        'state': task.state,
        'result': task.result if task.state == 'SUCCESS' else None,
        'error': str(task.result) if task.state == 'FAILURE' else None,
        'info': task.info if task.state in ['PENDING', 'PROGRESS'] else None
    }

@router.get("/supplier", response_model=schemas.Supplier)
def get_supplier(db: Session = Depends(get_db)):
    """Get the single supplier for this PoC"""
    supplier = db.query(models.Supplier).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="No supplier found")
    return supplier

@router.post("/supplier", response_model=schemas.Supplier)
def create_or_update_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    """Create supplier if none exists, or update the existing one for this PoC"""
    # Check if a supplier already exists
    existing_supplier = db.query(models.Supplier).first()
    
    address_json = {
        "street": supplier.address,
        "zip_code": supplier.zip_code,
        "city": supplier.city,
        "country": supplier.country,
    }
    
    if existing_supplier:
        # Update the existing supplier
        existing_supplier.name = supplier.name
        existing_supplier.address = address_json
        existing_supplier.extracted_profile = supplier.extracted_profile
        existing_supplier.markdown_profile = supplier.markdown_profile
        db.commit()
        db.refresh(existing_supplier)
        return existing_supplier
    else:
        # Create new supplier
        db_supplier = models.Supplier(
            name=supplier.name,
            address=address_json,
            extracted_profile=supplier.extracted_profile,
            markdown_profile=supplier.markdown_profile
        )
        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)
        return db_supplier

@router.delete("/supplier/resources/{resource_id}")
async def delete_resource(
    resource_id: int,
    resource_type: str = Query(..., description="Type of resource: 'url' or 'pdf'"),
    db: Session = Depends(get_db)
):
    """Delete a resource (URL or PDF) for the single supplier"""
    supplier = db.query(models.Supplier).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="No supplier found")
    
    if resource_type.lower() == 'url':
        # Delete URL resource
        url_obj = db.query(models.Url).filter(
            models.Url.id == resource_id,
            models.Url.type == 'supplier',
            models.Url.type_id == supplier.id
        ).first()
        
        if not url_obj:
            raise HTTPException(status_code=404, detail="URL resource not found")
        
        db.delete(url_obj)
        db.commit()
        
        return {"message": "URL resource deleted successfully"}
        
    elif resource_type.lower() == 'pdf':
        # Delete PDF resource and its file
        doc_obj = db.query(models.Document).filter(
            models.Document.id == resource_id,
            models.Document.type == 'supplier',
            models.Document.type_id == supplier.id
        ).first()
        
        if not doc_obj:
            raise HTTPException(status_code=404, detail="PDF resource not found")
        
        # Delete the physical file if it exists
        if hasattr(doc_obj, 'file_path') and doc_obj.file_path:
            try:
                import os
                file_path = os.path.join("uploads", doc_obj.file_path)
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                # Log the error but don't fail the deletion
                print(f"Warning: Could not delete file {doc_obj.file_path}: {e}")
        
        db.delete(doc_obj)
        db.commit()
        
        return {"message": "PDF resource and file deleted successfully"}
    
    else:
        raise HTTPException(status_code=400, detail="Invalid resource type. Must be 'url' or 'pdf'")


@router.post("/supplier/resources/{resource_id}/reanalyze")
async def reanalyze_resource(
    resource_id: int,
    resource_type: str = Query(..., description="Type of resource: 'url' or 'pdf'"),
    db: Session = Depends(get_db)
):
    """Re-analyze a resource (URL or PDF) for the single supplier"""
    supplier = db.query(models.Supplier).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="No supplier found")
    
    if resource_type.lower() == 'url':
        # Re-analyze URL resource
        url_obj = db.query(models.Url).filter(
            models.Url.id == resource_id,
            models.Url.type == 'supplier',
            models.Url.type_id == supplier.id
        ).first()
        
        if not url_obj:
            raise HTTPException(status_code=404, detail="URL resource not found")
        
        # Check if resource is already being processed
        if url_obj.status in [ResourceStatus.PROCESSING.value, ResourceStatus.PENDING.value]:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot re-analyze resource. Current status is '{url_obj.status}'. Resource must be 'ready' or 'failed' to re-analyze."
            )
        
        # Update status to processing and timestamp
        from datetime import datetime
        url_obj.status = ResourceStatus.PROCESSING.value
        url_obj.last_analysis_at = datetime.utcnow()
        db.commit()
        db.refresh(url_obj)
        
        # Start Celery task for URL processing
        request_id = str(uuid.uuid4())
        
        # Start Firecrawl extraction
        extract_result = firecrawl_service.start_extract(url_obj.url)
        
        if not extract_result["success"]:
            # Revert status on error
            url_obj.status = ResourceStatus.FAILED.value
            db.commit()
            raise HTTPException(status_code=500, detail=f"Firecrawl error: {extract_result['error']}")
        
        if extract_result["is_direct"]:
            # Direct response - process immediately
            result = firecrawl_service.parse_extract_data(extract_result["response"].data)
            url_obj.extracted_data = json.dumps(result.dict())
            url_obj.status = ResourceStatus.READY.value
            db.commit()
        else:
            # Async job - start Celery task
            job_id = extract_result["job_id"]
            if not job_id:
                url_obj.status = ResourceStatus.FAILED.value
                db.commit()
                raise HTTPException(status_code=500, detail="No job ID returned from Firecrawl")
            
            # Start Celery task
            task = process_url_resource_task.delay(job_id, request_id, url_obj.id)
            
            # Store request info in Redis
            await redis_service.store_request_data(request_id, {
                "status": "processing",
                "job_id": job_id,
                "task_id": task.id,
                "resource_id": str(url_obj.id),
                "resource_type": "URL"
            })
        
        return {
            "message": "URL resource re-analysis started successfully",
            "resource": {
                "id": url_obj.id,
                "name": url_obj.name or url_obj.url,
                "type": "URL",
                "url": url_obj.url,
                "extracted_data": url_obj.extracted_data,
                "status": url_obj.status or ResourceStatus.PENDING.value,
                "last_analysis_at": url_obj.last_analysis_at.isoformat() if url_obj.last_analysis_at else None,
                "analysis_request_id": request_id
            }
        }
        
    elif resource_type.lower() == 'pdf':
        # Re-analyze PDF resource
        doc_obj = db.query(models.Document).filter(
            models.Document.id == resource_id,
            models.Document.type == 'supplier',
            models.Document.type_id == supplier.id
        ).first()
        
        if not doc_obj:
            raise HTTPException(status_code=404, detail="PDF resource not found")
        
        # Check if resource is already being processed
        if doc_obj.status in [ResourceStatus.PROCESSING.value, ResourceStatus.PENDING.value]:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot re-analyze resource. Current status is '{doc_obj.status}'. Resource must be 'ready' or 'failed' to re-analyze."
            )
        
        # Update status to processing
        doc_obj.status = ResourceStatus.PROCESSING.value
        db.commit()
        db.refresh(doc_obj)
        
        # Start Celery task for document processing
        request_id = str(uuid.uuid4())
        
        # Start Celery task for document processing
        task = process_document_resource_task.delay(doc_obj.id, request_id)
        
        # Store request info in Redis
        await redis_service.store_request_data(request_id, {
            "status": "processing",
            "task_id": task.id,
            "resource_id": str(doc_obj.id),
            "resource_type": "DOCUMENT"
        })
        
        resource_payload = {
            "id": doc_obj.id,
            "name": doc_obj.name or (doc_obj.original_filename if hasattr(doc_obj, 'original_filename') and doc_obj.original_filename else doc_obj.url),
            "type": "PDF",
            "filename": doc_obj.original_filename if hasattr(doc_obj, 'original_filename') and doc_obj.original_filename else doc_obj.url,
            "extracted_data": doc_obj.extracted_data,
            "status": doc_obj.status or ResourceStatus.PENDING.value,
            "analysis_request_id": request_id
        }

        if hasattr(doc_obj, 'file_path') and doc_obj.file_path:
            resource_payload.update({
                "file_path": doc_obj.file_path,
                "file_size": doc_obj.file_size if hasattr(doc_obj, 'file_size') else None,
                "file_url": get_file_url(doc_obj.file_path),
                "mime_type": doc_obj.mime_type if hasattr(doc_obj, 'mime_type') else None
            })
        
        return {
            "message": "PDF resource re-analysis started successfully",
            "resource": resource_payload
        }
    
    else:
        raise HTTPException(status_code=400, detail="Invalid resource type. Must be 'url' or 'pdf'")


@router.get("/supplier/resources")
def get_supplier_resources(db: Session = Depends(get_db)):
    """Get all resources for the single supplier in this PoC"""
    supplier = db.query(models.Supplier).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="No supplier found")
    
    # Get all URLs and Documents for this supplier
    urls = db.query(models.Url).filter(
        models.Url.type == 'supplier', 
        models.Url.type_id == supplier.id
    ).all()
    
    documents = db.query(models.Document).filter(
        models.Document.type == 'supplier',
        models.Document.type_id == supplier.id
    ).all()
    
    resources = [format_url_resource(url_obj) for url_obj in urls]
    resources.extend(format_document_resource(doc_obj) for doc_obj in documents)

    return resources

@router.post("/supplier/resources")
async def create_resource_for_supplier(
    name: str = Form(...),
    type: str = Form(...),
    url: str = Form(None),
    files: List[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # Get the single supplier for this PoC
    supplier = db.query(models.Supplier).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="No supplier found")

    if type == 'url':
        return await create_url_resource(db, supplier, name, url)
    if type == 'pdf':
        return await create_pdf_resource(db, supplier, name, files)

    raise HTTPException(status_code=400, detail="Invalid resource type")
