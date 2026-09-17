/**
 * Client-side SSE streaming and API client for the Talk to Mahad Assistant.
 * Milestones 11.1 - 11.3.
 */

import {
  AssistantChatRequest,
  AssistantChatResponse,
  ExecutionStep,
  PersonaType,
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
