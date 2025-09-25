"""File handling utilities for document uploads."""
import os
import uuid
import shutil
from pathlib import Path
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException

# Configuration
UPLOAD_BASE_DIR = Path("uploads")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
}

def ensure_upload_directories():
    """
    Ensure upload directories exist.
    
    Note: The uploads/ directory is completely excluded from git.
    This function creates the necessary structure when the app runs.
    """
    # Create base upload directory
    UPLOAD_BASE_DIR.mkdir(exist_ok=True)
    
    # Create subdirectories for organization
    (UPLOAD_BASE_DIR / "documents").mkdir(exist_ok=True)

def validate_file(file: UploadFile) -> None:
    """Validate uploaded file."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File type {file_ext} not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check MIME type if available
    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"MIME type {file.content_type} not allowed"
        )

def generate_safe_filename(original_filename: str) -> str:
    """Generate a safe, unique filename."""
    # Get file extension
    file_ext = Path(original_filename).suffix.lower()
    
    # Generate unique filename with UUID
    unique_id = str(uuid.uuid4())
    safe_filename = f"{unique_id}{file_ext}"
    
    return safe_filename

async def save_upload_file(file: UploadFile, supplier_id: int) -> Tuple[str, str]:
    """
    Save uploaded file to disk.
    
    Returns:
        Tuple of (relative_path, full_path)
    """
    # Ensure directories exist
    ensure_upload_directories()
    
    # Validate file
    validate_file(file)
    
    # Create supplier-specific directory
    supplier_dir = UPLOAD_BASE_DIR / "documents" / f"supplier_{supplier_id}"
    supplier_dir.mkdir(exist_ok=True)
    
    # Generate safe filename
    safe_filename = generate_safe_filename(file.filename)
    
    # Full path where file will be saved
    file_path = supplier_dir / safe_filename
    
    try:
        # Read file content
        content = await file.read()
        
        # Check file size
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024:.1f}MB"
            )
        
        # Save file to disk
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Return relative path for database storage
        relative_path = str(file_path.relative_to(UPLOAD_BASE_DIR))
        
        return relative_path, str(file_path)
        
    except Exception as e:
        # Clean up file if it was partially created
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

def get_file_url(relative_path: str) -> str:
    """Generate URL for accessing uploaded file."""
    # In production, this would be a proper URL
    # For now, just return the relative path
    return f"/uploads/{relative_path}"

def delete_file(relative_path: str) -> bool:
    """Delete uploaded file."""
    try:
        file_path = UPLOAD_BASE_DIR / relative_path
        if file_path.exists():
            file_path.unlink()
            return True
        return False
    except Exception:
        return False
