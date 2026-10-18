# TASKS.md

## Current execution override: conversational companion pivot

The original Phase 12 transcription and Phase 13 OpenVoice plans remain in this file as historical evidence. They document the architecture initially selected under the original zero-cost and no-realtime-transport constraints.

Those incomplete legacy voice tasks are paused and are not the current execution path.

The active voice and floating-assistant implementation is now:

- `PHASE 13P - Conversational Companion Pivot`
- `docs/adr/0010-elevenlabs-conversational-companion.md`

Phase 13P supersedes incomplete legacy Phase 12 and Phase 13 voice work for execution-order purposes. Existing completed transcription work must remain intact until the ElevenLabs proof of concept and rollback gate pass.

Do not delete the existing transcription implementation during the initial pivot. Remove or archive it only at the specific cleanup milestone after the new conversational channel is verified.

## How to use this file

This is the execution source of truth for the Mahad AI Portfolio. Antigravity must follow tasks in order and must not skip acceptance gates.

Checkbox meanings:

- `[ ]` Not started
- `[x]` Completed and verified
- `[-]` Intentionally deferred with Mahad's approval

Ownership:

- **[A]** Antigravity executes.
- **[M]** Mahad executes manually.
- **[A+M]** Antigravity prepares; Mahad reviews, supplies data or confirms.

Rules:

1. Complete only the first incomplete task whose dependencies are satisfied.
2. Antigravity checks **[A]** tasks only after running their verification.
3. Antigravity checks **[M]** tasks only after Mahad explicitly confirms them.
4. Do not proceed past a `GATE` task with any unmet condition.
5. Never place real secrets in this file.
6. Record blockers directly beneath the blocked task.
7. New ideas go to `docs/backlog.md`, not into the active milestone sequence.

---

# PHASE 0 - Scope, accounts and repository foundation

## Milestone 0.1 - Confirm the build contract

Goal: Freeze version 1 before code is written.

- [x] **P0.1.1 [A]** Copy the locked scope from `AGENTS.md` into `docs/product/scope.md`.
- [x] **P0.1.2 [A]** Create `docs/backlog.md` for post-version-1 ideas.
- [x] **P0.1.3 [A]** Create `docs/product/personas.md` for Recruiter, Engineer, Founder and Client audiences.
- [x] **P0.1.4 [A]** Write measurable product success criteria: useful without AI, grounded citations, bounded cost, mobile support and graceful degradation.
- [x] **P0.1.5 [M]** Review the scope and explicitly approve it.
- [x] **P0.1.G GATE [A+M]** Confirm that no version-1 feature has been added or removed without written approval.

Deliverable: Approved product contract.

## Milestone 0.2 - Create accounts safely

Goal: Establish free resources without enabling accidental billing.

- [x] **P0.2.1 [M]** Confirm ownership of a GitHub account and select a public repository name.
- [x] **P0.2.2 [M]** Create or confirm Cloudflare account on the Free plan.
- [x] **P0.2.3 [M]** Create Sanity account/project on the Free plan; record project ID privately.
- [x] **P0.2.4 [M]** Create Neon project on the Free plan; do not enable a paid plan.
- [x] **P0.2.5 [M]** Create Qdrant free cluster without attaching billing details.
- [x] **P0.2.6 [M]** Create Groq API key with free-tier usage only.
- [x] **P0.2.7 [M]** Create LangSmith Developer workspace and verify billing settings.
- [x] **P0.2.8 [M]** Create two Hugging Face Spaces placeholders: `mahad-portfolio-api` and `mahad-portfolio-voice`, using CPU Basic only.
- [x] **P0.2.9 [M]** Confirm no provider has automatic paid overage enabled.
- [x] **P0.2.10 [A]** Add `docs/runbooks/free-tier-audit.md` with a monthly manual audit checklist.
- [x] **P0.2.G GATE [M]** Confirm every production service is free/capped before Antigravity adds credentials.

## Milestone 0.3 - Scaffold the monorepo

Goal: Create reproducible foundations.

- [x] **P0.3.1 [A]** Initialize Git and the public GitHub repository if Mahad has supplied the remote.
- [x] **P0.3.2 [A]** Create `pnpm-workspace.yaml` and root `package.json`.
- [x] **P0.3.3 [A]** Create `apps/web`, `apps/studio`, `apps/api`, `apps/voice`, `packages/ui`, `packages/contracts`, `packages/prompts`, `pipelines/ingestion`, `pipelines/training`, `pipelines/evaluation`, `infra`, `docs/adr` and `docs/runbooks`.
- [x] **P0.3.4 [A]** Configure Node, pnpm and Python versions.
- [x] **P0.3.5 [A]** Add lockfiles, `.gitignore`, `.editorconfig` and `.env.example`.
- [x] **P0.3.6 [A]** Add secret-scanning and dependency-update configuration.
- [x] **P0.3.7 [A]** Add root commands for install, lint, type-check, unit tests and integration tests.
- [x] **P0.3.8 [A]** Add a minimal `README.md` with local prerequisites and no unverified setup claims.
- [x] **P0.3.9 [A]** Add `docker-compose.yml` for local PostgreSQL and Qdrant only.
- [x] **P0.3.10 [A]** Verify clean installation from repository instructions.
- [x] **P0.3.G GATE [A]** Fresh install, lint skeleton and local containers succeed.

## Milestone 0.4 - Architecture decisions

- [x] **P0.4.1 [A]** ADR: Sanity as authoring source of truth.
- [x] **P0.4.2 [A]** ADR: Neon as operational source of truth.
- [x] **P0.4.3 [A]** ADR: Qdrant as rebuildable vector index.
- [x] **P0.4.4 [A]** ADR: FastAPI/LangGraph on a CPU Space.
- [x] **P0.4.5 [A]** ADR: In-process ONNX routing model.
- [x] **P0.4.6 [A]** ADR: MLflow for ML lifecycle and LangSmith for LLMOps.
- [x] **P0.4.7 [A]** ADR: separate voice-service failure domain.
- [x] **P0.4.8 [A]** ADR: SSE instead of WebSockets/WebRTC for version 1.
- [x] **P0.4.9 [M]** Review and approve ADR summaries.
- [x] **P0.4.G GATE [A+M]** Architecture is approved before feature work.

---

# PHASE 1 - Minimal portfolio foundation

## Milestone 1.1 - Next.js application

- [x] **P1.1.1 [A]** Scaffold Next.js App Router with strict TypeScript.
- [x] **P1.1.2 [A]** Configure Tailwind CSS and shared UI package.
- [x] **P1.1.3 [A]** Load Plus Jakarta Sans using `next/font`.
- [x] **P1.1.4 [A]** Add global white, near-black and neutral-gray tokens only.
- [x] **P1.1.5 [A]** Add consistent content widths, spacing scale and focus styles.
- [x] **P1.1.6 [A]** Add header, footer and accessible mobile navigation.
- [x] **P1.1.7 [A]** Add error, not-found and loading boundaries.
- [x] **P1.1.8 [A]** Verify keyboard navigation and reduced-motion behavior.

## Milestone 1.2 - Plain content pages

- [x] **P1.2.1 [A]** Implement Home with short positioning, selected work and Talk to Mahad entry.
- [x] **P1.2.2 [A]** Implement Work index.
- [x] **P1.2.3 [A]** Implement case-study route.
- [x] **P1.2.4 [A]** Implement Blog index and article route placeholders.
- [x] **P1.2.5 [A]** Implement About with a concise career narrative.
- [x] **P1.2.6 [A]** Implement Contact/Resume page with LinkedIn, GitHub and Medium.
- [x] **P1.2.7 [A]** Keep copy short; use progressive disclosure for technical depth.
- [x] **P1.2.8 [M]** Review personal facts, links, titles and public wording.
- [x] **P1.2.9 [A]** Replace incorrect or unapproved claims.

## Milestone 1.3 - Foundation quality gate

