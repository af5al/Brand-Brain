# Brand Brain — Learning & Implementation Progress

## Overall Status
- **Current Phase:** Day 2, Phase 2 (Campaign Generator — English & Arabic)
- **Target Company:** Nextoria Information Technology LLC (Dubai) — AI Engineer Role
- **Core Stack:** React Native (Expo) + FastAPI + Supabase pgvector + Gemini API (Free tier)

---

## Phase Log

### Day 1: Foundations and the RAG Core
| Phase | Status | Focus |
|---|---|---|
| **Phase 0: Setup and "Hello AI"** | 🟢 Complete | Architecture, FastAPI async healthcheck, Gemini wrapper, Expo mobile handshake |
| **Phase 1: Ingestion and Retrieval (RAG Core)** | 🟢 Complete | Sliding-window chunker, pgvector HNSW indexing, 768-dim embeddings, semantic search |

### Day 2: Generation, Grounding & Mobile UI
| Phase | Status | Focus |
|---|---|---|
| **Phase 2: Campaign Generator** | 🟡 Up Next | Structured JSON generation, Pydantic validation, English/Arabic RTL, multi-channel copy |
| **Phase 3: Reply Assistant** | ⚪ Pending | Grounding checks, confidence thresholding, human-in-the-loop escalation |

### Day 3: Quality, Deployment & Interview Prep
| Phase | Status | Focus |
|---|---|---|
| **Phase 4: Evaluation & Hardening** | ⚪ Pending | Golden test set, Hit Rate@k, error handling & retry |
| **Phase 4b: Deployment** | ⚪ Pending | Render (backend), Supabase (DB), EAS Android APK |
| **Phase 5: Packaging & Mock Interview** | ⚪ Pending | README, demo video, resume bullets, 15-question technical interview |

---

## Concepts Mastered
- [x] Client-Server separation & mobile thin client security
- [x] Python `async`/`await` vs. Node.js Event Loop blocking behavior
- [x] LLM Temperature dynamics (deterministic 0.0 vs creative 0.8+ trade-offs)
- [x] Mobile Device Networking (Localhost loopback vs LAN IP & 0.0.0.0 binding)
- [x] Vector space, embeddings (768 dimensions), and cosine similarity
- [x] Sliding-window text chunking (size vs overlap trade-offs)
- [x] PostgreSQL + pgvector schema design with HNSW vector index
- [x] Similarity threshold calibration (filtering baseline noise e.g. 0.30 vs 0.50)
- [x] Multi-tenant data isolation (`filter_brand_id` partition in vector RPC)

## Weak Spots & Points to Practice
- Python `enumerate()` order: `(index, item)`.
- Remembering to `await` asynchronous generator and embedding calls.
- Distinguishing between path parameter syntax in FastAPI (`{param}`) vs JS template literals (`${param}`).

## Interview Questions Covered
- *"Why can't mobile applications call LLM APIs directly?"* (Answered: Secret exposure via APK decompile + business logic/rate limiting/RAG orchestration control).
- *"What happens if an LLM endpoint is synchronous instead of asynchronous?"* (Answered: Thread starvation, request queuing, 504 timeouts).
- *"How do you select the temperature parameter for different LLM tasks?"* (Answered: Low 0.0–0.2 for deterministic data extraction & strict schemas; High 0.7+ for creative copywriting).
- *"Walk me through the exact life of a request from mobile to backend to LLM and back."* (Answered: User gesture -> TCP/LAN -> FastAPI route -> HTTPS to Gemini -> JSON deserialize -> React state render).
- *"How did you choose chunk size? What happens if it's too large or too small?"* (Answered: Too small loses subject/context; too large dilutes meaning and inflates prompt token cost).
