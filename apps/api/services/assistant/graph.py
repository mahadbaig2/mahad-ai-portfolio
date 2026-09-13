"""LangGraph workflow definition, conditional edges, and execution engine (P9.1.4, P9.1.5 & P9.2)."""

import logging
from typing import Any
from uuid import UUID

from langgraph.graph import END, StateGraph

from apps.api.schemas.assistant import (
    AssistantChatResponse,
    AssistantMode,
    ExecutionStepPayload,
)
from apps.api.schemas.router import LanguageLabel, RouteLabel
from apps.api.services.assistant.audit import record_safe_retrieval_event
from apps.api.services.assistant.nodes import (
    apply_audience_style_node,
    clarification_node,
    classify_query_node,
    direct_response_node,
    evaluate_evidence_node,
    grade_evidence_node,
    grounded_generation_node,
    refusal_node,
    retrieve_evidence_node,
    rewrite_query_node,
    validate_input_node,
)
from apps.api.services.assistant.state import AssistantState, create_initial_state

logger = logging.getLogger(__name__)

# Hard limits (P9.1.5 and locked agent rules in AGENTS.md)
HARD_RECURSION_LIMIT = 10
MAX_QUERY_REWRITES = 1


def route_after_validation(state: AssistantState) -> str:
    """Conditional edge after input validation."""
    if not state.get("is_safe", True):
        return "refusal"
    return "classify_query"


def route_after_classification(state: AssistantState) -> str:
    """P9.1.4: Explicit conditional routing edge evaluating route recommendations."""
    route = state.get("route", "")

    if route == RouteLabel.DIRECT_CHAT.value:
        return "direct_response"
    elif route == RouteLabel.REFUSAL.value:
        return "refusal"
    elif route == "clarification":
        return "clarification"
    elif route == RouteLabel.RAG_RETRIEVAL.value:
        return "retrieve_evidence"

    # Default fallback
    return "retrieve_evidence"


def route_after_evidence(state: AssistantState) -> str:
    """P9.2.5 & P9.3.1: Conditional edge evaluating threshold evidence check."""
    route = state.get("route", "")
    if route == "grounded_generation":
        return "grounded_generation"
    elif route == "grade_evidence":
        return "grade_evidence"
    elif route == "rewrite_query":
        return "rewrite_query"
    elif route == "clarification":
        return "clarification"
    return "refusal"


def route_after_grading(state: AssistantState) -> str:
    """P9.3.1 & P9.3.2: Conditional edge evaluating evidence grader decision."""
    route = state.get("route", "")
    if route == "grounded_generation":
        return "grounded_generation"
    elif route == "rewrite_query":
        return "rewrite_query"
    elif route == "clarification":
        return "clarification"
    return "refusal"


def create_assistant_graph() -> Any:
    """Build and compile the typed LangGraph assistant workflow with full Milestone 9.3 recovery & citation layers."""
    builder = StateGraph(AssistantState)

    # Register nodes
    builder.add_node("validate_input", validate_input_node)
    builder.add_node("classify_query", classify_query_node)
    builder.add_node("direct_response", direct_response_node)
    builder.add_node("refusal", refusal_node)
    builder.add_node("clarification", clarification_node)
    builder.add_node("retrieve_evidence", retrieve_evidence_node)
    builder.add_node("evaluate_evidence", evaluate_evidence_node)
    builder.add_node("grade_evidence", grade_evidence_node)
    builder.add_node("rewrite_query", rewrite_query_node)
    builder.add_node("grounded_generation", grounded_generation_node)
    builder.add_node("apply_audience_style", apply_audience_style_node)

    # Set entry point
    builder.set_entry_point("validate_input")

    # Conditional routing edges (P9.1.4)
    builder.add_conditional_edges(
        "validate_input",
        route_after_validation,
        {
            "classify_query": "classify_query",
            "refusal": "refusal",
        },
    )

    builder.add_conditional_edges(
        "classify_query",
        route_after_classification,
        {
            "direct_response": "direct_response",
            "refusal": "refusal",
            "clarification": "clarification",
            "retrieve_evidence": "retrieve_evidence",
        },
    )

    # RAG pipeline edges (P9.2 & P9.3)
    builder.add_edge("retrieve_evidence", "evaluate_evidence")

    builder.add_conditional_edges(
        "evaluate_evidence",
        route_after_evidence,
        {
            "grounded_generation": "grounded_generation",
            "grade_evidence": "grade_evidence",
            "rewrite_query": "rewrite_query",
            "clarification": "clarification",
            "refusal": "refusal",
        },
    )

    builder.add_conditional_edges(
        "grade_evidence",
        route_after_grading,
        {
            "grounded_generation": "grounded_generation",
            "rewrite_query": "rewrite_query",
            "clarification": "clarification",
            "refusal": "refusal",
        },
    )

    # Bounded retry loop (P9.3.2): rewrite_query loops back to retrieve_evidence
    builder.add_edge("rewrite_query", "retrieve_evidence")

    # Grounded synthesis transitions to audience style adaptation (P9.3.5 & P9.3.6)
    builder.add_edge("grounded_generation", "apply_audience_style")

    # Terminal edges
    builder.add_edge("direct_response", END)
    builder.add_edge("refusal", END)
    builder.add_edge("clarification", END)
    builder.add_edge("apply_audience_style", END)

    return builder.compile()


