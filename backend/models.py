"""Pydantic models for the FireCrawl application."""
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from constants import ResourceStatus

Base = declarative_base()

class Url(Base):
    __tablename__ = 'urls'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=True)  # Human-readable name for the resource
    url = Column(String, nullable=False)
    extracted_data = Column(Text)
    status = Column(String(20), default=ResourceStatus.PENDING.value)  # pending, processing, ready, failed
    last_analysis_at = Column(DateTime, nullable=True)  # When analysis was last attempted/completed
    type = Column(String(50))
    type_id = Column(Integer)

class Document(Base):
    __tablename__ = 'documents'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=True)  # Human-readable name for the resource
    file_path = Column(String)  # Relative path to the stored file
    original_filename = Column(String)  # Original filename from upload
    file_size = Column(Integer)  # File size in bytes
    mime_type = Column(String(100))  # MIME type of the file
    url = Column(String)  # For backward compatibility, stores filename/path
    extracted_data = Column(Text)
    status = Column(String(20), default=ResourceStatus.PENDING.value)  # pending, processing, ready, failed
    type = Column(String(50))
    type_id = Column(Integer)

class Supplier(Base):
    __tablename__ = 'suppliers'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    address = Column(JSON)
    extracted_profile = Column(Text)
    markdown_profile = Column(Text)
    campaigns = relationship("Campaign", back_populates="supplier")

class Campaign(Base):
    __tablename__ = 'campaigns'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)
    extracted_profile = Column(Text)
    markdown_profile = Column(Text)
    supplier_id = Column(Integer, ForeignKey('suppliers.id'))
    supplier = relationship("Supplier", back_populates="campaigns")
    leads = relationship("CampaignLead", back_populates="campaign")

class Lead(Base):
    __tablename__ = 'leads'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    extracted_profile = Column(Text)
    markdown_profile = Column(Text)
    campaigns = relationship("CampaignLead", back_populates="lead")

class CampaignLead(Base):
    __tablename__ = 'campaign_leads'
    id = Column(Integer, primary_key=True)
    campaign_id = Column(Integer, ForeignKey('campaigns.id'))
    lead_id = Column(Integer, ForeignKey('leads.id'))
    extracted_profile = Column(Text)
    markdown_profile = Column(Text)
    matching_score = Column(Float)
    campaign = relationship("Campaign", back_populates="leads")
    lead = relationship("Lead", back_populates="campaigns")

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

class DocumentAnalysisResponse(BaseModel):
    """Response model for document analysis with dynamic questions."""
    responses: Dict[str, str]  # question -> answer mapping
    success: bool
    error: Optional[str] = None