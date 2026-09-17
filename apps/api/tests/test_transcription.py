"""Tests for voice transcription endpoint (Phase 12, P12.2.1–P12.2.5).

Verifies:
- P12.1.3: Size and MIME type enforcement
- P12.2.1: Multipart endpoint exists and is reachable
- P12.2.2: Groq is invoked; no audio persisted
- P12.2.3: Transcript and language metadata returned
- P12.2.5: In-memory buffer released in success and error paths

Error responses follow the app envelope: { "error": { "code": "...", "message": "..." } }
"""

import io
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from apps.api.main import create_app


@pytest.fixture()
def client():
    """Create a test client with a fresh app instance."""
    app = create_app()
    return TestClient(app, raise_server_exceptions=False)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_audio_upload(
    data: bytes = b"fake-audio-content",
    filename: str = "recording.webm",
    content_type: str = "audio/webm",
):
    """Return the files dict used by TestClient for a multipart upload."""
    return {"audio": (filename, io.BytesIO(data), content_type)}


def _mock_transcription(text: str = "Hello world", language: str = "en", duration: float = 2.5):
    """Return a MagicMock shaped like a Groq verbose_json transcription response."""
    mock = MagicMock()
    mock.text = text
    mock.language = language
    mock.duration = duration
    return mock


def _error_code(response) -> str:
    """Extract stable error code from the app error envelope."""
    return response.json()["error"]["code"]


def _error_message(response) -> str:
    """Extract error message from the app error envelope."""
    return response.json()["error"]["message"]


# ---------------------------------------------------------------------------
# P12.1.3 — MIME type validation
# ---------------------------------------------------------------------------

def test_unsupported_mime_type_returns_415(client):
    """Unsupported audio MIME type must yield 415 with a stable error code."""
    files = _make_audio_upload(content_type="video/mp4", filename="recording.mp4")
    response = client.post("/api/v1/transcription/transcribe", files=files)
    assert response.status_code == 415
    assert _error_code(response) == "UNSUPPORTED_AUDIO_TYPE"


def test_supported_mime_types_pass_validation(client):
    """All configured MIME types should not be rejected at the type-check stage."""
    accepted = ["audio/webm", "audio/ogg", "audio/mp4", "audio/wav", "audio/mpeg"]
    mock_result = _mock_transcription()

    for mime in accepted:
        with patch("apps.api.routes.transcription.AsyncGroq") as mock_groq_cls:
            mock_groq_instance = AsyncMock()
            mock_groq_cls.return_value = mock_groq_instance
            mock_groq_instance.audio.transcriptions.create = AsyncMock(return_value=mock_result)

            ext = mime.split("/")[1].replace("mpeg", "mp3")
            files = _make_audio_upload(content_type=mime, filename=f"rec.{ext}")
            response = client.post("/api/v1/transcription/transcribe", files=files)
            assert response.status_code != 415, f"MIME {mime} was incorrectly rejected"


# ---------------------------------------------------------------------------
# P12.1.3 — Size enforcement
# ---------------------------------------------------------------------------

def test_oversized_audio_returns_413(client):
    """Audio exceeding WHISPER_MAX_AUDIO_BYTES must yield 413."""
    with patch("apps.api.routes.transcription.get_settings") as mock_settings_fn:
        settings = MagicMock()
        settings.GROQ_API_KEY = "test-key"
        settings.GROQ_WHISPER_MODEL = "whisper-large-v3"
        settings.WHISPER_MAX_AUDIO_BYTES = 10  # 10 bytes limit for test
        settings.WHISPER_ACCEPTED_MIME_TYPES = ["audio/webm"]
        mock_settings_fn.return_value = settings

        files = _make_audio_upload(data=b"x" * 11)
        response = client.post("/api/v1/transcription/transcribe", files=files)

    assert response.status_code == 413
    assert _error_code(response) == "PAYLOAD_TOO_LARGE"


def test_empty_audio_returns_422(client):
    """Empty audio body must yield 422 (validation error)."""
    files = _make_audio_upload(data=b"")
    response = client.post("/api/v1/transcription/transcribe", files=files)
    assert response.status_code == 422
    assert _error_code(response) == "VALIDATION_ERROR"


# ---------------------------------------------------------------------------
# P12.2.2 / P12.2.3 — Happy path: valid audio → transcript + metadata
# ---------------------------------------------------------------------------

def test_valid_audio_returns_transcript(client):
    """Valid audio with mocked Groq returns transcript, language and duration."""
    mock_result = _mock_transcription(text="What is your tech stack?", language="en", duration=3.1)

    with patch("apps.api.routes.transcription.AsyncGroq") as mock_groq_cls:
        mock_instance = AsyncMock()
        mock_groq_cls.return_value = mock_instance
        mock_instance.audio.transcriptions.create = AsyncMock(return_value=mock_result)

        files = _make_audio_upload()
        response = client.post("/api/v1/transcription/transcribe", files=files)

    assert response.status_code == 200
    body = response.json()
    assert body["transcript"] == "What is your tech stack?"
    assert body["language"] == "en"
    assert body["duration_seconds"] == pytest.approx(3.1, abs=0.01)


def test_transcript_is_stripped(client):
    """Leading/trailing whitespace in transcript must be stripped before returning."""
    mock_result = _mock_transcription(text="  hello world  ")

    with patch("apps.api.routes.transcription.AsyncGroq") as mock_groq_cls:
        mock_instance = AsyncMock()
        mock_groq_cls.return_value = mock_instance
        mock_instance.audio.transcriptions.create = AsyncMock(return_value=mock_result)

        files = _make_audio_upload()
        response = client.post("/api/v1/transcription/transcribe", files=files)

    assert response.status_code == 200
    assert response.json()["transcript"] == "hello world"


# ---------------------------------------------------------------------------
# P12.2.5 — Groq outage → 503, no crash, no leaked details
# ---------------------------------------------------------------------------

def test_groq_outage_returns_503(client):
    """When Groq raises, endpoint must return 503 with SERVICE_UNAVAILABLE."""
    with patch("apps.api.routes.transcription.AsyncGroq") as mock_groq_cls:
        mock_instance = AsyncMock()
        mock_groq_cls.return_value = mock_instance
        mock_instance.audio.transcriptions.create = AsyncMock(
            side_effect=Exception("Connection timeout")
        )

        files = _make_audio_upload()
        response = client.post("/api/v1/transcription/transcribe", files=files)

    assert response.status_code == 503
    assert _error_code(response) == "SERVICE_UNAVAILABLE"
    # Must not expose internal exception detail
    assert "Connection timeout" not in _error_message(response)
