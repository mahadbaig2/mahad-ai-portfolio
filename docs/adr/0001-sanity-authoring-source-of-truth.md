# ADR-001: Sanity CMS as Authoring Source of Truth

- **Status**: Proposed (Accepted for V1)
- **Date**: 2026-09-04
- **Author**: Antigravity & Mahad

## Context
A portfolio and demonstrable AI system must showcase real-world projects, articles, architectural decisions, and career milestones. Hardcoding production content in frontend code creates brittle duplication and makes maintenance cumbersome. At the same time, the RAG retrieval pipeline requires clean, structured content schemas with metadata (tags, target audiences, sensitivity, canonical URLs, and indexability flags).

## Decision
Adopt **Sanity CMS** (hosted on the Free Developer plan) with Sanity Studio embedded at `apps/studio` as the single authoring source of truth for all public content:
- Sanity owns schemas for `project`, `caseStudy`, `article`, `experience`, `education`, `skill`, `faq`, `architectureDecision`, `personalStory`, `styleExample`, and `siteSettings`.
- Content documents explicitly define `ragEnabled`, audience targeting (`recruiter`, `engineer`, `founder`), sensitivity level, and canonical path.
- The web frontend (`apps/web`) reads directly from Sanity via GROQ queries with safe fallback.
- The offline RAG ingestion pipeline fetches raw documents from Sanity to extract, normalize, and chunk.

## Consequences

### Positive
- Zero duplication: The frontend website and the AI assistant retrieval index draw from the exact same authoring source.
- Live editorial workflow without code redeployment.
- Rich text (Portable Text) provides structured AST representation that is easy to normalize into clean text chunks.

### Negative / Trade-offs
- External dependency on Sanity API availability; mitigated via Next.js caching / ISR and empty-state fallbacks.
- Rate limits on the free tier require batching and idempotent webhook ingestion rather than aggressive polling.
