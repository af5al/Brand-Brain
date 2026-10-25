import os
from google import genai
from google.genai import types

async def generate_text(prompt: str):
    apikey = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("GEMINI_MODEL")
    print(f"Calling Gemini with model: {model_name}")
    client = genai.Client()
    response = await client.aio.models.generate_content(model=model_name, contents=prompt)
    return response.text

async def generate_embedding(text: str) -> list[float]:
    embedding_model = os.getenv("EMBEDDING_MODEL")
    config = types.EmbedContentConfig(output_dimensionality=768)
    client = genai.Client()
    response = await client.aio.models.embed_content(
        model=embedding_model,
        contents=text,
        config=config
    )
    return response.embeddings[0].values