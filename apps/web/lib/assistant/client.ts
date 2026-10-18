/**
 * Client-side SSE streaming and API client for the Talk to Mahad Assistant.
 * Milestones 11.1 - 11.3.
 */

import {
  AssistantChatRequest,
  AssistantChatResponse,
  ExecutionStep,
  PersonaType,
  VoiceConfigResponse,
  VoiceTokenResponse,
  VoiceTurnCitationResponse,
} from "./types";


const DEFAULT_API_URL = "http://localhost:8000";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  }
  return DEFAULT_API_URL;
}

export interface StreamCallbacks {
  onProgress?: (step: ExecutionStep) => void;
  onToken?: (delta: string) => void;
  onDone?: (response: AssistantChatResponse) => void;
  onError?: (err: { code: string; message: string }) => void;
}

/**
 * Stream an assistant conversation turn via Server-Sent Events with cancellation support.
 */
export async function streamAssistantMessage(
  payload: AssistantChatRequest,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/v1/assistant/chat/stream`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: payload.message,
        session_id: payload.session_id,
        persona: payload.persona || "general",
        mode: payload.mode || "text",
        history: (payload.history || []).slice(-20),
        consent_given: payload.consent_given || false,
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      callbacks.onError?.({
        code: `HTTP_${response.status}`,
        message: errorText || `API returned status ${response.status}`,
      });
      return;
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const block of lines) {
        if (!block.trim()) continue;

        const eventMatch = block.match(/^event:\s*(\w+)/m);
        const dataMatch = block.match(/^data:\s*(.+)$/m);

        if (!dataMatch) continue;

        const eventType = eventMatch ? eventMatch[1] : "message";
        const rawData = dataMatch[1];

        try {
          const parsed = JSON.parse(rawData);

          if (eventType === "progress") {
            callbacks.onProgress?.(parsed as ExecutionStep);
          } else if (eventType === "token") {
            callbacks.onToken?.(parsed.delta || "");
          } else if (eventType === "done") {
            callbacks.onDone?.(parsed as AssistantChatResponse);
          } else if (eventType === "error") {
            callbacks.onError?.(parsed as { code: string; message: string });
          }
        } catch (e) {
          console.warn("Failed to parse SSE payload:", rawData, e);
        }
      }
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      // User cancelled request
      callbacks.onProgress?.({
        step_name: "cancelled",
        duration_ms: 0,
        status: "cancelled",
        details: { reason: "User stopped generation" },
      });
      return;
    }

    console.error("Assistant API connection error:", error);
    callbacks.onError?.({
      code: "API_UNAVAILABLE",
      message: "The assistant backend is currently waking up or unreachable. Please try again in a few seconds.",
    });
  }
}

/**
 * Lightweight probe to check if the assistant service is awake and responding.
 * Wakes up sleeping free-tier containers on page load.
 */
export async function checkAssistantHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/health/live`, { signal });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch public voice configuration (enabled state, max duration, active voice ID).
 */
export async function fetchVoiceConfig(signal?: AbortSignal): Promise<VoiceConfigResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/v1/voice/config`, { signal });
  if (!res.ok) {
    throw new Error(`Failed to fetch voice config: ${res.status}`);
  }
  return res.json();
}

/**
 * Request a short-lived ElevenLabs conversation token server-side (P13P.4.1).
 * Never exposes the server API key to the client.
 */
export async function requestVoiceToken(
  sessionId?: string,
  signal?: AbortSignal
): Promise<VoiceTokenResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/v1/voice/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      action: "start_voice",
    }),
    signal,
  });

  if (!res.ok) {
    let errData: any = {};
    try {
      errData = await res.json();
    } catch {
      // fallback
    }
    const code = errData?.detail?.code || `HTTP_${res.status}`;
    const message = errData?.detail?.message || "Failed to obtain voice token";
    const error: any = new Error(message);
    error.code = code;
    throw error;
  }

  return res.json();
}

/**
 * Explicitly release voice concurrency reservation when conversation ends (P13P.4.9).
 */
export async function endVoiceSession(sessionId?: string): Promise<void> {
  if (!sessionId) return;
  try {
    await fetch(`${getApiBaseUrl()}/api/v1/voice/session/end`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        action: "start_voice",
      }),
    });
  } catch (err) {
    console.warn("Failed to report voice session release:", err);
  }
}

/**
 * Fetch verified source citation metadata for the latest voice turn (Milestone 13P.13: P13P.13.5).
 */
export async function fetchLatestVoiceCitations(
  sessionId?: string,
  signal?: AbortSignal
): Promise<VoiceTurnCitationResponse | null> {
  try {
    const url = new URL(`${getApiBaseUrl()}/api/v1/voice/citations/latest`);
    if (sessionId) {
      url.searchParams.set("session_id", sessionId);
    }
    const res = await fetch(url.toString(), { signal });
    if (!res.ok) return null;
    const data = await res.json();
    return data || null;
  } catch (err) {
    console.warn("Failed to fetch voice turn citations:", err);
    return null;
  }
}


