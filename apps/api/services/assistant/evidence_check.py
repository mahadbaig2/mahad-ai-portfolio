"""Threshold-based evidence evaluation node for grounded assistant workflow (P9.2.5)."""

import time
from typing import Any

# Minimum similarity score threshold for evidence acceptance
DEFAULT_EVIDENCE_THRESHOLD = 0.55
MARGINAL_EVIDENCE_THRESHOLD = 0.45


def evaluate_evidence_quality(
    evidence_chunks: list[dict[str, Any]],
    threshold: float = DEFAULT_EVIDENCE_THRESHOLD,
) -> dict[str, Any]:
    """P9.2.5: Evaluate similarity scores and coverage of retrieved chunks.

    Returns structured evaluation with status: 'sufficient', 'uncertain', or 'insufficient'.
    """
    if not evidence_chunks:
        return {
            "status": "insufficient",
            "top_score": 0.0,
            "chunks_count": 0,
            "threshold": threshold,
            "reason": "No vector chunks found matching query criteria.",
        }

    top_score = max(chunk.get("similarity_score", 0.0) for chunk in evidence_chunks)
    chunks_count = len(evidence_chunks)

    if top_score >= threshold:
        return {
            "status": "sufficient",
            "top_score": round(top_score, 4),
            "chunks_count": chunks_count,
            "threshold": threshold,
            "reason": f"Top similarity score ({top_score:.4f}) meets acceptance threshold ({threshold}).",
        }
    elif top_score >= MARGINAL_EVIDENCE_THRESHOLD:
        return {
            "status": "uncertain",
            "top_score": round(top_score, 4),
            "chunks_count": chunks_count,
            "threshold": threshold,
            "reason": f"Top similarity score ({top_score:.4f}) is marginal; warrants clarification or query refinement.",
        }
    else:
        return {
            "status": "insufficient",
            "top_score": round(top_score, 4),
            "chunks_count": chunks_count,
            "threshold": threshold,
            "reason": f"Top similarity score ({top_score:.4f}) is below minimum acceptance threshold ({threshold}).",
        }


def evaluate_evidence_node(state: dict[str, Any]) -> dict[str, Any]:
    """LangGraph node checking evidence threshold before grounded generation."""
    t0 = time.perf_counter()
    evidence_chunks = state.get("evidence_chunks", [])
    eval_result = evaluate_evidence_quality(evidence_chunks)

    status = eval_result["status"]
    duration_ms = (time.perf_counter() - t0) * 1000.0

    step_telemetry = {
        "step_name": "evaluate_evidence",
        "duration_ms": round(duration_ms, 2),
        "status": "completed",
        "details": eval_result,
    }

    steps = list(state.get("execution_steps", []))
    steps.append(step_telemetry)

    # Route update based on threshold evaluation
    if status == "sufficient":
        next_route = "grounded_generation"
    elif status == "uncertain":
        next_route = "clarification"
    else:
        next_route = "refusal"

    return {
        "route": next_route,
        "execution_steps": steps,
    }
