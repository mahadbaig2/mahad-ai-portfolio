# ADR-0010: ElevenLabs Conversational Companion with Shared Assistant Intelligence

- **Status**: Accepted
- **Date**: 2026-09-17
- **Author**: Mahad and Antigravity
- **Supersedes**: ADR-007 voice-service decision and ADR-008 voice-transport restriction
- **Preserves**: ADR-007 and ADR-008 as historical records
- **Scope**: Conversational voice, compact chat widget, shared assistant boundary and free-tier protection

## Context

The original Version 1 architecture treated voice as two additions to the existing text-chat experience:

1. Push-to-talk browser recording sent to Groq Whisper for transcription into the text composer.
2. Finalized assistant text sent to an independently hosted OpenVoice V2 service for cloned-voice playback.

This architecture deliberately excluded WebRTC and real-time conversational calls. It prioritized strict zero-cost infrastructure, editable transcripts, asynchronous processing, fault isolation and control over the complete pipeline.

Phase 12 implemented the browser recording and Groq Whisper transcription path. The separate OpenVoice service planned in Phase 13 was not implemented.

After reviewing the intended product experience, the requirement changed substantially. Voice is no longer intended to be an input convenience for the text composer. It is now a separate, continuous, interruptible conversational channel similar to the conversational agent presented on the ElevenLabs website.

A second requirement was added: the persistent floating assistant must support compact text chat and voice in one widget while preserving the full `/chat` page.

The new experience requires:

- A persistent bottom-right assistant across all website routes
- Compact text-chat and voice tabs
- Real-time speech recognition
- Automatic turn detection
- Interruptible spoken responses
- Live transcript and conversation states
- The same verified knowledge available to the text assistant
- No unsolicited meeting requests, lead collection or sales behaviour
- Strict two-minute voice sessions
- Honest free-tier and monthly-quota degradation
- Configurable voice selection so a future cloned voice can be added without code changes
- Automatic visual opening five seconds after page entry without automatically starting chat or voice activity

The original design remains valuable evidence of engineering under different constraints. It is preserved rather than erased.

## Decision

Adopt ElevenLabs as the managed real-time audio and conversation-transport provider.

Retain the existing portfolio assistant as the authoritative intelligence layer:

- Sanity remains the authoring source of truth.
- Neon PostgreSQL remains the operational and canonical document source.
- Qdrant remains the rebuildable semantic index.
- The in-process ONNX router remains responsible for intent, route, language and answerability classification.
- LangGraph remains responsible for safety, retrieval, response generation, refusal and bounded orchestration.
- Groq remains the primary LLM inference provider unless changed by a separate decision.
- LangSmith remains the LLM and graph observability layer.
- The existing assistant policies remain channel-independent.

ElevenLabs is responsible for:

- Real-time speech recognition
- Turn-taking
- Voice-activity handling
- Interruption and barge-in behaviour
- Speech synthesis
- Audio transport
- The selected synthetic voice

ElevenLabs must not become a duplicate production knowledge source.

## Shared intelligence boundary

The voice agent connects to a dedicated OpenAI-compatible FastAPI adapter.

The adapter:

1. Accepts the conversation messages required by ElevenLabs.
2. Validates authentication and bounded input.
3. Maps the latest user message and bounded history into the existing assistant request.
4. Runs the existing safety, routing, LangGraph and RAG pipeline.
5. Applies a voice-specific presentation formatter after factual grounding.
6. Streams the response using the contract required by ElevenLabs.

There must not be a separate voice-only assistant graph.

Text and voice may differ in presentation, but they must not differ in factual authority.

## Text interfaces

The application contains two text-chat surfaces:

1. The existing full `/chat` page
2. A compact Chat tab inside the floating widget

Both reuse the same API client, SSE handling, assistant backend, safety policy, conversation limits and citation rules.

The full page remains the detailed experience for:

- Extended conversations
- Complete source cards
- Feedback
- Audience selection
- Execution inspection
- Technical telemetry

The compact widget is optimized for:

- Quick questions
- Short answers
- Compact citations
- Smooth transition into voice
- A direct link to the full chat page

## Widget behaviour

The assistant widget is mounted once in the Next.js root layout.

It remains available across all routes and preserves state during client-side navigation.

The widget automatically expands five seconds after the first global mount during a browser session.

Automatic expansion is visual only. It must not:

- Start a chat session
- Submit a message
- Request microphone permission
- Create an ElevenLabs token
- Connect to ElevenLabs
- Begin recording
- Begin transcription
- Play audio
- Move keyboard focus

If the visitor manually interacts with the widget before the timer completes, the timer is cancelled.

If the visitor dismisses the widget, it does not automatically reopen during the same browser session.

Client-side navigation does not restart the timer.

The widget opens to the Chat tab by default.

## Voice-session limits

A voice conversation begins only after the visitor explicitly presses the start control.

Each conversation is limited to 120 seconds.

The limit is:

- Clearly disclosed before starting
- Displayed as remaining time
- Announced at defined warning points
- Enforced by server-side usage and session controls
- Followed by a text-continuation option

The browser timer is informational and is not the security boundary.

## Free-tier protection

The application maintains conservative usage accounting in Neon.

Before a voice session begins, the server checks:

- Voice feature status
- Required configuration
- Global concurrency
- Per-session and per-IP rate limits
- Daily application allowance
- Monthly application allowance
- Existing usage reservations

The server reserves the maximum session duration before issuing access.

Reservations are reconciled after termination and expired when abandoned.

The ElevenLabs account dashboard remains the authoritative provider-usage record. Application accounting is a protective estimate, not a billing source.

