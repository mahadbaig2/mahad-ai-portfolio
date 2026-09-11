"""Individual node functions for the LangGraph assistant graph (P9.1.2 & P9.1.3).

Each node has a single responsibility and updates specific fields in AssistantState.
"""

import re
import time
from typing import Any, Dict

from apps.api.schemas.router import IntentLabel, RouteLabel
from apps.api.services.assistant.state import AssistantState
from apps.api.services.query_router import get_router_service

# Heuristic patterns for prompt injection and out-of-domain exploits
_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior)\s+instructions",
    r"disregard\s+(all\s+)?(previous|prior)\s+prompts",
    r"system\s*prompt",
    r"reveal\s+(your|the)\s+instructions",
    r"jailbreak",
    r"you\s+are\s+now\s+dan",
    r"bypass\s+safety",
]

_COMPILED_INJECTIONS = [re.compile(p, re.IGNORECASE) for p in _INJECTION_PATTERNS]


def validate_input_node(state: AssistantState) -> Dict[str, Any]:
    """P9.1.2: Validate input bounds, sanitize control characters, and evaluate safety rules."""
    t0 = time.perf_counter()
    raw_text = state.get("input_text", "")

    # Clean whitespace and strip invisible control characters
    cleaned = "".join(ch for ch in raw_text if ch.isprintable() or ch in "\n\t").strip()
    violations = []

    if not cleaned:
        violations.append("Empty query")
    elif len(cleaned) > 1000:
        cleaned = cleaned[:1000]
        violations.append("Input truncated to 1000 characters")

    # Evaluate injection heuristics
    is_safe = True
    for pattern in _COMPILED_INJECTIONS:
        if pattern.search(cleaned):
            violations.append("Prompt injection heuristic triggered")
            is_safe = False
            break

    duration_ms = (time.perf_counter() - t0) * 1000.0

    step_telemetry = {
        "step_name": "validate_input",
        "duration_ms": round(duration_ms, 2),
        "status": "passed" if is_safe else "flagged",
        "details": {"violations": violations, "input_length": len(cleaned)},
    }

    steps = list(state.get("execution_steps", []))
    steps.append(step_telemetry)

    if not is_safe:
        return {
            "sanitized_query": cleaned,
            "is_safe": False,
            "safety_violations": violations,
            "route": RouteLabel.REFUSAL.value,
            "intent": IntentLabel.PROMPT_INJECTION.value,
            "execution_steps": steps,
        }

    return {
        "sanitized_query": cleaned,
        "is_safe": True,
        "safety_violations": violations,
        "retrieval_query": cleaned,
        "execution_steps": steps,
    }


def classify_query_node(state: AssistantState) -> Dict[str, Any]:
    """P9.1.3: In-process ONNX query classification node without LLM API overhead."""
    t0 = time.perf_counter()
    query = state.get("sanitized_query") or state.get("input_text", "")

    router_service = get_router_service()
    prediction = router_service.predict(query)

    duration_ms = (time.perf_counter() - t0) * 1000.0

    step_telemetry = {
        "step_name": "classify_query",
        "duration_ms": round(duration_ms, 2),
        "status": "completed",
        "details": {
            "route": prediction.route.value,
            "route_confidence": round(prediction.route_confidence, 4),
            "intent": prediction.intent.value,
            "language": prediction.language.value,
            "model_version": prediction.model_version,
            "is_fallback": prediction.is_fallback,
        },
    }

    steps = list(state.get("execution_steps", []))
    steps.append(step_telemetry)

    # Convert prediction to dictionary for state serializability
    pred_dict = {
        "text": prediction.text,
        "route": prediction.route.value,
        "route_confidence": prediction.route_confidence,
        "intent": prediction.intent.value,
        "intent_confidence": prediction.intent_confidence,
        "answerability": prediction.answerability.value,
        "language": prediction.language.value,
        "model_name": prediction.model_name,
        "model_version": prediction.model_version,
        "is_fallback": prediction.is_fallback,
        "latency_ms": prediction.latency_ms,
    }

    # Route override: if route confidence is marginal, suggest clarification
    route = prediction.route.value
    if prediction.is_fallback:
        route = "clarification"

    # P9.2.1: Check if deterministic navigation or contact override applies
    from apps.api.services.assistant.deterministic import resolve_deterministic_turn
    det_res = resolve_deterministic_turn(query, prediction.intent.value, prediction.language.value)
    if det_res is not None and route != RouteLabel.REFUSAL.value:
        route = RouteLabel.DIRECT_CHAT.value

    return {
        "classifier_output": pred_dict,
        "route": route,
        "intent": prediction.intent.value,
        "language": prediction.language.value,
        "confidence": prediction.route_confidence,
        "execution_steps": steps,
    }


