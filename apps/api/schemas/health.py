"""Schemas for health, liveness, readiness, and version endpoints."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class HealthLiveResponse(BaseModel):
    status: Literal["alive", "degraded", "dead"] = Field(
        default="alive",
        description="Liveness status of the API service process",
        examples=["alive"],
    )
    service: str = Field(default="mahad-portfolio-api")
    environment: str = Field(examples=["development", "production"])
    timestamp: datetime = Field(description="UTC timestamp of the probe response")


class DependencyCheck(BaseModel):
    status: Literal["ok", "warning", "error", "skipped"] = Field(
        examples=["ok"],
    )
    latency_ms: float | None = Field(default=None, description="Latency of check in ms")
    details: str | None = Field(default=None)


class HealthReadyResponse(BaseModel):
    status: Literal["ready", "not_ready"] = Field(
        default="ready",
        description="Readiness status indicating if the service can handle live requests",
        examples=["ready"],
    )
    service: str = Field(default="mahad-portfolio-api")
    environment: str
    timestamp: datetime
    checks: dict[str, DependencyCheck] = Field(
        default_factory=dict,
        description="Individual status of backing dependencies",
    )


class VersionResponse(BaseModel):
    version: str = Field(examples=["1.0.0"])
    service: str = Field(default="mahad-portfolio-api")
    environment: str = Field(examples=["development", "production"])
    python_version: str = Field(examples=["3.12.10"])
    docs_url: str | None = Field(default="/docs")
