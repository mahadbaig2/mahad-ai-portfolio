"""Pydantic schemas for the voice transcription endpoint (Phase 12)."""

from pydantic import BaseModel, Field


class TranscriptionResponse(BaseModel):
    """Successful transcription result returned to the caller."""

    transcript: str = Field(..., description="Transcribed text from the audio input")
    language: str = Field(..., description="BCP-47 language code detected by Whisper")
    duration_seconds: float = Field(
        ..., ge=0.0, description="Duration of the submitted audio clip in seconds"
    )


class TranscriptionErrorDetail(BaseModel):
    """Structured error payload for transcription failures."""

    error_code: str = Field(..., description="Stable machine-readable error code")
    message: str = Field(..., description="Human-readable description safe to surface in UI")
