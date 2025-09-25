import asyncio
import json
import os
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

import models
from constants import ResourceStatus
from services.firecrawl_service import firecrawl_service
from services.redis_service import redis_service
from services.websocket_service import websocket_service
from services.document_reader_service import document_reader_service
from services.grok_service import grok_service
from database import SessionLocal
from utils.file_handler import save_upload_file, get_file_url


PDF_ANALYSIS_QUESTIONS = [
    "What products or services does the company offer?",
    "What is the company's mission or core purpose?",
    "What unique value proposition or differentiator does the company highlight?",
    "Where is the company located or which regions do they serve?",
    "Who appears to be the ideal customer profile based on the document?",
    "Which industry or industries does the company operate within?",
]


def format_url_resource(url_obj: models.Url, analysis_request_id: Optional[str] = None) -> dict:
    """Serialize a URL resource into the API response shape."""
    resource = {
        "id": url_obj.id,
        "name": url_obj.name or url_obj.url,
        "type": "URL",
        "url": url_obj.url,
        "extracted_data": url_obj.extracted_data,
        "status": url_obj.status or ResourceStatus.PENDING.value,
        "last_analysis_at": url_obj.last_analysis_at.isoformat() if url_obj.last_analysis_at else None,
    }

    if analysis_request_id is not None:
        resource["analysis_request_id"] = analysis_request_id

    return resource


def format_document_resource(doc_obj: models.Document) -> dict:
    """Serialize a PDF resource into the API response shape."""
    resource = {
        "id": doc_obj.id,
        "name": doc_obj.name or (doc_obj.original_filename if hasattr(doc_obj, 'original_filename') and doc_obj.original_filename else doc_obj.url),
        "type": "PDF",
        "filename": doc_obj.original_filename if hasattr(doc_obj, 'original_filename') and doc_obj.original_filename else doc_obj.url,
        "extracted_data": doc_obj.extracted_data,
        "status": doc_obj.status or ResourceStatus.PENDING.value
    }

    if hasattr(doc_obj, 'file_path') and doc_obj.file_path:
        resource.update({
            "file_path": doc_obj.file_path,
            "file_size": doc_obj.file_size if hasattr(doc_obj, 'file_size') else None,
            "file_url": get_file_url(doc_obj.file_path),
            "mime_type": doc_obj.mime_type if hasattr(doc_obj, 'mime_type') else None
        })

    return resource


def _update_url_resource(url_id: int, *, status: Optional[str] = None, extracted_data: Optional[str] = None, set_last_analysis: bool = False) -> Optional[models.Url]:
    """Update a URL resource record with safe session handling."""
    session = SessionLocal()
    try:
        url_obj = session.get(models.Url, url_id)
        if not url_obj:
            return None

        if status is not None:
            url_obj.status = status

        if extracted_data is not None:
            url_obj.extracted_data = extracted_data

        if set_last_analysis:
            url_obj.last_analysis_at = datetime.utcnow()

        session.commit()
        session.refresh(url_obj)
        return url_obj
    finally:
        session.close()


def _mark_url_processing(db: Session, url_obj: models.Url) -> None:
    url_obj.status = ResourceStatus.PROCESSING.value
    url_obj.last_analysis_at = datetime.utcnow()
    db.commit()
    db.refresh(url_obj)


async def _start_url_analysis(db: Session, url_obj: models.Url, request_id: str) -> None:
    extract_result = firecrawl_service.start_extract(url_obj.url)

    if not extract_result.get("success"):
        error_message = extract_result.get("error") or "Failed to start analysis"
        url_obj.status = ResourceStatus.FAILED.value
        url_obj.last_analysis_at = datetime.utcnow()
        db.commit()
        raise HTTPException(status_code=500, detail=f"Firecrawl error: {error_message}")

    job_id = extract_result.get("job_id")
    if not job_id:
        url_obj.status = ResourceStatus.FAILED.value
        url_obj.last_analysis_at = datetime.utcnow()
        db.commit()
        raise HTTPException(status_code=500, detail="No job ID returned from Firecrawl")

    await redis_service.store_request_data(request_id, {
        "status": "processing",
        "job_id": job_id,
        "resource_id": str(url_obj.id),
        "resource_type": "URL"
    })
    await websocket_service.send_status(request_id, "processing")
    asyncio.create_task(_poll_url_resource(job_id, request_id, url_obj.id))