# Single compiled graph instance for reuse
_compiled_graph = None


def get_assistant_graph() -> Any:
    """Obtain or compile singleton LangGraph assistant workflow."""
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = create_assistant_graph()
    return _compiled_graph


def run_assistant_turn(
    message: str,
    session_id: str,
    mode: str = "text",
    history: list[dict[str, Any]] | None = None,
    persona: str = "general",
) -> AssistantChatResponse:
    """Execute a single assistant turn through the compiled LangGraph workflow (P9.1.5, P9.2 & P9.3)."""
    graph = get_assistant_graph()
    initial_state = create_initial_state(
        input_text=message,
        session_id=session_id,
        mode=mode,
        transcript=history,
        persona=persona,
    )

    config = {"recursion_limit": HARD_RECURSION_LIMIT}

    try:
        final_state: AssistantState = graph.invoke(initial_state, config=config)
    except Exception as e:
        logger.exception("Assistant graph execution failed: %s", e)
        # Bounded fallback on unexpected runtime error
        return AssistantChatResponse(
            session_id=UUID(session_id),
            answer="I encountered an unexpected internal error. Please try again.",
            citations=[],
            route=RouteLabel.REFUSAL,
            language=LanguageLabel.EN,
            is_safe=False,
            mode=AssistantMode(mode),
            execution_steps=[],
            errors=[str(e)],
        )

    # P9.3.7: Safe retrieval event persistence (non-fatal)
    record_safe_retrieval_event(
        query_text=final_state.get("sanitized_query") or message,
        rewritten_query=final_state.get("rewritten_query"),
        evidence_chunks=final_state.get("evidence_chunks", []),
        cited_chunk_ids=final_state.get("citations", []),
    )

    # Map state to typed Pydantic response contract
    steps = [
        ExecutionStepPayload(
            step_name=s["step_name"],
            duration_ms=s["duration_ms"],
            status=s.get("status", "completed"),
            details=s.get("details", {}),
        )
        for s in final_state.get("execution_steps", [])
    ]

    route_str = final_state.get("route", "rag_retrieval")
    try:
        route_label = RouteLabel(route_str)
    except ValueError:
        route_label = RouteLabel.RAG_RETRIEVAL

    lang_str = final_state.get("language", "en")
    try:
        lang_label = LanguageLabel(lang_str)
    except ValueError:
        lang_label = LanguageLabel.EN

    return AssistantChatResponse(
        session_id=UUID(session_id),
        answer=final_state.get("final_answer", ""),
        citations=final_state.get("citations", []),
        route=route_label,
        language=lang_label,
        is_safe=final_state.get("is_safe", True),
        mode=AssistantMode(mode),
        suggested_actions=final_state.get("suggested_actions", []),
        navigation_target=final_state.get("navigation_target"),
        execution_steps=steps,
        errors=final_state.get("errors", []),
    )