- [x] **P1.3.1 [A]** Add Vitest component/unit setup.
- [x] **P1.3.2 [A]** Add Playwright smoke tests for all pages and mobile navigation.
- [x] **P1.3.3 [A]** Add accessibility checks for primary pages.
- [x] **P1.3.4 [A]** Add Lighthouse CI budgets without premature micro-optimization.
- [x] **P1.3.5 [M]** Review readability, whitespace and scanability on phone and desktop.
- [x] **P1.G GATE [A+M]** Site is usable and credible without CMS or AI.

---

# PHASE 2 - Sanity CMS and managed content

## Milestone 2.1 - Studio and schemas

- [x] **P2.1.1 [A]** Scaffold Sanity Studio in `apps/studio`.
- [x] **P2.1.2 [A]** Add schemas: `project`, `caseStudy`, `article`, `experience`, `education`, `skill`, `faq`, `architectureDecision`, `personalStory`, `styleExample`, `siteSettings`.
- [x] **P2.1.3 [A]** Add `ragEnabled`, audiences, sensitivity, source label, canonical path, review date and publish status to indexable documents.
- [x] **P2.1.4 [A]** Add validation for required titles, slugs, summaries and references.
- [x] **P2.1.5 [A]** Add Portable Text blocks with constrained headings, lists, links, images and code.
- [x] **P2.1.6 [A]** Add preview structures and desk organization.
- [x] **P2.1.7 [A]** Document local Studio setup.

## Milestone 2.2 - CMS integration

- [x] **P2.2.1 [A]** Create typed Sanity client and query layer.
- [x] **P2.2.2 [A]** Implement GROQ queries for all public pages.
- [x] **P2.2.3 [A]** Implement Portable Text rendering with safe link handling.
- [x] **P2.2.4 [A]** Implement image dimensions, alt text and responsive loading.
- [x] **P2.2.5 [A]** Add preview mode without exposing write credentials.
- [x] **P2.2.6 [A]** Remove duplicated hard-coded production content.
- [x] **P2.2.7 [A]** Add empty-state behavior when collections have no content.

## Milestone 2.3 - Mahad content entry

- [x] **P2.3.1 [A]** Provide a concise content-entry guide and required-field checklist.
- [x] **P2.3.2 [M]** Enter approved profile and contact information.
- [x] **P2.3.3 [M]** Enter at least three projects/case studies.
- [x] **P2.3.4 [M]** Enter at least one blog article or architecture note.
- [x] **P2.3.5 [M]** Mark sensitive/private material as non-indexable.
- [x] **P2.3.6 [M]** Review every source that the assistant may cite.
- [x] **P2.G GATE [A+M]** A CMS edit updates the site without a code change, and all published facts are approved.

---

# PHASE 3 - FastAPI and PostgreSQL operational foundation

## Milestone 3.1 - API skeleton

- [x] **P3.1.1 [A]** Scaffold FastAPI with settings loaded through Pydantic.
- [x] **P3.1.2 [A]** Add structured JSON logging and correlation IDs.
- [x] **P3.1.3 [A]** Add `/health/live`, `/health/ready` and version endpoints.
- [x] **P3.1.4 [A]** Add explicit CORS allowlist and body-size limits.
- [x] **P3.1.5 [A]** Add stable error response schema.
- [x] **P3.1.6 [A]** Add provider interfaces and test doubles.
- [x] **P3.1.7 [A]** Generate an OpenAPI artifact and validate it in CI.

## Milestone 3.2 - Database schema

- [x] **P3.2.1 [A]** Configure async SQLAlchemy 2.x.
- [x] **P3.2.2 [A]** Configure Alembic.
- [x] **P3.2.3 [A]** Add enums and tables for source documents, document chunks and index runs.
- [x] **P3.2.4 [A]** Add tables for consented chat sessions, redacted messages, retrieval events and feedback.
- [x] **P3.2.5 [A]** Add model-release metadata table.
- [x] **P3.2.6 [A]** Add foreign keys, uniqueness constraints and query indexes.
- [x] **P3.2.7 [A]** Add repository/service boundaries; do not query ORM models from route handlers.
- [x] **P3.2.8 [A]** Add migration-up and migration-from-clean-database tests.
- [x] **P3.2.9 [A]** Add retention/deletion method for expired sessions.

## Milestone 3.3 - Neon connection

- [x] **P3.3.1 [A]** Document required Neon variables in `.env.example`.
- [x] **P3.3.2 [M]** Store Neon credentials in local and deployment secret managers, never Git.
- [x] **P3.3.3 [A]** Run migrations against a non-production Neon branch.
- [x] **P3.3.4 [A]** Verify SSL, connection timeout and wake-from-zero behavior.
- [x] **P3.3.5 [A]** Document backup/export and migration recovery.
- [x] **P3.G GATE [A]** API health, clean migrations and database integration tests pass.

---

# PHASE 4 - Offline RAG ingestion

## Milestone 4.1 - Sanity extraction and normalization

- [x] **P4.1.1 [A]** Define normalized document and chunk contracts.
- [x] **P4.1.2 [A]** Fetch one document and resolve referenced content.
- [x] **P4.1.3 [A]** Convert Portable Text into structured normalized text.
- [x] **P4.1.4 [A]** Preserve headings, lists, captions, code and canonical source path.
- [x] **P4.1.5 [A]** Normalize whitespace and Unicode without destroying Urdu text.
- [x] **P4.1.6 [A]** Compute deterministic SHA-256 document hashes.
- [x] **P4.1.7 [A]** Add fixtures and normalization snapshot tests.

## Milestone 4.2 - Chunking

- [x] **P4.2.1 [A]** Implement heading-aware recursive chunking.
- [x] **P4.2.2 [A]** Target 350-500 tokens and 50-75-token overlap through configuration.
- [x] **P4.2.3 [A]** Keep project identity and heading path in each chunk.
- [x] **P4.2.4 [A]** Prevent two projects from sharing a chunk.
- [x] **P4.2.5 [A]** Keep list introductions with their lists.
- [x] **P4.2.6 [A]** Compute chunk hashes and deterministic order.
- [x] **P4.2.7 [A]** Test short documents, long sections, lists, code, Urdu and empty blocks.

## Milestone 4.3 - Embeddings and PostgreSQL manifest

- [x] **P4.3.1 [A]** Pin `intfloat/multilingual-e5-small` and tokenizer versions.
- [x] **P4.3.2 [A]** Implement E5 `passage:` and `query:` conventions.
- [x] **P4.3.3 [A]** Implement batch embedding with normalized vectors.
- [x] **P4.3.4 [A]** Persist canonical documents/chunks and embedding metadata to PostgreSQL.
- [x] **P4.3.5 [A]** Skip unchanged hashes.
- [x] **P4.3.6 [A]** Add `--dry-run`, `--document-id` and safe environment targeting.
- [x] **P4.3.7 [A]** Verify a second identical run creates no duplicates or extra embedding work.
- [x] **P4.G GATE [A]** Deterministic, idempotent offline ingestion works without Qdrant or an LLM.

---

# PHASE 5 - Qdrant vector retrieval

## Milestone 5.1 - Collection and indexing

- [x] **P5.1.1 [A]** Add Qdrant provider adapter.
- [x] **P5.1.2 [A]** Create collection configuration with cosine distance and verified model dimension.
- [x] **P5.1.3 [A]** Create payload indexes for document type, project, audience, language and active version.
- [x] **P5.1.4 [A]** Use PostgreSQL chunk mapping UUID as Qdrant point ID.
- [x] **P5.1.5 [A]** Store compact payload and only a short debug preview.
- [x] **P5.1.6 [A]** Implement batch upsert and deletion with retries.
- [x] **P5.1.7 [M]** Store Qdrant URL/key as secrets.

## Milestone 5.2 - Retrieval and hydration

