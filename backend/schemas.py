from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

# URL Schemas
class UrlBase(BaseModel):
    url: str
    extracted_data: Optional[str] = None
    type: Optional[str] = None
    type_id: Optional[int] = None

class UrlCreate(UrlBase):
    pass

class Url(UrlBase):
    id: int

    class Config:
        orm_mode = True

# Document Schemas
class DocumentBase(BaseModel):
    url: Optional[str] = None
    extracted_data: Optional[str] = None
    type: Optional[str] = None
    type_id: Optional[int] = None

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: int

    class Config:
        orm_mode = True

# Supplier Schemas
class SupplierBase(BaseModel):
    name: str
    address: Optional[str] = None
    zip_code: Optional[str] = None
    city: str
    country: str
    extracted_profile: Optional[str] = None
    markdown_profile: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    zip_code: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    extracted_profile: Optional[str] = None
    markdown_profile: Optional[str] = None

class Supplier(BaseModel):
    id: int
    name: str
    address: Optional[Any] = None  # This will contain the JSON address object
    extracted_profile: Optional[str] = None
    markdown_profile: Optional[str] = None
    campaigns: List['Campaign'] = []

    class Config:
        orm_mode = True

# Lead Schemas
class LeadBase(BaseModel):
    name: str
    extracted_profile: Optional[str] = None
    markdown_profile: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class Lead(LeadBase):
    id: int
    campaigns: List['CampaignLead'] = []
    
    class Config:
        orm_mode = True

# CampaignLead Schemas
class CampaignLeadBase(BaseModel):
    extracted_profile: Optional[str] = None
    markdown_profile: Optional[str] = None
    matching_score: Optional[float] = None
    campaign_id: int
    lead_id: int

class CampaignLeadCreate(CampaignLeadBase):
    pass

class CampaignLead(CampaignLeadBase):
    id: int
    
    class Config:
        orm_mode = True

# Campaign Schemas
class CampaignBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    extracted_profile: Optional[str] = None
    markdown_profile: Optional[str] = None
    supplier_id: int

class CampaignCreate(CampaignBase):
    pass

class Campaign(CampaignBase):
    id: int
    supplier: Supplier
    leads: List[CampaignLead] = []

    class Config:
        orm_mode = True


# Update forward references
Supplier.update_forward_refs()
Lead.update_forward_refs()
Campaign.update_forward_refs()