async def _poll_url_resource(job_id: str, request_id: str, url_id: int) -> None:
    """Poll Firecrawl for a URL resource and propagate results."""
    try:
        while True:
            status_result = firecrawl_service.get_extract_status(job_id)

            if not status_result.get("success"):
                error_msg = status_result.get("error") or "Unknown error"
                _update_url_resource(url_id, status=ResourceStatus.FAILED.value, set_last_analysis=True)
                await websocket_service.send_error(request_id, error_msg)
                break

            status = status_result.get("status")

            if status == "completed":
                extract_data = status_result.get("data")
                analysis_dict = {}

                if extract_data:
                    result = firecrawl_service.parse_extract_data(extract_data)
                    analysis_dict = result.dict()
                    _update_url_resource(
                        url_id,
                        status=ResourceStatus.READY.value,
                        extracted_data=json.dumps(analysis_dict),
                        set_last_analysis=True
                    )
                else:
                    _update_url_resource(
                        url_id,
                        status=ResourceStatus.READY.value,
                        set_last_analysis=True
                    )

                result_payload = {
                    "resource_id": url_id,
                    "resource_type": "URL",
                    "analysis": analysis_dict,
                }

                await websocket_service.send_result(request_id, result_payload)
                await redis_service.update_request_status(
                    request_id,
                    "completed",
                    resource_id=str(url_id),
                    resource_type="URL"
                )
                break

            if status == "failed":
                error_msg = status_result.get("error") or "Unknown error"
                _update_url_resource(url_id, status=ResourceStatus.FAILED.value, set_last_analysis=True)
                await websocket_service.send_error(request_id, error_msg)
                break

            await redis_service.update_request_status(request_id, status or "processing")
            await websocket_service.send_status(request_id, status or "processing")
            await asyncio.sleep(3)

    except Exception as exc:
        _update_url_resource(url_id, status=ResourceStatus.FAILED.value, set_last_analysis=True)
        await websocket_service.send_error(request_id, str(exc))


async def create_url_resource(db: Session, supplier: models.Supplier, name: str, url: Optional[str]) -> dict:
    """Create a URL resource and kick off analysis."""
    if not url:
        raise HTTPException(status_code=400, detail="URL is required for type 'url'")

    db_url = models.Url(name=name, url=url, type='supplier', type_id=supplier.id)
    db.add(db_url)
    db.commit()
    db.refresh(db_url)

    request_id = str(uuid.uuid4())

    _mark_url_processing(db, db_url)

    try:
        await _start_url_analysis(db, db_url, request_id)
    except HTTPException:
        raise
    except Exception as exc:
        db_url.status = ResourceStatus.FAILED.value
        db_url.last_analysis_at = datetime.utcnow()
        db.commit()
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return format_url_resource(db_url, request_id)


async def _analyze_pdf_document(db: Session, db_doc: models.Document, full_path: str) -> None:
    """Run document extraction and Groq analysis for a saved PDF."""
    # Mark as processing while we perform synchronous analysis work
    db_doc.status = ResourceStatus.PROCESSING.value
    db.commit()
    db.refresh(db_doc)

    loop = asyncio.get_running_loop()

    def _read_file_bytes() -> bytes:
        with open(full_path, "rb") as handle:
            return handle.read()

    file_bytes = await loop.run_in_executor(None, _read_file_bytes)

    reader_result = await loop.run_in_executor(
        None,
        document_reader_service.process_files,
        [(file_bytes, db_doc.original_filename or db_doc.name or db_doc.file_path)],
    )

    if not reader_result.get("success"):
        db_doc.status = ResourceStatus.FAILED.value
        db.commit()
        raise HTTPException(status_code=400, detail=reader_result.get("error", "Failed to read document"))

    documents = reader_result.get("documents", [])
    document_content = "\n\n".join(doc.get("text", "") for doc in documents).strip()

    if not document_content:
        db_doc.status = ResourceStatus.FAILED.value
        db.commit()
        raise HTTPException(status_code=400, detail="No readable text found in the uploaded document")

    analysis = await loop.run_in_executor(
        None,
        grok_service.analyze_documents_with_questions,
        document_content,
        PDF_ANALYSIS_QUESTIONS,
    )

    if not analysis.success:
        db_doc.status = ResourceStatus.FAILED.value
        db.commit()
        raise HTTPException(status_code=500, detail=analysis.error or "Failed to analyze document")

    db_doc.extracted_data = json.dumps({
        "responses": analysis.responses,
        "processed_files": reader_result.get("processed_files", []),
    })
    db_doc.status = ResourceStatus.READY.value
    db.commit()
    db.refresh(db_doc)


async def create_pdf_resource(db: Session, supplier: models.Supplier, name: str, files: Optional[List[UploadFile]]) -> Optional[dict]:
    """Create a PDF resource and return the formatted representation."""
    if not files:
        raise HTTPException(status_code=400, detail="Files are required for type 'pdf'")

    created_resources = []
    for file in files:
        try:
            relative_path, full_path = await save_upload_file(file, supplier.id)
            file_stats = os.stat(full_path)

            db_doc = models.Document(
                name=name,
                file_path=relative_path,
                original_filename=file.filename,
                file_size=file_stats.st_size,
                mime_type=file.content_type or "application/pdf",
                url=file.filename,
                type='supplier',
                type_id=supplier.id
            )
            db.add(db_doc)
            db.commit()
            db.refresh(db_doc)

            await _analyze_pdf_document(db, db_doc, full_path)

            created_resources.append(format_document_resource(db_doc))

        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to process file {file.filename}: {str(exc)}") from exc

    return created_resources[0] if created_resources else None
