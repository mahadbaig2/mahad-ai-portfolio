# Sanity Webhook & GitHub CI Configuration Guide (P6.2.6, P6.2.7)

This runbook provides step-by-step instructions for configuring automated, real-time CMS-to-index synchronization between Sanity Studio, FastAPI, and GitHub Actions.

---

## 1. Required GitHub Actions Secrets (P6.2.6 [M])

To enable the automated ingestion workflows (`ingest-content.yml` and `reconcile.yml`):

1. Go to your repository on GitHub: `https://github.com/mahadbaig2/mahad-ai-portfolio/settings/secrets/actions`
2. Under **Repository secrets**, click **New repository secret** and add:

| Secret Name | Value Description | Example / Reference |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon PostgreSQL pooled connection string | From `.env` (`ep-red-star-...`) |
| `QDRANT_URL` | Qdrant Cloud cluster endpoint | `https://cc2370ca-f584-4971-ac41-8cba1dc9a72b.eu-west-1-0.aws.cloud.qdrant.io` |
| `QDRANT_API_KEY` | Qdrant Cloud API Key | From `.env` |
| `SANITY_PROJECT_ID` | Sanity project ID | `rnjj6f7w` |
| `SANITY_DATASET` | Sanity dataset | `production` |
| `SANITY_API_READ_TOKEN` | Sanity read token for server ingestion | From `.env` |
| `SANITY_WEBHOOK_SECRET` | Secret string for HMAC-SHA256 signature verification | Generate a random 32-character string |

---

## 2. Sanity Dashboard Webhook Setup (P6.2.7 [M])

To trigger immediate incremental ingestion whenever you publish, edit, or unpublish a document:

1. Open [sanity.io/manage](https://www.sanity.io/manage) and select project **`rnjj6f7w`**.
2. Navigate to **API > Webhooks** in the project navigation bar.
3. Click **Create Webhook**.
4. Configure the exact fields below:

* **Name**: `Portfolio RAG Incremental Ingestion`
* **Description**: `Notifies FastAPI backend to re-index published projects, articles, and case studies into Neon and Qdrant.`
* **URL**: `https://<your-deployed-api-domain>/api/v1/webhooks/sanity`
  *(For local testing with ngrok: `https://<ngrok-id>.ngrok-free.app/api/v1/webhooks/sanity`)*
* **Dataset**: `production`
* **Trigger on**:
  - [x] `Create`
  - [x] `Update`
  - [x] `Delete`
* **Filter**:
  ```groq
  _type in ["project", "caseStudy", "article", "skill", "careerProfile", "faq", "architectureDecision"]
  ```
* **Projections**:
  ```groq
  {
    _id,
    _type,
    title,
    name,
    question,
    slug,
    overview,
    summary,
    description,
    shortSummary,
    ragEnabled,
    ragMetadata,
    body,
    content,
    answer,
    metrics,
    techStack,
    language,
    targetAudiences,
    action
  }
  ```
* **Secret**: Enter the exact secret string you configured for `SANITY_WEBHOOK_SECRET`.
* **Status**: Enabled.
* Click **Save**.

---

## 3. How the Automated Lifecycle Works

```
[ Author edits document in Sanity Studio ]
                   |
                   v
[ Sanity sends signed POST to /api/v1/webhooks/sanity ]
                   |
     (HMAC-SHA256 signature + timestamp verified)
                   |
                   v
   [ IncrementalSynchronizer.handle_event ]
    1. Writes new chunks to PostgreSQL
    2. Writes new vectors to Qdrant Cloud
    3. Validates new version
    4. Deactivates stale PostgreSQL chunks
    5. Deletes stale Qdrant points
                   |
                   v
       [ Zero-Downtime Live Update ]
```

---

## 4. Verification

1. When you publish a document in Sanity Studio, inspect the response log in Sanity Webhook Activity. You will see `HTTP 200 OK` with JSON:
   ```json
   {
     "status": "ok",
     "event": {
       "event_type": "publish",
       "sanity_id": "...",
       "status": "completed",
       "chunks_created": 2,
       "chunks_deactivated": 0,
       "vectors_upserted": 2,
       "vectors_deleted": 0
     }
   }
   ```
2. Run the three-way reconciliation command locally to verify zero drift:
   ```bash
   python -m pipelines.reconciliation
   ```