def direct_response_node(state: AssistantState) -> Dict[str, Any]:
    """P9.2.1: Deterministic resolution for contact info, navigation, greetings, and basic chitchat."""
    t0 = time.perf_counter()
    query = state.get("sanitized_query") or state.get("input_text", "")
    intent = state.get("intent", "")
    language = state.get("language", "en")

    from apps.api.services.assistant.deterministic import resolve_deterministic_turn
    resolution = resolve_deterministic_turn(query, intent=intent, language=language)

    if resolution:
        answer = resolution.answer
        actions = resolution.suggested_actions
        nav_target = resolution.navigation_target
        resolved_intent = resolution.intent
    else:
        resolved_intent = intent
        actions = [{"label": "Selected Work", "url": "/work"}]
        nav_target = None
        if language == "ur":
            answer = "Main Mahad ke portfolio aur unke engineering work ke hawale se aap ki madad kar sakta hoon."
        else:
            answer = "I am here to help you explore Mahad's AI Product Engineering projects, case studies, and engineering decisions."

    duration_ms = (time.perf_counter() - t0) * 1000.0
    step_telemetry = {
        "step_name": "direct_response",
        "duration_ms": round(duration_ms, 2),
        "status": "completed",
        "details": {
            "intent": resolved_intent,
            "language": language,
            "has_navigation_target": nav_target is not None,
        },
    }
    steps = list(state.get("execution_steps", []))
    steps.append(step_telemetry)

    return {
        "final_answer": answer,
        "citations": [],
        "suggested_actions": actions,
        "navigation_target": nav_target,
        "execution_steps": steps,
    }


def refusal_node(state: AssistantState) -> Dict[str, Any]:
    """Respectful refusal node for safety violations, prompt injection, or out-of-domain inquiries."""
    t0 = time.perf_counter()
    intent = state.get("intent", "")
    language = state.get("language", "en")
    is_safe = state.get("is_safe", True)

    if not is_safe or intent == IntentLabel.PROMPT_INJECTION.value:
        if language == "ur":
            answer = (
                "Yeh sawal security policies ke khilaf hai. Main sirf Mahad ke portfolio aur technical kaam "
                "ke baray mein authenticated maloomat share kar sakta hoon."
            )
        else:
            answer = (
                "I cannot process this query as it violates safety guidelines or attempts system prompt manipulation. "
                "I am designed to answer factual questions about Mahad's portfolio, architecture, and experience."
            )
    else:
        if language == "ur":
            answer = (
                "Yeh sawal Mahad ke portfolio ya unke professional engineering background ke domain se bahir hai. "
                "Aap unke projects (jaise CardioScan AI ya RAG architectures) ke baray mein pooch sakte hain."
            )
        else:
            answer = (
                "This question is outside the scope of Mahad's AI portfolio and engineering work. "
                "I can only answer questions related to his projects, system architectures, skills, and articles."
            )

    duration_ms = (time.perf_counter() - t0) * 1000.0
    step_telemetry = {
        "step_name": "refusal",
        "duration_ms": round(duration_ms, 2),
        "status": "completed",
        "details": {"intent": intent, "is_safe": is_safe},
    }
    steps = list(state.get("execution_steps", []))
    steps.append(step_telemetry)

    return {
        "final_answer": answer,
        "citations": [],
        "execution_steps": steps,
    }


def clarification_node(state: AssistantState) -> Dict[str, Any]:
    """Clarification node when router confidence is low or input is ambiguous."""
    t0 = time.perf_counter()
    language = state.get("language", "en")

    if language == "ur":
        answer = (
            "Aap ka sawal wazeh nahi hai. Kya aap Mahad ke kisi makhsoos project (maslan CardioScan AI ya In-process ML router) "
            "ya unke career background ke baray mein mazeed wazahat kar sakte hain?"
        )
    else:
        answer = (
            "Your query was a bit ambiguous. Could you please clarify if you are asking about a specific project "
            "(such as CardioScan AI, the In-Process ML Router, or RAG pipeline) or Mahad's technical background?"
        )

    duration_ms = (time.perf_counter() - t0) * 1000.0
    step_telemetry = {
        "step_name": "clarification",
        "duration_ms": round(duration_ms, 2),
        "status": "completed",
        "details": {"confidence": state.get("confidence", 0.0)},
    }
    steps = list(state.get("execution_steps", []))
    steps.append(step_telemetry)

    return {
        "final_answer": answer,
        "citations": [],
        "execution_steps": steps,
    }


def retrieval_stub_node(state: AssistantState) -> Dict[str, Any]:
    """Placeholder node for RAG retrieval in Milestone 9.1 (fully implemented in Milestone 9.2)."""
    t0 = time.perf_counter()
    query = state.get("retrieval_query") or state.get("sanitized_query", "")

    # Stub returns structured placeholder showing successful graph routing to RAG branch
    duration_ms = (time.perf_counter() - t0) * 1000.0
    step_telemetry = {
        "step_name": "retrieval_routing",
        "duration_ms": round(duration_ms, 2),
        "status": "completed",
        "details": {"retrieval_query": query, "milestone": "9.1-graph-routing"},
    }
    steps = list(state.get("execution_steps", []))
    steps.append(step_telemetry)

    return {
        "draft_answer": f"Retrieval route activated for query: '{query}'",
        "final_answer": f"Retrieval route verified for query: '{query}'. Grounded context synthesis active.",
        "execution_steps": steps,
    }
