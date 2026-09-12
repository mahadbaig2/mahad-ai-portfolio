"""Comprehensive test suite for Milestone 9.2: Deterministic and RAG Routes."""

import uuid

import pytest

from apps.api.providers.groq import GroqLLMProvider
from apps.api.schemas.assistant import AssistantChatResponse
from apps.api.services.assistant.evidence_check import (
    DEFAULT_EVIDENCE_THRESHOLD,
    evaluate_evidence_node,
    evaluate_evidence_quality,
)
from apps.api.services.assistant.filter_planner import plan_retrieval_filters
from apps.api.services.assistant.generation_node import set_llm_provider
from apps.api.services.assistant.graph import run_assistant_turn
from apps.api.services.assistant.normalizer import normalize_query
from apps.api.services.assistant.prompts import (
    build_grounded_messages,
    extract_and_validate_citations,
    format_evidence_block,
)
from apps.api.services.assistant.retrieval_node import (
    retrieve_evidence_node,
    set_retrieval_service,
)
from apps.api.services.assistant.state import create_initial_state
from apps.api.services.retrieval_service import (
    GroundedCitation,
    RetrievalResult,
    RetrievalTimingMetrics,
)

# =============================================================================
# P9.2.2: Multi-lingual Query Normalization & Code-Switching
# =============================================================================


def test_query_normalization_roman_urdu_code_switching():
    """P9.2.2: Normalizes Roman Urdu phonetic variations while preserving code-switched terms."""
    raw = "Mahad ka tajurba kia hy aur un k projects k bare mein batayein?"
    normalized = normalize_query(raw)

    assert normalized.has_roman_urdu is True
    # 'kia' -> 'kya', 'hy' -> 'hai', 'bare mein' -> 'baray mein'
    assert "kya" in normalized.normalized_text
    assert "hai" in normalized.normalized_text
    assert "baray mein" in normalized.normalized_text
    assert "projects" in normalized.normalized_text


def test_query_normalization_preserves_technical_casing_and_entities():
    """P9.2.2: Preserves camelCase, project names, and technical acronyms."""
    raw = "How does CardioScan AI leverage LangGraph, ONNX Runtime, and FastAPI?"
    normalized = normalize_query(raw)

    assert "CardioScan AI" in normalized.detected_entities
    assert "LangGraph" in normalized.detected_entities
    assert "ONNX" in normalized.detected_entities
    assert "FastAPI" in normalized.detected_entities
    assert "CardioScan AI" in normalized.normalized_text
    assert "LangGraph" in normalized.normalized_text


def test_query_normalization_cleans_control_characters_and_spaces():
    """P9.2.2: Strips invisible control characters and collapses redundant whitespace."""
    raw = "Tell   me\x00\x08 about  \n  mimAR Studios \t  systems."
    normalized = normalize_query(raw)

    assert "\x00" not in normalized.normalized_text
    assert "\x08" not in normalized.normalized_text
    assert normalized.normalized_text == "Tell me about mimAR Studios systems."
    assert "mimAR Studios" in normalized.detected_entities


# =============================================================================
# P9.2.3: Filter Planning
# =============================================================================


def test_filter_planning_project_slug_extraction():
    """P9.2.3: Automatically identifies project slug from query text."""
    filters = plan_retrieval_filters(
        query="Tell me about the architecture of CardioScan AI",
        intent="project_technical",
    )

    assert filters.project_slug == "cardioscan-ai"
    assert filters.raw_filters["project_slug"] == "cardioscan-ai"
    assert "project" in filters.document_types
    assert "caseStudy" in filters.document_types


def test_filter_planning_mimar_studios_alias():
    """P9.2.3: Maps mimAR variations to canonical project slug."""
    filters = plan_retrieval_filters(
        query="Show me the spatial systems at mimar studios"
    )
    assert filters.project_slug == "mimar-studios"
    assert filters.raw_filters["project_slug"] == "mimar-studios"


def test_filter_planning_audience_context():
    """P9.2.3: Formulates target_audiences filter from conversation mode."""
    filters = plan_retrieval_filters(
        query="What is Mahad's experience with ML systems?",
        intent="career_skills",
        mode="recruiter",
    )

    assert filters.target_audience == "recruiter"
    assert filters.raw_filters["target_audiences"] == "recruiter"
    assert "experience" in filters.document_types
    assert "skill" in filters.document_types


# =============================================================================
# P9.2.5: Threshold-Based Evidence Check
# =============================================================================


