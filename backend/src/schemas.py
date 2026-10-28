
from pydantic import BaseModel

class IngestRequest(BaseModel):
    brand_name: str
    document_title: str
    content: str

class CampaignRequest(BaseModel):
    brand_id: str
    product_name: str
    channel: str # instagram, whatsapp, google_ads, email
    language: str # arabic, english

class CampaignResponse(BaseModel):
    headline: str
    body_copy: str
    call_to_action: str
    hashtags: list[str]
    is_rtl: bool
    grounded_facts_used: list[str]

