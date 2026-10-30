"""Unit tests for Qdrant configuration & credential validation and sanitization."""

import pytest
from pydantic import ValidationError

from apps.api.core.config import (
    Settings,
    normalize_qdrant_url,
    normalize_secret_value,
    validate_qdrant_credentials,
)
from apps.api.providers.qdrant import QdrantVectorProvider


def test_qdrant_valid_api_key() -> None:
    """Valid Qdrant API key and URL pass validation unchanged."""
    url, key = validate_qdrant_credentials(
        "https://cluster-xyz.us-east4-0.gcp.cloud.qdrant.io:6333",
        "valid-qdrant-secret-key-12345",
    )
    assert url == "https://cluster-xyz.us-east4-0.gcp.cloud.qdrant.io:6333"
    assert key == "valid-qdrant-secret-key-12345"

    settings = Settings(
        QDRANT_URL="https://cluster-xyz.us-east4-0.gcp.cloud.qdrant.io:6333",
        QDRANT_API_KEY="valid-qdrant-secret-key-12345",
    )
    assert settings.QDRANT_API_KEY == "valid-qdrant-secret-key-12345"
    # Secret must never appear in repr(settings)
    assert "valid-qdrant-secret-key-12345" not in repr(settings)


def test_qdrant_api_key_with_leading_or_trailing_whitespace() -> None:
    """Leading and trailing horizontal whitespace is trimmed safely at the config boundary."""
    raw_key = "  \tmy-trimmed-qdrant-key-987\t  "
    assert normalize_secret_value(raw_key, "QDRANT_API_KEY", allow_empty=False) == "my-trimmed-qdrant-key-987"

    settings = Settings(
        QDRANT_URL="  https://cluster-xyz.qdrant.io:6333  ",
        QDRANT_API_KEY=raw_key,
    )
    assert settings.QDRANT_URL == "https://cluster-xyz.qdrant.io:6333"
    assert settings.QDRANT_API_KEY == "my-trimmed-qdrant-key-987"


@pytest.mark.parametrize(
    "malformed_key",
    [
        "secret-key-with-newline\n",
        "secret-key\r\n-embedded",
        "\nleading-newline-key",
        "secret-with-null\x00byte",
        "secret-with-del\x7fchar",
        "secret with internal spaces",
        "    ",
    ],
)
def test_qdrant_api_key_with_newline_or_control_characters_rejected(malformed_key: str) -> None:
    """Keys containing newlines, control characters, or internal whitespace fail early with a sanitized error."""
    with pytest.raises(ValueError) as exc_info:
        normalize_secret_value(malformed_key, "QDRANT_API_KEY", allow_empty=False)

    message = str(exc_info.value)
    assert "QDRANT_API_KEY contains invalid whitespace or control characters." in message
    # Never leak the secret content in the error message
    stripped_fragment = malformed_key.strip()
    if stripped_fragment:
        assert stripped_fragment not in message

    with pytest.raises(ValidationError) as settings_exc:
        Settings(QDRANT_API_KEY=malformed_key)
    assert "QDRANT_API_KEY contains invalid whitespace or control characters." in str(settings_exc.value)


@pytest.mark.parametrize("missing_key", ["", None, '""', "''"])
def test_qdrant_missing_api_key_for_remote_endpoint_rejected(missing_key: str | None) -> None:
    """Remote Qdrant endpoints reject missing or empty API keys immediately."""
    with pytest.raises(ValueError, match="QDRANT_API_KEY is required and cannot be empty"):
        validate_qdrant_credentials(
            "https://cluster-xyz.qdrant.io:6333",
            missing_key,
        )

    with pytest.raises(ValueError, match="QDRANT_API_KEY is required and cannot be empty"):
        QdrantVectorProvider(
            url="https://cluster-xyz.qdrant.io:6333",
            api_key=missing_key or "",
        )


@pytest.mark.parametrize(
    "quoted_key,expected",
    [
        ('"quoted-double-secret-key"', "quoted-double-secret-key"),
        ("'quoted-single-secret-key'", "quoted-single-secret-key"),
        ('  "spaced-and-quoted-key"  ', "spaced-and-quoted-key"),
    ],
)
def test_qdrant_quoted_api_key_normalized(quoted_key: str, expected: str) -> None:
    """Surrounding single or double quotes from copied config values are stripped cleanly."""
    assert normalize_secret_value(quoted_key, "QDRANT_API_KEY", allow_empty=False) == expected

    settings = Settings(QDRANT_API_KEY=quoted_key)
    assert settings.QDRANT_API_KEY == expected


@pytest.mark.parametrize(
    "invalid_url",
    [
        "",
        "   ",
        "not-a-url",
        "ftp://cluster.qdrant.io",
        "https://cluster.qdrant.io\n",
        "https://cluster.qdrant.io/path with spaces",
    ],
)
def test_qdrant_invalid_url_rejected(invalid_url: str) -> None:
    """Invalid or empty QDRANT_URL values fail early."""
    with pytest.raises(ValueError, match="QDRANT_URL"):
        normalize_qdrant_url(invalid_url)

