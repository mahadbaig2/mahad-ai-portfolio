# TASKS.md

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
- [ ] **P1.2.8 [M]** Review personal facts, links, titles and public wording.
- [ ] **P1.2.9 [A]** Replace incorrect or unapproved claims.

## Milestone 1.3 - Foundation quality gate

- [ ] **P1.3.1 [A]** Add Vitest component/unit setup.
- [ ] **P1.3.2 [A]** Add Playwright smoke tests for all pages and mobile navigation.
- [ ] **P1.3.3 [A]** Add accessibility checks for primary pages.
- [ ] **P1.3.4 [A]** Add Lighthouse CI budgets without premature micro-optimization.
- [ ] **P1.3.5 [M]** Review readability, whitespace and scanability on phone and desktop.
- [ ] **P1.G GATE [A+M]** Site is usable and credible without CMS or AI.

---

# PHASE 2 - Sanity CMS and managed content

## Milestone 2.1 - Studio and schemas

- [ ] **P2.1.1 [A]** Scaffold Sanity Studio in `apps/studio`.
- [ ] **P2.1.2 [A]** Add schemas: `project`, `caseStudy`, `article`, `experience`, `education`, `skill`, `faq`, `architectureDecision`, `personalStory`, `styleExample`, `siteSettings`.
- [ ] **P2.1.3 [A]** Add `ragEnabled`, audiences, sensitivity, source label, canonical path, review date and publish status to indexable documents.
- [ ] **P2.1.4 [A]** Add validation for required titles, slugs, summaries and references.
- [ ] **P2.1.5 [A]** Add Portable Text blocks with constrained headings, lists, links, images and code.
- [ ] **P2.1.6 [A]** Add preview structures and desk organization.
- [ ] **P2.1.7 [A]** Document local Studio setup.

## Milestone 2.2 - CMS integration

- [ ] **P2.2.1 [A]** Create typed Sanity client and query layer.
- [ ] **P2.2.2 [A]** Implement GROQ queries for all public pages.
- [ ] **P2.2.3 [A]** Implement Portable Text rendering with safe link handling.
- [ ] **P2.2.4 [A]** Implement image dimensions, alt text and responsive loading.
- [ ] **P2.2.5 [A]** Add preview mode without exposing write credentials.
- [ ] **P2.2.6 [A]** Remove duplicated hard-coded production content.
- [ ] **P2.2.7 [A]** Add empty-state behavior when collections have no content.

## Milestone 2.3 - Mahad content entry

- [ ] **P2.3.1 [A]** Provide a concise content-entry guide and required-field checklist.
- [ ] **P2.3.2 [M]** Enter approved profile and contact information.
- [ ] **P2.3.3 [M]** Enter at least three projects/case studies.
- [ ] **P2.3.4 [M]** Enter at least one blog article or architecture note.
- [ ] **P2.3.5 [M]** Mark sensitive/private material as non-indexable.
- [ ] **P2.3.6 [M]** Review every source that the assistant may cite.
- [ ] **P2.G GATE [A+M]** A CMS edit updates the site without a code change, and all published facts are approved.

---

# PHASE 3 - FastAPI and PostgreSQL operational foundation

## Milestone 3.1 - API skeleton

- [ ] **P3.1.1 [A]** Scaffold FastAPI with settings loaded through Pydantic.
- [ ] **P3.1.2 [A]** Add structured JSON logging and correlation IDs.
- [ ] **P3.1.3 [A]** Add `/health/live`, `/health/ready` and version endpoints.
- [ ] **P3.1.4 [A]** Add explicit CORS allowlist and body-size limits.
- [ ] **P3.1.5 [A]** Add stable error response schema.
- [ ] **P3.1.6 [A]** Add provider interfaces and test doubles.
- [ ] **P3.1.7 [A]** Generate an OpenAPI artifact and validate it in CI.

## Milestone 3.2 - Database schema

