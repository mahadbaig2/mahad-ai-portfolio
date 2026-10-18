"""Unit and integration tests for ElevenLabs OpenAI-compatible custom LLM adapter.
Milestone 13P.3 - P13P.3.15, P13P.3.16, P13P.3.G [A]
"""

import json
from collections.abc import AsyncIterator
from unittest.mock import patch

import pytest
from httpx import ASGITransport, AsyncClient

from apps.api.core.config import Settings, get_settings
from apps.api.main import create_app
from apps.api.schemas.assistant import AssistantChatResponse, AssistantMode
from apps.api.schemas.router import LanguageLabel, RouteLabel
from apps.api.services.voice_formatter import format_voice_output


def make_voice_settings() -> Settings:
    """Helper to instantiate test settings without directly calling pytest fixture."""
    return Settings(
        ENVIRONMENT="test",
        LOG_LEVEL="DEBUG",
        ELEVENLABS_API_KEY="test_xi_key",
        ELEVENLABS_AGENT_ID="agent_7601m3zc989wfnwvvd78k6kcpvpa",
        ELEVENLABS_VOICE_ID="test_voice_brian",
        ELEVENLABS_CUSTOM_LLM_SECRET="test_custom_llm_secret_123",
        ELEVENLABS_VOICE_ENABLED=True,
        VOICE_SESSION_MAX_SECONDS=120,
        VOICE_INACTIVITY_TIMEOUT_SECONDS=15,
    )


@pytest.fixture
def voice_settings() -> Settings:
    """Fixture providing test settings for voice adapter tests."""
    return make_voice_settings()



@pytest.fixture
async def voice_client(voice_settings: Settings) -> AsyncIterator[AsyncClient]:
    """Test client with overridden voice settings."""
    app = create_app(settings=voice_settings)
    app.dependency_overrides[get_settings] = lambda: voice_settings
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:

        yield ac


def test_voice_formatter_removes_markdown_and_citations() -> None:
    """P13P.3.10, P13P.3.11: Spoken output formatter removes markdown, raw URLs, and citation brackets."""
    raw = (
        "### Projects\n"
        "* **CardioScan**: an AI diagnostic tool [1] [chunk_99].\n"
        "Read more at [Portfolio](https://mahad.ai/work/cardioscan)."
    )
    formatted = format_voice_output(raw)
    assert "#" not in formatted
    assert "**" not in formatted
    assert "[1]" not in formatted
    assert "[chunk_99]" not in formatted
    assert "https://" not in formatted
    assert "CardioScan" in formatted
    assert "Portfolio" in formatted


@pytest.mark.asyncio
async def test_get_voice_config_endpoint(voice_client: AsyncClient, voice_settings: Settings) -> None:
    """P13P.2.11: Public config endpoint discloses operational constraints without secrets."""
    response = await voice_client.get("/api/v1/voice/config")
    assert response.status_code == 200
    data = response.json()
    assert data["voice_enabled"] is True
    assert data["max_session_seconds"] == 120
    assert data["inactivity_timeout_seconds"] == 15
    assert data["active_voice_id"] == "test_voice_brian"
    # Verify no secret is leaked in the public config response (P13P.2.13)
    assert "ELEVENLABS_API_KEY" not in str(data)
    assert "test_xi_key" not in str(data)


@pytest.mark.asyncio
async def test_custom_llm_auth_rejection(voice_client: AsyncClient) -> None:
    """P13P.3.3: Requests with missing or incorrect Bearer token are rejected."""
    payload = {
        "messages": [{"role": "user", "content": "Hello"}],
        "stream": False,
    }
    # Missing auth header
    res_no_auth = await voice_client.post("/api/v1/voice/chat/completions", json=payload)
    assert res_no_auth.status_code == 401

    # Wrong auth token
    res_bad_auth = await voice_client.post(
        "/api/v1/voice/chat/completions",
        json=payload,
        headers={"Authorization": "Bearer wrong_secret"},
    )
    assert res_bad_auth.status_code == 401


@pytest.mark.asyncio
async def test_custom_llm_malformed_request_rejection(voice_client: AsyncClient) -> None:
    """P13P.3.4: Requests without a user message or with empty content return 400."""
    headers = {"Authorization": "Bearer test_custom_llm_secret_123"}

    # No user message
    res_no_user = await voice_client.post(
        "/api/v1/voice/chat/completions",
        json={"messages": [{"role": "system", "content": "System prompt"}]},
        headers=headers,
    )
    assert res_no_user.status_code == 400

    # Empty user content
    res_empty_content = await voice_client.post(
        "/api/v1/voice/chat/completions",
        json={"messages": [{"role": "user", "content": "   "}]},
        headers=headers,
    )
    assert res_empty_content.status_code == 400


