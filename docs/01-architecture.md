# 01 — System Architecture: Brand Brain

## System Overview

Brand Brain is an AI Campaign Copilot designed for multi-channel marketing automation. It ingests public brand knowledge, indexes it via vector embeddings, and exposes grounded generation endpoints to a mobile client.

```mermaid
graph TD
    subgraph Client ["Client Layer (Mobile)"]
        Mobile["React Native (Expo App)<br/>iOS & Android APK"]
    end

    subgraph Server ["Backend Layer (FastAPI on Render)"]
        API["FastAPI REST Server<br/>(Async Endpoints, Pydantic)"]
        Wrapper["Gemini Client Wrapper<br/>(Retry / Backoff / Env Config)"]
        RAG["RAG Ingestion & Query Engine"]
    end

    subgraph Data ["Data & Storage Layer (Supabase)"]
        PG["PostgreSQL + pgvector<br/>(Brands, Documents, Vector Chunks)"]
    end

    subgraph AI ["AI Services (Google AI Studio)"]
        GeminiLLM["Gemini 2.0 / 1.5 Flash<br/>(Campaign & Reply Generation)"]
        GeminiEmbed["text-embedding-004<br/>(768-dim Vector Embeddings)"]
    end

    Mobile -->|REST JSON via LAN / HTTPS| API
    API --> RAG
    RAG --> Wrapper
    Wrapper -->|API Key in Env / HTTPS| GeminiLLM
    Wrapper -->|Batch Embeddings / HTTPS| GeminiEmbed
    RAG -->|Vector Search SQL| PG
```

---

## Free-Tier Operational Constraints (Verified October 2026)

| Service | Component | Quota / Free Limit | Architectural Mitigation |
|---|---|---|---|
| **Google AI Studio** | Gemini Flash (Generation) | 15 RPM, 1M TPM, 1,500 RPD | Asynchronous exponential backoff on HTTP 429, short concise system prompts |
| **Google AI Studio** | `text-embedding-004` (Embeddings) | 1,500 RPD, ~100 RPM | Batch embedding requests, caching text hashes |
| **Supabase** | PostgreSQL + pgvector | 500 MB DB, auto-pause after 7 days | Reduced vector dimensions where appropriate, health ping before interviews |
| **Render** | FastAPI Backend | Sleeps after 15 min idle, 50s cold start | Mobile app retry logic, pre-warming ping on app launch |

---

## Network & Security Isolation

1. **Zero Secret Leakage:** The mobile client only holds the backend's base URL. `GEMINI_API_KEY` and `SUPABASE_DB_URL` exist solely in the backend environment.
2. **Device Networking Reality:** Physical mobile devices running Expo Go cannot access `http://localhost:8000` because `localhost` refers to the mobile phone itself. Communication requires the host computer's Local Area Network (LAN) IP (e.g., `http://192.168.x.x:8000`).
