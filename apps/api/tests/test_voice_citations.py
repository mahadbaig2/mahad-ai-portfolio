"""Unit tests for voice turn citations and metadata.
Milestone 13P.13 - P13P.13.1 - P13P.13.7 [A]
"""

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from apps.api.main import create_app
from apps.api.routes.voice import VoiceCitationRegistry, voice_citation_registry
from apps.api.schemas.assistant import (
    AssistantChatResponse,
    AssistantMode,
    CitationDetailPayload,
)
from apps.api.schemas.router import LanguageLabel, RouteLabel
from apps.api.services.voice_formatter import format_voice_output


def test_format_voice_output_natural_attribution_and_sanitization() -> None:
    """Verify that voice output formatter strips technical artifacts and preserves natural attribution (P13P.13.2 & P13P.13.3)."""
    raw_markdown = (
        "According to the [CardioScan Case Study](https://mahad.ai/work/cardioscan), "
        "Mahad implemented real-time ECG classification [chunk_abc123]. "
        "Further details are in [Blog Post](http://mahad.ai/blog/fastapi) [1] (see source [1]).\n\n"
        "Sources:\n"
        "[1] https://mahad.ai/work/cardioscan"
    )

    spoken = format_voice_output(raw_markdown)

    # 1. Natural attribution preserved
    assert "CardioScan Case Study" in spoken
    assert "Blog Post" in spoken

    # 2. Raw URLs and chunk IDs stripped
    assert "https://" not in spoken
    assert "http://" not in spoken
    assert "chunk_" not in spoken
    assert "[1]" not in spoken
    assert "see source" not in spoken
    assert "Sources:" not in spoken


def test_format_voice_output_fullwidth_brackets_and_uuids() -> None:
    """Verify fullwidth brackets and UUID chunk tags are completely removed (P13P.13.3)."""
    text = "Mahad specializes in MLOps 【chunk_999】 and distributed AI systems 【12345678-1234-1234-1234-123456789abc】."
    spoken = format_voice_output(text)

    assert "【" not in spoken
    assert "】" not in spoken
    assert "chunk_" not in spoken
    assert "12345678" not in spoken
    assert "Mahad specializes in MLOps and distributed AI systems." == spoken


def test_voice_citation_registry_retrieval_and_scoping() -> None:
    """Verify citations are associated with session/conversation IDs and strictly isolated to current turn (P13P.13.4 & P13P.13.7)."""
    registry = VoiceCitationRegistry(max_entries=10, ttl_seconds=60)

    turn_1_details = [
        CitationDetailPayload(
            index=1,
            chunk_id="chunk_cardioscan_1",
            title="CardioScan Case Study",
            url="/work/cardioscan",
            heading="Architecture",
        )
    ]

    # Turn 1
    registry.record_turn(
        turn_id="turn_001",
        citations=["chunk_cardioscan_1"],
        citation_details=turn_1_details,
        route="rag_retrieval",
        session_id="session_user_a",
        conversation_id="conv_elev_a",
    )

    # Lookup by session
    rec_a = registry.get_latest(session_id="session_user_a")
    assert rec_a is not None
    assert rec_a.turn_id == "turn_001"
    assert rec_a.citations == ["chunk_cardioscan_1"]
    assert rec_a.citation_details[0].title == "CardioScan Case Study"

    # Turn 2 with different sources
    turn_2_details = [
        CitationDetailPayload(
            index=1,
            chunk_id="chunk_busyfile_1",
            title="Busyfile Overview",
            url="/work/busyfile",
            heading="Overview",
        )
    ]
    registry.record_turn(
        turn_id="turn_002",
        citations=["chunk_busyfile_1"],
        citation_details=turn_2_details,
        route="rag_retrieval",
        session_id="session_user_b",
        conversation_id="conv_elev_b",
    )

    # Turn 2 citations should not contaminate Turn 1 (P13P.13.7)
    rec_b = registry.get_latest(session_id="session_user_b")
    assert rec_b is not None
    assert rec_b.turn_id == "turn_002"
    assert rec_b.citations == ["chunk_busyfile_1"]

    rec_a_again = registry.get_latest(session_id="session_user_a")
    assert rec_a_again is not None
    assert rec_a_again.turn_id == "turn_001"
    assert rec_a_again.citations == ["chunk_cardioscan_1"]


@pytest.fixture
def client() -> TestClient:
    app = create_app()
    return TestClient(app)


def test_api_voice_citations_endpoint(client: TestClient) -> None:
    """Test GET /api/v1/voice/citations/latest endpoint (P13P.13.5)."""
    # Seed a record into the active router registry
    test_turn_id = "test_turn_api_123"
    voice_citation_registry.record_turn(
        turn_id=test_turn_id,
        citations=["chunk_test_1"],
        citation_details=[
            CitationDetailPayload(
                index=1,
                chunk_id="chunk_test_1",
                title="LangGraph Grounded Assistant",
                url="/work/talk-to-mahad",
                heading="State Graph",
            )
        ],
        route="rag_retrieval",
        session_id="sess_api_test",
        conversation_id="conv_api_test",
    )

    # Query with session_id
    response = client.get("/api/v1/voice/citations/latest?session_id=sess_api_test")
    assert response.status_code == 200
    data = response.json()
    assert data["turn_id"] == test_turn_id
    assert len(data["citation_details"]) == 1
    assert data["citation_details"][0]["title"] == "LangGraph Grounded Assistant"
    assert data["citation_details"][0]["url"] == "/work/talk-to-mahad"


def test_custom_llm_records_citations_from_graph(client: TestClient) -> None:
    """Verify that when ElevenLabs calls /voice/chat/completions, verified citations are captured in registry (P13P.13.1, P13P.13.4, P13P.13.7)."""
    mock_response = AssistantChatResponse(
        session_id="00000000-0000-0000-0000-000000000000",
        answer="Mahad engineered CardioScan [1].",
        citations=["chunk_cs_mock"],
        citation_details=[
            CitationDetailPayload(
                index=1,
                chunk_id="chunk_cs_mock",
                title="CardioScan System",
                url="/work/cardioscan",
                heading="Inference",
            )
        ],
        route=RouteLabel.RAG_RETRIEVAL,
        language=LanguageLabel.EN,
        is_safe=True,
        mode=AssistantMode.VOICE,
        execution_steps=[],
        errors=[],
    )

    with patch("apps.api.routes.voice.run_assistant_turn", return_value=mock_response):
        payload = {
            "model": "mahad-ai-assistant",
            "messages": [
                {"role": "user", "content": "Tell me about CardioScan"}
            ],
            "stream": False,
            "user": "session_test_cs_99",
        }
        res = client.post(
            "/api/v1/voice/chat/completions",
            json=payload,
            headers={"X-Conversation-Id": "conv_cs_test_99"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "CardioScan" in data["choices"][0]["message"]["content"]
        assert "[1]" not in data["choices"][0]["message"]["content"]

        # Check that citation was registered under this session
        citation_rec = voice_citation_registry.get_latest(session_id="session_test_cs_99")
        assert citation_rec is not None
        assert citation_rec.citations == ["chunk_cs_mock"]
        assert citation_rec.citation_details[0].title == "CardioScan System"
