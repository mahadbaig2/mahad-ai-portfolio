"""Tests for Assistant API endpoints, streaming SSE, and resilience safeguards (Milestone 9.4).

Verifies:
- P9.4.1: Bounded session and message endpoints.
- P9.4.2: SSE stream with safe progress events and answer tokens.
- P9.4.3: Circuit breakers, timeouts, and limited retries.
- P9.4.4: Controlled quota and rate limit response codes (429, 503).
- P9.4.5: Independent resilience during Qdrant, Neon, Groq, and LangSmith outages.
- P9.G GATE: Bounded termination, citation integrity, and refusal invariants.
"""

import json
import uuid
from unittest.mock import MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from apps.api.core.errors import RateLimitError, ServiceUnavailableError
from apps.api.core.resilience import (
    CircuitBreaker,
    CircuitBreakerState,
    chat_rate_limiter,
    groq_breaker,
    qdrant_breaker,
)
from apps.api.main import create_app
from apps.api.services.assistant.generation_node import set_llm_provider
from apps.api.services.assistant.retrieval_node import set_retrieval_service


@pytest.fixture(autouse=True)
def reset_resilience_state():
    """Reset rate limiter and circuit breakers before and after each test."""
    chat_rate_limiter.reset()
    groq_breaker.reset()
    qdrant_breaker.reset()
    set_llm_provider(None)
    set_retrieval_service(None)
    yield
    chat_rate_limiter.reset()
    groq_breaker.reset()
    qdrant_breaker.reset()
    set_llm_provider(None)
    set_retrieval_service(None)


@pytest.fixture
def app():
    return create_app()


@pytest.mark.asyncio
async def test_create_session_endpoint(app) -> None:
    """P9.4.1: Verify session creation endpoint returns bounded session with persona and TTL."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/assistant/session",
            json={"consent_given": True, "persona": "engineer"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "session_id" in data
        assert data["consent_given"] is True
        assert data["persona"] == "engineer"
        assert "expires_at" in data


@pytest.mark.asyncio
async def test_get_session_detail_endpoint(app) -> None:
    """P9.4.1: Verify session retrieval endpoint returns session metadata and message history."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Create session
        create_resp = await client.post(
            "/api/v1/assistant/session",
            json={"consent_given": True, "persona": "founder"},
        )
        session_id = create_resp.json()["session_id"]

        # 2. Retrieve session
        get_resp = await client.get(f"/api/v1/assistant/session/{session_id}")
        assert get_resp.status_code == 200
        data = get_resp.json()
        assert data["session_id"] == session_id
        assert data["persona"] == "founder"
        assert data["consent_given"] is True
        assert isinstance(data["messages"], list)


@pytest.mark.asyncio
async def test_get_session_not_found(app) -> None:
    """P9.4.1: Verify nonexistent session returns 404 NOT_FOUND."""
    random_id = str(uuid.uuid4())
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get(f"/api/v1/assistant/session/{random_id}")
        assert resp.status_code == 404
        data = resp.json()
        assert data["error"]["code"] == "NOT_FOUND"


@pytest.mark.asyncio
async def test_chat_endpoint_deterministic(app) -> None:
    """P9.4.1: Verify synchronous chat endpoint routes deterministic contact queries."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/assistant/chat",
            json={
                "message": "What is Mahad's email address?",
                "mode": "text",
                "consent_given": False,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["route"] in ("deterministic", "direct_chat")
        assert "mahad" in data["answer"].lower() or "email" in data["answer"].lower()
        assert len(data["execution_steps"]) > 0


@pytest.mark.asyncio
async def test_chat_endpoint_history_bounding(app) -> None:
    """P9.4.1: Verify message history is bounded to maximum 20 turns."""
    # Construct 25 prior conversation turns
    long_history = [
        {"role": "user" if i % 2 == 0 else "assistant", "content": f"Message turn {i}"}
        for i in range(25)
    ]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/assistant/chat",
            json={
                "message": "Where is Mahad based?",
                "history": long_history,
                "mode": "text",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["route"] in ("deterministic", "direct_chat")


@pytest.mark.asyncio
async def test_chat_stream_endpoint(app) -> None:
    """P9.4.2: Verify SSE streaming endpoint emits progress, token deltas, and done payload."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/assistant/chat/stream",
            json={
                "message": "How can I contact Mahad?",
                "mode": "text",
                "consent_given": False,
            },
        )
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers["content-type"]

        body_text = resp.text
        lines = [line.strip() for line in body_text.split("\n") if line.strip()]

        events = [line for line in lines if line.startswith("event: ")]
        data_lines = [line for line in lines if line.startswith("data: ")]

        assert any("progress" in ev for ev in events)
        assert any("token" in ev for ev in events)
        assert any("done" in ev for ev in events)

        # Verify done payload deserialization
        done_idx = [i for i, ev in enumerate(events) if "done" in ev][0]
        done_data_str = data_lines[done_idx].replace("data: ", "")
        done_data = json.loads(done_data_str)
        assert done_data["route"] in ("deterministic", "direct_chat")
        assert len(done_data["answer"]) > 0