- [x] **P5.2.1 [A]** Embed queries using the exact indexed model/version.
- [x] **P5.2.2 [A]** Retrieve top 12 with optional metadata filters.
- [x] **P5.2.3 [A]** Hydrate canonical content from PostgreSQL by point ID.
- [x] **P5.2.4 [A]** Reject inactive, missing or mismatched-version rows.
- [x] **P5.2.5 [A]** Deduplicate adjacent/near-identical chunks.
- [x] **P5.2.6 [A]** Select up to five chunks within a configurable context budget.
- [x] **P5.2.7 [A]** Create CLI retrieval inspector with query, filters, ranks and sources.

## Milestone 5.3 - Retrieval evaluation and recovery

- [x] **P5.3.1 [A+M]** Draft at least 50 expected-query/source pairs; Mahad verifies relevance.
- [x] **P5.3.2 [A]** Measure hit rate at K and mean reciprocal rank.
- [x] **P5.3.3 [A]** Calibrate initial score thresholds from evaluation data.
- [x] **P5.3.4 [A]** Implement full index rebuild behind explicit confirmation flags.
- [x] **P5.3.5 [A]** Delete local/test Qdrant collection and prove successful rebuild.
- [x] **P5.3.6 [A]** Document free-cluster suspension/deletion recovery.
- [x] **P5.G GATE [A+M]** Retrieval meets agreed test quality and the index is demonstrably rebuildable.



---

# PHASE 6 - Automated CMS-to-index lifecycle

## Milestone 6.1 - Incremental synchronization

- [x] **P6.1.1 [A]** Implement create, update, unpublish and delete ingestion events.
- [x] **P6.1.2 [A]** Write new chunks/vectors before deactivating old versions.
- [x] **P6.1.3 [A]** Delete stale Qdrant points after new version validation.
- [x] **P6.1.4 [A]** Record every run and error summary in `index_runs`.
- [x] **P6.1.5 [A]** Preserve the previous active version after partial failure.
- [x] **P6.1.6 [A]** Add reconciliation command comparing Sanity, PostgreSQL and Qdrant.

## Milestone 6.2 - Webhook and CI

- [x] **P6.2.1 [A]** Implement a signature-validating Cloudflare webhook endpoint.
- [x] **P6.2.2 [A]** Dispatch GitHub ingestion workflow without exposing its token.
- [x] **P6.2.3 [A]** Add `ingest-content.yml` for targeted updates.
- [x] **P6.2.4 [A]** Add scheduled full reconciliation.
- [x] **P6.2.5 [A]** Add concurrency control so two index runs cannot corrupt active versions.
- [ ] **P6.2.6 [M]** Add webhook and CI secrets through dashboards.
- [ ] **P6.2.7 [M]** Configure Sanity webhook using Antigravity's exact instructions.
- [x] **P6.2.8 [A]** Test publish, edit, unpublish, deletion, replay and failed-run paths.
- [ ] **P6.G GATE [A+M]** A real Sanity update produces a verified incremental index update.


---

# PHASE 7 - Query router dataset and ML baseline

## Milestone 7.1 - Label system

- [x] **P7.1.1 [A]** Define intent labels, route labels, answerability labels and language labels.
- [x] **P7.1.2 [A]** Define deterministic examples and boundary cases for each label.
- [x] **P7.1.3 [A]** Create dataset schema with origin, base-question group and reviewer fields.
- [x] **P7.1.4 [A]** Add validation for unknown labels, duplicates, missing groups and invalid text.
- [x] **P7.1.5 [A]** Create dataset card documenting purpose, limitations and privacy.
- [x] **P7.1.6 [M]** Review label definitions for natural recruiter and Roman Urdu usage.

## Milestone 7.2 - Data creation

- [x] **P7.2.1 [A]** Generate a starter set from approved portfolio topics, clearly marked synthetic.
- [x] **P7.2.2 [M]** Add/rewrite authentic questions in Mahad's English and Roman Urdu.
- [x] **P7.2.3 [A]** Add out-of-domain, malicious, ambiguous and clarification examples.
- [x] **P7.2.4 [A]** Create group-aware train/validation/test split.
- [x] **P7.2.5 [A]** Keep final locked test set human-authored.
- [x] **P7.2.6 [A]** Run leakage and class-balance report.
- [x] **P7.2.7 [M]** Approve locked test set; do not use it for model iteration afterward.

## Milestone 7.3 - Baseline and MLflow

- [x] **P7.3.1 [A]** Implement seeded TF-IDF/logistic-regression training pipeline.
- [x] **P7.3.2 [A]** Configure local MLflow tracking.
- [x] **P7.3.3 [A]** Log data version, Git commit, parameters, environment and artifacts.
- [x] **P7.3.4 [A]** Log macro F1, per-class metrics, confusion matrix, calibration and latency.
- [x] **P7.3.5 [A]** Write error analysis by label and language slice.
- [x] **P7.3.6 [A]** Register baseline as first candidate, not champion until reviewed.
- [x] **P7.3.7 [M]** Review errors and approve or request label/data corrections.
- [x] **P7.G GATE [A+M]** Reproducible baseline and honest error analysis exist.

---

# PHASE 8 - Transformer fine-tuning and model deployment

## Milestone 8.1 - Fine-tuning

- [x] **P8.1.1 [A]** Select MiniLM or DistilBERT based on model-size/language experiments; record ADR.
- [x] **P8.1.2 [A]** Implement deterministic training with checkpointing and early stopping.
- [x] **P8.1.3 [A]** Use class weights or sampling only when justified by data.
- [x] **P8.1.4 [A]** Train intent and route heads; keep answerability separate if shared training is unstable.
- [x] **P8.1.5 [A]** Log every formal run to MLflow.
- [x] **P8.1.6 [A]** Evaluate aggregate, per-class, Roman Urdu, refusal and latency slices.
- [x] **P8.1.7 [A]** Compare candidate against baseline using predeclared promotion rules.

## Milestone 8.2 - Packaging

- [x] **P8.2.1 [A]** Export candidate to ONNX.
- [x] **P8.2.2 [A]** Verify ONNX predictions match framework predictions within tolerance.
- [x] **P8.2.3 [A]** Evaluate quantization; retain unquantized model if quality regresses.
- [x] **P8.2.4 [A]** Package tokenizer, labels, config, metrics and model card.
- [x] **P8.2.5 [A]** Publish an immutable artifact version only after Mahad approval.
- [x] **P8.2.6 [M]** Approve champion based on evidence, not architecture preference.
- [x] **P8.2.7 [A]** Mirror champion metadata in PostgreSQL.

## Milestone 8.3 - In-process serving

- [x] **P8.3.1 [A]** Download/pin the immutable model during backend build.
- [x] **P8.3.2 [A]** Load one ONNX Runtime session at application startup.
- [x] **P8.3.3 [A]** Implement identical training/serving preprocessing.
- [x] **P8.3.4 [A]** Return labels, confidence, model version and safe fallback.
- [x] **P8.3.5 [A]** Add concurrency and cold-start latency tests.
- [x] **P8.3.6 [A]** Add configuration-based rollback to the prior artifact.
- [x] **P8.G GATE [A+M]** Champion is reproducible, approved, served locally and rollback-tested.

---

# PHASE 9 - LangGraph grounded assistant

## Milestone 9.1 - Typed graph

- [x] **P9.1.1 [A]** Define graph state for input, transcript, mode, classifier output, query, evidence, retries, answer, citations and errors.
- [x] **P9.1.2 [A]** Implement input validation and safety node.
- [x] **P9.1.3 [A]** Implement ONNX classification node.
- [x] **P9.1.4 [A]** Implement explicit conditional edges for deterministic, RAG, agentic, clarify and refuse routes.
- [x] **P9.1.5 [A]** Set hard step and one-rewrite limits.
- [x] **P9.1.6 [A]** Add graph visualization to architecture documentation.

## Milestone 9.2 - Deterministic and RAG routes

