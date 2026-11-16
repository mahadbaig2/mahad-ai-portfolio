"""Tests for health, liveness, readiness, and version endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_live_endpoint(client: AsyncClient) -> None:
    """Verify /health/live returns status alive and correlation header."""
    response = await client.get("/health/live")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "alive"
    assert "timestamp" in data
    assert "service" in data
    assert "environment" in data

    # Verify Correlation ID header
    assert "X-Correlation-ID" in response.headers
    assert len(response.headers["X-Correlation-ID"]) > 0


@pytest.mark.asyncio
async def test_health_ready_endpoint(client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    """Verify /health/ready returns status and dependency checks."""
    async def reachable() -> bool:
        return True

    monkeypatch.setattr("apps.api.db.session.ping_database", reachable)
    response = await client.get("/health/ready")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] in ("ready", "not_ready")
    assert "checks" in data
    assert "api_runtime" in data["checks"]
    assert data["checks"]["api_runtime"]["status"] == "ok"
    assert data["checks"]["database"]["status"] == "ok"
    assert response.status_code == (200 if data["status"] == "ready" else 503)


@pytest.mark.asyncio
async def test_health_ready_reports_database_outage(client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    async def unreachable() -> bool:
        return False

    monkeypatch.setattr("apps.api.db.session.ping_database", unreachable)
    response = await client.get("/health/ready")
    assert response.status_code == 503
    assert response.json()["checks"]["database"]["status"] == "error"


@pytest.mark.asyncio
async def test_version_endpoints(client: AsyncClient) -> None:
    """Verify /health/version and /version return identical version information."""
    res1 = await client.get("/health/version")
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["version"] == "1.0.0"
    assert "python_version" in data1

    res2 = await client.get("/version")
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2 == data1
