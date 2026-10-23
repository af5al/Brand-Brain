# Brand Brain — Learning & Implementation Progress

## Overall Status
- **Current Phase:** Day 1, Phase 0 (Setup & "Hello AI")
- **Target Company:** Nextoria Information Technology LLC (Dubai) — AI Engineer Role
- **Core Stack:** React Native (Expo) + FastAPI + Supabase pgvector + Gemini API (Free tier)

---

## Phase Log

### Day 1: Foundations and the RAG Core
| Phase | Status | Focus |
|---|---|---|
| **Phase 0: Setup and "Hello AI"** | 🟡 In Progress | Architecture, FastAPI async healthcheck, Gemini wrapper, Expo handshake |
| **Phase 1: Ingestion and Retrieval (RAG Core)** | ⚪ Pending | Chunking, embeddings, pgvector, similarity search |

### Day 2: Generation, Grounding & Mobile UI
| Phase | Status | Focus |
|---|---|---|
| **Phase 2: Campaign Generator** | ⚪ Pending | Structured JSON generation, Pydantic validation, English/Arabic RTL |
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

## Weak Spots & Points to Practice
- Bridging Node.js synchronous vs asynchronous event loop mental models to Python's `asyncio`.
- Device networking when testing mobile apps against local backends (`localhost` vs LAN IP).

## Interview Questions Covered
- *"Why can't mobile applications call LLM APIs directly?"* (Answered: Secret exposure via APK decompile + business logic/rate limiting/RAG orchestration control).
- *"What happens if an LLM endpoint is synchronous instead of asynchronous?"* (Answered: Thread starvation, request queuing, 504 timeouts).
- *"How do you select the temperature parameter for different LLM tasks?"* (Answered: Low 0.0–0.2 for deterministic data extraction & strict schemas; High 0.7+ for creative copywriting).
