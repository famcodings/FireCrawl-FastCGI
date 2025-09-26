"""Firecrawl service for web scraping operations."""
import asyncio
from typing import Dict, Optional
from firecrawl import Firecrawl
from sqlalchemy.orm import Session
from models import FirecrawlResponse
from config import config

class FirecrawlService:
    """Service for Firecrawl API operations."""
    
    def __init__(self):
        self.client = Firecrawl(api_key=config.FIRECRAWL_API_KEY)
        self.extract_query = self._get_extract_query()
        self.extract_schema = self._get_extract_schema()
    
    def _get_extract_query(self) -> str:
        """Get the extraction query for company analysis."""
        return """As a Sales Professional, extract information about the company from all pages of the website. What industry is the company working in? What products and services does this company offer? Where is the company located? Analyze the site to derive what their formally declared or informal mission mission is. Also check what the Unique Selling Proposition of the company is (USP): Why should a customer work with them and not with any other? Also infer an Ideal Customer Profile (ICP) from the site."""
    
    def _get_extract_schema(self) -> Dict:
        """Get the extraction schema for structured data."""
        return {
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
    
    def start_extract(self, url: str) -> Dict:
        """Start a new extraction job."""
        try:
            res = self.client.start_extract(
                urls=[url],
                prompt=self.extract_query,
                schema=self.extract_schema,
            )
            return {
                "success": True,
                "response": res,
                "job_id": res.id if hasattr(res, 'id') else None,
                "is_direct": hasattr(res, 'data') and res.data is not None
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_extract_status(self, job_id: str) -> Dict:
        """Get the status of an extraction job."""
        try:
            status_response = self.client.get_extract_status(job_id)
            return {
                "success": True,
                "status": status_response.status,
                "data": status_response.data if hasattr(status_response, 'data') else None,
                "error": status_response.error if hasattr(status_response, 'error') else None
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def parse_extract_data(self, extract_data: Dict) -> FirecrawlResponse:
        """Parse extraction data into structured response."""
        return FirecrawlResponse(
            products_services=extract_data.get("products_services", ""),
            mission=extract_data.get("mission", ""),
            usp=extract_data.get("usp", ""),
            locations=extract_data.get("locations", ""),
            icp=extract_data.get("icp", ""),
            industry=extract_data.get("industry", "")
        )
    
    # Note: poll_status method removed - now handled by Celery tasks

async def scrape_url(url: str,
                   page_options: dict = None,
                   crawler_options: dict = None,
                   extraction_options: dict = None) -> dict:
    """
    Asynchronously scrapes a URL using the Firecrawl API.
    """
    # ... function implementation ...

async def process_url(url_id: int, db: Session):
    """
    Process a URL resource to extract information.
    """
    # TODO: Implement Firecrawl extraction logic here
    # 1. Fetch the URL from the database using url_id
    # 2. Call scrape_url with the URL
    # 3. Save the extracted data back to the Url record
    pass

async def process_document(document_id: int, db: Session):
    """
    Process a document resource to extract information.
    """
    # TODO: Implement Firecrawl extraction logic for documents
    # 1. Fetch the document from the database using document_id
    # 2. Get the file path or content
    # 3. Use Firecrawl's document processing capabilities
    # 4. Save the extracted data back to the Document record
    pass

# Global Firecrawl service instance
firecrawl_service = FirecrawlService()
