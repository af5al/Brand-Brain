

from typing_extensions import List
from typing import Optional
from enum import Enum
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

class CustomerIntent(str, Enum):
    FAQ = "faq"
    LEAD ="lead"
    COMPLAINT = "complaint"
    OUT_OF_SCOPE = "out_of_scope"
    
class ReplyAction(str, Enum):
    REPLY_DRAFTED = "reply_drafted"
    ESCALATE_TO_HUMAN = "escalate_to_human"
    
class ReplyRequest(BaseModel):
    brand_id: str
    customer_message: str
    channel: Optional[str] = "whatsapp"
    
class ReplyResponse(BaseModel):
    intent: CustomerIntent
    action: ReplyAction
    draft_reply: str
    confidence_score: float
    escalation_reason: Optional[str] = None
    grounded_facts_used: List[str] = []
    

