"""Tests for OpenAPI contract generation and validation."""

import json

from apps.api.main import create_app
from apps.api.scripts.generate_openapi import generate_openapi


def test_openapi_schema_matches_runtime() -> None:
    """Verify packages/contracts/openapi.json matches the current FastAPI app OpenAPI schema."""
    output_path = generate_openapi()
    assert output_path.exists()

    with open(output_path, encoding="utf-8") as f:
        saved_schema = json.load(f)

    app = create_app()
    runtime_schema = app.openapi()

    assert saved_schema["info"]["title"] == runtime_schema["info"]["title"]
    assert saved_schema["info"]["version"] == runtime_schema["info"]["version"]
    assert set(saved_schema["paths"].keys()) == set(runtime_schema["paths"].keys())
    assert "/health/live" in saved_schema["paths"]
    assert "/health/ready" in saved_schema["paths"]
    assert "/health/version" in saved_schema["paths"]
