"""Application settings loaded through Pydantic V2."""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Root directory of the repository
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
ENV_FILE = ROOT_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE if ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore",
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

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_async_db_url(cls, v: str) -> str:
        if isinstance(v, str):
            import urllib.parse
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

    @field_validator("DATABASE_URL_SYNC", mode="before")
    @classmethod
    def assemble_sync_db_url(cls, v: str) -> str:
        if isinstance(v, str):
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
    QDRANT_API_KEY: str = Field(default="", description="Qdrant Cloud API Key")
    QDRANT_COLLECTION_NAME: str = "mahad_portfolio_chunks"

    # --------------------------------------------------------------------------
    # Groq Inference (LLM & Whisper)
    # --------------------------------------------------------------------------
    GROQ_API_KEY: str = Field(default="")
    GROQ_CHAT_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_WHISPER_MODEL: str = "whisper-large-v3"

    # --------------------------------------------------------------------------
    # LangSmith Observability
    # --------------------------------------------------------------------------
    LANGSMITH_TRACING: bool = False
    LANGSMITH_API_KEY: str = Field(default="")
    LANGSMITH_PROJECT: str = "mahad-portfolio-assistant"

    # --------------------------------------------------------------------------
    # Sanity CMS Integrations
    # --------------------------------------------------------------------------
    SANITY_PROJECT_ID: str = Field(
        default="rnjj6f7w",
        alias="NEXT_PUBLIC_SANITY_PROJECT_ID",
    )
    SANITY_DATASET: str = Field(
        default="production",
        alias="NEXT_PUBLIC_SANITY_DATASET",
    )
    SANITY_API_READ_TOKEN: str = Field(default="")
    SANITY_WEBHOOK_SECRET: str = Field(default="")

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
