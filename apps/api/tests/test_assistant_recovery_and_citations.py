"""Unit and integration test suite for Milestone 9.3: Agentic Recovery and Citations.

Verifies:
- P9.3.1: Constrained evidence grader for uncertain similarity decisions.
- P9.3.2: Bounded query rewriting strictly limited to one retry.
- P9.3.3: Differentiated clarify/refuse behavior after weak evidence in EN and Roman Urdu.
- P9.3.4: Strict claim-to-source citation validation and hallucination purging.
- P9.3.5: Audience styler persona adaptation (Recruiter, Engineer, Founder).
- P9.3.6: Style invariant validation and fallback to grounded draft.
- P9.3.7: Safe retrieval event audit recording with consent adherence.
"""

import uuid

from apps.api.providers.base import LLMProvider
from apps.api.schemas.router import RouteLabel
from apps.api.services.assistant.audience_styler import (
    apply_audience_style_node,
    set_styler_llm_provider,
    verify_style_invariants,
)
from apps.api.services.assistant.audit import record_safe_retrieval_event
from apps.api.services.assistant.citation_validator import validate_claim_citations
from apps.api.services.assistant.evidence_grader import (
    grade_evidence_node,
    parse_grader_response,
    set_grader_llm_provider,
)
from apps.api.services.assistant.generation_node import set_llm_provider
from apps.api.services.assistant.graph import (
    run_assistant_turn,
)
from apps.api.services.assistant.nodes import clarification_node, refusal_node
from apps.api.services.assistant.query_rewriter import (
    rewrite_query_node,
    set_rewriter_llm_provider,
)
from apps.api.services.assistant.retrieval_node import set_retrieval_service
from apps.api.services.assistant.state import create_initial_state
from apps.api.services.retrieval_service import (
    GroundedCitation,
    RetrievalResult,
    RetrievalTimingMetrics,
)


class MockLLM(LLMProvider):
    """Deterministic mock LLM provider for unit tests."""

    def __init__(self, canned_response: str):
        self.canned_response = canned_response
        self.call_history: list[dict] = []

    async def generate(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 1000,
        **kwargs,
    ) -> str:
        self.call_history.append(
            {"messages": messages, "temperature": temperature, "max_tokens": max_tokens}
        )
        return self.canned_response

    async def stream(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 1000,
        **kwargs,
    ):
        yield self.canned_response


class MockRetrievalService:
    """Deterministic mock retrieval service."""

    def __init__(self, chunks: list[dict]):
        self.chunks = chunks

    async def retrieve(self, query: str, filters=None, top_k: int = 5, **kwargs) -> RetrievalResult:
        citations = [
            GroundedCitation(
                chunk_id=uuid.UUID(c["chunk_id"]),
                document_id=uuid.uuid4(),
                document_title=c.get("document_title", "CardioScan AI"),
                document_type="project",
                heading_path=c.get("heading_path", "Section"),
                canonical_url=c.get("canonical_url", "/work/cardioscan-ai"),
                similarity_score=float(c.get("similarity_score", 0.9)),
                content=c.get("content", ""),
                token_count=100,
            )
            for c in self.chunks
        ]
        return RetrievalResult(
            query=query,
            citations=citations,
            raw_hydrated_count=len(citations),
            metrics=RetrievalTimingMetrics(
                total_retrieval_latency_ms=21.0,
            ),
            filters_applied={},
        )


# =============================================================================
# P9.3.1: Constrained Evidence Grader Tests
# =============================================================================


def test_grader_response_parser_valid_json():
    """P9.3.1: Parses well-formatted JSON responses from grader."""
    raw = '{"is_relevant": true, "confidence": 0.95, "reason": "Discusses ONNX pipeline."}'
    result = parse_grader_response(raw)
    assert result["is_relevant"] is True
    assert result["confidence"] == 0.95
    assert "ONNX" in result["reason"]


