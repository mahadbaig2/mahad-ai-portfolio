# Portfolio assistant deployment

The web frontend is a static Cloudflare Pages export. Its text and voice
clients require a separate public FastAPI service. A Pages build with an empty
`NEXT_PUBLIC_API_URL` sends chat POSTs to the Pages origin and returns HTTP 405.

## API Space

The existing `mirzaMahad/mahad-ai-portfolio-api` Hugging Face Space can use the
files in `deploy/huggingface-api`. Set its SDK to Docker and build with a pinned
`SOURCE_COMMIT` argument matching the reviewed GitHub main commit. The image
installs CPU-only PyTorch, embeds the public E5 model, verifies the champion
ONNX router and serves Uvicorn on port 7860.

**Current hosting blocker (2026-11-24):** Hugging Face rejected changing the
existing ZeroGPU Space to CPU Basic and rejected creating a new Docker Space
with HTTP 402. Its current plan requires a PRO subscription for CPU Basic
Docker hosting. A Gradio SDK build of the CPU-only API reached startup, but
ZeroGPU rejected it because no GPU function was registered. The Space was
restored to its original files and has no running API. Do not use a dummy GPU
function to bypass this hosting restriction. Render's free service has 512 MB
RAM; the current local API process used approximately 968 MB after loading the
retrieval model, so deploying it there unchanged would risk an out-of-memory
restart. No public API URL has been verified yet. A compatible host with enough
memory or a paid CPU Basic plan is required before connecting Cloudflare Pages.

Set these **Space secrets** in Hugging Face, without putting values in Git:

- `DATABASE_URL` (Neon pooled URL)
- `QDRANT_URL` and `QDRANT_API_KEY`
- `GROQ_API_KEY`
- `SANITY_API_READ_TOKEN` and `SANITY_PROJECT_ID` / `SANITY_DATASET`
- `ENVIRONMENT=production`
- `CORS_ORIGINS=https://mahad-ai-portfolio.pages.dev`

Keep voice disabled until its separate ElevenLabs settings and usage limits are
verified. The Space must return 200 at `/health/live` and `/health/ready`, then
answer a factual `/api/v1/assistant/chat` request with a valid citation.

Set `NEXT_PUBLIC_API_URL` in Cloudflare Pages production build variables to
the verified HTTPS Space origin. Redeploy Pages so this value is embedded in
the static JavaScript bundle. Test one text request from the public site.

Qdrant Free clusters may suspend after inactivity. Reactivate the existing
cluster in its dashboard, verify collection health and reconcile its point IDs
against active Neon chunks. The web client should report an unavailable backend
honestly during any future suspension. A free service cannot guarantee uptime.
