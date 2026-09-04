# Sanity Studio (`@mahad/studio`)

Authoring environment for Mahad's AI Product Engineering portfolio and the *Talk to Mahad* conversational RAG assistant.

As decided in [ADR-001](../../docs/adr/0001-sanity-authoring-source-of-truth.md), Sanity CMS is the single authoring source of truth. Production content is never duplicated across the frontend and assistant; both consume documents authored and published here.

---

## Prerequisites & Environment Configuration

The studio reads project credentials from environment variables or falls back to development defaults.

Ensure your root `.env` or local studio environment defines:

```bash
# Sanity Studio Project Credentials
SANITY_STUDIO_PROJECT_ID="your_sanity_project_id"
SANITY_STUDIO_DATASET="production"

# Frontend / Public fallback
NEXT_PUBLIC_SANITY_PROJECT_ID="your_sanity_project_id"
NEXT_PUBLIC_SANITY_DATASET="production"

# Backend Ingestion & Preview (Server-side)
SANITY_API_READ_TOKEN="your_sanity_read_token"
SANITY_WEBHOOK_SECRET="your_webhook_secret"
```

> [!NOTE]
> When running locally without active credentials, the studio defaults to a placeholder project ID and allows schema validation and preview structure inspection.

---

## Available Commands

From repository root:

```bash
# Run local Sanity Studio development server (defaults to http://localhost:3333)
pnpm --filter @mahad/studio dev

# Typecheck Studio schemas and configuration
pnpm --filter @mahad/studio typecheck

# Build static production Studio bundle
pnpm --filter @mahad/studio build
```

---

## Content Model & Desk Organization

The studio is organized into four primary sections:

### 1. Site Settings & Profile (Singleton)
- **Document**: `siteSettings`
- **Purpose**: Author Name, Target Role ("AI Product Engineer"), headline, short bio, verified contact addresses, and verified résumé PDF upload.
- **Résumé Note**: Uploading `resumePdf` here provides the authoritative download source for the portfolio contact page.

### 2. Work & Editorial
- **`project`**: Production engineering projects with metrics, architectural decisions, live demos, and stack badges.
- **`caseStudy`**: Deep technical case studies detailing context, architecture, quantitative evaluation, unsuccessful experiments, and trade-offs.
- **`article`**: Engineering blog posts, technical essays, and cross-posted Medium articles with structured Portable Text.

### 3. Career & Background
- **`experience`**: Chronological work history, roles, key achievements, and technologies.
- **`education`**: Academic history, honors, and technical certifications.
- **`skill`**: Categorized competencies across AI/ML, backend systems, product engineering, cloud, and LLMOps.

### 4. Knowledge Base & RAG
- **`architectureDecision`**: Machine-readable ADRs (ADR-001 through ADR-008) indexable by the RAG system.
- **`faq`**: Structured question-and-answer pairs across career, engineering philosophy, and stack choices.
- **`styleExample`**: Grounding exemplars in English and Roman Urdu demonstrating Mahad's direct, concise communication style.
- **`personalStory`**: First-person narratives detailing engineering perspectives and background.

---

## Standard RAG Metadata Mixin

Every indexable document includes standardized RAG metadata (`ragMetadataFields`):

| Field | Type | Description |
| :--- | :--- | :--- |
| `ragEnabled` | `boolean` | When true, included in PostgreSQL ingestion and Qdrant vector index. |
| `audiences` | `array` | Target audiences (`recruiter`, `engineer`, `founder`, `general`) for query routing. |
| `sensitivity` | `string` | Access boundary (`public` vs `internal`). |
| `sourceLabel` | `string` | Human-readable provenance label displayed in citations (e.g., `"Sanity CMS: Project"`). |
| `canonicalPath`| `string` | Relative URL on the portfolio website (e.g., `"/work/multimodal-rag"`). |
| `reviewDate` | `date` | Content verification date for freshness tracking. |
| `publishStatus`| `string` | Document lifecycle state (`published`, `draft`, `archived`). |