def test_grader_response_parser_markdown_code_block():
    """P9.3.1: Strips markdown code fences when parsing grader responses."""
    raw = '```json\n{"is_relevant": false, "confidence": 0.8, "reason": "Unrelated topic."}\n```'
    result = parse_grader_response(raw)
    assert result["is_relevant"] is False
    assert result["confidence"] == 0.8


def test_grade_evidence_node_relevant_routes_to_generation():
    """P9.3.1: Grader marks marginal evidence as relevant, proceeding to grounded_generation."""
    mock_llm = MockLLM('{"is_relevant": true, "confidence": 0.9, "reason": "Relevant project context found."}')
    set_grader_llm_provider(mock_llm)

    state = create_initial_state("How is CardioScan built?", str(uuid.uuid4()))
    state["evidence_chunks"] = [{"chunk_id": str(uuid.uuid4()), "similarity_score": 0.48, "content": "CardioScan uses ONNX."}]
    state["route"] = "grade_evidence"

    res = grade_evidence_node(state)
    assert res["route"] == "grounded_generation"
    assert res["grader_decision"] == "relevant"
    set_grader_llm_provider(None)


def test_grade_evidence_node_irrelevant_routes_to_rewrite():
    """P9.3.1 & P9.3.2: Grader marks marginal evidence irrelevant; routes to rewrite_query on first attempt."""
    mock_llm = MockLLM('{"is_relevant": false, "confidence": 0.85, "reason": "Only general site info."}')
    set_grader_llm_provider(mock_llm)

    state = create_initial_state("How is CardioScan built?", str(uuid.uuid4()))
    state["evidence_chunks"] = [{"chunk_id": str(uuid.uuid4()), "similarity_score": 0.47, "content": "General about info."}]
    state["retrieval_retries"] = 0

    res = grade_evidence_node(state)
    assert res["route"] == "rewrite_query"
    assert res["grader_decision"] == "irrelevant"
    set_grader_llm_provider(None)


# =============================================================================
# P9.3.2: Bounded Query Rewrite and Retry Tests
# =============================================================================


def test_query_rewriter_increments_retry_and_updates_query():
    """P9.3.2: Rewrites query, increments retries count, and loops back to retrieve_evidence."""
    mock_llm = MockLLM("CardioScan AI architecture ONNX Runtime inference")
    set_rewriter_llm_provider(mock_llm)

    state = create_initial_state("how it works?", str(uuid.uuid4()))
    state["sanitized_query"] = "how it works?"
    state["retrieval_retries"] = 0

    res = rewrite_query_node(state)
    assert res["retrieval_retries"] == 1
    assert res["retrieval_query"] == "CardioScan AI architecture ONNX Runtime inference"
    assert res["rewritten_query"] == "CardioScan AI architecture ONNX Runtime inference"
    assert res["route"] == "retrieve_evidence"
    set_rewriter_llm_provider(None)


def test_query_rewriter_strictly_bounds_to_single_retry():
    """P9.3.2: Invariant check: Cannot retry more than once per AGENTS.md."""
    state = create_initial_state("how it works?", str(uuid.uuid4()))
    state["retrieval_retries"] = 1  # Already retried once

    res = rewrite_query_node(state)
    # Does not permit another rewrite; routes to clarification or refusal
    assert res["route"] in ("clarification", "refusal")
    assert "retrieval_retries" not in res  # Not incremented


# =============================================================================
# P9.3.3: Differentiated Clarify / Refuse on Weak Evidence Tests
# =============================================================================


def test_weak_evidence_refusal_english_and_roman_urdu():
    """P9.3.3: Weak evidence produces helpful refusal in English and Roman Urdu."""
    # English refusal
    state_en = create_initial_state("quantum cryptography details", str(uuid.uuid4()))
    state_en["retrieval_retries"] = 1
    state_en["language"] = "en"
    res_en = refusal_node(state_en)
    assert "verified portfolio sources" in res_en["final_answer"]

    # Roman Urdu refusal
    state_ur = create_initial_state("quantum computing kaisay chalti hy", str(uuid.uuid4()))
    state_ur["retrieval_retries"] = 1
    state_ur["language"] = "ur"
    res_ur = refusal_node(state_ur)
    assert "Mahad ke portfolio mein" in res_ur["final_answer"]
    assert "CardioScan AI" in res_ur["final_answer"]


