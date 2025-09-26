"""Main FastAPI application."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pathlib import Path
from routes import api
from config import config
from services.websocket_bridge import websocket_bridge

app = FastAPI(
    title="infobud-poc API",
    description="API for infobud-poc, a modern web scraping and crawling application.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router, prefix="/api")

@app.get("/uploads/{file_path:path}")
async def serve_uploaded_file(file_path: str):
    """Serve uploaded files."""
    # Construct full file path
    full_path = Path("uploads") / file_path
    
    # Security check - ensure file is within uploads directory
    try:
        full_path = full_path.resolve()
        uploads_dir = Path("uploads").resolve()
        if not str(full_path).startswith(str(uploads_dir)):
            raise HTTPException(status_code=403, detail="Access denied")
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check if file exists
    if not full_path.exists() or not full_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Return file
    return FileResponse(
        path=str(full_path),
        filename=full_path.name,
        media_type='application/octet-stream'
    )

@app.get("/")
def read_root():
    return {"message": "Welcome to the infobud-poc API"}


@app.on_event("startup")
async def startup_event():
    """Start WebSocket bridge on application startup."""
    await websocket_bridge.start_background_task()


@app.on_event("shutdown")
async def shutdown_event():
    """Stop WebSocket bridge on application shutdown."""
    await websocket_bridge.stop_background_task()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=config.HOST, port=config.PORT)