- [ ] **P3.2.1 [A]** Configure async SQLAlchemy 2.x.
- [ ] **P3.2.2 [A]** Configure Alembic.
- [ ] **P3.2.3 [A]** Add enums and tables for source documents, document chunks and index runs.
- [ ] **P3.2.4 [A]** Add tables for consented chat sessions, redacted messages, retrieval events and feedback.
- [ ] **P3.2.5 [A]** Add model-release metadata table.
- [ ] **P3.2.6 [A]** Add foreign keys, uniqueness constraints and query indexes.
- [ ] **P3.2.7 [A]** Add repository/service boundaries; do not query ORM models from route handlers.
- [ ] **P3.2.8 [A]** Add migration-up and migration-from-clean-database tests.
- [ ] **P3.2.9 [A]** Add retention/deletion method for expired sessions.

## Milestone 3.3 - Neon connection

- [ ] **P3.3.1 [A]** Document required Neon variables in `.env.example`.
- [ ] **P3.3.2 [M]** Store Neon credentials in local and deployment secret managers, never Git.
- [ ] **P3.3.3 [A]** Run migrations against a non-production Neon branch.
- [ ] **P3.3.4 [A]** Verify SSL, connection timeout and wake-from-zero behavior.
- [ ] **P3.3.5 [A]** Document backup/export and migration recovery.
- [ ] **P3.G GATE [A]** API health, clean migrations and database integration tests pass.

---

# PHASE 4 - Offline RAG ingestion

## Milestone 4.1 - Sanity extraction and normalization

- [ ] **P4.1.1 [A]** Define normalized document and chunk contracts.
- [ ] **P4.1.2 [A]** Fetch one document and resolve referenced content.
- [ ] **P4.1.3 [A]** Convert Portable Text into structured normalized text.
- [ ] **P4.1.4 [A]** Preserve headings, lists, captions, code and canonical source path.
- [ ] **P4.1.5 [A]** Normalize whitespace and Unicode without destroying Urdu text.
- [ ] **P4.1.6 [A]** Compute deterministic SHA-256 document hashes.
- [ ] **P4.1.7 [A]** Add fixtures and normalization snapshot tests.

## Milestone 4.2 - Chunking

- [ ] **P4.2.1 [A]** Implement heading-aware recursive chunking.
- [ ] **P4.2.2 [A]** Target 350-500 tokens and 50-75-token overlap through configuration.
- [ ] **P4.2.3 [A]** Keep project identity and heading path in each chunk.
- [ ] **P4.2.4 [A]** Prevent two projects from sharing a chunk.
- [ ] **P4.2.5 [A]** Keep list introductions with their lists.
- [ ] **P4.2.6 [A]** Compute chunk hashes and deterministic order.
- [ ] **P4.2.7 [A]** Test short documents, long sections, lists, code, Urdu and empty blocks.

## Milestone 4.3 - Embeddings and PostgreSQL manifest

- [ ] **P4.3.1 [A]** Pin `intfloat/multilingual-e5-small` and tokenizer versions.
- [ ] **P4.3.2 [A]** Implement E5 `passage:` and `query:` conventions.
- [ ] **P4.3.3 [A]** Implement batch embedding with normalized vectors.
- [ ] **P4.3.4 [A]** Persist canonical documents/chunks and embedding metadata to PostgreSQL.
- [ ] **P4.3.5 [A]** Skip unchanged hashes.
- [ ] **P4.3.6 [A]** Add `--dry-run`, `--document-id` and safe environment targeting.
- [ ] **P4.3.7 [A]** Verify a second identical run creates no duplicates or extra embedding work.
- [ ] **P4.G GATE [A]** Deterministic, idempotent offline ingestion works without Qdrant or an LLM.

---

# PHASE 5 - Qdrant vector retrieval

## Milestone 5.1 - Collection and indexing

