"""Application exception hierarchy and FastAPI exception handlers."""

import logging
from typing import Any

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from apps.api.core.logging import get_correlation_id
from apps.api.schemas.error import ErrorDetail, ErrorResponse

logger = logging.getLogger(__name__)


class AppException(Exception):
    """Base application exception with structured error metadata."""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Any = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details


class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found", details: Any = None) -> None:
        super().__init__(
            code="NOT_FOUND",
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            details=details,
        )


class ValidationError(AppException):
    def __init__(self, message: str = "Validation failed", details: Any = None) -> None:
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )


class PayloadTooLargeError(AppException):
    def __init__(self, message: str = "Request payload exceeds maximum allowed size") -> None:
        super().__init__(
            code="PAYLOAD_TOO_LARGE",
            message=message,
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
        )


class ServiceUnavailableError(AppException):
    def __init__(self, message: str = "Service temporarily unavailable", details: Any = None) -> None:
        super().__init__(
            code="SERVICE_UNAVAILABLE",
            message=message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            details=details,
        )


def create_error_response(
    code: str,
    message: str,
    status_code: int,
    details: Any = None,
) -> JSONResponse:
    """Construct a standardized JSONResponse with ErrorResponse envelope."""
    envelope = ErrorResponse(
        error=ErrorDetail(
            code=code,
            message=message,
            details=details,
            correlation_id=get_correlation_id(),
        )
    )
    return JSONResponse(
        status_code=status_code,
        content=envelope.model_dump(exclude_none=True),
    )


async def app_exception_handler(_request: Request, exc: AppException) -> JSONResponse:
    """Handler for all domain AppException errors."""
    logger.warning(
        "Application exception [%s]: %s",
        exc.code,
        exc.message,
        extra={"code": exc.code, "details": exc.details},
    )
    return create_error_response(
        code=exc.code,
        message=exc.message,
        status_code=exc.status_code,
        details=exc.details,
    )


async def validation_exception_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handler for FastAPI / Pydantic request validation errors."""
    errors = exc.errors()
    # Format field errors safely
    formatted_errors = [
        {
            "field": ".".join(str(loc) for loc in err.get("loc", []) if loc != "body"),
            "message": err.get("msg", ""),
            "type": err.get("type", ""),
        }
        for err in errors
    ]
    logger.info("Request validation failed: %d errors", len(errors))
    return create_error_response(
        code="VALIDATION_ERROR",
        message="Invalid request parameters or payload",
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        details=formatted_errors,
    )


async def http_exception_handler(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handler for Starlette/FastAPI standard HTTPExceptions."""
    code_map = {
        status.HTTP_404_NOT_FOUND: "NOT_FOUND",
        status.HTTP_401_UNAUTHORIZED: "UNAUTHORIZED",
        status.HTTP_403_FORBIDDEN: "FORBIDDEN",
        status.HTTP_405_METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
        status.HTTP_413_REQUEST_ENTITY_TOO_LARGE: "PAYLOAD_TOO_LARGE",
        status.HTTP_429_TOO_MANY_REQUESTS: "RATE_LIMIT_EXCEEDED",
    }
    code = code_map.get(exc.status_code, "HTTP_ERROR")
    message = str(exc.detail) if exc.detail else "An HTTP error occurred"
    return create_error_response(
        code=code,
        message=message,
        status_code=exc.status_code,
    )


async def unhandled_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler for unexpected 500 exceptions with redacted internal trace."""
    logger.error(
        "Unhandled internal server exception: %s",
        str(exc),
        exc_info=True,
    )
    return create_error_response(
        code="INTERNAL_SERVER_ERROR",
        message="An unexpected server error occurred. Please try again later.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