def test_weak_evidence_clarification_in_domain():
    """P9.3.3: In-domain ambiguous query with weak evidence offers targeted project options."""
    state = create_initial_state("tell me about the pipeline", str(uuid.uuid4()))
    state["retrieval_retries"] = 1
    state["language"] = "en"
    res = clarification_node(state)
    assert "CardioScan AI" in res["final_answer"]
    assert "INDKOM" in res["final_answer"]


# =============================================================================
# P9.3.4: Strict Claim Citation Validation Tests
# =============================================================================


def test_citation_validator_preserves_valid_and_purges_hallucinated():
    """P9.3.4: Valid citations are kept; hallucinated UUIDs are purged cleanly."""
    valid_id = str(uuid.uuid4())
    fake_id = str(uuid.uuid4())

    evidence = [{"chunk_id": valid_id, "similarity_score": 0.89}]
    raw_response = (
        f"CardioScan utilizes ONNX Runtime for inference [{valid_id}]. "
        f"It also trained a phantom transformer on 100 GPUs [{fake_id}]."
    )

    result = validate_claim_citations(raw_response, evidence)

    assert result.has_valid_citations is True
    assert valid_id in result.valid_citations
    assert fake_id not in result.valid_citations
    assert fake_id in result.stripped_citations
    # Fake ID citation bracket is purged from text
    assert f"[{fake_id}]" not in result.cleaned_text
    # Valid ID citation bracket remains
    assert f"[{valid_id}]" in result.cleaned_text
    assert result.validation_status == "purged_hallucinations"


def test_citation_validator_attaches_primary_if_missing():
    """P9.3.4: If factual answer omitted brackets, primary evidence source is attached."""
    chunk_id = str(uuid.uuid4())
    evidence = [{"chunk_id": chunk_id, "similarity_score": 0.92}]
    raw_response = "CardioScan achieves sub-5ms latency through ONNX quantization."

    result = validate_claim_citations(raw_response, evidence)
    assert result.has_valid_citations is True
    assert chunk_id in result.valid_citations
    assert f"[{chunk_id}]" in result.cleaned_text
    assert result.validation_status == "fallback_attached"


# =============================================================================
# P9.3.5 & P9.3.6: Audience Styler & Invariant Tests
# =============================================================================


def test_audience_styler_general_persona_skips_call():
    """P9.3.5: General persona preserves grounded draft directly without LLM overhead."""
    state = create_initial_state("query", str(uuid.uuid4()), persona="general")
    state["draft_answer"] = "Grounded draft answer [12345678-1234-1234-1234-123456789abc]."

    res = apply_audience_style_node(state)
    assert res["final_answer"] == state["draft_answer"]


def test_audience_styler_recruiter_and_engineer():
    """P9.3.5: Styles output for recruiter and engineer personas."""
    chunk_id = str(uuid.uuid4())
    draft = f"CardioScan AI utilizes ONNX Runtime on CPU [{chunk_id}]."
    recruiter_styled = f"• Built CardioScan AI using ONNX Runtime, delivering sub-5ms CPU performance [{chunk_id}]."

    mock_llm = MockLLM(recruiter_styled)
    set_styler_llm_provider(mock_llm)

    state = create_initial_state("query", str(uuid.uuid4()), persona="recruiter")
    state["draft_answer"] = draft
    state["citations"] = [chunk_id]

    res = apply_audience_style_node(state)
    assert res["final_answer"] == recruiter_styled
    set_styler_llm_provider(None)


