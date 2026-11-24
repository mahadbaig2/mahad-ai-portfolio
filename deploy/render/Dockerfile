FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TOKENIZERS_PARALLELISM=false \
    USE_TORCH=0 \
    RETRIEVAL_BACKEND=lexical \
    ENVIRONMENT=production \
    PORT=10000

WORKDIR /app

COPY deploy/render/requirements.txt /tmp/requirements.txt
RUN python -m pip install --no-cache-dir -r /tmp/requirements.txt \
    && python -m pip check

COPY apps/api /app/apps/api
COPY pipelines/ingestion /app/pipelines/ingestion
COPY pipelines/training/releases/champion_v1.0.0 /app/pipelines/training/releases/champion_v1.0.0

RUN python -c "from apps.api.services.query_router import QueryRouterService; QueryRouterService()"

EXPOSE 10000
CMD ["sh", "-c", "exec uvicorn apps.api.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
