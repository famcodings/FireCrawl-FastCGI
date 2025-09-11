import asyncio
import json
import uuid
from typing import Dict, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl
import os
from dotenv import load_dotenv
from firecrawl import Firecrawl
import time
import redis.asyncio as redis

load_dotenv()

app = FastAPI(title="Firecrawl Extract API Service")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Firecrawl API configuration
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")
FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v1"

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
redis_client: Optional[redis.Redis] = None

# WebSocket connections (still in-memory for active connections)
websocket_connections: Dict[str, WebSocket] = {}

class CrawlRequest(BaseModel):
    url: HttpUrl
    company_name: str

class FirecrawlResponse(BaseModel):
    products_services: str
    mission: str
    usp: str
    locations: str
    icp: str
    industry: str

# Redis helper functions
async def get_redis_client():
    """Get Redis client instance"""
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    return redis_client

async def store_request_data(request_id: str, data: Dict):
    """Store request data in Redis"""
    client = await get_redis_client()
    await client.hset(f"request:{request_id}", mapping=data)
    await client.expire(f"request:{request_id}", 3600)  # Expire after 1 hour

async def get_request_data(request_id: str) -> Optional[Dict]:
    """Get request data from Redis"""
    client = await get_redis_client()
    data = await client.hgetall(f"request:{request_id}")
    return data if data else None

async def update_request_status(request_id: str, status: str, **kwargs):
    """Update request status and additional data in Redis"""
    client = await get_redis_client()
    await client.hset(f"request:{request_id}", "status", status)
    if kwargs:
        await client.hset(f"request:{request_id}", mapping=kwargs)

async def poll_firecrawl_status(request_id: str, job_id: str):
    """Background task to poll Firecrawl Extract status"""
    firecrawl = Firecrawl(api_key=FIRECRAWL_API_KEY)
    
    while True:
        try:
            # Check status using Firecrawl client
            status_response = firecrawl.get_extract_status(job_id)
            
            print(f"Status check for {job_id}: {status_response}")
            
            if status_response.status == "completed":
                # Extract completed, get the data
                extract_data = status_response.data
                
                # Parse the response according to our schema
                result = FirecrawlResponse(
                    products_services=extract_data.get("products_services", ""),
                    mission=extract_data.get("mission", ""),
                    usp=extract_data.get("usp", ""),
                    locations=extract_data.get("locations", ""),
                    icp=extract_data.get("icp", ""),
                    industry=extract_data.get("industry", "")
                )
                
                # Update request in Redis
                await update_request_status(request_id, "completed", result=json.dumps(result.dict()))
                
                # Send result via WebSocket
                if request_id in websocket_connections:
                    await websocket_connections[request_id].send_text(
                        json.dumps({
                            "type": "result",
                            "data": result.dict()
                        })
                    )
                
                break
            
            elif status_response.status == "failed":
                await update_request_status(request_id, "error", error=status_response.error if status_response.error else "Unknown error")
                
                if request_id in websocket_connections:
                    await websocket_connections[request_id].send_text(
                        json.dumps({
                            "type": "error",
                            "message": status_response.error if status_response.error else "Unknown error"
                        })
                    )
                break
            
            # Still processing, wait 3 seconds
            await asyncio.sleep(3)
                
        except Exception as e:
            print(f"Error in polling: {str(e)}")
            await update_request_status(request_id, "error", error=str(e))
            
            if request_id in websocket_connections:
                await websocket_connections[request_id].send_text(
                    json.dumps({
                        "type": "error",
                        "message": str(e)
                    })
                )
            break

