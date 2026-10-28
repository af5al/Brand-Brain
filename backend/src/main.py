from src.services.gemini import generate_campaign_result
from src.schemas import CampaignRequest
from src.services.gemini import search_brand_chunks
from src.services.gemini import ingest_brand_service
from src.schemas import IngestRequest
from src.services.gemini import generate_embedding
from src.services.gemini import generate_text
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

@app.get('/')
async def home():
    return {"message": "Welcome"}

@app.get('/health')
async def health_check():
    return  {"message": "ok"}

@app.get('/test-gemini')
async def test_gemini():
    result = await generate_text("what is apple")
    return {"output": result}

@app.get('/test-embedding')
async def check_embedding():
    text = 'Eco-friendly organic mango juice'
    vector = await generate_embedding(text)
    return {"dimensions": len(vector), "sample": vector[:5]}

@app.post('/brands/ingest')
async def ingest_brand(req: IngestRequest):
    result = await ingest_brand_service(req)
    return result

@app.post('/brands/{brand_id}/search')
async def search_brand(brand_id: str, q: str):
    results = await search_brand_chunks(brand_id, q, limit=5, threshold=0.50)
    return {
        "query": q,
        "brand_id": brand_id,
        "results_count": len(results),
        "matches": results
    }

@app.post('/campaigns/generate')
async def generate_campaign(req: CampaignRequest):
    results = await generate_campaign_result(req)
    return {
        "brand_id": req.brand_id,
        "results": results,
    }

