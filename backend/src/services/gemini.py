from src.schemas import CustomerIntent
from src.schemas import ReplyResponse
from src.schemas import ReplyAction
from src.schemas import ReplyRequest
from fastapi import responses
from src.schemas import CampaignResponse
from fastapi import HTTPException
import supabase
from src.schemas import CampaignRequest
from src.services.chunker import chunk_text
from src.services.db import get_supabase
from src.schemas import IngestRequest
import asyncio
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

async def draft_customer_reply(req: ReplyRequest):
    brand_chunks = await search_brand_chunks(brand_id=req.brand_id, query=req.customer_message, limit=3, threshold=0.50)
    
    top_score = max([c.get("similarity", 0.0) for c in brand_chunks]) if brand_chunks else 0.0
             
    print("Customer message:", req.customer_message)
    print("Brand chunks:", len(brand_chunks))
    print("Retrieved chunks:", brand_chunks)
    print("Top score:", top_score)
    print("Threshold:", 0.50)
   
    if top_score < 0.50:
        return ReplyResponse(
            intent=CustomerIntent.FAQ,
            action= ReplyAction.ESCALATE_TO_HUMAN,
            draft_reply= "Thank you for reaching out! To ensure you receive accurate details about this, I've forwarded your request to our team specialist who will assist you shortly.",
            escalation_reason= "No verified brand facts found in knowledge base.",
            confidence_score= 0.0,
            grounded_facts_used=[]
        )
        
    context_text = "\n\n".join([c["content"] for c in brand_chunks])
    prompt = f"""
        You are an expert customer support assistant for this brand on {req.channel}.

        CUSTOMER INQUIRY:
        "{req.customer_message}"

        VERIFIED BRAND CONTEXT:
        ---
        {context_text}
        ---

        INSTRUCTIONS:
        1. CLASSIFY the customer's intent into one of: 'faq', 'lead', 'complaint', or 'out_of_scope'.
        2. GROUNDING RULE: Answer the inquiry using ONLY the verified brand context above. Never invent facts, prices, policies, or claims.
        3. DECISION LOGIC:
        - If the context contains sufficient evidence to answer accurately:
            * Set action = "reply_drafted"
            * draft_reply = A warm, professional, concise response answering their question.
            * grounded_facts_used = List the specific facts from the context you used.
        - If the context does NOT fully answer the inquiry or is ambiguous:
            * Set action = "escalate_to_human"
            * draft_reply = "Thank you for reaching out! To make sure you get the most accurate details regarding this, I've routed your inquiry to our team specialist who will assist you shortly."
            * escalation_reason = "Context lacked specific details to answer safely without guessing."
            * grounded_facts_used = []
        4. Set confidence_score = {top_score}
    """
    
    model_name = os.getenv("GEMINI_MODEL")
    
    client = genai.Client()
    
    print("CALLING GEMINI API...")
    for attempt in range(3):
        try:
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ReplyResponse,
                    temperature=0.1,
                )
            )
            print("Gemini response:", response.text)
            return ReplyResponse.model_validate_json(response.text)
        except Exception as e:
            err_str = str(e)
            is_transient = any(x in err_str for x in ["503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED"])
            if is_transient:
                wait_secs = 2 ** attempt
                print("Gemini transient error, attempt", attempt + 1, "of 3. Retrying in", wait_secs, "s:", err_str[:120])
                await asyncio.sleep(wait_secs)
                continue
            raise
    raise HTTPException(
        status_code=503,
        detail="AI service temporarily unavailable after retries. Please try again in a moment."
    )
    
async def create_brand(name: str):
    clean_name = name.strip()
    if not clean_name:
        raise HTTPException(status_code = 400, detail="Brand name cannot be empty.")
    supabase = get_supabase()
    try:
        res = supabase.table("brands").insert({
             "name": name
        }).execute()
        return res.data[0]
    except Exception as e:
        if "unique" in str(e).lower() or "duplicate" in str(e).lower():
            raise HTTPException(status_code = 409, detail= f"Brand '{name}' already exists") 
        raise
    
async def delete_brand(brand_id: str):
    supabase = get_supabase()
    # FK cascade: chunks → documents → brand
    supabase.table("document_chunks").delete().eq("brand_id", brand_id).execute()
    supabase.table("documents").delete().eq("brand_id", brand_id).execute()
    supabase.table("brands").delete().eq("id", brand_id).execute()
    return {"status": "deleted", "brand_id": brand_id}

# ── Document CRUD ───────────────────────────────────────────
async def add_document_to_brand(brand_id: str, title: str, content: str):
    supabase = get_supabase()
    doc_res = supabase.table("documents").insert({
        "brand_id": brand_id,
        "title": title,
        "raw_content": content
    }).execute()
    doc_id = doc_res.data[0]["id"]
    chunks = chunk_text(content, chunk_size=500, chunk_overlap=50)
    records = []
    for index, chunk in enumerate(chunks):
        embedding = await generate_embedding(chunk)
        records.append({
            "document_id": doc_id,
            "brand_id": brand_id,
            "chunk_index": index,
            "content": chunk,
            "embedding": embedding
        })
    if records:
       supabase.table("document_chunks").insert(records).execute()
    return {"status": "success", "doc_id": doc_id, "chunks_added": len(records)}

async def list_brands_service():
    supabase = get_supabase()
    res = supabase.table("brands").select("*").order("name").execute()
    return res.data

async def update_document(brand_id: str, doc_id: str, title: str, content: str):
    supabase = get_supabase()
    # Delete stale embeddings first (embedding drift prevention)
    supabase.table("document_chunks").delete().eq("document_id", doc_id).execute()
    # Update the source text
    supabase.table("documents").update({
        "title": title,
        "raw_content": content
    }).eq("id", doc_id, "brand_id", brand_id).execute()
    # Re-chunk and re-embed fresh
    chunks = chunk_text(content, chunk_size=500, chunk_overlap=50)
    records = []
    for index, chunk in enumerate(chunks):
        embedding = await generate_embedding(chunk)
        records.append({
            "document_id": doc_id,
            "brand_id": brand_id,
            "chunk_index": index,
            "content": chunk,
            "embedding": embedding
        })
    if records:
     supabase.table("document_chunks").insert(records).execute()
    return {"status": "updated", "doc_id": doc_id, "chunks_added": len(records)}

async def delete_document(doc_id: str):
    supabase = get_supabase()
    supabase.table("document_chunks").delete().eq("document_id", doc_id).execute()
    supabase.table("documents").delete().eq("id", doc_id).execute()
    return {"status": "deleted", "doc_id": doc_id}
