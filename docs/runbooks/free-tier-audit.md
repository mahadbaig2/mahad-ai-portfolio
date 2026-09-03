# Runbook: Monthly Free-Tier & Quota Safety Audit

## Purpose
This runbook defines the monthly manual audit procedure to verify that all hosting, compute, database, and AI service accounts remain strictly within free-tier allowances and cannot generate unexpected bills or overage charges.

---

## Frequency & Ownership
- **Frequency**: Monthly (1st calendar day of each month) and before any production deployment or major evaluation run.
- **Auditor**: Mahad (Antigravity cannot access external authenticated dashboards or manage billing credentials).

---

## Service Audit Checklist

### 1. GitHub
- [ ] **Account / Organization**: Free tier.
- [ ] **Actions Minutes**: Verify usage is well within the 2,000 free monthly minutes for public/free repositories.
- [ ] **Spending Limit**: Set to `$0.00` in GitHub Billing settings (prevent any paid Actions overage).

### 2. Cloudflare
- [ ] **Plan**: Free plan.
- [ ] **Workers / Pages**: Verify under 100,000 daily requests (free limit).
- [ ] **Paid Add-ons**: Confirm no paid add-ons (Workers Paid, Workers KV paid tiers, or Argo) are enabled.

### 3. Sanity CMS
- [ ] **Plan**: Free / Developer plan.
- [ ] **Usage**: Check API requests and dataset bandwidth against monthly free limits.
- [ ] **Billing**: Ensure no credit card is tied to automatic upgrades or overage billing.

### 4. Neon PostgreSQL
- [ ] **Plan**: Free tier (0.5 GiB storage, shared compute).
- [ ] **Autosuspend**: Enabled (compute suspended when idle to conserve compute hours).
- [ ] **Branching**: Ensure only necessary branches exist; delete stale test branches.
- [ ] **Billing Cap**: Verify no paid tier is active.

### 5. Qdrant Cloud
- [ ] **Cluster Type**: Free 1GB cloud cluster (1 node, 1GB RAM, 0.5 vCPU).
- [ ] **Billing Details**: Ensure no payment method is attached to prevent auto-conversion to standard/premium tiers.
- [ ] **Index Health**: Confirm vector points and payload sizes remain below 1GB limit.

### 6. Groq
- [ ] **Usage / Tier**: Free tier.
- [ ] **Rate Limits**: Verify requests/minute and tokens/minute thresholds are respected by application backoff.
- [ ] **Billing**: Confirm no automatic paid usage or prepaid balance refill is configured.

### 7. LangSmith
- [ ] **Plan**: Developer / Free tier (5,000 traces/month allowance).
- [ ] **Tracing Safeguards**: Ensure application client enforces monthly hard-disable limit below 5,000 traces (e.g. capped at 4,000 traces).
- [ ] **Sampling**: Keep sampling rate configured for production traffic so quota is never exceeded.

### 8. Hugging Face Spaces
- [ ] **Spaces**: `mahad-portfolio-api` and `mahad-portfolio-voice`.
- [ ] **Hardware**: Explicitly set to `CPU Basic` (2 vCPU, 16GB RAM - 100% Free).
- [ ] **Paid Hardware / GPU**: Confirm no paid GPU or upgraded compute instances are provisioned.

---

## Failure & Incident Handling

If any service approaches 80% of its monthly free limit:
1. **Immediate Action**: Enable application-level circuit breakers / fallback modes (e.g., disable LangSmith tracing, serve static responses, fall back to browser TTS).
2. **Investigation**: Inspect logs for abnormal query spikes, bot traffic, or loop errors.
3. **Remediation**: Adjust client-side rate limits and caching policies before the limit is breached.
