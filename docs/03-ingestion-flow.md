# 03 — Ingestion & Vectorization Flow: Brand Brain

## Ingestion Pipeline Sequence

The ingestion flow transforms raw brand content (websites, product catalogs, FAQ text) into searchable vector embeddings stored in Supabase pgvector.

```mermaid
sequenceDiagram
    autonumber
    actor Marketer as Marketer (Mobile Client)
    participant API as FastAPI Backend (/ingest)
    participant Scraper as Text Scraper / Cleaner
    participant Chunker as Text Chunking Engine
    participant Gemini as Gemini Embeddings (text-embedding-004)
    participant DB as Supabase PostgreSQL + pgvector

    Marketer->>API: POST /brands/{id}/ingest (URL or Text)
    API->>Scraper: Fetch & extract clean text (remove HTML, scripts, noise)
    Scraper-->>API: Clean text document
    API->>DB: Store raw document in `documents` table
    
    API->>Chunker: Split into chunks (size: 500 chars, overlap: 50 chars)
    Chunker-->>API: Array of chunk strings + metadata
    
    API->>Gemini: Request batch embeddings (client.aio.models.embed_content)
    Note over API,Gemini: Rate-limit aware batching with backoff retry
    Gemini-->>API: Array of 768-dimensional float vectors
    
    API->>DB: Bulk insert chunks + vectors into `document_chunks`
    DB-->>API: Success (HNSW index automatically updated)
    API-->>Marketer: Ingestion Complete ({chunks_count, document_id})
```

---

## Architectural Principles & Trade-Offs

1. **Deterministic Multi-Tenancy:**
   Every chunk in `document_chunks` explicitly carries both `brand_id` and `document_id`. Search queries **always** filter by `brand_id = target_brand` first before calculating vector cosine distance. This completely prevents Brand A from ever seeing Brand B's proprietary copy.

2. **HNSW vs IVFFlat Indexing:**
   - **IVFFlat:** Requires a training step and data clustering. Performs poorly when tables are small or rapidly growing.
   - **HNSW (Hierarchical Navigable Small World):** Builds a multi-layer graph of vectors. Offers higher query recall (search accuracy) and faster lookups out of the box with zero pre-training required.
