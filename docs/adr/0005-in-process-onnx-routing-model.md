# ADR-005: In-Process ONNX Query Routing Model

- **Status**: Proposed (Accepted for V1)
- **Date**: 2026-09-04
- **Author**: Antigravity & Mahad

## Context
A primary engineering highlight of the portfolio is demonstrating classical and applied machine learning capabilities beyond generic prompt engineering. Every incoming user query must be classified for:
- Intent: (e.g. `experience_inquiry`, `project_deepdive`, `technical_decision`, `contact_request`, `out_of_domain`).
- Processing Route: (`deterministic_lookup`, `standard_rag`, `agentic_rewrite`, `clarify`, `refuse`).
- Answerability: (`groundable`, `ambiguous`, `unanswerable`).
- Language: (`en`, `ur_roman`, `ur_nastaliq`, `mixed`).

Running this classification through an LLM API call increases latency by 300-800ms, consumes precious LLM quota, and introduces non-deterministic outputs. Conversely, running a separate microservice adds operational overhead and inter-service network failure modes.

## Decision
Train a dedicated classifier (baseline: TF-IDF + Logistic Regression, candidate: compact MiniLM/DistilBERT transformer), export the champion model to **ONNX**, and load it once at FastAPI startup into an **in-process `onnxruntime` session**:
- Queries are classified in < 5 milliseconds directly within the FastAPI process.
- No network hops or external API dependencies for routing decisions.
- A calibrated confidence threshold determines whether the predicted route is accepted or safely falls back to standard RAG / clarification.

## Consequences

### Positive
- Sub-10ms classification latency with zero LLM API cost.
- Fully reproducible ML pipeline tracked in MLflow and exported to an immutable artifact.
- The model runs reliably on the CPU Space without GPU requirements.

### Negative / Trade-offs
- Model updates require bundling a new ONNX artifact and redeploying the Docker image (or downloading a versioned artifact on container startup).
- Domain shift or unexpected slang requires periodic dataset expansion and retraining.