def test_evidence_quality_sufficient():
    """P9.2.5: Evidence with top similarity score >= threshold evaluates to 'sufficient'."""
    chunks = [
        {
            "chunk_id": str(uuid.uuid4()),
            "similarity_score": 0.82,
            "content": "CardioScan AI",
        },
        {
            "chunk_id": str(uuid.uuid4()),
            "similarity_score": 0.65,
            "content": "Medical device",
        },
    ]
    eval_res = evaluate_evidence_quality(chunks, threshold=DEFAULT_EVIDENCE_THRESHOLD)
    assert eval_res["status"] == "sufficient"
    assert eval_res["top_score"] == 0.82
    assert eval_res["chunks_count"] == 2


def test_evidence_quality_uncertain():
    """P9.2.5: Marginal evidence score between 0.45 and threshold evaluates to 'uncertain'."""
    chunks = [
        {
            "chunk_id": str(uuid.uuid4()),
            "similarity_score": 0.50,
            "content": "Marginal hit",
        }
    ]
    eval_res = evaluate_evidence_quality(chunks, threshold=0.55)
    assert eval_res["status"] == "uncertain"


def test_evidence_quality_insufficient_or_empty():
    """P9.2.5: Low score (< 0.45) or empty chunks evaluates to 'insufficient'."""
    empty_res = evaluate_evidence_quality([])
    assert empty_res["status"] == "insufficient"
    assert empty_res["chunks_count"] == 0

    low_res = evaluate_evidence_quality([{"similarity_score": 0.35}])
    assert low_res["status"] == "insufficient"


def test_evaluate_evidence_node_routing():
    """P9.2.5: evaluate_evidence_node routes appropriately based on chunk quality."""
    # Sufficient evidence -> grounded_generation
    state_sufficient = {
        "evidence_chunks": [{"similarity_score": 0.88}],
        "execution_steps": [],
    }
    res_sufficient = evaluate_evidence_node(state_sufficient)
    assert res_sufficient["route"] == "grounded_generation"

    # Insufficient evidence -> refusal
    state_empty = {"evidence_chunks": [], "execution_steps": []}
    res_empty = evaluate_evidence_node(state_empty)
    assert res_empty["route"] == "refusal"


# =============================================================================
# P9.2.6: Grounded Prompt Formatting & Strict Citation Extraction
# =============================================================================


def test_format_evidence_block_and_messages():
    """P9.2.6: Formats inspectable evidence block with chunk IDs and source details."""
    chunk_id = str(uuid.uuid4())
    chunks = [
        {
            "chunk_id": chunk_id,
            "document_title": "CardioScan Architecture",
            "heading_path": "Edge Deployment",
            "canonical_url": "/work/cardioscan-ai",
            "similarity_score": 0.89,
            "content": "CardioScan utilizes ONNX Runtime for CPU-optimized inference.",
        }
    ]

    block = format_evidence_block(chunks)
    assert chunk_id in block
    assert "CardioScan Architecture" in block
    assert "Edge Deployment" in block
    assert "/work/cardioscan-ai" in block

    messages = build_grounded_messages("How is CardioScan deployed?", chunks)
    assert len(messages) >= 2
    assert messages[0]["role"] == "system"
    assert chunk_id in messages[0]["content"]
    assert messages[-1]["content"] == "How is CardioScan deployed?"


def test_extract_and_validate_citations_strict():
    """P9.2.6: Strictly extracts valid chunk UUIDs and drops hallucinated IDs."""
    valid_id_1 = str(uuid.uuid4())
    valid_id_2 = str(uuid.uuid4())
    fake_id = str(uuid.uuid4())

    chunks = [
        {"chunk_id": valid_id_1, "title": "Doc 1"},
        {"chunk_id": valid_id_2, "title": "Doc 2"},
    ]

    answer = (
        f"CardioScan runs in-process ONNX models [{valid_id_1}]. "
        f"It achieves sub-50ms latency [{valid_id_2}], "
        f"and also claims fake facts [{fake_id}]."
    )

    citations = extract_and_validate_citations(answer, chunks)
    assert valid_id_1 in citations
    assert valid_id_2 in citations
    assert fake_id not in citations


# =============================================================================
# P9.2.7: Provider-Neutral Groq Adapter
# =============================================================================