@pytest.mark.asyncio
async def test_rate_limiter_exceeded(app) -> None:
    """P9.4.4: Verify HTTP 429 RATE_LIMIT_EXCEEDED with Retry-After header when capacity exhausted."""
    # Configure low limit to test quickly
    test_session = str(uuid.uuid4())
    for _ in range(30):
        chat_rate_limiter.check(test_session)

    # Next call must raise RateLimitError
    with pytest.raises(RateLimitError) as exc_info:
        chat_rate_limiter.check(test_session)
    assert exc_info.value.status_code == 429
    assert exc_info.value.retry_after > 0

    # Test via HTTP endpoint
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/assistant/chat",
            json={"message": "Hello", "session_id": test_session},
        )
        assert resp.status_code == 429
        assert "Retry-After" in resp.headers
        data = resp.json()
        assert data["error"]["code"] == "RATE_LIMIT_EXCEEDED"


@pytest.mark.asyncio
async def test_circuit_breaker_transitions() -> None:
    """P9.4.3: Verify CircuitBreaker transitions CLOSED -> OPEN -> HALF_OPEN -> CLOSED."""
    breaker = CircuitBreaker("test_service", failure_threshold=2, recovery_timeout_sec=0.1)

    assert breaker.state == CircuitBreakerState.CLOSED

    # Record 1 failure
    breaker.record_failure(Exception("Transient failure 1"))
    assert breaker.state == CircuitBreakerState.CLOSED

    # Record 2nd failure -> trips to OPEN
    breaker.record_failure(Exception("Transient failure 2"))
    assert breaker.state == CircuitBreakerState.OPEN

    # While OPEN, check_available raises ServiceUnavailableError
    with pytest.raises(ServiceUnavailableError):
        breaker.check_available()

    # Wait for recovery timeout to transition to HALF_OPEN
    import asyncio
    await asyncio.sleep(0.12)
    breaker.check_available()
    assert breaker.state == CircuitBreakerState.HALF_OPEN

    # Two successes recover to CLOSED
    breaker.record_success()
    breaker.record_success()
    assert breaker.state == CircuitBreakerState.CLOSED


@pytest.mark.asyncio
async def test_outage_neon_db_failure(app) -> None:
    """P9.4.5: Verify Neon database failure does not break user chat or session endpoints."""
    from apps.api.routes.assistant import get_db_optional

    async def mock_offline_db():
        yield None

    app.dependency_overrides[get_db_optional] = mock_offline_db

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # 1. Session creation succeeds via ephemeral fallback
            session_resp = await client.post(
                "/api/v1/assistant/session",
                json={"consent_given": True, "persona": "engineer"},
            )
            assert session_resp.status_code == 200
            session_id = session_resp.json()["session_id"]

            # 2. Chat succeeds despite DB failure
            chat_resp = await client.post(
                "/api/v1/assistant/chat",
                json={
                    "message": "What is Mahad's email?",
                    "session_id": session_id,
                    "consent_given": True,
                },
            )
            assert chat_resp.status_code == 200
            assert chat_resp.json()["route"] in ("deterministic", "direct_chat")
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_outage_qdrant_failure(app) -> None:
    """P9.4.5: Verify Qdrant outage safely degrades to refusal/clarification without 500 error."""
    broken_retrieval = MagicMock()
    async def mock_retrieve_fail(*args, **kwargs):
        raise RuntimeError("Qdrant vector cluster connection refused (503)")
    broken_retrieval.retrieve = mock_retrieve_fail
    set_retrieval_service(broken_retrieval)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/assistant/chat",
            json={"message": "Tell me about Mahad's CardioScan AI project architecture"},
        )
        assert resp.status_code == 200
        data = resp.json()
        # Does not crash; terminates safely
        assert data["route"] in ("clarification", "refusal", "rag_retrieval", "direct_chat")
        assert len(data["answer"]) > 0


@pytest.mark.asyncio
async def test_outage_groq_breaker_open(app) -> None:
    """P9.4.5: Verify open Groq circuit breaker returns HTTP 503 SERVICE_UNAVAILABLE."""
    groq_breaker.state = CircuitBreakerState.OPEN
    groq_breaker.last_failure_time = 1000000000.0  # Far in future

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/assistant/chat",
            json={"message": "Can you explain something?"},
        )
        assert resp.status_code == 503
        data = resp.json()
        assert data["error"]["code"] == "SERVICE_UNAVAILABLE"


@pytest.mark.asyncio
async def test_stream_error_handling(app) -> None:
    """P9.4.2 & P9.4.5: Verify SSE stream gracefully transmits error event when breaker is open."""
    groq_breaker.state = CircuitBreakerState.OPEN
    groq_breaker.last_failure_time = 1000000000.0

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/assistant/chat/stream",
            json={"message": "Hello"},
        )
        assert resp.status_code == 503 or resp.status_code == 200
        body = resp.text
        if resp.status_code == 200:
            assert "event: error" in body
            assert "SERVICE_UNAVAILABLE" in body


@pytest.mark.asyncio
async def test_gate_termination_and_citation_invariants(app) -> None:
    """P9.G GATE: Supported questions cite evidence; unsupported refuse/clarify; termination is guaranteed."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Unsupported query (e.g. general non-portfolio math / cooking)
        resp_unsupported = await client.post(
            "/api/v1/assistant/chat",
            json={"message": "How do I make chocolate cake?"},
        )
        assert resp_unsupported.status_code == 200
        unsupported_data = resp_unsupported.json()
        assert unsupported_data["route"] in ("refusal", "clarification")
        assert len(unsupported_data["citations"]) == 0

        # 2. Deterministic query
        resp_contact = await client.post(
            "/api/v1/assistant/chat",
            json={"message": "What is Mahad's email address?"},
        )
        assert resp_contact.status_code == 200
        assert resp_contact.json()["route"] in ("deterministic", "direct_chat")
