# ADR-007: Separate Failure Domain for Cloned Voice Service

- **Status**: Proposed (Accepted for V1)
- **Date**: 2026-09-04
- **Author**: Antigravity & Mahad

## Context
The portfolio features an experimental cloned voice of Mahad powered by OpenVoice V2. Neural voice cloning models have substantial dependency footprints (PyTorch, audio codecs, speaker embedding extractors) and significant memory / compute requirements. If bundled into the primary API container, a voice crash, out-of-memory error, or slow synthesis would take down the core chat and portfolio backend.

## Decision
Isolate the OpenVoice synthesis engine into a completely separate failure domain:
1. **Isolated Container**: Deploy `apps/voice` as an independent Docker container (hosted on a dedicated Hugging Face Space: `mahad-ai-portfolio-voice`).
2. **Asynchronous & Non-Blocking**: Text responses and citations are stream-completed first. Text is *never* held back waiting for audio generation.
3. **Graceful Fallback**: If the voice service is down, sleeping, or exceeds its timeout threshold (e.g. 5 seconds), the frontend seamlessly falls back to browser-native SpeechSynthesis API or purely visual text without any error prompt to the user.
4. **Data Privacy**: Raw audio recordings used to calibrate the voice profile are stored privately and never exposed via Git or public buckets.

## Consequences

### Positive
- Total fault isolation: A failure, cold start, or memory spike in OpenVoice cannot impact website availability or text chat.
- Clean separation between lightweight CPU chat service and heavy audio processing dependencies.
- Immediate user feedback: Text streams instantly while audio is synthesized concurrently in the background.

### Negative / Trade-offs
- An additional microservice to monitor and deploy.
- Inter-service network hop between `apps/api` and `apps/voice` (secured via internal token).