When the monthly voice allowance is unavailable or exhausted, the widget displays:

> The monthly voice allowance for this free portfolio demo has been reached. Voice conversations will return when the allowance resets. The text assistant is still available and has the same knowledge about Mahad.

The interface provides:

- Continue in text
- Open full chat

Text chat remains operational during all voice failures.

## Voice configuration

Voice and agent selection are configuration-driven.

Required settings include:

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_AGENT_ID`
- `ELEVENLABS_VOICE_ID`
- `ELEVENLABS_VOICE_ENABLED`
- `VOICE_SESSION_MAX_SECONDS`

Optional settings include:

- `ELEVENLABS_VOICE_ID_FALLBACK`
- `ELEVENLABS_SERVER_LOCATION`
- `VOICE_INACTIVITY_TIMEOUT_SECONDS`
- `VOICE_DAILY_BUDGET_SECONDS`
- `VOICE_MONTHLY_BUDGET_SECONDS`
- `VOICE_GLOBAL_CONCURRENCY_LIMIT`

The ElevenLabs API key is server-only.

Voice IDs must not be hard-coded into UI components.

A future cloned voice must be adoptable by replacing the configured Voice ID and rerunning voice-quality tests. It must not require changes to the widget, assistant graph, RAG pipeline, API contracts or database.

## Persona

The agent identifies itself as Mahad’s AI portfolio assistant.

If voice is enabled, it discloses that the voice is AI-generated.

It must not claim the visitor is speaking directly with Mahad.

The agent:

- Answers the question directly
- Uses verified portfolio information
- Distinguishes completed, ongoing and planned work
- Admits when information is unavailable
- Supports natural English and tested Roman Urdu
- Avoids repetitive closing questions
- Does not behave as a sales agent
- Does not collect leads
- Does not suggest a call or meeting unless directly asked about contacting Mahad
- Does not use calendar, calling or transfer tools

## Spoken-answer formatting

The grounded answer is authoritative.

A voice-specific formatter may:

- Shorten sentences
- Remove Markdown syntax
- Avoid reading raw URLs
- Replace mechanical citations with natural attribution
- Reduce excessive lists
- Keep normal responses concise

The formatter must not:

- Add unsupported claims
- Remove necessary uncertainty
- Change employment or project facts
- Convert planned work into completed work
- Bypass refusal or safety decisions

## Privacy

Microphone access is requested only after explicit user action.

This application does not intentionally persist raw microphone audio.

Transcript persistence follows the existing affirmative-consent rules.

Public retention claims must be verified against actual ElevenLabs workspace settings before publication.

The interface discloses:

- Live audio is processed by ElevenLabs
- The voice is AI-generated
- Text chat is available without microphone access
- Users should not provide private or sensitive information

## Historical treatment

ADR-007 and ADR-008 remain in the repository.

They are not deleted because they demonstrate:

- The initial constraints
- The original zero-cost reasoning
- Failure-domain analysis
- The earlier rejection of real-time voice transport
- The product and architecture evolution caused by changed requirements

They are marked superseded only for the active voice implementation.

SSE remains valid for the text assistant. Only the voice-specific prohibition on managed real-time transport is superseded.

Completed Phase 12 transcription code remains temporarily as a rollback path until the new voice experience passes its acceptance gate.

## Alternatives considered

### Continue with Whisper and OpenVoice

Rejected because it produces a turn-based transcription and playback experience rather than the required real-time conversation.

### Use ElevenLabs native knowledge base as the production source

Rejected because it duplicates the existing Sanity, Neon and Qdrant knowledge architecture and can cause content drift.

### Use an ElevenLabs webhook only for retrieval

Rejected as the primary approach because ElevenLabs would still become the main response generator and could behave differently from the text assistant.

### Build a self-hosted real-time speech stack

Rejected for Version 1 because it adds audio streaming, voice activity detection, interruption handling, speech recognition, synthesis, scaling and operational complexity that ElevenLabs already provides.

### Remove the full chat page

Rejected because the full page provides detailed citations, feedback, audience controls and execution inspection that do not fit comfortably inside a compact widget.

## Consequences

### Positive

- Real conversational voice rather than transcription-only input
- Shared intelligence across text and voice
- No OpenVoice GPU or PyTorch service
- No separate voice deployment
- Configurable future voice replacement
- Preserved architectural history
- Persistent assistant access across the website
- Clear free-tier degradation
- Text chat remains available during voice failures
- Stronger demonstration of adapting an existing system to changed requirements

### Negative

- New dependency on ElevenLabs availability and plan limits
- Voice usage is highly constrained on the free plan
- Additional provider privacy and retention considerations
- Need for an OpenAI-compatible adapter
- More complex session accounting
- Additional widget state and accessibility requirements
- Potential latency from ElevenLabs to the existing FastAPI and LangGraph backend
- Roman Urdu quality must be tested rather than assumed

## Acceptance criteria

The decision is successfully implemented when:

1. The widget appears across all website routes.
2. It automatically opens after five seconds without starting any conversation.
3. Compact chat and full chat use the same assistant.
4. ElevenLabs voice uses the existing LangGraph and RAG system.
5. No ElevenLabs API key appears in the browser.
6. Voice IDs can be replaced through configuration.
7. Voice sessions cannot exceed 120 seconds.
8. Monthly quota exhaustion produces an honest text fallback.
9. Voice failure cannot disable text chat or the static portfolio.
10. The assistant does not push calls, meetings or lead collection.
11. ADR-007 and ADR-008 remain available as historical records.