# Product Scope - Mahad AI Portfolio (Version 1)

## Project Identity

This repository contains Mahad's AI Product Engineering portfolio and the "Talk to Mahad" assistant. The website is both a usable portfolio and an intentionally over-engineered, demonstrable AI system designed to showcase deep AI product engineering capabilities, architectural rigor, and end-to-end craftsmanship.

The assistant answers questions about Mahad's experience, projects, articles and engineering decisions using managed, cited sources. It supports text and voice, English and Roman Urdu, an inspectable RAG pipeline, a custom ML query router, LangGraph orchestration, LangSmith evaluation and an experimental cloned voice.

## Authority & Scope Rules

1. `AGENTS.md` and `TASKS.md` define the authoritative execution requirements.
2. All scope changes require explicit written approval from Mahad.
3. Any feature not listed in Version 1 Included Scope is strictly excluded from Version 1 and must be placed in `docs/backlog.md`.

---

## Locked Product Scope: Version 1

### Version 1 Included Features

- **Frontend & Web**: Next.js App Router portfolio and blog.
- **Content Management**: Sanity Studio and structured content schema.
- **Operational Persistence**: Neon PostgreSQL database.
- **Semantic Vector Store**: Qdrant vector database.
- **RAG Infrastructure**: Reproducible RAG ingestion, chunking, and retrieval pipeline.
- **Backend API**: FastAPI service.
- **ML Query Router**: Custom query-routing ML model served in-process using ONNX Runtime.
- **Orchestration**: LangGraph stateful graph workflow.
- **LLM & Speech-to-Text**: Groq LLM inference and Whisper speech transcription.
- **Observability**: LangSmith tracing, evaluation, and usage protection safeguards.
- **UI Interaction**: Text chat interface, grounded citations, and safe execution inspector.
- **Voice Capabilities**: Push-to-talk voice input.
- **Experimental Voice**: OpenVoice V2 based Mahad cloned voice output.
- **Fallback Speech**: Browser text-to-speech fallback.
- **CI/CD**: GitHub Actions workflows.
- **Containerization**: Dockerized AI and voice microservices.
- **Documentation**: Public system architecture and evaluation documentation.

### Version 1 Excluded Features

- User authentication / accounts
- Payments or billable transactions
- General autonomous actions / agentic side effects
- Email or calendar writing/sending capabilities
- Long-term personalized user memory across sessions
- WebRTC real-time audio calls
- Custom LLM model fine-tuning
- Custom neural reranking
- Kubernetes infrastructure
- Paid AWS production hosting
- Native mobile applications (iOS / Android)
- Decorative multi-agent systems

---

## Scope Governance

Any proposed addition, change, or new idea during development must be added to `docs/backlog.md` and must not be implemented in Version 1 without Mahad's explicit written approval.