- [x] **P9.2.1 [A]** Implement structured contact/navigation lookup without LLM calls.
- [x] **P9.2.2 [A]** Implement query normalization while preserving code-switching.
- [x] **P9.2.3 [A]** Implement filter planning.
- [x] **P9.2.4 [A]** Implement Qdrant retrieval and PostgreSQL hydration tool.
- [x] **P9.2.5 [A]** Implement threshold-based evidence check.
- [x] **P9.2.6 [A]** Implement grounded prompt with explicit source IDs.
- [x] **P9.2.7 [A]** Implement provider-neutral Groq adapter.
- [x] **P9.2.8 [M]** Add Groq key to server-side secret stores.



## Milestone 9.3 - Agentic recovery and citations

- [x] **P9.3.1 [A]** Implement constrained evidence grader only when threshold decision is uncertain.
- [x] **P9.3.2 [A]** Implement one bounded query rewrite and retry.
- [x] **P9.3.3 [A]** Implement clarify/refuse behavior after weak evidence.
- [x] **P9.3.4 [A]** Implement claim-to-source citation validation.
- [x] **P9.3.5 [A]** Apply audience style only after grounded draft creation.
- [x] **P9.3.6 [A]** Verify style step cannot introduce unsupported claims.
- [x] **P9.3.7 [A]** Store safe route/retrieval events with consent rules.

## Milestone 9.4 - API streaming and resilience

- [x] **P9.4.1 [A]** Add bounded session and message endpoints.
- [x] **P9.4.2 [A]** Add SSE stream with safe progress events and answer tokens.
- [x] **P9.4.3 [A]** Add timeouts, limited retries and circuit breakers.
- [x] **P9.4.4 [A]** Add controlled quota/capacity response codes.
- [x] **P9.4.5 [A]** Test Qdrant, Neon, Groq and LangSmith outages independently.
- [x] **P9.G GATE [A]** Supported questions cite evidence; unsupported questions refuse/clarify; graph termination is guaranteed.

---

# PHASE 10 - LangSmith and LLMOps

## Milestone 10.1 - Safe tracing

- [x] **P10.1.1 [A]** Add optional LangSmith configuration disabled by default locally.
- [x] **P10.1.2 [A]** Add trace hierarchy for classifier, retrieval, grading, generation and verification.
- [x] **P10.1.3 [A]** Redact secrets, raw audio and sensitive user content.
- [x] **P10.1.4 [A]** Add trace sampling and monthly hard-disable threshold below free allowance.
- [x] **P10.1.5 [A]** Prove user requests succeed when LangSmith is unavailable.
- [x] **P10.1.6 [M]** Add LangSmith key and project name to deployment secrets.

## Milestone 10.2 - Evaluation suites

- [x] **P10.2.1 [A+M]** Create recruiter, engineer and founder evaluation cases; Mahad approves expected behavior.
- [x] **P10.2.2 [A+M]** Create English/Roman Urdu cases; Mahad reviews naturalness.
- [x] **P10.2.3 [A]** Create unanswerable, incorrect-premise and prompt-injection cases.
- [x] **P10.2.4 [A]** Implement retrieval relevance, groundedness, citation and refusal evaluators.
- [x] **P10.2.5 [A]** Record prompt, model, embedding and index versions for each run.
- [x] **P10.2.6 [A]** Establish initial release thresholds from measured baseline results.

## Milestone 10.3 - Release regression gate

- [x] **P10.3.1 [A]** Run a small deterministic evaluation set on every pull request.
- [x] **P10.3.2 [A]** Run cost-controlled LLM evaluation before release only.
- [x] **P10.3.3 [A]** Store human-readable evaluation summary as CI artifact.
- [x] **P10.3.4 [A]** Block release on citation/refusal regression.
- [x] **P10.G GATE [A]** Tracing is safe/capped and regressions block release.

---

# PHASE 11 - Production chat interface

## Milestone 11.1 - API integration

- [x] **P11.1.1 [A]** Generate or validate frontend types from OpenAPI.
- [x] **P11.1.2 [A]** Create server-only API proxy configuration.
- [x] **P11.1.3 [A]** Implement bounded client conversation state.
- [x] **P11.1.4 [A]** Implement SSE parsing, cancellation and reconnection rules.
- [x] **P11.1.5 [A]** Do not persist history without affirmative consent.

## Milestone 11.2 - Chat UX

- [x] **P11.2.1 [A]** Add concise Recruiter, Engineer and Founder mode selector.
- [x] **P11.2.2 [A]** Add text input, submit, stop and clear controls.
- [x] **P11.2.3 [A]** Add suggested questions without marketing jargon.
- [x] **P11.2.4 [A]** Show functional states: classifying, searching, generating and error.
- [x] **P11.2.5 [A]** Render citations as source cards.
- [x] **P11.2.6 [A]** Add feedback control and optional reason.
- [x] **P11.2.7 [A]** Add keyboard and screen-reader support.

## Milestone 11.3 - Safe execution inspector

- [x] **P11.3.1 [A]** Show route, confidence and model version.
- [x] **P11.3.2 [A]** Show graph path, retrieval duration and retry count.
- [x] **P11.3.3 [A]** Show source titles and safe similarity scores.
- [x] **P11.3.4 [A]** Show high-level latency/token data.
- [x] **P11.3.5 [A]** Explicitly exclude system prompts, secrets, hidden reasoning and private data.
- [x] **P11.3.6 [M]** Review inspector usefulness for recruiters and engineers.
- [x] **P11.G GATE [A+M]** Chat is readable, mobile-friendly, accessible and honest about failures.

---

# PHASE 12 - Voice input (Legacy - Incomplete tasks paused)

> [!NOTE]
> **Historical / Paused**: Completed transcription work remains active as fallback/historical capability. Incomplete tasks (P12.2.6, P12.G) are paused. Active voice development is governed by **PHASE 13P** (ADR-0010).

## Milestone 12.1 - Browser capture

- [x] **P12.1.1 [A]** Implement push-to-talk after explicit user action.
- [x] **P12.1.2 [A]** Handle microphone permission granted, denied and unavailable.
- [x] **P12.1.3 [A]** Enforce short duration, accepted MIME types and maximum bytes.
- [x] **P12.1.4 [A]** Add recording, stop, cancel and delete controls.
- [x] **P12.1.5 [A]** Do not upload until the user submits the captured question.

## Milestone 12.2 - Transcription

- [x] **P12.2.1 [A]** Add protected multipart transcription endpoint.
- [x] **P12.2.2 [A]** Stream to Groq Whisper without persistent raw-audio storage.
- [x] **P12.2.3 [A]** Return transcript and detected language metadata.
- [x] **P12.2.4 [A]** Allow transcript editing before it enters the graph.
- [x] **P12.2.5 [A]** Delete temporary audio in success and failure paths.
- [ ] **P12.2.6 [M]** Test a defined set of English, Urdu and Roman Urdu recordings.
- [x] **P12.2.7 [A]** Record word/error observations without overstating accuracy.
- [ ] **P12.G GATE [A+M]** Voice reliably becomes editable text; text chat remains fully usable without microphone access.

---

# PHASE 13 - Mahad voice output (Legacy OpenVoice - Paused)

> [!NOTE]
> **Historical / Paused**: The standalone OpenVoice microservice approach is paused and superseded by **PHASE 13P** (ADR-0010: ElevenLabs Conversational Companion). Preserved as historical evidence of initial architecture constraints.

## Milestone 13.1 - Consent and dataset preparation

- [ ] **P13.1.1 [A]** Write a private recording protocol: quiet room, consistent microphone, sample scripts and file naming.
- [ ] **P13.1.2 [A]** Provide English, Urdu and Roman Urdu recording prompts totaling 20-30 minutes.
- [ ] **P13.1.3 [M]** Record only Mahad's own consented voice.
- [ ] **P13.1.4 [M]** Store raw recordings privately outside the public repository.
- [ ] **P13.1.5 [A+M]** Clean/select a short reference clip; Mahad approves it.
- [ ] **P13.1.6 [A]** Document dataset consent, purpose and deletion procedure.

## Milestone 13.2 - Voice service

