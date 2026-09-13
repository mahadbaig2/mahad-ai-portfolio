"""Constrained evidence grader node for marginal/uncertain retrieval decisions (P9.3.1).

Invoked strictly when vector similarity scores fall within the uncertain band (0.45 <= score < 0.55).
Uses a structured prompt and low temperature to assess if retrieved chunks actually address the query.
"""

import asyncio
import concurrent.futures
import json
import logging
import re
import time
from collections.abc import Coroutine
from typing import Any, TypeVar

from apps.api.providers.base import LLMProvider
from apps.api.providers.groq import GroqLLMProvider
from apps.api.services.assistant.prompts import format_evidence_block
from apps.api.services.assistant.state import AssistantState

logger = logging.getLogger("assistant.evidence_grader")

T = TypeVar("T")

GRADER_SYSTEM_PROMPT = """You are a strict, objective evidence evaluator for Mahad's Portfolio Assistant.
Your task is to determine whether the provided retrieved context snippets contain relevant, factual information that helps answer the user's question.

CRITICAL GRADING RULES:
1. RELEVANCE ONLY: Evaluate ONLY whether the snippet contains facts relevant to answering the query. Do NOT generate the answer.
2. LOW THRESHOLD FOR MARGINAL RELEVANCE: If the snippet partially discusses the project, architecture, skill, or role asked about, grade it as relevant.
3. IRRELEVANT: If the snippet is wholly about an unrelated topic, project, or general navigation without addressing the question, grade as irrelevant.
4. STRICT JSON FORMAT: Output ONLY a valid JSON object with the following schema:
{
  "is_relevant": true or false,
  "confidence": float between 0.0 and 1.0,
  "reason": "concise 1-sentence justification"
}
"""

_injected_grader_llm: LLMProvider | None = None


def set_grader_llm_provider(provider: LLMProvider | None) -> None:
    """Set or override LLM provider for unit testing the evidence grader."""
    global _injected_grader_llm
    _injected_grader_llm = provider


def get_grader_llm_provider() -> LLMProvider:
    """Obtain injected or default Groq LLM provider for evidence grading."""
    global _injected_grader_llm
    if _injected_grader_llm is not None:
        return _injected_grader_llm
    return GroqLLMProvider()


def _run_async(coro: Coroutine[Any, Any, T]) -> T:
    """Safely execute async coroutines from synchronous LangGraph nodes."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            return pool.submit(asyncio.run, coro).result()
    else:
        return asyncio.run(coro)


def parse_grader_response(raw_text: str) -> dict[str, Any]:
    """Parse JSON payload from grader LLM output with robust fallback."""
    cleaned = raw_text.strip()
    # Try finding JSON block inside markdown fence
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL)
    if match:
        cleaned = match.group(1)
    else:
        match_brace = re.search(r"(\{.*\})", cleaned, re.DOTALL)
        if match_brace:
            cleaned = match_brace.group(1)

    try:
        data = json.loads(cleaned)
        return {
            "is_relevant": bool(data.get("is_relevant", False)),
            "confidence": float(data.get("confidence", 0.5)),
            "reason": str(data.get("reason", "Parsed from LLM output")),
        }
    except Exception as e:
        logger.warning(f"Failed to parse grader JSON ({e}), raw text: {raw_text[:200]}")
        # Keyword-based fallback
        is_rel = "true" in cleaned.lower() and "false" not in cleaned.lower()
        return {
            "is_relevant": is_rel,
            "confidence": 0.5,
            "reason": "Fallback keyword extraction after JSON parse failure",
        }


def grade_evidence_node(state: AssistantState) -> dict[str, Any]:
    """LangGraph node: Evaluate marginal evidence quality via constrained LLM grader (P9.3.1)."""
    t0 = time.perf_counter()
    query = state.get("sanitized_query") or state.get("input_text", "")
    evidence_chunks = state.get("evidence_chunks", [])
    retrieval_retries = state.get("retrieval_retries", 0)

    if not evidence_chunks:
        grade = {
            "is_relevant": False,
            "confidence": 1.0,
            "reason": "No evidence chunks available to grade.",
        }
    else:
        formatted_context = format_evidence_block(evidence_chunks[:3])
        messages = [
            {"role": "system", "content": GRADER_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"USER QUESTION: {query}\n\nRETRIEVED CONTEXT SNIPPETS:\n{formatted_context}\n\nEVALUATION JSON:",
            },
        ]
        llm = get_grader_llm_provider()
        try:
            raw_eval = _run_async(
                llm.generate(messages=messages, temperature=0.0, max_tokens=150)
            )
            grade = parse_grader_response(raw_eval)
        except Exception as e:
            logger.exception(f"Evidence grading LLM call failed: {e}")
            grade = {
                "is_relevant": False,
                "confidence": 0.0,
                "reason": f"Grader failed: {e}",
            }

    duration_ms = (time.perf_counter() - t0) * 1000.0

    step_telemetry = {
        "step_name": "grade_evidence",
        "duration_ms": round(duration_ms, 2),
        "status": "completed",
        "details": grade,
    }
    steps = list(state.get("execution_steps", []))
    steps.append(step_telemetry)

    # Route determination after grading:
    # 1. If relevant -> proceed to grounded generation
    # 2. If irrelevant and retry available (retries == 0) -> rewrite query
    # 3. If irrelevant and retry exhausted -> clarify or refuse
    is_rel = bool(grade.get("is_relevant", False))
    raw_conf = grade.get("confidence", 0.0)
    conf = float(raw_conf) if isinstance(raw_conf, int | float | str) else 0.0
    if is_rel and conf >= 0.5:
        next_route = "grounded_generation"
    elif retrieval_retries < 1:
        next_route = "rewrite_query"
    else:
        # Weak evidence exhausted: differentiate based on intent/safety
        intent = str(state.get("intent", ""))
        if intent in ("project_technical", "career_skills", "architecture_decisions"):
            next_route = "clarification"
        else:
            next_route = "refusal"

    return {
        "route": next_route,
        "grader_decision": "relevant" if is_rel else "irrelevant",
        "grader_reason": str(grade.get("reason", "")),
        "execution_steps": steps,
    }