- [ ] **P5.1.1 [A]** Add Qdrant provider adapter.
- [ ] **P5.1.2 [A]** Create collection configuration with cosine distance and verified model dimension.
- [ ] **P5.1.3 [A]** Create payload indexes for document type, project, audience, language and active version.
- [ ] **P5.1.4 [A]** Use PostgreSQL chunk mapping UUID as Qdrant point ID.
- [ ] **P5.1.5 [A]** Store compact payload and only a short debug preview.
- [ ] **P5.1.6 [A]** Implement batch upsert and deletion with retries.
- [ ] **P5.1.7 [M]** Store Qdrant URL/key as secrets.

## Milestone 5.2 - Retrieval and hydration

- [ ] **P5.2.1 [A]** Embed queries using the exact indexed model/version.
- [ ] **P5.2.2 [A]** Retrieve top 12 with optional metadata filters.
- [ ] **P5.2.3 [A]** Hydrate canonical content from PostgreSQL by point ID.
- [ ] **P5.2.4 [A]** Reject inactive, missing or mismatched-version rows.
- [ ] **P5.2.5 [A]** Deduplicate adjacent/near-identical chunks.
- [ ] **P5.2.6 [A]** Select up to five chunks within a configurable context budget.
- [ ] **P5.2.7 [A]** Create CLI retrieval inspector with query, filters, ranks and sources.

## Milestone 5.3 - Retrieval evaluation and recovery

- [ ] **P5.3.1 [A+M]** Draft at least 50 expected-query/source pairs; Mahad verifies relevance.
- [ ] **P5.3.2 [A]** Measure hit rate at K and mean reciprocal rank.
- [ ] **P5.3.3 [A]** Calibrate initial score thresholds from evaluation data.
- [ ] **P5.3.4 [A]** Implement full index rebuild behind explicit confirmation flags.
- [ ] **P5.3.5 [A]** Delete local/test Qdrant collection and prove successful rebuild.
- [ ] **P5.3.6 [A]** Document free-cluster suspension/deletion recovery.
- [ ] **P5.G GATE [A+M]** Retrieval meets agreed test quality and the index is demonstrably rebuildable.

---

# PHASE 6 - Automated CMS-to-index lifecycle

## Milestone 6.1 - Incremental synchronization

- [ ] **P6.1.1 [A]** Implement create, update, unpublish and delete ingestion events.
- [ ] **P6.1.2 [A]** Write new chunks/vectors before deactivating old versions.
- [ ] **P6.1.3 [A]** Delete stale Qdrant points after new version validation.
- [ ] **P6.1.4 [A]** Record every run and error summary in `index_runs`.
- [ ] **P6.1.5 [A]** Preserve the previous active version after partial failure.
- [ ] **P6.1.6 [A]** Add reconciliation command comparing Sanity, PostgreSQL and Qdrant.

## Milestone 6.2 - Webhook and CI

- [ ] **P6.2.1 [A]** Implement a signature-validating Cloudflare webhook endpoint.
- [ ] **P6.2.2 [A]** Dispatch GitHub ingestion workflow without exposing its token.
- [ ] **P6.2.3 [A]** Add `ingest-content.yml` for targeted updates.
- [ ] **P6.2.4 [A]** Add scheduled full reconciliation.
- [ ] **P6.2.5 [A]** Add concurrency control so two index runs cannot corrupt active versions.
- [ ] **P6.2.6 [M]** Add webhook and CI secrets through dashboards.
- [ ] **P6.2.7 [M]** Configure Sanity webhook using Antigravity's exact instructions.
- [ ] **P6.2.8 [A]** Test publish, edit, unpublish, deletion, replay and failed-run paths.
- [ ] **P6.G GATE [A+M]** A real Sanity update produces a verified incremental index update.

---

# PHASE 7 - Query router dataset and ML baseline

## Milestone 7.1 - Label system

- [ ] **P7.1.1 [A]** Define intent labels, route labels, answerability labels and language labels.
- [ ] **P7.1.2 [A]** Define deterministic examples and boundary cases for each label.
- [ ] **P7.1.3 [A]** Create dataset schema with origin, base-question group and reviewer fields.
- [ ] **P7.1.4 [A]** Add validation for unknown labels, duplicates, missing groups and invalid text.
- [ ] **P7.1.5 [A]** Create dataset card documenting purpose, limitations and privacy.
- [ ] **P7.1.6 [M]** Review label definitions for natural recruiter and Roman Urdu usage.

