# ElevenLabs Conversational Agent Setup Guide

This guide provides the exact dashboard steps required to fulfill **Milestone 13P.1** on ElevenLabs under the free plan.

---

## 1. Free Account & Billing Verification (P13P.1.1, P13P.1.2, P13P.1.12)
1. Log in to [ElevenLabs](https://elevenlabs.io/).
2. Navigate to **Subscription & Usage** in the dashboard.
3. **Verify Billing**:
   - Confirm your account is on the **Free** tier.
   - Confirm that **automatic usage/billing overages are disabled** (no credit card charged if quota is exhausted).
4. **Record Allowance**:
   - Note the exact conversational allowance or credit quota displayed on your dashboard (e.g., 10,000 characters or ~15 minutes).
   - Record this value for `VOICE_MONTHLY_BUDGET_SECONDS` (e.g., `900` for 15 minutes).

---

## 2. Conversational Agent Creation (P13P.1.1, P13P.1.4, P13P.1.7)
1. In the dashboard, navigate to **Conversational AI** > **Agents** > **Create Agent** (or select Blank Template).
2. Name the agent: `Mahad AI Portfolio Companion`.
3. Set **Primary Language**: `English` (`en`).
4. Note and privately record the **Agent ID** (found in the URL or agent settings under Agent ID: e.g., `agent_...` or alphanumeric string).

---

## 3. Stock Voice Selection (P13P.1.3, P13P.1.5, P13P.1.6)
1. In the Agent Voice settings, select an expressive, natural stock voice (e.g., *Brian*, *Adam*, *George*, or another neutral English voice).
2. Privately record the **Voice ID** (visible in Voice Details or API settings).
3. Test if conversation-level voice override is supported on your plan (this is optional; note whether allowed).

---

## 4. Conversation & Turn-Taking Behavior (P13P.1.9)
In the Agent's **Conversation Settings**:
1. **Turn Timeout / Inactivity**: Set the silence/inactivity threshold to conservative timing (~7–10 seconds).
2. **Interruption Sensitivity**: Set to normal/balanced so the user can easily interrupt the spoken stream by speaking.

---

## 5. Persona & Safety Constraints (P13P.1.10)
In the Agent's **System Prompt / First Message / Directives**:
1. Note: The agent will ultimately be wired to our custom FastAPI LLM adapter (`Milestone 13P.3`), but configure the default fallback prompt safely:
   - Identify as *Mahad's AI Portfolio Assistant*.
   - Never push or schedule calls/meetings.
   - Never collect phone numbers, emails, or personal contact info.
   - Disclose synthetic voice nature when asked.

---

## 6. Audio & Data Retention (P13P.1.11)
1. In the agent or workspace privacy settings, review **Conversation History & Audio Recording**:
   - Disable audio retention/recording storage if available on the dashboard, or set to minimum retention.
   - Confirm that no raw visitor audio is stored for public model training.

---

## 7. Language Verification (P13P.1.8)
1. Use the ElevenLabs dashboard test console to run a quick test sentence in English, and experimental Roman Urdu phrases (e.g., *"Kya haal hai? Mahad ke projects ke bare me batao"*).
2. Observe phonetics and pronunciation behavior.

---

## 8. Summary of Values for `.env`
Keep these values ready for Milestone 13P.2:
```bash
ELEVENLABS_API_KEY="<your-server-only-api-key>"
ELEVENLABS_AGENT_ID="<your-agent-id>"
ELEVENLABS_VOICE_ID="<your-selected-voice-id>"
ELEVENLABS_VOICE_ENABLED="true"
VOICE_SESSION_MAX_SECONDS="120"
VOICE_MONTHLY_BUDGET_SECONDS="<recorded-free-allowance-in-seconds>"
```
