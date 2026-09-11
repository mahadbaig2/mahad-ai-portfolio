"""
FastAPI route for in-process query classification using the ONNX champion model.
"""

from fastapi import APIRouter, Depends
from apps.api.schemas.router import RouterPredictionRequest, RouterPredictionResponse
from apps.api.services.query_router import QueryRouterService, get_router_service

router = APIRouter(prefix="/router", tags=["Query Router"])


@router.post(
    "/classify",
    response_model=RouterPredictionResponse,
    summary="Classify user query using in-process ONNX model",
    description="Returns predicted route, intent, answerability, language, confidence, and fallback status.",
)
async def classify_query(
    request: RouterPredictionRequest,
    service: QueryRouterService = Depends(get_router_service),
) -> RouterPredictionResponse:
    return service.predict(request.text)
