"""Application settings loaded through Pydantic V2."""

import urllib.parse
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Root directory of the repository
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
ENV_FILE = ROOT_DIR / ".env"


def normalize_secret_value(
    raw: str | None,
    field_name: str,
    *,
    allow_empty: bool = True,
) -> str:
    """Normalize a secret-backed string by trimming horizontal whitespace and outer quotes,
    and reject embedded whitespace, newlines, or control characters without logging the value.
    """
    if raw is None:
        if allow_empty:
            return ""
        raise ValueError(f"{field_name} is required and cannot be empty.")

    if not isinstance(raw, str):
        raise ValueError(f"{field_name} must be a string.")

    if raw == "":
        if allow_empty:
            return ""
        raise ValueError(f"{field_name} is required and cannot be empty.")

    # Reject newlines or ASCII control characters (except horizontal tab which is trimmed at edges)
    if any((ord(ch) < 32 and ch != "\t") or ord(ch) == 127 for ch in raw):
        raise ValueError(f"{field_name} contains invalid whitespace or control characters.")

    trimmed = raw.strip(" \t")
    if trimmed == "":
        raise ValueError(f"{field_name} contains invalid whitespace or control characters.")

    # Strip matching surrounding single or double quotes if present from env/secret configuration
    if len(trimmed) >= 2 and (
        (trimmed.startswith('"') and trimmed.endswith('"'))
        or (trimmed.startswith("'") and trimmed.endswith("'"))
    ):
        trimmed = trimmed[1:-1].strip(" \t")

    if trimmed == "":
        if allow_empty:
            return ""
        raise ValueError(f"{field_name} is required and cannot be empty.")

    if (
        any(ch.isspace() for ch in trimmed)
        or any(ord(ch) < 32 or ord(ch) == 127 for ch in trimmed)
        or not trimmed.isascii()
    ):
        raise ValueError(f"{field_name} contains invalid whitespace or control characters.")

    return trimmed


def normalize_qdrant_url(raw: str | None) -> str:
    """Normalize and validate QDRANT_URL without exposing sensitive parameters."""
    if raw is None or not isinstance(raw, str):
        raise ValueError("QDRANT_URL is required and cannot be empty.")

    if any((ord(ch) < 32 and ch != "\t") or ord(ch) == 127 for ch in raw):
        raise ValueError("QDRANT_URL contains invalid whitespace or control characters.")

    trimmed = raw.strip(" \t")
    if len(trimmed) >= 2 and (
        (trimmed.startswith('"') and trimmed.endswith('"'))
        or (trimmed.startswith("'") and trimmed.endswith("'"))
    ):
        trimmed = trimmed[1:-1].strip(" \t")

    if not trimmed:
        raise ValueError("QDRANT_URL is required and cannot be empty.")

    if any(ch.isspace() for ch in trimmed) or any(ord(ch) < 32 or ord(ch) == 127 for ch in trimmed):
        raise ValueError("QDRANT_URL contains invalid whitespace or control characters.")

    parsed = urllib.parse.urlparse(trimmed)
    if parsed.scheme not in ("http", "https") or not parsed.netloc or not parsed.hostname:
        raise ValueError("QDRANT_URL must be a valid HTTP or HTTPS URL.")

    return trimmed


