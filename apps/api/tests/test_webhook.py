"""Unit and integration tests for Sanity webhook endpoint and signature validation (P6.2.1, P6.2.8)."""

import hashlib
import hmac
import time

import pytest
from httpx import ASGITransport, AsyncClient

from apps.api.core.config import get_settings
from apps.api.main import app
from apps.api.routers.webhook import verify_sanity_signature

TEST_SECRET = "test_webhook_signing_secret_xyz123"


def create_test_signature(body: bytes, secret: str = TEST_SECRET, timestamp: int | None = None) -> str:
    """Helper to generate a valid Sanity webhook signature header."""
    t = timestamp or int(time.time())
    payload = f"{t}.".encode() + body
    sig = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    return f"t={t},v1={sig}"


def test_verify_sanity_signature_valid() -> None:
    """Verify correct signature within acceptable timestamp returns True."""
    body = b'{"_id": "test-doc", "_type": "project"}'
    header = create_test_signature(body, secret=TEST_SECRET)
    assert verify_sanity_signature(body, header, TEST_SECRET) is True


def test_verify_sanity_signature_invalid_secret() -> None:
    """Verify mismatched secret returns False."""
    body = b'{"_id": "test-doc", "_type": "project"}'
    header = create_test_signature(body, secret="wrong_secret")
    assert verify_sanity_signature(body, header, TEST_SECRET) is False


def test_verify_sanity_signature_replay_attack() -> None:
    """P6.2.8: Verify timestamps older than max_age (replay attack) are rejected."""
    body = b'{"_id": "test-doc", "_type": "project"}'
    # Timestamp 10 minutes ago (> 300s limit)
    old_timestamp = int(time.time()) - 600
    header = create_test_signature(body, secret=TEST_SECRET, timestamp=old_timestamp)
    assert verify_sanity_signature(body, header, TEST_SECRET, max_age_seconds=300) is False


def test_verify_sanity_signature_tampered_body() -> None:
    """Verify body tampering after signature generation returns False."""
    body = b'{"_id": "original-doc"}'
    header = create_test_signature(body, secret=TEST_SECRET)
    tampered_body = b'{"_id": "tampered-doc"}'
    assert verify_sanity_signature(tampered_body, header, TEST_SECRET) is False


@pytest.mark.asyncio
async def test_webhook_unauthorized_without_signature() -> None:
    """Verify webhook endpoint returns 401 when signature header is missing."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/webhooks/sanity",
            json={"_id": "doc-1", "_type": "project"},
        )
        assert response.status_code == 401
        data = response.json()
        error_msg = data.get("error", {}).get("message", "") or data.get("detail", "")
        assert "Invalid or expired" in error_msg



@pytest.mark.asyncio
async def test_webhook_draft_ignored(monkeypatch) -> None:
    """Verify draft documents are ignored without error."""
    settings = get_settings()
    monkeypatch.setattr(settings, "SANITY_WEBHOOK_SECRET", TEST_SECRET)

    body = b'{"_id": "drafts.doc-1", "_type": "project"}'
    sig = create_test_signature(body, secret=TEST_SECRET)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/webhooks/sanity",
            content=body,
            headers={"Content-Type": "application/json", "sanity-webhook-signature": sig},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "ignored"
        assert response.json()["reason"] == "draft_document"
