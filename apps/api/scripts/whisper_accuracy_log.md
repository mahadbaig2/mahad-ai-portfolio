# Whisper Accuracy Observations (P12.2.7)

This file records word/error observations from Mahad's manual testing (P12.2.6).
Accuracy is documented honestly without overstating capability.

## Test Protocol

| Setting         | Value                              |
|-----------------|------------------------------------|
| Model           | `whisper-large-v3` via Groq        |
| Tested by       | Mahad (P12.2.6 — manual task)      |
| Environment     | Quiet room, laptop microphone      |
| Max duration    | 60 seconds                         |

---

## English

> Status: **PENDING** — Mahad to fill after P12.2.6

| Clip | Text spoken | Transcript returned | Notes |
|------|------------|---------------------|-------|
| 1    |            |                     |       |

---

## Roman Urdu

> Status: **PENDING** — Mahad to fill after P12.2.6

| Clip | Text spoken | Transcript returned | Notes |
|------|------------|---------------------|-------|
| 1    |            |                     |       |

---

## Urdu (Nastaliq)

> Status: **PENDING** — Mahad to fill after P12.2.6

| Clip | Text spoken | Transcript returned | Notes |
|------|------------|---------------------|-------|
| 1    |            |                     |       |

---

## Known Limitations

- Code-switching mid-sentence (English/Roman Urdu mix) may produce inconsistent results.
- Whisper returns its best-effort `language` field; it may not always match the user's actual language.
- Accuracy degrades with background noise or non-standard microphones.
- Roman Urdu is transcribed as best-effort Latin script; Urdu Nastaliq is not guaranteed.

These limitations are surfaced in the UI only when relevant (e.g. editable transcript before submission).
