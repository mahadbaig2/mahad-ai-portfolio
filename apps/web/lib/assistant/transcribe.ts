/**
 * Client-side transcription helper — Phase 12, P12.2.2/P12.2.3.
 *
 * Sends a bounded audio Blob to the FastAPI transcription endpoint and returns
 * the transcript text and detected language. Audio is uploaded once; the blob
 * is never stored client-side beyond the function call lifetime.
 */

import { getApiBaseUrl } from "./client";

export interface TranscriptionResult {
  transcript: string;
  language: string;
  duration_seconds: number;
}

export class TranscriptionError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "TranscriptionError";
  }
}

/**
 * Upload an audio Blob to Groq Whisper via the FastAPI backend.
 *
 * @param blob     - Captured audio blob from MediaRecorder
 * @param mimeType - MIME type reported by MediaRecorder (e.g. "audio/webm")
 * @param signal   - Optional AbortSignal for cancellation
 */
export async function transcribeAudio(
  blob: Blob,
  mimeType: string,
  signal?: AbortSignal
): Promise<TranscriptionResult> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/v1/transcription/transcribe`;

  const form = new FormData();
  // Provide a filename so the backend can infer format; Groq also uses it
  const ext = _extForMime(mimeType);
  form.append("audio", blob, `recording.${ext}`);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      body: form,
      signal,
    });
  } catch (networkErr) {
    if ((networkErr as Error).name === "AbortError") {
      throw new TranscriptionError("ABORTED", "Transcription was cancelled.");
    }
    throw new TranscriptionError(
      "NETWORK_ERROR",
      "Could not reach the transcription service. Check your connection."
    );
  }

  if (!response.ok) {
    let errorCode = "TRANSCRIPTION_FAILED";
    let errorMessage = `Transcription failed (HTTP ${response.status}).`;

    try {
      const body = await response.json();
      if (body?.detail?.error_code) errorCode = body.detail.error_code;
      if (body?.detail?.message) errorMessage = body.detail.message;
    } catch {
      // JSON parse failed — use defaults above
    }

    throw new TranscriptionError(errorCode, errorMessage);
  }

  const data = await response.json();
  return {
    transcript: data.transcript ?? "",
    language: data.language ?? "unknown",
    duration_seconds: data.duration_seconds ?? 0,
  };
}

function _extForMime(mime: string): string {
  const map: Record<string, string> = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/mp4": "mp4",
    "audio/wav": "wav",
    "audio/mpeg": "mp3",
  };
  return map[mime.split(";")[0].trim()] ?? "bin";
}
