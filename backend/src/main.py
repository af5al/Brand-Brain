from fastapi import FastAPI

app = FastAPI()

@app.get('/')
async def home():
    return {"message": "Welcome"}

@app.get('/health')
async def health_check():
 return  {"message": "ok"}