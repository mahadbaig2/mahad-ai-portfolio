# Neon PostgreSQL Runbook: Architecture, Migrations & Disaster Recovery

## 1. Overview & Architecture

The operational database for the portfolio and the "Talk to Mahad" AI assistant runs on **Neon Serverless PostgreSQL**. Neon provides auto-scaling serverless compute with instant scale-to-zero when idle, keeping operations strictly within the free tier.

### Role in the RAG Architecture
- **PostgreSQL is the operational source of truth**:
  - `source_documents`: Tracks Sanity documents, schemas, and deterministic SHA-256 hashes.
  - `document_chunks`: Stores canonical chunk text, token counts, and heading paths.
  - `index_runs`: Audits indexing runs and records chunk counts and completion timestamps.
  - `chat_sessions`: Manages sessions with explicit consent flags and TTL expiration.
  - `chat_messages`: Stores scrubbed and redacted user and assistant messages (only when consented).
  - `retrieval_events`: Records cited chunk IDs, similarity scores, and execution latency.
  - `chat_feedback`: Captures explicit user feedback (+1/-1 and reasoning).
  - `model_releases`: Tracks candidate and champion query classifier models and MLflow run IDs.

> [!IMPORTANT]
> **Dual-Persistence RAG Invariant**:
> In accordance with `AGENTS.md`, Qdrant point UUIDs must match `document_chunks.id` in PostgreSQL exactly. Qdrant is merely a derived vector index. If Qdrant and PostgreSQL ever conflict, PostgreSQL always wins.

---

## 2. Environment Variables & Connection Configuration

Neon separates connections into two distinct endpoints:
1. **Pooled Connection (`-pooler`)**: Uses PgBouncer for lightweight serverless transactions. Recommended for FastAPI and high-concurrency requests.
2. **Direct Connection**: Connects directly to the PostgreSQL compute instance. Required for operations requiring transactional DDL locks (such as Alembic migrations).

### Configuration in `.env`
```env
# Async connection string for FastAPI / SQLAlchemy (asyncpg)
DATABASE_URL=postgresql+asyncpg://<username>:<password>@ep-example-pooler.us-east-2.aws.neon.tech/neondb

# Synchronous connection string for Alembic migrations (psycopg2)
DATABASE_URL_SYNC=postgresql://<username>:<password>@ep-example-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# Serverless pool tuning
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=1800
```

> [!NOTE]
> `asyncpg` does not accept `sslmode=require` as a URL query parameter. The application configuration (`apps/api/core/config.py`) strips URL query parameters and passes `connect_args={"ssl": "require"}` directly to the async engine.

---

## 3. Wake-From-Zero Behavior

Neon compute instances suspend automatically after 5 minutes of inactivity to preserve compute hours.

- **Cold Start Latency**: The first incoming query to a sleeping endpoint typically incurs a 1.0 to 3.0 second wake latency.
- **Pre-Ping & Resilience**: SQLAlchemy engines are configured with `pool_pre_ping=True` and `pool_recycle=1800`.
- **Health Checks**: The `/health/ready` endpoint tests connectivity with a bounded ping query (`SELECT 1`), returning 200 once compute is awake.

---

## 4. Alembic Migration Procedures

Migrations are managed with Alembic.

### Checking Current Migration State
```bash
.\.venv\Scripts\alembic.exe current
```

### Applying Migrations (Upgrade to Head)
```bash
.\.venv\Scripts\alembic.exe upgrade head
```

### Rolling Back the Most Recent Migration
```bash
.\.venv\Scripts\alembic.exe downgrade -1
```

### Creating a New Migration Revision
```bash
.\.venv\Scripts\alembic.exe revision -m "add_table_or_column"
```

---

## 5. Logical Backup & Export Procedures

### Full Database Export using `pg_dump`
To create a timestamped SQL dump:
```bash
pg_dump "$DATABASE_URL_SYNC" --format=c --file="backup_$(date +%Y%m%d_%H%M%S).dump"
```

### Exporting Plain SQL Schema Only
```bash
pg_dump "$DATABASE_URL_SYNC" --schema-only > schema_backup.sql
```

### Restoring from Dump
```bash
pg_restore --clean --if-exists -d "$DATABASE_URL_SYNC" backup_YYYYMMDD_HHMMSS.dump
```

---

## 6. Neon Branching & Disaster Recovery

Neon supports instant, copy-on-write database branching without storage duplication.

### Safe Migration Verification Flow:
1. Create a development branch in the Neon Console (or via Neon CLI: `neon branches create --name test-migration`).
2. Run migrations against the test branch:
   ```bash
   DATABASE_URL_SYNC="postgresql://...neon.tech/test_db?sslmode=require" alembic upgrade head
   ```
3. Run integration tests:
   ```bash
   pytest apps/api/tests/test_neon_integration.py
   ```
4. Promote/apply to the primary branch once verified.

### Recovery from Failed Migrations
If an Alembic migration fails partially or corrupts data:
1. **Point-In-Time Restore (PITR)**: Use Neon Console's time-travel restore to roll the primary branch back to the exact minute prior to migration execution.
2. **Branch Swap**: Alternatively, branch off a previous snapshot and point `DATABASE_URL` to the healthy branch.
