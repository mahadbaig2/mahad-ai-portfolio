"""Middleware to enforce maximum request body size limits."""

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from apps.api.core.errors import create_error_response


class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    """Rejects incoming HTTP requests exceeding max_bytes with a 413 Payload Too Large."""

    def __init__(self, app: ASGIApp, max_bytes: int = 2 * 1024 * 1024) -> None:
        super().__init__(app)
        self.max_bytes = max_bytes

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        content_length = request.headers.get("content-length")

        if content_length:
            try:
                length = int(content_length)
                if length > self.max_bytes:
                    return create_error_response(
                        code="PAYLOAD_TOO_LARGE",
                        message=f"Request payload ({length} bytes) exceeds maximum limit of {self.max_bytes} bytes",
                        status_code=413,
                    )
            except ValueError:
                pass

        return await call_next(request)
