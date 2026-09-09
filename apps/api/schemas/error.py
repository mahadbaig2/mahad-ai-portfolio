"""Stable error response schemas."""

from typing import Any

from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    code: str = Field(
        ...,
        description="Machine-readable error code (e.g. VALIDATION_ERROR, NOT_FOUND)",
        examples=["VALIDATION_ERROR"],
    )
    message: str = Field(
        ...,
        description="Human-readable explanation of the error",
        examples=["Invalid request parameters"],
    )
    details: Any = Field(
        default=None,
        description="Optional structured details, field errors, or validation messages",
    )
    correlation_id: str | None = Field(
        default=None,
        description="Tracing correlation ID associated with this request",
        examples=["550e8400-e29b-41d4-a716-446655440000"],
    )


class ErrorResponse(BaseModel):
    """Standardized error envelope returned across all API endpoints."""

    error: ErrorDetail
