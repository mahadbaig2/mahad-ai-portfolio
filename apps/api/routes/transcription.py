"""FastAPI route for voice transcription via Groq Whisper (Phase 12).

POST /api/v1/transcription/transcribe
  - Accepts multipart/form-data with a single audio file field.
  - Validates MIME type and byte size before forwarding to Groq.
  - Streams bytes to Groq Whisper in-process; no audio is written to disk.
  - Deletes any in-memory buffer in both success and error paths.
  - Returns TranscriptionResponse on success, structured JSON error on failure.

Satisfies: P12.2.1, P12.2.2, P12.2.3, P12.2.5
"""

import io
import logging

from fastapi import APIRouter, File, UploadFile
from groq import AsyncGroq

from apps.api.core.config import get_settings
from apps.api.core.errors import (
    AppException,
    PayloadTooLargeError,
    ServiceUnavailableError,
    ValidationError,
)
from apps.api.schemas.transcription import TranscriptionResponse

logger = logging.getLogger("api.routes.transcription")

router = APIRouter(prefix="/transcription", tags=["Transcription"])


class UnsupportedAudioTypeError(AppException):
    """Raised when the uploaded MIME type is not accepted."""

    def __init__(self, content_type: str, accepted: list[str]) -> None:
        super().__init__(
            code="UNSUPPORTED_AUDIO_TYPE",
            message=(
                f"Audio type '{content_type}' is not supported. "
                f"Accepted types: {', '.join(accepted)}"
            ),
            status_code=415,
        )


@router.post(
    "/transcribe",
    response_model=TranscriptionResponse,
    summary="Transcribe voice audio to text via Groq Whisper",
)
async def transcribe_audio(
    audio: UploadFile = File(..., description="Audio file to transcribe"),
) -> TranscriptionResponse:
    """Transcribe a bounded audio upload using Groq Whisper.

    The file bytes are held in memory only for the duration of the API call.
    Raw audio is never persisted to storage (P12.2.5).
    """
    settings = get_settings()
    audio_bytes: bytes | None = None

    try:
        # --- Validate MIME type (P12.1.3) ---
        content_type = (audio.content_type or "").split(";")[0].strip().lower()
        if content_type not in settings.WHISPER_ACCEPTED_MIME_TYPES:
            raise UnsupportedAudioTypeError(content_type, settings.WHISPER_ACCEPTED_MIME_TYPES)

        # --- Read and validate size (P12.1.3) ---
        audio_bytes = await audio.read()

        if len(audio_bytes) == 0:
            raise ValidationError(message="Received an empty audio file.")

        if len(audio_bytes) > settings.WHISPER_MAX_AUDIO_BYTES:
            max_mb = settings.WHISPER_MAX_AUDIO_BYTES / (1024 * 1024)
            raise PayloadTooLargeError(
                message=f"Audio exceeds the {max_mb:.0f} MB limit."
            )

        # --- Forward to Groq Whisper (P12.2.2) ---
        filename = audio.filename or f"recording.{_ext_for_mime(content_type)}"

        client = AsyncGroq(api_key=settings.GROQ_API_KEY)

        try:
            transcription = await client.audio.transcriptions.create(
                file=(filename, io.BytesIO(audio_bytes), content_type),
                model=settings.GROQ_WHISPER_MODEL,
                response_format="verbose_json",
            )
        except Exception as groq_exc:
            logger.error(
                "Groq Whisper transcription failed",
                extra={"error": str(groq_exc)},
                exc_info=True,
            )
            raise ServiceUnavailableError(
                message="Transcription service is temporarily unavailable. Please try again."
            ) from groq_exc

        # --- Build response (P12.2.3) ---
        transcript_text: str = getattr(transcription, "text", "") or ""
        language: str = getattr(transcription, "language", "unknown") or "unknown"
        duration: float = float(getattr(transcription, "duration", 0.0) or 0.0)

        logger.info(
            "Transcription succeeded",
            extra={
                "language": language,
                "duration_seconds": duration,
                "transcript_chars": len(transcript_text),
            },
        )

        return TranscriptionResponse(
            transcript=transcript_text.strip(),
            language=language,
            duration_seconds=duration,
        )

    finally:
        # --- Always release in-memory audio buffer (P12.2.5) ---
        audio_bytes = None


def _ext_for_mime(mime: str) -> str:
    """Map a MIME type to a file extension for the Groq upload filename."""
    _map = {
        "audio/webm": "webm",
        "audio/ogg": "ogg",
        "audio/mp4": "mp4",
        "audio/wav": "wav",
        "audio/mpeg": "mp3",
    }
    return _map.get(mime, "bin")
