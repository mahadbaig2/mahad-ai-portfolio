"""Structured JSON logging with correlation ID propagation."""

import json
import logging
import sys
from contextvars import ContextVar
from datetime import UTC, datetime
from typing import Any

# Context variable holding the correlation ID for the active async request
correlation_id_ctx: ContextVar[str | None] = ContextVar("correlation_id", default=None)


def get_correlation_id() -> str | None:
    """Return the active correlation ID or None."""
    return correlation_id_ctx.get()


def set_correlation_id(correlation_id: str | None) -> None:
    """Set the active correlation ID in context."""
    correlation_id_ctx.set(correlation_id)


class StructuredJsonFormatter(logging.Formatter):
    """Formatter that outputs RFC 3339 UTC timestamps and structured JSON."""

    def __init__(self, environment: str = "development") -> None:
        super().__init__()
        self.environment = environment

    def format(self, record: logging.LogRecord) -> str:
        log_payload: dict[str, Any] = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "environment": self.environment,
        }

        # Include correlation ID if set
        cid = get_correlation_id()
        if cid:
            log_payload["correlation_id"] = cid

        # Include exception details if present
        if record.exc_info:
            log_payload["exception"] = self.formatException(record.exc_info)

        # Include custom extra attributes (excluding standard LogRecord attributes)
        standard_attrs = {
            "args", "asctime", "created", "exc_info", "exc_text", "filename",
            "funcName", "levelname", "levelno", "lineno", "module", "msecs",
            "message", "msg", "name", "pathname", "process", "processName",
            "relativeCreated", "stack_info", "thread", "threadName",
        }
        extras = {
            k: v for k, v in record.__dict__.items()
            if k not in standard_attrs and not k.startswith("_")
        }
        if extras:
            log_payload["extra"] = extras

        return json.dumps(log_payload, default=str)


def setup_logging(level: str = "INFO", environment: str = "development") -> None:
    """Configure root logger with StructuredJsonFormatter."""
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Remove existing handlers
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    # Add stdout handler with JSON formatting
    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setFormatter(StructuredJsonFormatter(environment=environment))
    root_logger.addHandler(stdout_handler)

    # Silence overly verbose third-party loggers
    logging.getLogger("uvicorn.access").handlers = [stdout_handler]
    logging.getLogger("uvicorn.error").handlers = [stdout_handler]
    logging.getLogger("asyncio").setLevel(logging.WARNING)
