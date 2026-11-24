FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TOKENIZERS_PARALLELISM=false \
    HF_HOME=/app/.cache/huggingface \
    PORT=7860

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-runtime.txt /tmp/requirements-runtime.txt
RUN python -m pip install --no-cache-dir 'torch==2.14.0+cpu' \
      --index-url https://download.pytorch.org/whl/cpu \
    && python -m pip install --no-cache-dir -r /tmp/requirements-runtime.txt \
    && python -m pip check

ARG SOURCE_COMMIT
RUN test -n "$SOURCE_COMMIT" \
    && git init /app \
    && git remote add origin https://github.com/mahadbaig2/mahad-ai-portfolio.git \
    && git fetch --depth 1 origin "$SOURCE_COMMIT" \
    && git checkout --detach FETCH_HEAD \
    && test "$(git rev-parse HEAD)" = "$SOURCE_COMMIT" \
    && rm -rf /app/.git

# Cache public embedding weights in the image so retrieval does not depend on
# Hugging Face Hub availability at request time.
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('intfloat/multilingual-e5-small', device='cpu')"

RUN python -c "from apps.api.services.query_router import QueryRouterService; QueryRouterService()"

EXPOSE 7860
CMD ["sh", "-c", "exec uvicorn apps.api.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