- [ ] **P13.2.1 [A]** Scaffold independent FastAPI/OpenVoice Docker service.
- [ ] **P13.2.2 [A]** Add health and version endpoints.
- [ ] **P13.2.3 [A]** Load versioned speaker reference/profile securely.
- [ ] **P13.2.4 [A]** Accept only finalized bounded text and language hint.
- [ ] **P13.2.5 [A]** Implement sentence segmentation and ordered audio results.
- [ ] **P13.2.6 [A]** Add timeouts, concurrency limit and input validation.
- [ ] **P13.2.7 [A]** Ensure generated temporary audio expires/deletes.

## Milestone 13.3 - Playback and fallback

- [ ] **P13.3.1 [A]** Display text before waiting for cloned audio.
- [ ] **P13.3.2 [A]** Add play, stop, replay and voice-mode controls.
- [ ] **P13.3.3 [A]** Implement browser speech-synthesis fallback.
- [ ] **P13.3.4 [A]** Add synthetic-voice disclosure.
- [ ] **P13.3.5 [M]** Rate similarity, naturalness, pronunciation and code-switching on a fixed rubric.
- [ ] **P13.3.6 [A]** Publish honest supported-language limitations.
- [ ] **P13.G GATE [A+M]** English cloned voice passes Mahad review; failures never block text; Roman Urdu status is measured and disclosed.

---

# PHASE 14 - Security, deployment and operations

## Milestone 14.1 - Security hardening

- [ ] **P14.1.1 [A]** Add Cloudflare origin, IP/session rate limits and request-size controls.
- [ ] **P14.1.2 [A]** Validate all external inputs at API boundaries.
- [ ] **P14.1.3 [A]** Add prompt-injection tests treating retrieved content as data.
- [ ] **P14.1.4 [A]** Add dependency, container and secret scans.
- [ ] **P14.1.5 [A]** Add privacy policy describing chat and voice handling.
- [ ] **P14.1.6 [A]** Add data deletion and expired-session cleanup commands.
- [ ] **P14.1.7 [M]** Review all public contact information and privacy wording.

## Milestone 14.2 - CI/CD

- [ ] **P14.2.1 [A]** Add frontend lint, types, unit and Playwright workflows.
- [ ] **P14.2.2 [A]** Add Python Ruff, MyPy and Pytest workflow.
- [ ] **P14.2.3 [A]** Add migration and local Qdrant integration jobs.
- [ ] **P14.2.4 [A]** Add model artifact contract and rollback tests.
- [ ] **P14.2.5 [A]** Add controlled evaluation gate.
- [ ] **P14.2.6 [A]** Require checks before production deployment.

## Milestone 14.3 - Deploy services

- [ ] **P14.3.1 [A]** Prepare Cloudflare web/Worker deployment configuration.
- [ ] **P14.3.2 [M]** Add frontend and Worker secrets through Cloudflare dashboard.
- [ ] **P14.3.3 [A]** Prepare API Docker Space configuration.
- [ ] **P14.3.4 [M]** Add API secrets through Hugging Face Space settings.
- [ ] **P14.3.5 [A]** Prepare voice Docker Space configuration.
- [ ] **P14.3.6 [M]** Add voice secrets/private assets through approved private storage.
- [ ] **P14.3.7 [A]** Deploy each service independently and verify health/version endpoints.
- [ ] **P14.3.8 [A]** Run production smoke tests from the public frontend.
- [ ] **P14.3.9 [M]** Confirm all public URLs and free-tier dashboards.

## Milestone 14.4 - Runbooks and degradation

- [ ] **P14.4.1 [A]** Runbook: Neon cold start/outage.
- [ ] **P14.4.2 [A]** Runbook: Qdrant suspension, deletion and rebuild.
- [ ] **P14.4.3 [A]** Runbook: Groq quota or outage.
- [ ] **P14.4.4 [A]** Runbook: LangSmith allowance reached.
- [ ] **P14.4.5 [A]** Runbook: model artifact rollback.
- [ ] **P14.4.6 [A]** Runbook: voice Space cold start/outage.
- [ ] **P14.4.7 [A]** Test static portfolio operation with every AI service unavailable.
- [ ] **P14.G GATE [A+M]** Production deploy is reproducible, secrets are safe, failure modes are controlled and no billable plan is active.

---

# PHASE 15 - Evidence, case study and version 1 release

## Milestone 15.1 - Engineering evidence

- [ ] **P15.1.1 [A]** Publish system architecture and data-flow diagrams.
- [ ] **P15.1.2 [A]** Publish CMS-to-RAG lifecycle explanation.
- [ ] **P15.1.3 [A]** Publish PostgreSQL/Qdrant relationship explanation.
- [ ] **P15.1.4 [A]** Publish ML baseline-versus-candidate results.
- [ ] **P15.1.5 [A]** Publish routed-versus-all-LLM latency/call comparison using measured data.
- [ ] **P15.1.6 [A]** Publish LangSmith evaluation summary without private traces.
- [ ] **P15.1.7 [A]** Publish known limitations and future improvements.

## Milestone 15.2 - Product case study

- [ ] **P15.2.1 [A]** Draft concise problem, users, constraints, decisions, architecture, validation and outcomes.
- [ ] **P15.2.2 [A]** Keep the public story skimmable; place deep details behind expandable sections.
- [ ] **P15.2.3 [M]** Review tone, factual claims and authorship.
- [ ] **P15.2.4 [A]** Correct all unsupported claims.
- [ ] **P15.2.5 [M]** Approve public case study.

## Milestone 15.3 - Final verification

- [ ] **P15.3.1 [A]** Run full frontend, backend, data, model, RAG, evaluation and voice test suites.
- [ ] **P15.3.2 [A]** Run mobile/desktop accessibility and performance checks.
- [ ] **P15.3.3 [A]** Test Recruiter, Engineer and Founder journeys.
- [ ] **P15.3.4 [A]** Test deterministic, RAG, agentic, clarify and refuse routes.
- [ ] **P15.3.5 [A]** Test all provider-degradation paths.
- [ ] **P15.3.6 [A]** Scan repository/history for secrets and raw private audio.
- [ ] **P15.3.7 [M]** Perform final content, voice and UX review.
- [ ] **P15.3.8 [M]** Confirm free-tier/no-billing status one final time.
- [ ] **P15.G FINAL GATE [A+M]** Tag `v1.0.0` only after every required gate is complete and Mahad approves release.

---

# Post-version-1 backlog entry points

Do not execute these from this file. Track them in `docs/backlog.md`:

- Custom neural reranker
- General LLM LoRA style fine-tuning
- Real-time WebRTC voice conversation
- Additional language-specific TTS
- AWS reference deployment with explicit temporary cost controls
- Authentication and private recruiter rooms
- Read-only external portfolio connectors
- Advanced drift detection and automated retraining


---

# PHASE 13P - Conversational Companion Pivot

## Pivot objective

Replace the planned push-to-talk transcription and self-hosted OpenVoice output path with a persistent, combined Chat and Voice widget.

The widget provides:

- Compact text chat backed by the existing assistant
- Real-time ElevenLabs conversational voice
- Shared FastAPI, ONNX, LangGraph, Neon and Qdrant intelligence
- A strict two-minute voice-session limit
- Honest free-tier and monthly-quota disclosures
- A configurable voice ID that can later be replaced without code changes
- A link to the complete `/chat` experience for citations, inspection and extended conversations

The original voice ADRs and tasks remain preserved as historical evidence.

## Milestone 13P.0 - Pivot governance

- [x] **P13P.0.1 [A]** Add ADR-0010 documenting the conversational-companion pivot and its rationale.
- [x] **P13P.0.2 [A]** Add the active architecture-pivot authority section to `AGENTS.md`.
- [x] **P13P.0.3 [A]** Add the current execution override and Phase 13P to `TASKS.md`.
- [x] **P13P.0.4 [A]** Preserve ADR-007 and ADR-008 without deleting their original reasoning.
- [x] **P13P.0.5 [A]** Mark ADR-007 and ADR-008 as superseded by ADR-0010 using status metadata or a short supersession notice only.
- [x] **P13P.0.6 [A]** Record that incomplete legacy Phase 12 and original Phase 13 tasks are paused.
- [x] **P13P.0.7 [A]** Update the product-scope summary only where required to prevent the old voice approach from being represented as active.
- [x] **P13P.0.G GATE [A]** Current documentation clearly distinguishes historical decisions from the active architecture without erasing the project’s evolution.