## Milestone 7.2 - Data creation

- [ ] **P7.2.1 [A]** Generate a starter set from approved portfolio topics, clearly marked synthetic.
- [ ] **P7.2.2 [M]** Add/rewrite authentic questions in Mahad's English and Roman Urdu.
- [ ] **P7.2.3 [A]** Add out-of-domain, malicious, ambiguous and clarification examples.
- [ ] **P7.2.4 [A]** Create group-aware train/validation/test split.
- [ ] **P7.2.5 [A]** Keep final locked test set human-authored.
- [ ] **P7.2.6 [A]** Run leakage and class-balance report.
- [ ] **P7.2.7 [M]** Approve locked test set; do not use it for model iteration afterward.

## Milestone 7.3 - Baseline and MLflow

- [ ] **P7.3.1 [A]** Implement seeded TF-IDF/logistic-regression training pipeline.
- [ ] **P7.3.2 [A]** Configure local MLflow tracking.
- [ ] **P7.3.3 [A]** Log data version, Git commit, parameters, environment and artifacts.
- [ ] **P7.3.4 [A]** Log macro F1, per-class metrics, confusion matrix, calibration and latency.
- [ ] **P7.3.5 [A]** Write error analysis by label and language slice.
- [ ] **P7.3.6 [A]** Register baseline as first candidate, not champion until reviewed.
- [ ] **P7.3.7 [M]** Review errors and approve or request label/data corrections.
- [ ] **P7.G GATE [A+M]** Reproducible baseline and honest error analysis exist.

---

# PHASE 8 - Transformer fine-tuning and model deployment

## Milestone 8.1 - Fine-tuning

- [ ] **P8.1.1 [A]** Select MiniLM or DistilBERT based on model-size/language experiments; record ADR.
- [ ] **P8.1.2 [A]** Implement deterministic training with checkpointing and early stopping.
- [ ] **P8.1.3 [A]** Use class weights or sampling only when justified by data.
- [ ] **P8.1.4 [A]** Train intent and route heads; keep answerability separate if shared training is unstable.
- [ ] **P8.1.5 [A]** Log every formal run to MLflow.
- [ ] **P8.1.6 [A]** Evaluate aggregate, per-class, Roman Urdu, refusal and latency slices.
- [ ] **P8.1.7 [A]** Compare candidate against baseline using predeclared promotion rules.

## Milestone 8.2 - Packaging

- [ ] **P8.2.1 [A]** Export candidate to ONNX.
- [ ] **P8.2.2 [A]** Verify ONNX predictions match framework predictions within tolerance.
- [ ] **P8.2.3 [A]** Evaluate quantization; retain unquantized model if quality regresses.
- [ ] **P8.2.4 [A]** Package tokenizer, labels, config, metrics and model card.
- [ ] **P8.2.5 [A]** Publish an immutable artifact version only after Mahad approval.
- [ ] **P8.2.6 [M]** Approve champion based on evidence, not architecture preference.
- [ ] **P8.2.7 [A]** Mirror champion metadata in PostgreSQL.

## Milestone 8.3 - In-process serving

- [ ] **P8.3.1 [A]** Download/pin the immutable model during backend build.
- [ ] **P8.3.2 [A]** Load one ONNX Runtime session at application startup.
- [ ] **P8.3.3 [A]** Implement identical training/serving preprocessing.
- [ ] **P8.3.4 [A]** Return labels, confidence, model version and safe fallback.
- [ ] **P8.3.5 [A]** Add concurrency and cold-start latency tests.
- [ ] **P8.3.6 [A]** Add configuration-based rollback to the prior artifact.
- [ ] **P8.G GATE [A+M]** Champion is reproducible, approved, served locally and rollback-tested.

