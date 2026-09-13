"""Audience style adaptation and invariant verification (P9.3.5 & P9.3.6).

Applied strictly AFTER grounded draft creation.
Adapts tone for Recruiter, Engineer, or Founder personas without introducing new facts.
If any invariant is violated, safely rolls back to the grounded draft answer.
"""

import asyncio
import concurrent.futures
import logging
import time
from collections.abc import Coroutine
from typing import Any, TypeVar

from apps.api.providers.base import LLMProvider
from apps.api.providers.groq import GroqLLMProvider
from apps.api.services.assistant.citation_validator import UUID_CITATION_REGEX
from apps.api.services.assistant.state import AssistantState

logger = logging.getLogger("assistant.audience_styler")

T = TypeVar("T")

STYLE_PROMPT_TEMPLATE = """You are an audience-adaptation editor for Mahad's Portfolio Assistant.
The grounded draft response below was synthesized strictly from verified evidence sources.
Your sole job is to adjust the emphasis, structure, and tone of this draft for a {persona} audience.

CRITICAL INVARIANTS:
1. STRICT TRUTH: Do NOT add, extrapolate, or invent any fact, date, technology, project, or metric not present in the draft.
2. CITATION INTEGRITY: You MUST PRESERVE all existing citation tags [source_id] attached to their claims. Do NOT invent new source tags.
3. PERSONA EMPHASIS:
{persona_guidance}
4. CODE-SWITCHING: If the draft is in Roman Urdu, maintain natural Roman Urdu while adapting emphasis.

GROUNDED DRAFT ANSWER:
{draft_answer}

ADAPTED {persona_upper} ANSWER (markdown only, no commentary):
"""

PERSONA_GUIDANCE = {
    "recruiter": "- Highlight core competencies, role scope, measurable impact, tech stack proficiencies, and engineering craftsmanship.\n- Use clean bullet points and executive summary formatting.",
    "engineer": "- Emphasize technical depth, architectural patterns, concurrency/latency tradeoffs, framework choices, and system invariants.\n- Be precise with technical terminology.",
    "founder": "- Highlight practical execution speed, ROI, zero-cost operational infrastructure, lean system design, and pragmatic problem-solving.\n- Emphasize business and product impact.",
}

_injected_styler_llm: LLMProvider | None = None


def set_styler_llm_provider(provider: LLMProvider | None) -> None:
    """Set or override LLM provider for unit testing the audience styler."""
    global _injected_styler_llm
    _injected_styler_llm = provider


def get_styler_llm_provider() -> LLMProvider:
    """Obtain injected or default Groq LLM provider for audience styling."""
    global _injected_styler_llm
    if _injected_styler_llm is not None:
        return _injected_styler_llm
    return GroqLLMProvider()


def _run_async(coro: Coroutine[Any, Any, T]) -> T:
    """Safely execute async coroutine from synchronous LangGraph node."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            return pool.submit(asyncio.run, coro).result()
    else:
        return asyncio.run(coro)


def verify_style_invariants(
    draft_answer: str,
    styled_answer: str,
    allowed_citations: list[str],
) -> tuple[bool, str]:
    """P9.3.6: Verify that styled output respects factual grounding and citation invariants.

    Returns (is_valid, failure_reason).
    """
    if not styled_answer or not styled_answer.strip():
        return False, "Styled answer is empty."

    # Invariant 1: All citations in styled_answer must belong to allowed_citations
    styled_citations = [
        m.group(1).lower() for m in UUID_CITATION_REGEX.finditer(styled_answer)
    ]
    allowed_set = {c.lower() for c in allowed_citations}

    for cit in styled_citations:
        if cit not in allowed_set:
            return False, f"Styled answer introduced unauthorized citation: {cit}"

    # Invariant 2: If draft had citations, styled text should not discard all of them
    if allowed_citations and not styled_citations:
        # If the draft had citations but styled version dropped all, failure
        draft_citations = [
            m.group(1).lower() for m in UUID_CITATION_REGEX.finditer(draft_answer)
        ]
        if draft_citations:
            return False, "Styled answer stripped all required source citations."

    # Invariant 3: Length sanity check (should not explode beyond 2.5x original draft)
    if len(styled_answer) > len(draft_answer) * 2.5 and len(draft_answer) > 100:
        return False, "Styled answer expanded disproportionately, suggesting hallucinated content."

    return True, "All style invariants passed."


def apply_audience_style_node(state: AssistantState) -> dict[str, Any]:
    """LangGraph node: Apply persona style adaptation after grounded draft creation (P9.3.5 & P9.3.6)."""
    t0 = time.perf_counter()
    draft_answer = state.get("draft_answer") or state.get("final_answer", "")
    persona = (state.get("persona") or "general").lower()
    citations = state.get("citations", [])

    # If general persona or empty draft, skip rewriting
    if persona not in PERSONA_GUIDANCE or not draft_answer:
        step_telemetry = {
            "step_name": "audience_style",
            "duration_ms": 0.0,
            "status": "skipped",
            "details": {"persona": persona, "reason": "General persona or empty draft"},
        }
        steps = list(state.get("execution_steps", []))
        steps.append(step_telemetry)
        return {
            "final_answer": draft_answer,
            "execution_steps": steps,
        }

    # Format styling prompt
    guidance = PERSONA_GUIDANCE[persona]
    prompt = STYLE_PROMPT_TEMPLATE.format(
        persona=persona,
        persona_upper=persona.upper(),
        persona_guidance=guidance,
        draft_answer=draft_answer,
    )
    messages = [
        {"role": "system", "content": "You are a professional technical editor adapting portfolio responses."},
        {"role": "user", "content": prompt},
    ]

    llm = get_styler_llm_provider()
    try:
        styled_output = _run_async(
            llm.generate(messages=messages, temperature=0.2, max_tokens=1000)
        )
        styled_output = styled_output.strip()

        # P9.3.6: Verify invariants
        is_valid, reason = verify_style_invariants(draft_answer, styled_output, citations)
        if not is_valid:
            logger.warning(
                f"Audience style invariant failed ({reason}). Reverting to grounded draft."
            )
            final_answer = draft_answer
            status = "fallback_draft_used"
        else:
            final_answer = styled_output
            status = "completed"
    except Exception as e:
        logger.exception(f"Audience styling failed: {e}. Reverting to grounded draft.")
        final_answer = draft_answer
        status = "fallback_on_error"
        reason = str(e)

    duration_ms = (time.perf_counter() - t0) * 1000.0
    step_telemetry = {
        "step_name": "audience_style",
        "duration_ms": round(duration_ms, 2),
        "status": status,
        "details": {
            "persona": persona,
            "status": status,
            "reason": reason if status != "completed" else "Verified against invariants",
        },
    }
    steps = list(state.get("execution_steps", []))
    steps.append(step_telemetry)

    return {
        "final_answer": final_answer,
        "execution_steps": steps,
    }
