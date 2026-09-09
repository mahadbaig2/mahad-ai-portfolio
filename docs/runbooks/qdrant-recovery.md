# Runbook: Qdrant Free-Tier Suspension & Collection Disaster Recovery

## 1. Context & Architecture Invariant

In Mahad's portfolio architecture, **PostgreSQL is the operational source of truth**, and **Sanity is the authoring source of truth**.

**Qdrant is strictly a derived vector index**, never the canonical store of document content:
- All canonical chunk text lives in PostgreSQL (`document_chunks` table).
- Point IDs in Qdrant match PostgreSQL `document_chunks.id` UUIDs exactly.
- Full text does NOT reside in Qdrant (only an immutable 160-character debug preview).
- If the Qdrant cluster is suspended, cleared, or deleted, **zero data is lost**. The entire vector index can be completely reconstructed in seconds.

---

## 2. Qdrant Cloud Free Tier Inactivity Policy

Qdrant Cloud provides a 1GB free-tier cluster. Under provider terms:
- Clusters with no read/write activity for extended periods (typically 7+ days) may be suspended into a dormant state.
- In rare circumstances of prolonged inactivity, free clusters may require re-creation.

### Failure Symptoms
When the cluster is dormant or suspended:
1. API health checks fail: `GET /health` returns `qdrant: false`.
2. Retrieval requests log warnings: `Qdrant health check failed` or HTTP connection timeouts.
3. User requests fall back safely without unhandled 500 crashes (returning safe fallback messages).

---

## 3. One-Command Index Rebuild & Recovery

To completely restore or rebuild the vector index from PostgreSQL:

```bash
# 1. Activate virtual environment
.venv\Scripts\activate

# 2. Run rebuild with confirmation
python -m pipelines.rebuild_index --confirm-rebuild
```

### What This Command Does:
1. Verifies connectivity to Neon PostgreSQL and Qdrant Cloud.
2. Creates the collection `mahad_portfolio_chunks` with `size=384` and `distance=Cosine` if missing.
3. Initializes payload indexes on:
   - `document_type`
   - `project_slug`
   - `language`
   - `target_audiences`
   - `is_active`
   - `embedding_version`
4. Queries all active canonical chunks from PostgreSQL (`is_active = True`).
5. Batches chunks, embeds using `intfloat/multilingual-e5-small` with `passage: ` prefixes, and upserts them to Qdrant.

---

## 4. Full Re-Sync from Sanity CMS

If PostgreSQL is also empty or needs to be refreshed from authored Sanity content:

```bash
# Re-ingest from Sanity CMS directly into PostgreSQL and Qdrant
python -m pipelines.ingestion.indexer --sync-qdrant
```

---

## 5. Verification After Recovery

Run the CLI Retrieval Inspector to verify end-to-end vector search, PostgreSQL hydration, and citations:

```bash
python -m pipelines.retrieval_inspector "What is CardioScan AI?"
```

Expected output:
- Total Retrieval Latency: < 50ms
- Points Returned by Qdrant: >= 1
- PostgreSQL Hydration: >= 1
- Grounded Citations with verified URLs and chunk UUIDs.