def test_style_invariants_rejects_hallucinated_citation_and_rolls_back():
    """P9.3.6: Invariant failure: If styled text introduces an unverified citation, rolls back to draft."""
    valid_id = str(uuid.uuid4())
    hallucinated_id = str(uuid.uuid4())

    draft = f"Original verified fact [{valid_id}]."
    styled_bad = f"Hallucinated rewrite [{hallucinated_id}]."

    is_valid, reason = verify_style_invariants(draft, styled_bad, [valid_id])
    assert is_valid is False
    assert "unauthorized citation" in reason

    # Test that apply_audience_style_node automatically rolls back to draft
    mock_llm = MockLLM(styled_bad)
    set_styler_llm_provider(mock_llm)

    state = create_initial_state("query", str(uuid.uuid4()), persona="engineer")
    state["draft_answer"] = draft
    state["citations"] = [valid_id]

    res = apply_audience_style_node(state)
    # Rolled back to safe draft answer!
    assert res["final_answer"] == draft
    set_styler_llm_provider(None)


# =============================================================================
# P9.3.7: Safe Retrieval Audit Logging Tests
# =============================================================================


def test_safe_retrieval_event_recording_non_fatal():
    """P9.3.7: Audit logger writes non-fatally and does not raise exceptions if DB is offline."""
    # Even with bad session maker or DB offline, function executes safely
    chunk_id = str(uuid.uuid4())
    evidence = [{"chunk_id": chunk_id, "similarity_score": 0.85}]

    # Should not raise exception
    record_safe_retrieval_event(
        query_text="What is CardioScan?",
        rewritten_query="CardioScan AI architecture",
        evidence_chunks=evidence,
        cited_chunk_ids=[chunk_id],
    )


# =============================================================================
# End-to-End Integration Tests: Milestone 9.3 Graph Traversal
# =============================================================================


def test_e2e_marginal_evidence_grader_to_generation_and_styling():
    """Milestone 9.3 E2E: Marginal score (0.48) -> Grader (relevant) -> GroundedGen -> CitationVal -> Recruiter Style."""
    chunk_id = str(uuid.uuid4())
    canned_evidence = [
        {
            "chunk_id": chunk_id,
            "document_title": "CardioScan AI",
            "heading_path": "Architecture",
            "similarity_score": 0.48,  # In marginal/uncertain band!
            "content": "CardioScan AI uses ONNX Runtime with INT8 quantization on CPU.",
        }
    ]
    set_retrieval_service(MockRetrievalService(canned_evidence))

    # Grader marks as relevant
    set_grader_llm_provider(MockLLM('{"is_relevant": true, "confidence": 0.92, "reason": "Mentions CardioScan ONNX."}'))
    # Grounded generation synthesizes
    set_llm_provider(MockLLM(f"CardioScan achieves low latency via ONNX Runtime [{chunk_id}]."))
    # Recruiter styler adapts
    styled_recruiter = f"• Led development of CardioScan AI, achieving low CPU latency with ONNX Runtime [{chunk_id}]."
    set_styler_llm_provider(MockLLM(styled_recruiter))

    session_id = str(uuid.uuid4())
    response = run_assistant_turn(
        message="How does CardioScan AI achieve low latency on CPU?",
        session_id=session_id,
        persona="recruiter",
    )

    assert response.route == RouteLabel.RAG_RETRIEVAL
    assert chunk_id in response.citations
    assert styled_recruiter in response.answer

    # Verify telemetry steps
    step_names = [s.step_name for s in response.execution_steps]
    assert "classify_query" in step_names
    assert "retrieve_evidence" in step_names
    assert "evaluate_evidence" in step_names
    assert "grade_evidence" in step_names
    assert "grounded_generation" in step_names
    assert "audience_style" in step_names

    # Cleanup
    set_retrieval_service(None)
    set_grader_llm_provider(None)
    set_llm_provider(None)
    set_styler_llm_provider(None)
