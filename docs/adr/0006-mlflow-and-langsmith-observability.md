# ADR-006: Dual Observability — MLflow for ML Lifecycle and LangSmith for LLMOps

- **Status**: Proposed (Accepted for V1)
- **Date**: 2026-09-04
- **Author**: Antigravity & Mahad

## Context
The system combines classical/deep ML (classifier training, dataset splits, hyperparameter tuning, model versioning) and generative LLM orchestration (LangGraph state transitions, vector retrieval context, groundedness evaluation, token usage). Using a single tool for both creates poor visibility: LLM tracing tools lack metric comparison across ML training runs, while ML experiment trackers cannot trace multi-node agentic graph execution.

## Decision
Adopt a clean separation of observability concerns:
1. **MLflow**: Manages the machine learning lifecycle:
   - Tracks dataset versions, random seeds, hyperparameters, classification metrics (Macro F1, per-class recall, calibration, confusion matrix).
   - Serves as the artifact registry for champion ONNX models.
   - Runs locally in dev or lightweight remote file storage (`./mlruns`).
2. **LangSmith**: Manages LLMOps and runtime tracing:
   - Traces LangGraph workflow steps: input validation -> ONNX routing -> vector retrieval -> evidence grading -> grounded draft -> citation verification.
   - Runs continuous evaluation suites (groundedness, citation accuracy, unanswerable query refusal, Roman Urdu comprehension).
   - **Cost Safeguard**: Disabled by default in local dev (`LANGCHAIN_TRACING_V2=false`), sampled in production, and wrapped in non-blocking error handlers so LangSmith outages never fail a user request.

## Consequences

### Positive
- Clear audit trails for both ML modeling and generative agent behavior.
- High-fidelity debugging of agent execution paths for both the developer and the public Execution Inspector.
- Zero risk of user request disruption if tracing encounters network or quota limits.

### Negative / Trade-offs
- Managing two observability tools; mitigated by keeping MLflow strictly offline during model training and LangSmith as an optional runtime wrapper.
