# ElevenLabs Voice Monthly Reconciliation Runbook

**Milestone 13P.10 - P13P.10.15 [A]**

## 1. Objective
Ensure that internal PostgreSQL usage tracking (`voice_session_usages`) remains reconciled against the authoritative ElevenLabs dashboard usage metrics, guaranteeing strict adherence to free-tier quotas and zero billable leakage.

## 2. Schedule
- **Frequency:** Monthly on the 1st day of each month, or immediately following an unexpected quota alert.
- **Owner:** Mahad Baig.

## 3. Authoritative Source of Truth
- **Provider Dashboard:** [ElevenLabs Usage Dashboard](https://elevenlabs.io/app/usage)
- **Local Database:** Neon PostgreSQL table `voice_session_usages`

## 4. Reconciliation Steps

### Step 4.1: Query Neon PostgreSQL Recorded Usage
Run the following SQL query on the active Neon branch:

```sql
SELECT 
    COUNT(*) AS total_sessions,
    SUM(used_seconds) AS total_used_seconds,
    ROUND(SUM(used_seconds) / 60.0, 2) AS total_used_minutes,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_sessions,
    COUNT(CASE WHEN status = 'expired' THEN 1 END) AS expired_reservations
FROM voice_session_usages
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE);
```

### Step 4.2: Compare with ElevenLabs Dashboard
1. Log in to the ElevenLabs dashboard.
2. Navigate to **Workspace Settings > Subscription & Usage**.
3. Record the total conversational AI minutes consumed in the billing cycle.
4. Verify discrepancy:
   - Allowable variance is +/- 15% due to network latency, synthesis buffer roundings, or WebRTC turn delays.
   - If ElevenLabs reports significantly higher usage (>25%), check for abandoned sessions or unclosed WebRTC streams.

### Step 4.3: Clean Up Abandoned Reservations
To release stale reservations older than 24 hours:

```sql
UPDATE voice_session_usages
SET status = 'expired',
    used_seconds = 0,
    termination_reason = 'manual_monthly_reconciliation'
WHERE status = 'reserved'
  AND created_at < NOW() - INTERVAL '24 hours';
```

### Step 4.4: Reset / Update Monthly Limits if Needed
If free-tier allocation changes, update `VOICE_MONTHLY_BUDGET_SECONDS` in environment configuration:
- Default: 900 seconds (15 minutes).
- Restart API container or redeploy after modification.
