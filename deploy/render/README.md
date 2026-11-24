# Free CPU API deployment

`render.yaml` creates a free Docker web service. It uses the same FastAPI,
LangGraph, Groq, Neon, and champion ONNX query router as the local API. To fit
the free instance's 512 MB memory limit, `RETRIEVAL_BACKEND=lexical` ranks the
published, RAG-enabled canonical chunks in Neon with BM25. The default runtime
continues to use the Qdrant vector index and multilingual E5 embeddings. The
GitHub reconciliation workflow maintains Qdrant independently.

Provide `DATABASE_URL` and `GROQ_API_KEY` as Render secret environment values.
The database URL must point to the same Neon database used by the successful
reconciliation workflow. Do not commit either value. The health check is
`/health/ready`; it checks the ONNX artifact and a live Neon connection.

The public API is deployed at `https://mahad-ai-portfolio-api.onrender.com`.
Cloudflare Pages production has `NEXT_PUBLIC_API_URL` set to that origin. On
November 25, 2026 (Asia/Karachi), `/health/ready` returned ready with the API,
ONNX router artifact, and Neon database checks all OK. Live Busyfile, Alder
Legal, and Marketing OS questions returned specific answers with case-study
citations. The Pages chat widget returned a cited Busyfile answer on mobile.
`monitor-live.yml` probes the public site and API readiness every six hours;
GitHub Actions reports failures in the workflow run history.

Render free services sleep after idle time and may take about a minute to wake.
They can also be suspended when free usage limits are reached. This is not an
always-on deployment. Check Render events/logs, `/health/ready`, Neon, and Groq
when chat fails. The lexical backend will have different recall from Qdrant;
keep the Qdrant-backed deployment as the preferred higher-memory configuration.
