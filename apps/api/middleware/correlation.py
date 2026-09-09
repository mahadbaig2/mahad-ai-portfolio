"""Middleware to inject and propagate correlation IDs across requests and responses."""

import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from apps.api.core.logging import set_correlation_id

CORRELATION_HEADER = "X-Correlation-ID"


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Ensures every incoming HTTP request has a valid UUID correlation ID."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        incoming_id = request.headers.get(CORRELATION_HEADER)

        # Validate incoming ID or generate a new UUID4
        if incoming_id and len(incoming_id.strip()) > 0:
            correlation_id = incoming_id.strip()
        else:
            correlation_id = str(uuid.uuid4())

        # Set in logging context
        set_correlation_id(correlation_id)

        try:
            response = await call_next(request)
            response.headers[CORRELATION_HEADER] = correlation_id
            return response
        finally:
            set_correlation_id(None)
