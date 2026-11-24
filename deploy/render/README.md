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

After the public API passes `/health/ready` and cited chat requests, set the
Cloudflare Pages build variable `NEXT_PUBLIC_API_URL` to its `https://...onrender.com`
origin and trigger a new production build. Verify the browser's chat request
goes to the API origin and the response includes a project citation.

Render free services sleep after idle time and may take about a minute to wake.
They can also be suspended when free usage limits are reached. This is not an
always-on deployment. Check Render events/logs, `/health/ready`, Neon, and Groq
when chat fails. The lexical backend will have different recall from Qdrant;
keep the Qdrant-backed deployment as the preferred higher-memory configuration.
