# ADR-004: FastAPI and LangGraph Hosted on CPU Basic Space

- **Status**: Proposed (Accepted for V1)
- **Date**: 2026-09-04
- **Author**: Antigravity & Mahad

## Context
Production hosting for the AI backend must remain 100% free with predictable resource consumption. The backend coordinates stateful workflows, query classification, retrieval, Groq API proxying, and Server-Sent Events (SSE). Paid cloud VMs, serverless container platforms with metered execution, or GPU instances would violate the locked zero-dollar operational constraint.

## Decision
Host the AI API (`apps/api`) on **Hugging Face Spaces** using the permanent **CPU Basic tier** (2 vCPU, 16 GB RAM) packaged in a slim Docker container:
- **FastAPI**: Provides asynchronous endpoint handling, Pydantic data validation, OpenAPI specification generation, and streaming responses.
- **LangGraph**: Orchestrates the multi-step assistant workflow as a directed, typed state graph with bounded retries (maximum 1 query rewrite) and explicit conditional routing.
- External heavy inference (LLM completion via Groq, Whisper transcription via Groq) is offloaded over HTTPS, keeping CPU utilization and memory footprint minimal.

## Consequences

### Positive
- Zero recurring hosting cost with generous 16 GB memory headroom (easily accommodating the in-process ONNX model and tokenizer).
- Standard Docker deployment ensures 100% local dev / production parity.
- Explicit LangGraph execution state enables inspectability for the live Execution Inspector on the frontend.

### Negative / Trade-offs
- CPU Space sleep/spin-down on inactivity; mitigated with frontend loading state indicators and keep-alive health pings.
- CPU inference is unsuitable for large autoregressive LLMs, which is why Groq free-tier API handles generation while only lightweight ONNX classification runs locally.
