
from pydantic import BaseModel

class IngestRequest(BaseModel):
    brand_name: str
    document_title: str
    content: str