"""Health, readiness, liveness, and version route handlers."""

import platform
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Response, status

from apps.api.core.config import Settings, get_settings
from apps.api.schemas.health import (
    DependencyCheck,
    HealthLiveResponse,
    HealthReadyResponse,
    VersionResponse,
)

router = APIRouter(tags=["Health & Diagnostics"])


@router.get(
    "/health/live",
    response_model=HealthLiveResponse,
    status_code=status.HTTP_200_OK,
    summary="Liveness Probe",
    description="Returns HTTP 200 as long as the API process is running and responding.",
)
async def get_liveness(settings: Settings = Depends(get_settings)) -> HealthLiveResponse:
    return HealthLiveResponse(
        status="alive",
        service=settings.APP_NAME,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(UTC),
    )


@router.get(
    "/health/ready",
    response_model=HealthReadyResponse,
    status_code=status.HTTP_200_OK,
    summary="Readiness Probe",
    description="Returns HTTP 200 when backing dependencies (database, storage) are available.",
)
async def get_readiness(response: Response, settings: Settings = Depends(get_settings)) -> HealthReadyResponse:
    # Basic dependency checks - extensible as providers are registered
    checks: dict[str, DependencyCheck] = {
        "api_runtime": DependencyCheck(status="ok", details="FastAPI ASGI runtime active"),
    }
    from apps.api.core.config import ROOT_DIR

    router_model = ROOT_DIR / settings.MODEL_ROUTER_DIR / "model.onnx"
    checks["query_router_model"] = DependencyCheck(
        status="ok" if router_model.is_file() else "error",
        details="Router artifact available" if router_model.is_file() else "Router artifact missing",
    )

    # If in test/development without live DB, report skipped or ok
    if settings.DATABASE_URL:
        checks["database"] = DependencyCheck(
            status="ok",
            details="Database connection string configured",
        )
    else:
        checks["database"] = DependencyCheck(
            status="warning",
            details="No database connection string configured",
        )

    all_ok = all(check.status in ("ok", "skipped") for check in checks.values())
    if not all_ok:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return HealthReadyResponse(
        status="ready" if all_ok else "not_ready",
        service=settings.APP_NAME,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(UTC),
        checks=checks,
    )


@router.get(
    "/health/version",
    response_model=VersionResponse,
    status_code=status.HTTP_200_OK,
    summary="Version Metadata",
    description="Returns application version and runtime environment information.",
)
@router.get(
    "/version",
    response_model=VersionResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
async def get_version(settings: Settings = Depends(get_settings)) -> VersionResponse:
    return VersionResponse(
        version=settings.APP_VERSION,
        service=settings.APP_NAME,
        environment=settings.ENVIRONMENT,
        python_version=platform.python_version(),
        docs_url="/docs" if not settings.is_production else None,
    )
