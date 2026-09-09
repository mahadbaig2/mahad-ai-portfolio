"""Tests for error handling, CORS headers, and payload limits."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_not_found_standard_error(client: AsyncClient) -> None:
    """Verify 404 produces structured ErrorResponse envelope."""
    response = await client.get("/non-existent-path")
    assert response.status_code == 404

    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"
    assert "correlation_id" in data["error"]
    assert response.headers["X-Correlation-ID"] == data["error"]["correlation_id"]


@pytest.mark.asyncio
async def test_custom_correlation_id_propagation(client: AsyncClient) -> None:
    """Verify incoming X-Correlation-ID is preserved in response and error envelope."""
    custom_id = "test-custom-correlation-12345"
    response = await client.get("/health/live", headers={"X-Correlation-ID": custom_id})
    assert response.status_code == 200
    assert response.headers["X-Correlation-ID"] == custom_id


@pytest.mark.asyncio
async def test_payload_too_large_rejection(client: AsyncClient) -> None:
    """Verify request exceeding max_bytes is rejected with 413 Payload Too Large."""
    # test_settings configures MAX_BODY_BYTES = 100 KB
    huge_payload = "x" * (1024 * 150)
    response = await client.post(
        "/health/live",
        content=huge_payload,
        headers={"Content-Length": str(len(huge_payload))},
    )
    assert response.status_code == 413
    data = response.json()
    assert data["error"]["code"] == "PAYLOAD_TOO_LARGE"


@pytest.mark.asyncio
async def test_cors_headers(client: AsyncClient) -> None:
    """Verify CORS allow-origin header is present for approved origins."""
    # Preflight OPTIONS request
    preflight = await client.options(
        "/health/live",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert preflight.status_code == 200
    assert preflight.headers.get("access-control-allow-origin") == "http://localhost:3000"

    # Actual GET request with Origin
    response = await client.get("/health/live", headers={"Origin": "http://localhost:3000"})
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert "X-Correlation-ID" in response.headers.get("access-control-expose-headers", "")
