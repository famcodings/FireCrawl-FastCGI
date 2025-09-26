"""Database utility functions for Celery tasks."""
from typing import Optional
from sqlalchemy.orm import Session
from database import SessionLocal
from models import ResourceStatus, Url, Document
from datetime import datetime
import models


def update_url_resource(url_id: int, *, status: Optional[str] = None, extracted_data: Optional[str] = None, set_last_analysis: bool = False) -> Optional[models.Url]:
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
    except Exception as e:
        print(f"Error updating URL resource: {e}")
        session.rollback()
        return None
    finally:
        session.close()


def update_document_resource(document_id: int, *, status: Optional[str] = None, extracted_data: Optional[str] = None, set_last_analysis: bool = False) -> Optional[models.Document]:
    """Update a document resource record with safe session handling."""
    session = SessionLocal()
    try:
        doc_obj = session.get(models.Document, document_id)
        if not doc_obj:
            return None

        if status is not None:
            doc_obj.status = status

        if extracted_data is not None:
            doc_obj.extracted_data = extracted_data

        if set_last_analysis:
            doc_obj.last_analysis_at = datetime.utcnow()

        session.commit()
        session.refresh(doc_obj)
        return doc_obj
    except Exception as e:
        print(f"Error updating document resource: {e}")
        session.rollback()
        return None
    finally:
        session.close()
