import os
from google import genai

async def generate_text(prompt: str):
    apikey = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("GEMINI_MODEL")
    print(f"Calling Gemini with model: {model_name}")
    client = genai.Client()
    response = await client.aio.models.generate_content(model=model_name, contents=prompt)
    return response.text