## Milestone 13P.1 - ElevenLabs account and agent verification

- [x] **P13P.1.1 [M]** Create or select an ElevenLabs conversational agent on the free plan.
- [x] **P13P.1.2 [M]** Confirm that no paid plan or automatic paid overage is enabled.
- [x] **P13P.1.3 [M]** Select an existing ElevenLabs voice for the initial release.
- [x] **P13P.1.4 [M]** Record the Agent ID privately in deployment configuration.
- [x] **P13P.1.5 [M]** Record the selected Voice ID privately in deployment configuration.
- [x] **P13P.1.6 [M]** Verify whether conversation-level voice overrides are available on the current plan.
- [x] **P13P.1.7 [M]** Configure English as the primary language.
- [x] **P13P.1.8 [M]** Verify Urdu and Roman Urdu recognition and pronunciation experimentally.
- [x] **P13P.1.9 [M]** Configure interruption, turn-taking and inactivity behaviour.
- [x] **P13P.1.10 [M]** Configure the agent so it does not schedule meetings, transfer calls, collect leads or request contact information.
- [x] **P13P.1.11 [M]** Review ElevenLabs conversation and audio-retention settings.
- [x] **P13P.1.12 [M]** Record the actual free-plan allowance visible in the account dashboard without estimating unsupported minutes.
- [x] **P13P.1.G GATE [M]** The free account can create a real-time conversation using a stock voice, and its quota and retention constraints are documented accurately.

## Milestone 13P.2 - Configuration and provider boundary

- [x] **P13P.2.1 [A]** Add `ELEVENLABS_API_KEY` as a server-only setting.
- [x] **P13P.2.2 [A]** Add `ELEVENLABS_AGENT_ID`.
- [x] **P13P.2.3 [A]** Add `ELEVENLABS_VOICE_ID`.
- [x] **P13P.2.4 [A]** Add optional `ELEVENLABS_VOICE_ID_FALLBACK`.
- [x] **P13P.2.5 [A]** Add `ELEVENLABS_SERVER_LOCATION`.
- [x] **P13P.2.6 [A]** Add `ELEVENLABS_VOICE_ENABLED`.
- [x] **P13P.2.7 [A]** Add `VOICE_SESSION_MAX_SECONDS` with a default of `120`.
- [x] **P13P.2.8 [A]** Add `VOICE_INACTIVITY_TIMEOUT_SECONDS` with a conservative default.
- [x] **P13P.2.9 [A]** Add daily and monthly voice-budget settings.
- [x] **P13P.2.10 [A]** Add a global concurrency setting with an initial default of `1`.
- [x] **P13P.2.11 [A]** Validate all voice configuration at the server boundary.
- [x] **P13P.2.12 [A]** Ensure missing or invalid configuration disables voice without affecting either text-chat surface.
- [x] **P13P.2.13 [A]** Ensure no ElevenLabs secret enters client bundles, logs, traces or API responses.
- [x] **P13P.2.14 [A]** Keep agent and voice selection replaceable without changing UI, graph, RAG or database code.
- [x] **P13P.2.G GATE [A]** A voice or agent ID can be replaced through configuration alone, and the application safely degrades when configuration is unavailable.

## Milestone 13P.3 - OpenAI-compatible assistant adapter

- [x] **P13P.3.1 [A]** Define the minimum OpenAI-compatible request and streaming-response contracts required by ElevenLabs.
- [x] **P13P.3.2 [A]** Add a dedicated FastAPI endpoint for ElevenLabs custom-LLM requests.
- [x] **P13P.3.3 [A]** Authenticate requests from ElevenLabs using a server-managed secret.
- [x] **P13P.3.4 [A]** Validate message roles, lengths, history bounds and supported content types.
- [x] **P13P.3.5 [A]** Map the latest user message into the existing assistant request contract with `mode="voice"`.
- [x] **P13P.3.6 [A]** Map bounded conversation history into the existing graph state.
- [x] **P13P.3.7 [A]** Reuse the existing ONNX router, safety checks, LangGraph orchestration and retrieval services.
- [x] **P13P.3.8 [A]** Do not create a second voice-only assistant graph.
- [x] **P13P.3.9 [A]** Preserve refusal behaviour for out-of-domain, private and adversarial requests.
- [x] **P13P.3.10 [A]** Add a voice-output formatter after grounded answer generation.
- [x] **P13P.3.11 [A]** Remove raw URLs, Markdown syntax and interface-specific citation markup from spoken output.
- [x] **P13P.3.12 [A]** Preserve factual meaning and natural source attribution in spoken responses.
- [x] **P13P.3.13 [A]** Stream the response using the OpenAI-compatible format expected by ElevenLabs.
- [x] **P13P.3.14 [A]** Add structured correlation IDs without exposing hidden prompts or reasoning.
- [x] **P13P.3.15 [A]** Add unit tests for request mapping, streaming, refusals, history bounds and malformed requests.
- [x] **P13P.3.16 [A]** Add an integration test proving that a portfolio question reaches the existing RAG pipeline.
- [x] **P13P.3.G GATE [A]** ElevenLabs can ask one factual portfolio question and speak a grounded answer produced by the existing LangGraph assistant.

## Milestone 13P.4 - Secure conversation-session creation

- [x] **P13P.4.1 [A]** Add a server-only endpoint that creates or retrieves a short-lived ElevenLabs conversation token or signed URL.
- [x] **P13P.4.2 [A]** Never return the ElevenLabs API key to the browser.
- [x] **P13P.4.3 [A]** Require an explicit start-voice action before creating a token.
- [x] **P13P.4.4 [A]** Do not create a token when the widget automatically opens.
- [x] **P13P.4.5 [A]** Validate allowed origins.
- [x] **P13P.4.6 [A]** Apply IP, session and global rate limits.
- [x] **P13P.4.7 [A]** Check configuration, concurrency and usage budgets before issuing a token.
- [x] **P13P.4.8 [A]** Reserve the maximum allowed session duration before issuing a token.
- [x] **P13P.4.9 [A]** Expire unused reservations when a conversation fails to start.
- [x] **P13P.4.10 [A]** Return stable error codes for disabled, unavailable, rate-limited, concurrent and quota-exhausted states.
- [x] **P13P.4.11 [A]** Add tests proving that automatic widget opening cannot create a voice session.
- [x] **P13P.4.G GATE [A]** Browser clients can start authorized sessions without receiving secrets, and passive widget behaviour consumes no voice quota.

## Milestone 13P.5 - Shared text-chat foundation

- [x] **P13P.5.1 [A]** Audit the full `/chat` implementation for reusable API and state logic.
- [x] **P13P.5.2 [A]** Extract shared assistant request and response types.
- [x] **P13P.5.3 [A]** Extract shared SSE parsing.
- [x] **P13P.5.4 [A]** Extract shared cancellation and error handling.
- [x] **P13P.5.5 [A]** Extract shared bounded-history logic.
- [x] **P13P.5.6 [A]** Extract reusable citation rendering at compact and full-detail levels.
- [x] **P13P.5.7 [A]** Preserve the full chat page’s execution inspector and feedback features.
- [x] **P13P.5.8 [A]** Ensure the compact widget does not fork assistant prompts or business logic.
- [x] **P13P.5.9 [A]** Add regression tests for the existing full chat page.
- [x] **P13P.5.G GATE [A]** Full chat and compact chat use one shared client foundation while retaining their appropriate presentation depth.

## Milestone 13P.6 - Global companion shell

