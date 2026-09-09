"""Pytest configuration and fixtures for API testing."""

from collections.abc import AsyncIterator

import pytest
from httpx import ASGITransport, AsyncClient

from apps.api.core.config import Settings, get_settings
from apps.api.main import create_app


@pytest.fixture
def test_settings() -> Settings:
    """Test-specific application settings."""
    return Settings(
        ENVIRONMENT="test",
        LOG_LEVEL="DEBUG",
        MAX_BODY_BYTES=1024 * 100,  # 100 KB for testing
        CORS_ORIGINS=["http://localhost:3000"],
    )


@pytest.fixture
async def client(test_settings: Settings) -> AsyncIterator[AsyncClient]:
    """Async HTTP test client with ASGI transport."""
    app = create_app(settings=test_settings)
    app.dependency_overrides[get_settings] = lambda: test_settings

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
