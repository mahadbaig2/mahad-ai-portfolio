# ADR-002: Neon PostgreSQL as Operational Source of Truth

- **Status**: Proposed (Accepted for V1)
- **Date**: 2026-09-04
- **Author**: Antigravity & Mahad

## Context
While Sanity owns user-authored content, an AI assistant requires relational operational persistence for:
- Document manifests, canonical normalized chunks, chunk hashes, and embedding model versions.
- Ingestion run history, synchronization status, and reconciliation logs.
- User chat sessions, redacted messages (only when explicit consent is provided), retrieval events, and citation audit records.
- Model release metadata and user feedback.

## Decision
Adopt **Neon Serverless PostgreSQL** (on the Free plan) as the operational source of truth managed via async SQLAlchemy 2.x and Alembic migrations:
- PostgreSQL holds the authoritative copy of all canonical chunk text and metadata.
- Qdrant stores only vector points and mapping UUIDs; whenever vectors are retrieved from Qdrant, canonical text is hydrated from PostgreSQL.
- Database branching is used for isolated testing and schema migration validation without disrupting production data.

## Consequences

### Positive
- Strict referential integrity, ACID compliance, and relational querying for operational and audit metrics.
- Separation of concerns: Vector stores are treated as derived search indexes, preventing data loss if a vector collection is deleted or re-indexed.
- Serverless auto-suspend and wake-from-zero aligns perfectly with zero-cost free-tier operations.

### Negative / Trade-offs
- Cold starts (wake-from-zero latency of 1-3 seconds); mitigated with connection retry loops and health-check warmups.
- Free tier storage limit (0.5 GB); mitigated with automatic session retention expiry and strict deduplication.