- [x] **P13P.6.1 [A]** Add `@elevenlabs/react` using the repository package manager.
- [x] **P13P.6.2 [A]** Add a global `AssistantWidgetProvider`.
- [x] **P13P.6.3 [A]** Mount the provider and widget in the root layout.
- [x] **P13P.6.4 [A]** Add a fixed bottom-right launcher.
- [x] **P13P.6.5 [A]** Add a responsive panel for desktop.
- [x] **P13P.6.6 [A]** Add an accessible mobile bottom-sheet presentation.
- [x] **P13P.6.7 [A]** Add Chat and Voice tabs.
- [x] **P13P.6.8 [A]** Preserve widget state across client-side navigation.
- [x] **P13P.6.9 [A]** Add an “Open full chat” action.
- [x] **P13P.6.10 [A]** Ensure the widget does not obscure essential page controls.
- [x] **P13P.6.11 [A]** Support keyboard navigation, visible focus and Escape-to-close.
- [x] **P13P.6.12 [A]** Do not trap focus when the widget opens automatically.
- [x] **P13P.6.13 [A]** Respect reduced-motion settings.
- [x] **P13P.6.14 [A]** Add component tests for tab switching, opening, closing and route persistence.
- [ ] **P13P.6.G GATE [A+M]** The combined widget works across all pages and screen sizes without regressing the full chat page.

## Milestone 13P.7 - Five-second automatic opening

- [x] **P13P.7.1 [A]** Start one five-second timer after the global widget mounts for the first time.
- [x] **P13P.7.2 [A]** Automatically expand the widget when the timer completes.
- [x] **P13P.7.3 [A]** Open to the Chat tab by default.
- [x] **P13P.7.4 [A]** Do not send a greeting request or create an assistant session merely because the widget opened.
- [x] **P13P.7.5 [A]** Do not request microphone permission.
- [x] **P13P.7.6 [A]** Do not create an ElevenLabs token or connection.
- [x] **P13P.7.7 [A]** Do not play audio.
- [x] **P13P.7.8 [A]** Do not move keyboard focus when opening automatically.
- [x] **P13P.7.9 [A]** Cancel the timer if the visitor manually opens the widget before five seconds.
- [x] **P13P.7.10 [A]** Cancel the timer and record dismissal if the visitor closes the widget before automatic opening.
- [x] **P13P.7.11 [A]** Record the automatic-open event in `sessionStorage`.
- [x] **P13P.7.12 [A]** Do not automatically reopen after dismissal during the same browser session.
- [x] **P13P.7.13 [A]** Do not restart the timer during client-side navigation.
- [x] **P13P.7.14 [A]** Add tests proving auto-open has no network call to ElevenLabs and no microphone side effect.
- [ ] **P13P.7.G GATE [A+M]** The widget opens visually after five seconds exactly once per browser session without initiating chat or voice activity.

## Milestone 13P.8 - Compact text chat

- [x] **P13P.8.1 [A]** Add compact text-chat message history.
- [x] **P13P.8.2 [A]** Add input, submit, stop and clear controls.
- [x] **P13P.8.3 [A]** Reuse the existing assistant endpoint.
- [x] **P13P.8.4 [A]** Reuse the existing audience/persona configuration where appropriate.
- [x] **P13P.8.5 [A]** Render concise grounded answers.
- [x] **P13P.8.6 [A]** Render compact source chips.
- [x] **P13P.8.7 [A]** Link source chips to safe canonical portfolio paths.
- [x] **P13P.8.8 [A]** Direct users to the full chat page for execution inspection.
- [x] **P13P.8.9 [A]** Preserve text chat when voice is disabled, unavailable or quota exhausted.
- [x] **P13P.8.10 [A]** Add empty, loading, cancellation, timeout and error states.
- [ ] **P13P.8.G GATE [A+M]** Compact chat answers grounded questions consistently with the existing full chat page.

## Milestone 13P.9 - Conversational voice interface

- [x] **P13P.9.1 [A]** Add explicit voice-mode consent and usage disclosure.
- [x] **P13P.9.2 [A]** Show the two-minute limit before the start button.
- [x] **P13P.9.3 [A]** Label the voice as AI-generated.
- [x] **P13P.9.4 [A]** Identify the agent as Mahad’s AI portfolio assistant.
- [x] **P13P.9.5 [A]** Request microphone permission only after explicit start.
- [x] **P13P.9.6 [A]** Start ElevenLabs only after authorization succeeds.
- [x] **P13P.9.7 [A]** Add ready, connecting, listening, thinking, speaking, muted, ending, unavailable and quota-exhausted states.
- [x] **P13P.9.8 [A]** Add live input and output visualization using SDK volume data.
- [x] **P13P.9.9 [A]** Add mute, unmute, stop-speaking and end-session controls.
- [x] **P13P.9.10 [A]** Display tentative and final transcript events appropriately.
- [x] **P13P.9.11 [A]** Display remaining session time.
- [x] **P13P.9.12 [A]** Warn visually and conversationally at 30 seconds remaining.
- [x] **P13P.9.13 [A]** Warn at 10 seconds remaining.
- [x] **P13P.9.14 [A]** End automatically at 120 seconds.
- [x] **P13P.9.15 [A]** Provide “Continue in text” during and after the session.
- [x] **P13P.9.16 [A]** Stop all microphone tracks and SDK resources on termination.
- [x] **P13P.9.17 [A]** Handle tab hiding, page unload and network loss safely.
- [x] **P13P.9.18 [A]** Never automatically reconnect after a quota rejection.
- [ ] **P13P.9.G GATE [A+M]** A visitor can hold an interruptible, grounded conversation for up to two minutes and continue in text afterward.

## Milestone 13P.10 - Usage accounting and quota protection

- [x] **P13P.10.1 [A]** Add a Neon model and migration for voice-session usage.
- [x] **P13P.10.2 [A]** Store provider conversation ID, internal session ID, timestamps, reserved seconds, estimated used seconds and termination reason.
- [x] **P13P.10.3 [A]** Do not store raw audio.
- [x] **P13P.10.4 [A]** Store transcripts only under the existing affirmative-consent policy.
- [x] **P13P.10.5 [A]** Implement atomic usage reservation before token issuance.
- [x] **P13P.10.6 [A]** Reconcile reservations after session termination.
- [x] **P13P.10.7 [A]** Expire abandoned reservations.
- [x] **P13P.10.8 [A]** Enforce the monthly application-side voice budget.
- [x] **P13P.10.9 [A]** Enforce the daily application-side voice budget.
- [x] **P13P.10.10 [A]** Enforce per-IP and per-session cooldowns.
- [x] **P13P.10.11 [A]** Enforce the global concurrency limit.
- [x] **P13P.10.12 [A]** Detect and classify ElevenLabs quota errors.
- [x] **P13P.10.13 [A]** Add a temporary circuit breaker after confirmed provider quota exhaustion.
- [x] **P13P.10.14 [A]** Keep the ElevenLabs dashboard as the authoritative provider-usage source.
- [x] **P13P.10.15 [A]** Add a manual monthly reconciliation runbook.
- [x] **P13P.10.G GATE [A]** Voice consumption is bounded server-side and cannot disable either text-chat experience.

## Milestone 13P.11 - Honest degradation and disclaimers

- [x] **P13P.11.1 [A]** Add the pre-session two-minute notice.
- [x] **P13P.11.2 [A]** Add the session-ended notice.
- [x] **P13P.11.3 [A]** Add the monthly-allowance-reached notice.
- [x] **P13P.11.4 [A]** Add the temporarily-unavailable notice.
- [x] **P13P.11.5 [A]** Add the microphone-denied notice.
- [x] **P13P.11.6 [A]** Always provide “Continue in text” and “Open full chat” actions.
- [x] **P13P.11.7 [A]** Do not use generic error wording for known quota limitations.
- [x] **P13P.11.8 [A]** Do not promise when the provider allowance will reset unless the reset time is verified.
- [x] **P13P.11.9 [A]** Add a voice-provider privacy disclosure before permission is requested.
- [ ] **P13P.11.10 [M]** Verify all public storage and retention claims against actual provider settings.
- [ ] **P13P.11.G GATE [A+M]** Every expected limitation is explained honestly without making the website or text assistant appear broken.