---

# PHASE 9 - LangGraph grounded assistant

## Milestone 9.1 - Typed graph

- [ ] **P9.1.1 [A]** Define graph state for input, transcript, mode, classifier output, query, evidence, retries, answer, citations and errors.
- [ ] **P9.1.2 [A]** Implement input validation and safety node.
- [ ] **P9.1.3 [A]** Implement ONNX classification node.
- [ ] **P9.1.4 [A]** Implement explicit conditional edges for deterministic, RAG, agentic, clarify and refuse routes.
- [ ] **P9.1.5 [A]** Set hard step and one-rewrite limits.
- [ ] **P9.1.6 [A]** Add graph visualization to architecture documentation.

## Milestone 9.2 - Deterministic and RAG routes

- [ ] **P9.2.1 [A]** Implement structured contact/navigation lookup without LLM calls.
- [ ] **P9.2.2 [A]** Implement query normalization while preserving code-switching.
- [ ] **P9.2.3 [A]** Implement filter planning.
- [ ] **P9.2.4 [A]** Implement Qdrant retrieval and PostgreSQL hydration tool.
- [ ] **P9.2.5 [A]** Implement threshold-based evidence check.
- [ ] **P9.2.6 [A]** Implement grounded prompt with explicit source IDs.
- [ ] **P9.2.7 [A]** Implement provider-neutral Groq adapter.
- [ ] **P9.2.8 [M]** Add Groq key to server-side secret stores.

## Milestone 9.3 - Agentic recovery and citations

- [ ] **P9.3.1 [A]** Implement constrained evidence grader only when threshold decision is uncertain.
- [ ] **P9.3.2 [A]** Implement one bounded query rewrite and retry.
- [ ] **P9.3.3 [A]** Implement clarify/refuse behavior after weak evidence.
- [ ] **P9.3.4 [A]** Implement claim-to-source citation validation.
- [ ] **P9.3.5 [A]** Apply audience style only after grounded draft creation.
- [ ] **P9.3.6 [A]** Verify style step cannot introduce unsupported claims.
- [ ] **P9.3.7 [A]** Store safe route/retrieval events with consent rules.

## Milestone 9.4 - API streaming and resilience

- [ ] **P9.4.1 [A]** Add bounded session and message endpoints.
- [ ] **P9.4.2 [A]** Add SSE stream with safe progress events and answer tokens.
- [ ] **P9.4.3 [A]** Add timeouts, limited retries and circuit breakers.
- [ ] **P9.4.4 [A]** Add controlled quota/capacity response codes.
- [ ] **P9.4.5 [A]** Test Qdrant, Neon, Groq and LangSmith outages independently.
- [ ] **P9.G GATE [A]** Supported questions cite evidence; unsupported questions refuse/clarify; graph termination is guaranteed.

---

# PHASE 10 - LangSmith and LLMOps

## Milestone 10.1 - Safe tracing

- [ ] **P10.1.1 [A]** Add optional LangSmith configuration disabled by default locally.
- [ ] **P10.1.2 [A]** Add trace hierarchy for classifier, retrieval, grading, generation and verification.
- [ ] **P10.1.3 [A]** Redact secrets, raw audio and sensitive user content.
- [ ] **P10.1.4 [A]** Add trace sampling and monthly hard-disable threshold below free allowance.
- [ ] **P10.1.5 [A]** Prove user requests succeed when LangSmith is unavailable.
- [ ] **P10.1.6 [M]** Add LangSmith key and project name to deployment secrets.

## Milestone 10.2 - Evaluation suites

- [ ] **P10.2.1 [A+M]** Create recruiter, engineer and founder evaluation cases; Mahad approves expected behavior.
- [ ] **P10.2.2 [A+M]** Create English/Roman Urdu cases; Mahad reviews naturalness.
- [ ] **P10.2.3 [A]** Create unanswerable, incorrect-premise and prompt-injection cases.
- [ ] **P10.2.4 [A]** Implement retrieval relevance, groundedness, citation and refusal evaluators.
- [ ] **P10.2.5 [A]** Record prompt, model, embedding and index versions for each run.
- [ ] **P10.2.6 [A]** Establish initial release thresholds from measured baseline results.

