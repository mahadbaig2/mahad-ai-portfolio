"""Tests for secure conversation token generation, rate limiting, and concurrency.
Milestone 13P.4 - P13P.4.1 - P13P.4.11, P13P.4.G [A]
"""

from collections.abc import AsyncIterator
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient, Response

from apps.api.core.config import Settings, get_settings
from apps.api.core.resilience import voice_concurrency_manager, voice_token_rate_limiter
from apps.api.main import create_app


def make_token_test_settings() -> Settings:
    """Settings helper configured with voice credentials for testing token generation."""
    return Settings(
        ENVIRONMENT="test",
        LOG_LEVEL="DEBUG",
        ELEVENLABS_API_KEY="test_xi_api_key_secret_999",
        ELEVENLABS_AGENT_ID="agent_7601m3zc989wfnwvvd78k6kcpvpa",
        ELEVENLABS_VOICE_ID="test_voice_id",
        ELEVENLABS_VOICE_ENABLED=True,
        VOICE_SESSION_MAX_SECONDS=120,
        VOICE_INACTIVITY_TIMEOUT_SECONDS=15,
        VOICE_GLOBAL_CONCURRENCY_LIMIT=1,
    )


@pytest.fixture(autouse=True)
def reset_resilience() -> AsyncIterator[None]:
    voice_concurrency_manager.reset()
    voice_token_rate_limiter.reset()
    yield
    voice_concurrency_manager.reset()
    voice_token_rate_limiter.reset()


@pytest.fixture
def token_settings() -> Settings:
    return make_token_test_settings()


@pytest.fixture
async def token_client(token_settings: Settings) -> AsyncIterator[AsyncClient]:
    app = create_app(settings=token_settings)
    app.dependency_overrides[get_settings] = lambda: token_settings

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac



@pytest.mark.asyncio
async def test_token_creation_success_without_leaking_key(token_client: AsyncClient, token_settings: Settings) -> None:
    """P13P.4.1, P13P.4.2: Token is created server-side and API key is NEVER exposed to the client."""
    mock_response = Response(
        status_code=200,
        json={"token": "mocked_convai_token_abc123"},
    )

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=mock_response):
        response = await token_client.post(
            "/api/v1/voice/token",
            json={"session_id": "test-sess-1", "action": "start_voice"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["token"] == "mocked_convai_token_abc123"
        assert data["agent_id"] == "agent_7601m3zc989wfnwvvd78k6kcpvpa"
        assert data["max_duration_seconds"] == 120
        assert data["inactivity_timeout_seconds"] == 15
        assert "expires_at" in data

        # P13P.4.2: Absolutely verify server API key is not in response payload
        assert "test_xi_api_key_secret_999" not in str(data)
        assert "xi-api-key" not in str(data)


@pytest.mark.asyncio
async def test_explicit_action_required(token_client: AsyncClient) -> None:
    """P13P.4.3: Request without explicit start_voice action is rejected."""
    # Invalid action
    response = await token_client.post(
        "/api/v1/voice/token",
        json={"session_id": "test-sess-2", "action": "passive_open"},
    )
    assert response.status_code == 422 or response.status_code == 400


@pytest.mark.asyncio
async def test_voice_disabled_returns_503(token_client: AsyncClient, token_settings: Settings) -> None:
    """P13P.4.10: If voice is disabled or unconfigured, token request fails cleanly with 503."""
    token_settings.ELEVENLABS_VOICE_ENABLED = False
    response = await token_client.post(
        "/api/v1/voice/token",
        json={"session_id": "test-sess-3", "action": "start_voice"},
    )
    assert response.status_code == 503
    data = response.json()
    assert "VOICE_DISABLED" in str(data)
    token_settings.ELEVENLABS_VOICE_ENABLED = True


@pytest.mark.asyncio
async def test_concurrency_limit_and_release(token_client: AsyncClient) -> None:
    """P13P.4.7, P13P.4.8, P13P.4.9: Concurrency is strictly bounded and can be released."""
    mock_response = Response(
        status_code=200,
        json={"token": "token_session_first"},
    )

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=mock_response):
        # 1. First session acquires slot
        res1 = await token_client.post(
            "/api/v1/voice/token",
            json={"session_id": "session_alpha", "action": "start_voice"},
        )
        assert res1.status_code == 200

        # 2. Second session is blocked by concurrency limit (limit = 1)
        res2 = await token_client.post(
            "/api/v1/voice/token",
            json={"session_id": "session_beta", "action": "start_voice"},
        )
        assert res2.status_code == 429
        assert "CONCURRENCY_LIMIT_REACHED" in str(res2.json())

        # 3. Release first session
        release_res = await token_client.post(
            "/api/v1/voice/session/end",
            json={"session_id": "session_alpha", "action": "start_voice"},
        )
        assert release_res.status_code == 200

        # 4. Now second session can acquire slot
        res3 = await token_client.post(
            "/api/v1/voice/token",
            json={"session_id": "session_beta", "action": "start_voice"},
        )
        assert res3.status_code == 200


@pytest.mark.asyncio
async def test_provider_quota_exhausted_mapping(token_client: AsyncClient) -> None:
    """P13P.4.10: ElevenLabs quota exhaustion maps to stable error code PROVIDER_QUOTA_EXHAUSTED."""
    mock_quota_error = Response(
        status_code=401,
        text="Monthly quota limit reached for conversational AI credits",
    )

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=mock_quota_error):
        response = await token_client.post(
            "/api/v1/voice/token",
            json={"session_id": "session_quota", "action": "start_voice"},
        )

        assert response.status_code == 503
        data = response.json()
        assert "PROVIDER_QUOTA_EXHAUSTED" in str(data)