@app.post("/api/crawl")
async def start_crawl(request: CrawlRequest):
    """Start a new crawl request"""
    if not FIRECRAWL_API_KEY:
        raise HTTPException(status_code=500, detail="Firecrawl API key not configured")
    
    request_id = str(uuid.uuid4())
    
    # Prepare Firecrawl Extract request
    extract_query = """As a Sales Professional, extract information about the company from all pages of the website. What industry is the company working in? What products and services does this company offer? Where is the company located? Analyze the site to derive what their formally declared or informal mission mission is. Also check what the Unique Selling Proposition of the company is (USP): Why should a customer work with them and not with any other? Also infer an Ideal Customer Profile (ICP) from the site."""
    
    extract_schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
            "products_services": {"type": "string"},
            "mission": {"type": "string"},
            "usp": {"type": "string"},
            "locations": {"type": "string"},
            "icp": {"type": "string"},
            "industry": {"type": "string"}
        },
        "required": ["products_services", "mission", "usp", "locations", "icp", "industry"]
    }
    
    try:
        # Initialize Firecrawl client
        firecrawl = Firecrawl(api_key=FIRECRAWL_API_KEY)
        
        # Start the extract job
        res = firecrawl.start_extract(
            urls=[str(request.url)],
            prompt=extract_query,
            schema=extract_schema,
        )
        
        print(f"Firecrawl response: {res}")
        
        # Check if it's a direct response or async job
        if hasattr(res, 'data') and res.data:
            # Direct response - process immediately
            extract_data = res.data
            
            # Parse the response according to our schema
            result = FirecrawlResponse(
                products_services=extract_data.get("products_services", ""),
                mission=extract_data.get("mission", ""),
                usp=extract_data.get("usp", ""),
                locations=extract_data.get("locations", ""),
                icp=extract_data.get("icp", ""),
                industry=extract_data.get("industry", "")
            )
            
            # Store request info in Redis
            await store_request_data(request_id, {
                "status": "completed",
                "result": json.dumps(result.dict()),
                "url": str(request.url),
                "company_name": request.company_name
            })
            
            # Send result via WebSocket if connection exists
            if request_id in websocket_connections:
                await websocket_connections[request_id].send_text(
                    json.dumps({
                        "type": "result",
                        "data": result.dict()
                    })
                )
            
            return {
                "request_id": request_id,
                "status": "completed",
                "message": "Crawl completed successfully"
            }
        else:
            # Async job - get job ID
            # job_id = res.get("id") if hasattr(res, 'get') else getattr(res, 'jobId', None)
            job_id = res.id
            print("job_id", job_id)
            
            if job_id:
                # Store request info in Redis
                await store_request_data(request_id, {
                    "status": "processing",
                    "job_id": job_id,
                    "url": str(request.url),
                    "company_name": request.company_name
                })
                
                # Start background polling
                asyncio.create_task(poll_firecrawl_status(request_id, job_id))
                
                return {
                    "request_id": request_id,
                    "status": "started",
                    "message": "Crawl started successfully"
                }
            else:
                raise HTTPException(status_code=500, detail="No job ID returned from Firecrawl")
                
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.websocket("/ws/{request_id}")
async def websocket_endpoint(websocket: WebSocket, request_id: str):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()
    websocket_connections[request_id] = websocket
    
    try:
        # Send initial status if request exists
        request_data = await get_request_data(request_id)
        if request_data:
            await websocket.send_text(json.dumps({
                "type": "status",
                "status": request_data["status"]
            }))
            
            # If request is already completed, send the result
            if request_data["status"] == "completed" and "result" in request_data:
                result_data = json.loads(request_data["result"])
                await websocket.send_text(json.dumps({
                    "type": "result",
                    "data": result_data
                }))
        
        # Keep connection alive
        while True:
            await websocket.receive_text()
            
    except WebSocketDisconnect:
        if request_id in websocket_connections:
            del websocket_connections[request_id]

@app.get("/api/status/{request_id}")
async def get_status(request_id: str):
    """Get the status of a crawl request"""
    request_data = await get_request_data(request_id)
    if not request_data:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Parse result if it exists
    if "result" in request_data:
        request_data["result"] = json.loads(request_data["result"])
    
    return request_data

@app.get("/test_firecrawl")
def test_firecrawl():
    """Simple test endpoint to test Firecrawl API connection"""

    firecrawl = Firecrawl(api_key=FIRECRAWL_API_KEY)

    schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
            "products_services": { "type": "string" },
            "mission": { "type": "string" },
            "usp": { "type": "string" },
            "locations": { "type": "string" },
            "icp": { "type": "string" },
            "industry": { "type": "string" }
        },
         "required": ["products", "services", "mission", "usp", "locations", "icp", "industry"]
    }
    prompt = "As a Sales Professional, extract information about the company from all pages of the website. What industry is the company working in? What products and services does this company offer? Where is the company located? Analyze the site to derive what their formally declared or informal mission mission is. Also check what the Unique Selling Proposition of the company is (USP): Why should a customer work with them and not with any other? Also infer an Ideal Customer Profile (ICP) from the site."

    res = firecrawl.start_extract(
        urls=["https://www.notion.so"],
        prompt=prompt,
        schema=schema,
    )

    for i in range(10):
        status_response = firecrawl.get_extract_status(res.id)
        print(status_response)
        if status_response.status == "completed":
            break
        time.sleep(1)
    print(status_response)

    extract_data = status_response.data
                
    # Parse the response according to our schema
    result = {
        "products_services":extract_data.get("products_services", ""),
        "mission":extract_data.get("mission", ""),
        "usp":extract_data.get("usp", ""),
        "locations":extract_data.get("locations", ""),
        "icp":extract_data.get("icp", ""),
        "industry":extract_data.get("industry", "")
    }

    return {
        "result": result,
        "success": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