## Milestone 10.3 - Release regression gate

- [ ] **P10.3.1 [A]** Run a small deterministic evaluation set on every pull request.
- [ ] **P10.3.2 [A]** Run cost-controlled LLM evaluation before release only.
- [ ] **P10.3.3 [A]** Store human-readable evaluation summary as CI artifact.
- [ ] **P10.3.4 [A]** Block release on citation/refusal regression.
- [ ] **P10.G GATE [A]** Tracing is safe/capped and regressions block release.

---

# PHASE 11 - Production chat interface

## Milestone 11.1 - API integration

- [ ] **P11.1.1 [A]** Generate or validate frontend types from OpenAPI.
- [ ] **P11.1.2 [A]** Create server-only API proxy configuration.
- [ ] **P11.1.3 [A]** Implement bounded client conversation state.
- [ ] **P11.1.4 [A]** Implement SSE parsing, cancellation and reconnection rules.
- [ ] **P11.1.5 [A]** Do not persist history without affirmative consent.

## Milestone 11.2 - Chat UX

- [ ] **P11.2.1 [A]** Add concise Recruiter, Engineer and Founder mode selector.
- [ ] **P11.2.2 [A]** Add text input, submit, stop and clear controls.
- [ ] **P11.2.3 [A]** Add suggested questions without marketing jargon.
- [ ] **P11.2.4 [A]** Show functional states: classifying, searching, generating and error.
- [ ] **P11.2.5 [A]** Render citations as source cards.
- [ ] **P11.2.6 [A]** Add feedback control and optional reason.
- [ ] **P11.2.7 [A]** Add keyboard and screen-reader support.

## Milestone 11.3 - Safe execution inspector

- [ ] **P11.3.1 [A]** Show route, confidence and model version.
- [ ] **P11.3.2 [A]** Show graph path, retrieval duration and retry count.
- [ ] **P11.3.3 [A]** Show source titles and safe similarity scores.
- [ ] **P11.3.4 [A]** Show high-level latency/token data.
- [ ] **P11.3.5 [A]** Explicitly exclude system prompts, secrets, hidden reasoning and private data.
- [ ] **P11.3.6 [M]** Review inspector usefulness for recruiters and engineers.
- [ ] **P11.G GATE [A+M]** Chat is readable, mobile-friendly, accessible and honest about failures.

---

# PHASE 12 - Voice input

## Milestone 12.1 - Browser capture

- [ ] **P12.1.1 [A]** Implement push-to-talk after explicit user action.
- [ ] **P12.1.2 [A]** Handle microphone permission granted, denied and unavailable.
- [ ] **P12.1.3 [A]** Enforce short duration, accepted MIME types and maximum bytes.
- [ ] **P12.1.4 [A]** Add recording, stop, cancel and delete controls.
- [ ] **P12.1.5 [A]** Do not upload until the user submits the captured question.

## Milestone 12.2 - Transcription

- [ ] **P12.2.1 [A]** Add protected multipart transcription endpoint.
- [ ] **P12.2.2 [A]** Stream to Groq Whisper without persistent raw-audio storage.
- [ ] **P12.2.3 [A]** Return transcript and detected language metadata.
- [ ] **P12.2.4 [A]** Allow transcript editing before it enters the graph.
- [ ] **P12.2.5 [A]** Delete temporary audio in success and failure paths.
- [ ] **P12.2.6 [M]** Test a defined set of English, Urdu and Roman Urdu recordings.
- [ ] **P12.2.7 [A]** Record word/error observations without overstating accuracy.
- [ ] **P12.G GATE [A+M]** Voice reliably becomes editable text; text chat remains fully usable without microphone access.

---

# PHASE 13 - Mahad voice output

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

