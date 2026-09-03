# ADR-003: Qdrant as Rebuildable Derived Vector Index

- **Status**: Proposed (Accepted for V1)
- **Date**: 2026-09-04
- **Author**: Antigravity & Mahad

## Context
RAG retrieval requires high-performance approximate nearest neighbor (ANN) vector search with rich payload filtering (filtering by project, language, target audience, and active index version). However, free cloud vector databases may face cluster suspensions or inactivity resets. Relying on a vector database as the sole storage layer creates unacceptable risk of unrecoverable data loss.

## Decision
Use **Qdrant Cloud** (Free Tier cluster) as an ephemeral, derived vector index that can be completely rebuilt from scratch at any moment:
- Qdrant stores only: vector embeddings (384-dimensional for `intfloat/multilingual-e5-small`), point UUIDs (matching `document_chunks.id` in PostgreSQL), and lightweight indexing filter payloads (`document_type`, `project_slug`, `audience`, `active_version`).
- The full canonical text of every chunk resides strictly in Neon PostgreSQL.
- If PostgreSQL and Qdrant ever disagree, PostgreSQL wins and stale vector points are purged.
- A deterministic CLI and CI rebuild script (`rebuild-index --confirm`) can reconstruct the entire Qdrant collection from PostgreSQL chunk manifests at any time.

## Consequences

### Positive
- Total disaster recovery resilience: cluster suspension, deletion, or corruption causes zero permanent data loss.
- Allows seamless switching between embedding models or vector distances by spinning up a new collection version alongside the old one before deactivation.
- Fast, memory-efficient index operations since large text payloads are not duplicated in Qdrant memory.

### Negative / Trade-offs
- Retrieval requires a hydration step: vector search yields top IDs from Qdrant, followed by a primary key lookup in PostgreSQL. This adds a negligible ~5-15ms round-trip to database queries.
