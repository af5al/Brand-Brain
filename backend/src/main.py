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