## Milestone 13P.12 - Persona and conversational policy

- [x] **P13P.12.1 [A]** Create one channel-independent core persona policy.
- [x] **P13P.12.2 [A]** Add voice-specific delivery instructions without duplicating factual knowledge.
- [x] **P13P.12.3 [A]** Require direct answers before elaboration.
- [x] **P13P.12.4 [A]** Keep ordinary spoken turns concise.
- [x] **P13P.12.5 [A]** Prevent repeated sales-oriented calls to action.
- [x] **P13P.12.6 [A]** Prevent unsolicited meeting or call suggestions.
- [x] **P13P.12.7 [A]** Prevent lead collection.
- [x] **P13P.12.8 [A]** Allow contact guidance only when asked or clearly relevant.
- [x] **P13P.12.9 [A]** Require honest distinction between completed, ongoing and planned work.
- [x] **P13P.12.10 [A]** Require the assistant to acknowledge missing knowledge rather than improvise.
- [x] **P13P.12.11 [A]** Match English or Roman Urdu where supported.
- [x] **P13P.12.12 [A]** Prevent the synthetic voice from claiming to be Mahad live.
- [ ] **P13P.12.G GATE [A+M]** The voice agent behaves like a knowledgeable portfolio counterpart, not a sales or appointment-booking bot.

## Milestone 13P.13 - Citations and voice-turn metadata

- [x] **P13P.13.1 [A]** Preserve citation validation inside the shared assistant graph.
- [x] **P13P.13.2 [A]** Convert citations into natural spoken attribution where appropriate.
- [x] **P13P.13.3 [A]** Do not read raw URLs or chunk identifiers aloud.
- [x] **P13P.13.4 [A]** Associate voice turns with safe citation metadata using provider conversation ID or an internal correlation ID.
- [x] **P13P.13.5 [A]** Add a safe endpoint for the widget to retrieve the latest voice-turn citation metadata.
- [x] **P13P.13.6 [A]** Display compact source chips beneath voice transcript entries.
- [x] **P13P.13.7 [A]** Ensure citations come only from the current retrieval execution.
- [x] **P13P.13.G GATE [A]** Voice answers remain grounded and the widget can expose sources without speaking implementation metadata.

## Milestone 13P.14 - Testing and evaluation

- [ ] **P13P.14.1 [A]** Add component tests for automatic opening after five seconds.
- [ ] **P13P.14.2 [A]** Verify that automatic opening causes no microphone, token or audio side effect.
- [ ] **P13P.14.3 [A]** Test manual opening before the timer.
- [ ] **P13P.14.4 [A]** Test dismissal persistence across route changes.
- [ ] **P13P.14.5 [A]** Test text and voice tab switching.
- [ ] **P13P.14.6 [A]** Test microphone granted, denied and unavailable states.
- [ ] **P13P.14.7 [A]** Test server-enforced 120-second termination.
- [ ] **P13P.14.8 [A]** Test inactivity termination.
- [ ] **P13P.14.9 [A]** Test monthly-quota and provider-quota errors.
- [ ] **P13P.14.10 [A]** Test continuation from voice to compact text chat.
- [ ] **P13P.14.11 [A]** Test the full chat page for regressions.
- [ ] **P13P.14.12 [A]** Test keyboard access, focus handling, screen-reader states and reduced motion.
- [ ] **P13P.14.13 [A]** Create a fixed factual evaluation set shared by text and voice.
- [ ] **P13P.14.14 [A]** Compare text and voice factual consistency.
- [ ] **P13P.14.15 [A]** Evaluate recruiter, engineer, founder and general questions.
- [ ] **P13P.14.16 [A]** Evaluate follow-up questions requiring bounded history.
- [ ] **P13P.14.17 [A]** Evaluate out-of-domain refusals.
- [ ] **P13P.14.18 [A]** Evaluate prompt-injection resistance.
- [ ] **P13P.14.19 [A]** Evaluate private-information requests.
- [ ] **P13P.14.20 [A]** Evaluate English and Roman Urdu.
- [ ] **P13P.14.21 [M]** Evaluate pronunciation of Mahad, Busyfile, CardioScan, LangGraph, Qdrant, Islamabad and Karachi.
- [ ] **P13P.14.22 [M]** Confirm the assistant never pushes an unsolicited call or meeting.
- [ ] **P13P.14.G GATE [A+M]** Voice and text channels are grounded, consistent, accessible and honest under normal and degraded conditions.

## Milestone 13P.15 - Controlled rollout

- [ ] **P13P.15.1 [A]** Place public voice availability behind `ELEVENLABS_VOICE_ENABLED`.
- [ ] **P13P.15.2 [A]** Preserve a kill switch that does not require a frontend rebuild where hosting permits.
- [ ] **P13P.15.3 [A]** Deploy the custom-LLM adapter and token endpoint.
- [ ] **P13P.15.4 [A]** Verify production origin and authentication rules.
- [ ] **P13P.15.5 [A]** Run one controlled production conversation.
- [ ] **P13P.15.6 [A]** Verify usage accounting against the ElevenLabs dashboard.
- [ ] **P13P.15.7 [A]** Enable the widget globally while keeping voice initially disabled if necessary.
- [ ] **P13P.15.8 [M]** Review real usage and enable public voice.
- [ ] **P13P.15.9 [A]** Monitor quota, errors and latency during initial rollout.
- [ ] **P13P.15.10 [A]** Document how to change the configured voice.
- [ ] **P13P.15.G GATE [A+M]** The combined companion is public, bounded, replaceable and unable to compromise the static portfolio or text assistant.

## Milestone 13P.16 - Legacy cleanup after acceptance

- [ ] **P13P.16.1 [M]** Confirm the ElevenLabs path is accepted as the production voice experience.
- [ ] **P13P.16.2 [A]** Remove the old microphone control from the text-chat composer.
- [ ] **P13P.16.3 [A]** Remove unused frontend transcription imports and client helpers.
- [ ] **P13P.16.4 [A]** Decide whether to retain or remove the FastAPI transcription endpoint.
- [ ] **P13P.16.5 [A]** Remove the undeployed OpenVoice service scaffold from active deployment configuration.
- [ ] **P13P.16.6 [A]** Preserve historical code through Git history and architectural documentation.
- [ ] **P13P.16.7 [A]** Remove obsolete voice-specific environment variables.
- [ ] **P13P.16.8 [A]** Update public architecture diagrams to show the current system and link to the superseded decision history.
- [ ] **P13P.16.G GATE [A+M]** No dead production path remains, while the pivot remains fully visible through Git and ADR history.

## PHASE 13P ACCEPTANCE GATE

- [ ] **P13P.G.1 [A]** The widget automatically opens after five seconds without starting a conversation.
- [ ] **P13P.G.2 [A]** The widget does not automatically request microphone permission.
- [ ] **P13P.G.3 [A]** Compact and full chat use the same assistant backend.
- [ ] **P13P.G.4 [A]** Voice uses the existing LangGraph and RAG intelligence layer.
- [ ] **P13P.G.5 [A]** Voice is configurable through environment settings.
- [ ] **P13P.G.6 [A]** Voice sessions cannot exceed 120 seconds.
- [ ] **P13P.G.7 [A]** Monthly exhaustion produces an honest disclaimer and text fallback.
- [ ] **P13P.G.8 [A]** No API key is exposed to the browser.
- [ ] **P13P.G.9 [A]** No duplicate production knowledge base exists in ElevenLabs.
- [ ] **P13P.G.10 [A]** Text chat remains available during every voice failure mode.
- [ ] **P13P.G.11 [M]** Mahad approves the final widget UX, voice behaviour and public wording.
- [ ] **P13P.G GATE [A+M]** The conversational companion is production-ready within the approved free-tier constraints.