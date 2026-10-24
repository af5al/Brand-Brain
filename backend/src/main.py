from src.services.gemini import generate_text
from dotenv import load_dotenv
from fastapi import FastAPI

app = FastAPI()

load_dotenv()

@app.get('/')
async def home():
    return {"message": "Welcome"}

@app.get('/health')
async def health_check():
    return  {"message": "ok"}

@app.get('/test-gemini')
async def test_gemini():
    result = await generate_text("give me a insta quote for a special mango juice")
    return {"result": result}