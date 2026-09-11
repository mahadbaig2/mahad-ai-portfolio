"""Typed state definitions for the LangGraph assistant graph (P9.1.1)."""

from typing import Any, Dict, List, Optional, TypedDict


class AssistantState(TypedDict):
    """Execution state tracked across all LangGraph nodes in the assistant pipeline.

    P9.1.1 Attributes:
    - input: Raw user input text
    - session_id: Unique interaction/session tracking ID
    - transcript: Conversation history turns
    - mode: Interaction mode (text or voice)
    - sanitized_query: Cleaned, validated, and normalized text
    - is_safe: Boolean flag indicating if safety gate passed
    - safety_violations: Reasons for refusal or moderation flags
    - classifier_output: Full dictionary prediction from in-process ONNX model
    - route: Routing decision (rag_retrieval, direct_chat, refusal, clarification)
    - intent: Intent classification (project_technical, career_skills, greeting, etc.)
    - language: Detected language (en or ur)
    - confidence: Confidence score of route
    - retrieval_query: Final or rewritten search query for vector search
    - evidence_chunks: List of canonical chunks retrieved from PostgreSQL + Qdrant
    - retrieval_retries: Count of query rewrite attempts (hard-bounded to 1)
    - draft_answer: Initial drafted synthesis
    - final_answer: Grounded markdown answer with strict citations
    - citations: Unique chunk IDs referenced in the final response
    - errors: Trace of non-fatal execution errors
    - execution_steps: Detailed telemetry records for the UI Execution Inspector
    """
    input_text: str
    session_id: str
    mode: str
    transcript: List[Dict[str, Any]]
    sanitized_query: str
    is_safe: bool
    safety_violations: List[str]
    classifier_output: Optional[Dict[str, Any]]
    route: str
    intent: str
    language: str
    confidence: float
    retrieval_query: str
    evidence_chunks: List[Dict[str, Any]]
    retrieval_retries: int
    draft_answer: str
    final_answer: str
    citations: List[str]
    errors: List[str]
    execution_steps: List[Dict[str, Any]]


def create_initial_state(
    input_text: str,
    session_id: str,
    mode: str = "text",
    transcript: Optional[List[Dict[str, Any]]] = None,
) -> AssistantState:
    """Create a clean initial state for a new assistant turn."""
    return {
        "input_text": input_text,
        "session_id": session_id,
        "mode": mode,
        "transcript": transcript or [],
        "sanitized_query": "",
        "is_safe": True,
        "safety_violations": [],
        "classifier_output": None,
        "route": "rag_retrieval",
        "intent": "unknown",
        "language": "en",
        "confidence": 0.0,
        "retrieval_query": input_text,
        "evidence_chunks": [],
        "retrieval_retries": 0,
        "draft_answer": "",
        "final_answer": "",
        "citations": [],
        "errors": [],
        "execution_steps": [],
    }
