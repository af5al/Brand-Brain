from fastapi import responses
from src.schemas import CampaignResponse
from fastapi import HTTPException
import supabase
from src.schemas import CampaignRequest
from src.services.chunker import chunk_text
from src.services.db import get_supabase
from src.schemas import IngestRequest
import os
from google import genai
from google.genai import types

async def generate_text(prompt: str):
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

async def ingest_brand_service(data: IngestRequest):
    # brand lookup/ creation
    supabase = get_supabase()
    brand_res = supabase.table("brands").insert({
        "name": data.brand_name
    }).execute()
    brand_id = brand_res.data[0]["id"]

    # document record
    doc_res = supabase.table("documents").insert({
        "brand_id": brand_id,
        "title": data.document_title,
        "raw_content": data.content
    }).execute()
    doc_id = doc_res.data[0]["id"]

    # create chunk
    chunks = chunk_text(data.content, chunk_size=500, chunk_overlap=50)
    # embed and prepare rows- for each chunk index and chunk string. generate its 768-dim vector
    records = []
    for index, chunk in enumerate(chunks):
        embed_chunk = await generate_embedding(chunk)
        index_doc_chunk = {
            "document_id": doc_id,
            "brand_id": brand_id,
            "chunk_index": index,
            "content": chunk,
            "embedding": embed_chunk
        }
        records.append(index_doc_chunk)
    # bulk insert 
    supabase.table("document_chunks").insert(records).execute()

    return {
        "status": "success",
        "brand_id": brand_id,
        "chunks_count": len(records)
    }

async def search_brand_chunks(brand_id: str, query: str, limit:int = 5, threshold: float = 0.50):
    #1- embed the search query
    query_vector = await generate_embedding(query)

    #2- call the pgvector stored procedure via supabase RPC
    supabase = get_supabase()
    res = supabase.rpc("match_chunks", {
        "query_embedding": query_vector,
        "filter_brand_id": brand_id,
        "match_count": limit,
        "similarity_threshold": threshold
    }).execute()

    return res.data

async def generate_campaign_result(req_data: CampaignRequest):
    chunks = await search_brand_chunks(req_data.brand_id, req_data.product_name, limit=3, threshold=0.40)
    if(len(chunks) <= 0):  
      raise(HTTPException(status_code=404, detail="No brand facts found for this product."))  

    # Combine the retrieved chunks into text
    context_text = "\n\n".join([c["content"] for c in chunks])

    prompt = f"""
    You are a senior bilingual marketing strategist.
    Create a high-converting campaign for '{req_data.product_name}' on the '{req_data.channel}' channel.
    Language required: {req_data.language}.

    GROUNDING RULES:
    1. Base all copy ONLY on the brand context below.
    2. Do NOT invent claims, awards, or ingredients not present in the context.
    3. If language is 'arabic', write fluent Arabic and set is_rtl=true. If 'english', set is_rtl=false.

    BRAND CONTEXT:
    ---
    {context_text}
    ---
    """

    model_name = os.getenv("GEMINI_MODEL")
    client = genai.Client()

    response = await client.aio.models.generate_content(
        model = model_name,
        contents = prompt,
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=CampaignResponse,
            temperature = 0.7,
        )
    )

    # Parse JSON into validated Pydantic object
    return CampaignResponse.model_validate_json(response.text)