@pytest.mark.asyncio
async def test_custom_llm_non_streaming_completion(voice_client: AsyncClient) -> None:
    """P13P.3.5, P13P.3.7, P13P.3.12: Non-streaming request returns valid OpenAI completion."""
    mock_answer = "Mahad built CardioScan, an AI system for automated ECG analysis."
    mock_assistant_resp = AssistantChatResponse(
        session_id="00000000-0000-0000-0000-000000000001",
        answer=mock_answer,
        citations=["chunk_cardioscan_01"],
        route=RouteLabel.RAG_RETRIEVAL,
        language=LanguageLabel.EN,
        is_safe=True,
        mode=AssistantMode.VOICE,
        execution_steps=[],
        errors=[],
    )

    with patch("apps.api.routes.voice.run_assistant_turn", return_value=mock_assistant_resp) as mock_turn:
        response = await voice_client.post(
            "/api/v1/voice/chat/completions",
            json={
                "messages": [
                    {"role": "system", "content": "You are Mahad's assistant"},
                    {"role": "user", "content": "Tell me about CardioScan"},
                ],
                "stream": False,
            },
            headers={"Authorization": "Bearer test_custom_llm_secret_123"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["object"] == "chat.completion"
        assert len(data["choices"]) == 1
        assert data["choices"][0]["message"]["role"] == "assistant"
        assert "CardioScan" in data["choices"][0]["message"]["content"]
        assert data["choices"][0]["finish_reason"] == "stop"

        # Verify run_assistant_turn was called with mode="voice" (P13P.3.5)
        mock_turn.assert_called_once()
        _, kwargs = mock_turn.call_args
        assert kwargs["mode"] == "voice"
        assert kwargs["message"] == "Tell me about CardioScan"


@pytest.mark.asyncio
async def test_custom_llm_streaming_sse_completion(voice_client: AsyncClient) -> None:
    """P13P.3.13: Streaming request produces valid OpenAI SSE chunks ending in [DONE]."""
    mock_assistant_resp = AssistantChatResponse(
        session_id="00000000-0000-0000-0000-000000000002",
        answer="Mahad specializes in AI product engineering.",
        citations=[],
        route=RouteLabel.RAG_RETRIEVAL,
        language=LanguageLabel.EN,
        is_safe=True,
        mode=AssistantMode.VOICE,
        execution_steps=[],
        errors=[],
    )

    with patch("apps.api.routes.voice.run_assistant_turn", return_value=mock_assistant_resp):
        response = await voice_client.post(
            "/api/v1/voice/chat/completions",
            json={
                "messages": [{"role": "user", "content": "What is Mahad's specialty?"}],
                "stream": True,
            },
            headers={"Authorization": "Bearer test_custom_llm_secret_123"},
        )

        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]

        body = response.text
        lines = [line.strip() for line in body.split("\n") if line.startswith("data: ")]
        assert len(lines) >= 3  # Initial chunk, content chunk(s), finish chunk, [DONE]
        assert lines[-1] == "data: [DONE]"

        # Parse first JSON chunk
        first_chunk = json.loads(lines[0].replace("data: ", ""))
        assert first_chunk["object"] == "chat.completion.chunk"
        assert first_chunk["choices"][0]["delta"]["role"] == "assistant"


@pytest.mark.asyncio
async def test_custom_llm_history_bounds(voice_client: AsyncClient) -> None:
    """P13P.3.6: Conversation history is bounded before entering the assistant graph."""
    mock_assistant_resp = AssistantChatResponse(
        session_id="00000000-0000-0000-0000-000000000003",
        answer="I have noted your follow-up.",
        citations=[],
        route=RouteLabel.DIRECT_CHAT,
        language=LanguageLabel.EN,
        is_safe=True,
        mode=AssistantMode.VOICE,
        execution_steps=[],
        errors=[],
    )

    # Pass 15 back-and-forth turns
    messages = []
    for i in range(14):
        role = "user" if i % 2 == 0 else "assistant"
        messages.append({"role": role, "content": f"Message turn {i}"})
    messages.append({"role": "user", "content": "Final query"})

    with patch("apps.api.routes.voice.run_assistant_turn", return_value=mock_assistant_resp) as mock_turn:
        response = await voice_client.post(
            "/api/v1/voice/chat/completions",
            json={"messages": messages, "stream": False},
            headers={"Authorization": "Bearer test_custom_llm_secret_123"},
        )

        assert response.status_code == 200
        mock_turn.assert_called_once()
        _, kwargs = mock_turn.call_args
        # Verify history passed to run_assistant_turn does not exceed 10 turns
        assert len(kwargs["history"]) <= 10
        assert kwargs["message"] == "Final query"
