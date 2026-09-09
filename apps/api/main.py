"""FastAPI application factory and entry point for the Mahad AI Portfolio API."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from apps.api.core.config import Settings, get_settings
from apps.api.core.errors import (
    AppException,
    app_exception_handler,
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from apps.api.core.logging import setup_logging
from apps.api.middleware.body_size import BodySizeLimitMiddleware
from apps.api.middleware.correlation import CorrelationIdMiddleware
from apps.api.routes.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan manager for startup and shutdown hooks."""
    settings = get_settings()
    setup_logging(level=settings.LOG_LEVEL, environment=settings.ENVIRONMENT)
    # Startup tasks (e.g. database pool, ONNX session initialization) occur here
    yield
    # Shutdown tasks (e.g. closing database connections) occur here


def create_app(settings: Settings | None = None) -> FastAPI:
    """Create and configure a FastAPI application instance."""
    if settings is None:
        settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "FastAPI backend and LangGraph orchestrator for Mahad's "
            "AI Product Engineering Portfolio assistant."
        ),
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # --------------------------------------------------------------------------
    # Middlewares (Order: Correlation ID -> Body Size -> CORS)
    # --------------------------------------------------------------------------
    app.add_middleware(CorrelationIdMiddleware)
    app.add_middleware(BodySizeLimitMiddleware, max_bytes=settings.MAX_BODY_BYTES)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Correlation-ID"],
    )

    # --------------------------------------------------------------------------
    # Exception Handlers
    # --------------------------------------------------------------------------
    app.add_exception_handler(AppException, app_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(RequestValidationError, validation_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, unhandled_exception_handler)

    # --------------------------------------------------------------------------
    # Routers
    # --------------------------------------------------------------------------
    app.include_router(health_router)

    return app


# Default ASGI application instance
app = create_app()