@pytest.mark.asyncio
async def test_groq_llm_provider_mock_fallback():
    """P9.2.7: GroqLLMProvider operates in deterministic mock mode without API key."""
    provider = GroqLLMProvider(api_key="", mock_fallback=True)
    chunk_id = str(uuid.uuid4())
    messages = [
        {
            "role": "system",
            "content": f"Source ID: {chunk_id}\nContent: Verified facts.",
        },
        {"role": "user", "content": "What is Mahad's experience?"},
    ]

    answer = await provider.generate(messages)
    assert "Mahad" in answer
    assert chunk_id in answer


@pytest.mark.asyncio
async def test_groq_llm_provider_streaming():
    """P9.2.7: GroqLLMProvider streams tokens as async generator."""
    provider = GroqLLMProvider(api_key="", mock_fallback=True)
    chunk_id = str(uuid.uuid4())
    messages = [
        {
            "role": "system",
            "content": f"Source ID: {chunk_id}\nContent: Verified facts.",
        },
        {"role": "user", "content": "Tell me about CardioScan"},
    ]

    tokens = []
    async for token in provider.stream(messages):
        tokens.append(token)

    full_text = "".join(tokens)
    assert len(tokens) > 1
    assert chunk_id in full_text


# =============================================================================
# P9.2.4 & End-to-End RAG Graph Execution
# =============================================================================


class MockRetrievalService:
    """Mock test double for RetrievalService."""

    def __init__(self, citations: list[GroundedCitation]) -> None:
        self.citations = citations

    async def retrieve(self, **kwargs) -> RetrievalResult:
        metrics = RetrievalTimingMetrics(
            qdrant_points_returned=len(self.citations),
            postgres_chunks_hydrated=len(self.citations),
            selected_chunks_count=len(self.citations),
        )
        return RetrievalResult(
            query=kwargs.get("query", ""),
            citations=self.citations,
            metrics=metrics,
        )


def test_retrieval_node_with_injected_service():
    """P9.2.4: retrieve_evidence_node correctly runs retrieval and populates evidence chunks."""
    chunk_id = uuid.uuid4()
    doc_id = uuid.uuid4()
    mock_citation = GroundedCitation(
        chunk_id=chunk_id,
        document_id=doc_id,
        document_title="CardioScan AI System",
        heading_path="Model Optimization",
        canonical_url="/work/cardioscan-ai",
        similarity_score=0.91,
        document_type="project",
        content="CardioScan AI uses PyTorch to ONNX quantization.",
        token_count=120,
    )

    mock_service = MockRetrievalService([mock_citation])
    set_retrieval_service(mock_service)

    try:
        initial_state = create_initial_state(
            "How does CardioScan optimize models?", str(uuid.uuid4())
        )
        res = retrieve_evidence_node(initial_state)

        assert len(res["evidence_chunks"]) == 1
        assert res["evidence_chunks"][0]["chunk_id"] == str(chunk_id)
        assert res["evidence_chunks"][0]["similarity_score"] == 0.91

        step_telemetry = res["execution_steps"][-1]
        assert step_telemetry["step_name"] == "retrieve_evidence"
        assert step_telemetry["details"]["points_returned"] == 1
    finally:
        set_retrieval_service(None)


def test_end_to_end_rag_assistant_turn():
    """End-to-end integration test: RAG query traverses retrieval -> evidence check -> grounded generation."""
    chunk_id = uuid.uuid4()
    mock_citation = GroundedCitation(
        chunk_id=chunk_id,
        document_id=uuid.uuid4(),
        document_title="In-Process ML Router",
        heading_path="Architecture",
        canonical_url="/work/in-process-ml-router",
        similarity_score=0.88,
        document_type="project",
        content="The query router uses an ONNX-exported MiniLM model loaded once at startup.",
        token_count=150,
    )

    mock_service = MockRetrievalService([mock_citation])
    set_retrieval_service(mock_service)
    set_llm_provider(GroqLLMProvider(api_key="", mock_fallback=True))

    session_id = str(uuid.uuid4())
    try:
        response: AssistantChatResponse = run_assistant_turn(
            message="How does the query router achieve low latency?",
            session_id=session_id,
        )

        assert response.is_safe is True
        assert str(chunk_id) in response.citations
        assert len(response.answer) > 0

        step_names = [s.step_name for s in response.execution_steps]
        assert "validate_input" in step_names
        assert "classify_query" in step_names
        assert "retrieve_evidence" in step_names
        assert "evaluate_evidence" in step_names
        assert "grounded_generation" in step_names
    finally:
        set_retrieval_service(None)
        set_llm_provider(None)

