"""API routes for the FireCrawl application."""
import uuid
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from models import CrawlRequest, CrawlStatus
from config import config
from services.redis_service import redis_service
from services.firecrawl_service import firecrawl_service
from services.websocket_service import websocket_service

router = APIRouter()

@router.post("/api/crawl", response_model=CrawlStatus)
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
            
            # Store request info in Redis
            await redis_service.store_request_data(request_id, {
                "status": "processing",
                "job_id": job_id,
                "url": str(request.url),
                "company_name": request.company_name
            })
            
            # Start background polling
            import asyncio
            asyncio.create_task(firecrawl_service.poll_status(job_id, request_id, websocket_service))
            
            return CrawlStatus(
                request_id=request_id,
                status="started",
                message="Crawl started successfully"
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

@router.get("/api/status/{request_id}")
async def get_status(request_id: str):
    """Get the status of a crawl request."""
    request_data = await redis_service.get_request_data(request_id)
    if not request_data:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Parse result if it exists
    if "result" in request_data:
        request_data["result"] = json.loads(request_data["result"])
    
    return request_data

@router.get("/test_firecrawl")
def test_firecrawl():
    """Simple test endpoint to test Firecrawl API connection."""
    import time
    
    # Use a simple test URL
    test_url = "https://www.notion.so"
    
    # Start extraction
    extract_result = firecrawl_service.start_extract(test_url)
    
    if not extract_result["success"]:
        return {"error": extract_result["error"], "success": False}
    
    response = extract_result["response"]
    job_id = extract_result["job_id"]
    
    if not job_id:
        return {"error": "No job ID returned", "success": False}
    
    # Poll for completion (simplified for testing)
    for i in range(10):
        status_result = firecrawl_service.get_extract_status(job_id)
        
        if not status_result["success"]:
            return {"error": status_result["error"], "success": False}
        
        if status_result["status"] == "completed":
            extract_data = status_result["data"]
            if extract_data:
                result = firecrawl_service.parse_extract_data(extract_data)
                return {"result": result.dict(), "success": True}
        
        time.sleep(1)
    
    return {"error": "Test timeout", "success": False}
