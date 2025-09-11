"""Pydantic models for the FireCrawl application."""
from pydantic import BaseModel, HttpUrl
from typing import Optional

class CrawlRequest(BaseModel):
    """Request model for crawl operations."""
    url: HttpUrl
    company_name: str

class FirecrawlResponse(BaseModel):
    """Response model for Firecrawl analysis results."""
    products_services: str
    mission: str
    usp: str
    locations: str
    icp: str
    industry: str

class CrawlStatus(BaseModel):
    """Model for crawl status responses."""
    request_id: str
    status: str
    message: str
    result: Optional[FirecrawlResponse] = None
    error: Optional[str] = None

class WebSocketMessage(BaseModel):
    """Model for WebSocket messages."""
    type: str  # 'status', 'result', 'error'
    data: Optional[dict] = None
    message: Optional[str] = None
