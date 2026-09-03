# apps/api

FastAPI backend service and LangGraph orchestrator for the Mahad AI Portfolio assistant.

## Responsibilities
- Serve assistant chat endpoints and Server-Sent Events (SSE) streaming.
- Run in-process ONNX query router.
- Orchestrate LangGraph conditional workflow (RAG, deterministic lookup, clarify, refuse).
- Provide health, liveness, readiness, and metrics endpoints.
- Manage operational persistence with PostgreSQL (Neon) and SQLAlchemy.