def validate_qdrant_credentials(
    url: str | None,
    api_key: str | None,
    *,
    require_api_key: bool | None = None,
) -> tuple[str, str]:
    """Validate and normalize Qdrant endpoint URL and API key.

    Requires a non-empty API key automatically for any non-local Qdrant endpoint
    (or when require_api_key=True is explicitly specified).
    """
    clean_url = normalize_qdrant_url(url)
    parsed = urllib.parse.urlparse(clean_url)
    hostname = (parsed.hostname or "").lower()
    is_local = hostname in ("localhost", "127.0.0.1", "::1")

    must_have_key = (not is_local) if require_api_key is None else require_api_key
    clean_key = normalize_secret_value(
        api_key,
        "QDRANT_API_KEY",
        allow_empty=not must_have_key,
    )
    return clean_url, clean_key


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE if ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    # --------------------------------------------------------------------------
    # Runtime & Service Metadata
    # --------------------------------------------------------------------------
    ENVIRONMENT: Literal["development", "test", "staging", "production"] = "development"
    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    PORT: int = Field(default=8000, ge=1, le=65535)
    APP_NAME: str = "Mahad AI Portfolio API"
    APP_VERSION: str = "1.0.0"

    # --------------------------------------------------------------------------
    # Security, CORS & Payload Constraints
    # --------------------------------------------------------------------------
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    MAX_BODY_BYTES: int = Field(default=2 * 1024 * 1024, ge=1024)  # Default: 2MB limit

    @field_validator("LOG_LEVEL", mode="before")
    @classmethod
    def uppercase_log_level(cls, v: str) -> str:
        if isinstance(v, str):
            return v.upper()
        return v

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # --------------------------------------------------------------------------
    # Neon PostgreSQL (Operational DB)
    # --------------------------------------------------------------------------
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/mahad_portfolio",
        description="Async connection string for SQLAlchemy / asyncpg",
    )
    DATABASE_URL_SYNC: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/mahad_portfolio",
        description="Sync connection string for Alembic migrations",
    )
    DATABASE_URL_UNPOOLED: str = Field(
        default="",
        description="Direct unpooled connection string for migrations and DDL",
    )

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_async_db_url(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            parsed = urllib.parse.urlparse(v)
            scheme = parsed.scheme
            if scheme in ("postgresql", "postgres"):
                scheme = "postgresql+asyncpg"
            query_dict = urllib.parse.parse_qs(parsed.query)
            # asyncpg accepts ssl via connect_args={'ssl': 'require'}, not query string
            clean_query = urllib.parse.urlencode(
                {k: val for k, val in query_dict.items() if k not in ("sslmode", "channel_binding")},
                doseq=True,
            )
            return urllib.parse.urlunparse(parsed._replace(scheme=scheme, query=clean_query))
        return v

    @field_validator("DATABASE_URL_UNPOOLED", mode="before")
    @classmethod
    def assemble_unpooled_db_url(cls, v: str) -> str:
        if isinstance(v, str) and v.strip():
            v = v.strip()
            parsed = urllib.parse.urlparse(v)
            scheme = parsed.scheme
            if scheme in ("postgresql", "postgres"):
                scheme = "postgresql+asyncpg"
            query_dict = urllib.parse.parse_qs(parsed.query)
            clean_query = urllib.parse.urlencode(
                {k: val for k, val in query_dict.items() if k not in ("sslmode", "channel_binding")},
                doseq=True,
            )
            return urllib.parse.urlunparse(parsed._replace(scheme=scheme, query=clean_query))
        return v

    @field_validator("DATABASE_URL_SYNC", mode="before")
    @classmethod
    def assemble_sync_db_url(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("postgresql+asyncpg://"):
                return v.replace("postgresql+asyncpg://", "postgresql://", 1)
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql://", 1)
        return v

    # --------------------------------------------------------------------------
    # Qdrant Vector Database
    # --------------------------------------------------------------------------
    QDRANT_URL: str = Field(
        default="http://localhost:6333",
        description="Qdrant endpoint URL",
    )
    QDRANT_API_KEY: str = Field(
        default="",
        description="Qdrant Cloud API Key",
        repr=False,
    )
    QDRANT_COLLECTION_NAME: str = "mahad_portfolio_chunks"

    @field_validator("QDRANT_URL", mode="before")
    @classmethod
    def validate_qdrant_url_setting(cls, v: str) -> str:
        return normalize_qdrant_url(v)

    @field_validator("QDRANT_API_KEY", mode="before")
    @classmethod
    def validate_qdrant_api_key_setting(cls, v: str | None) -> str:
        return normalize_secret_value(v, "QDRANT_API_KEY", allow_empty=True)

    # --------------------------------------------------------------------------
    # Groq Inference (LLM & Whisper)
    # --------------------------------------------------------------------------
    GROQ_API_KEY: str = Field(default="", repr=False)
    GROQ_CHAT_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_WHISPER_MODEL: str = "whisper-large-v3"

    # Voice transcription input constraints (P12.1.3)
    WHISPER_MAX_AUDIO_BYTES: int = Field(
        default=10 * 1024 * 1024,  # 10 MB hard cap
        description="Maximum raw audio upload size accepted before forwarding to Whisper",
    )
    WHISPER_ACCEPTED_MIME_TYPES: list[str] = Field(
        default=["audio/webm", "audio/ogg", "audio/mp4", "audio/wav", "audio/mpeg"],
        description="Accepted audio MIME types for voice transcription",
    )

    # --------------------------------------------------------------------------
    # LangSmith Observability (P10.1.1 & P10.1.4)
    # --------------------------------------------------------------------------
    LANGSMITH_TRACING: bool = Field(
        default=False,
        validation_alias=AliasChoices("LANGSMITH_TRACING", "LANGCHAIN_TRACING_V2"),
    )
    LANGSMITH_ENDPOINT: str = Field(
        default="https://api.smith.langchain.com",
        validation_alias=AliasChoices("LANGSMITH_ENDPOINT", "LANGCHAIN_ENDPOINT"),
    )
    LANGSMITH_API_KEY: str = Field(
        default="",
        validation_alias=AliasChoices("LANGSMITH_API_KEY", "LANGCHAIN_API_KEY"),
        repr=False,
    )
    LANGSMITH_PROJECT: str = Field(
        default="mahad-ai-portfolio",
        validation_alias=AliasChoices("LANGSMITH_PROJECT", "LANGCHAIN_PROJECT"),
    )
    LANGSMITH_SAMPLE_RATE: float = Field(default=1.0, ge=0.0, le=1.0)
    LANGSMITH_MAX_MONTHLY_TRACES: int = Field(
        default=4000,
        description="Monthly threshold safely below 5000 free tier",
    )

    # --------------------------------------------------------------------------
    # Sanity CMS Integrations
    # --------------------------------------------------------------------------
    SANITY_PROJECT_ID: str = Field(
        default="rnjj6f7w",
        validation_alias=AliasChoices("SANITY_PROJECT_ID", "NEXT_PUBLIC_SANITY_PROJECT_ID"),
    )
    SANITY_DATASET: str = Field(
        default="production",
        validation_alias=AliasChoices("SANITY_DATASET", "NEXT_PUBLIC_SANITY_DATASET"),
    )
    SANITY_API_READ_TOKEN: str = Field(default="", repr=False)
    SANITY_WEBHOOK_SECRET: str = Field(default="", repr=False)

    @field_validator(
        "GROQ_API_KEY",
        "LANGSMITH_API_KEY",
        "SANITY_API_READ_TOKEN",
        "SANITY_WEBHOOK_SECRET",
        "ELEVENLABS_API_KEY",
        "ELEVENLABS_CUSTOM_LLM_SECRET",
        mode="before",
    )
    @classmethod
    def strip_optional_secret_whitespace(cls, v: str | None) -> str:
        if v is None:
            return ""
        if isinstance(v, str):
            trimmed = v.strip()
            if len(trimmed) >= 2 and (
                (trimmed.startswith('"') and trimmed.endswith('"'))
                or (trimmed.startswith("'") and trimmed.endswith("'"))
            ):
                trimmed = trimmed[1:-1].strip()
            return trimmed
        return v

    # --------------------------------------------------------------------------
    # In-Process ONNX Query Router Model
    # --------------------------------------------------------------------------
    MODEL_ROUTER_DIR: str = Field(
        default="pipelines/training/releases/champion_v1.0.0",
        description="Path to the active champion model package directory",
    )
    MODEL_ROUTER_CONFIDENCE_THRESHOLD: float = Field(
        default=0.50,
        ge=0.0,
        le=1.0,
        description="Minimum confidence threshold for predicted route acceptance without fallback",
    )

    # --------------------------------------------------------------------------
    # ElevenLabs Conversational Companion (Phase 13P)
    # --------------------------------------------------------------------------
    ELEVENLABS_API_KEY: str = Field(
        default="",
        description="Server-only ElevenLabs API key for conversation token generation and agent requests",
        repr=False,
    )
    ELEVENLABS_CUSTOM_LLM_SECRET: str = Field(
        default="",
        description="Bearer token secret for authenticating ElevenLabs Custom LLM requests",
        repr=False,
    )
    ELEVENLABS_AGENT_ID: str = Field(
        default="",
        description="Configured ElevenLabs Conversational AI Agent ID",
    )
    ELEVENLABS_VOICE_ID: str = Field(
        default="",
        description="Default or override ElevenLabs Voice ID",
    )
    ELEVENLABS_VOICE_ID_FALLBACK: str = Field(
        default="",
        description="Fallback Voice ID if primary voice is unavailable",
    )
    ELEVENLABS_SERVER_LOCATION: str = Field(
        default="us",
        description="ElevenLabs server location preference (e.g. 'us', 'eu')",
    )
    ELEVENLABS_VOICE_ENABLED: bool = Field(
        default=True,
        description="Global master switch to enable or disable the conversational voice experience",
    )
    VOICE_SESSION_MAX_SECONDS: int = Field(
        default=120,
        ge=10,
        le=120,
        description="Hard ceiling for voice conversation duration in seconds (capped at 120s)",
    )
    VOICE_INACTIVITY_TIMEOUT_SECONDS: int = Field(
        default=15,
        ge=5,
        le=60,
        description="Client and server inactivity silence threshold before disconnecting",
    )
    VOICE_MONTHLY_BUDGET_SECONDS: int = Field(
        default=3600,
        ge=60,
        description="Monthly aggregated voice duration budget across all visitors in seconds",
    )
    VOICE_DAILY_BUDGET_SECONDS: int = Field(
        default=600,
        ge=60,
        description="Daily aggregated voice duration budget across all visitors in seconds",
    )
    VOICE_GLOBAL_CONCURRENCY_LIMIT: int = Field(
        default=1,
        ge=1,
        description="Maximum simultaneous active voice sessions permitted",
    )

    @field_validator("VOICE_SESSION_MAX_SECONDS", mode="before")
    @classmethod
    def clamp_max_voice_session(cls, v: int | str) -> int:
        val = int(v)
        if val > 120:
            return 120
        return max(val, 10)

    @property
    def is_voice_available(self) -> bool:
        """Return True only if voice is explicitly enabled and required credentials/IDs are configured."""
        if not self.ELEVENLABS_VOICE_ENABLED:
            return False
        if not self.ELEVENLABS_API_KEY.strip() or not self.ELEVENLABS_AGENT_ID.strip():
            return False
        return True

    @property
    def active_voice_id(self) -> str:
        """Return the effective voice ID, falling back to fallback voice ID if empty."""
        return self.ELEVENLABS_VOICE_ID.strip() or self.ELEVENLABS_VOICE_ID_FALLBACK.strip()

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_test(self) -> bool:
        return self.ENVIRONMENT == "test"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached application settings singleton."""
    return Settings()
