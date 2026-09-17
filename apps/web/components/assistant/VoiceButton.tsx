"use client";

/**
 * VoiceButton — Push-to-talk voice capture component (Phase 12).
 *
 * States:
 *   idle        → shows mic icon; explicit click required to start (P12.1.1)
 *   requesting  → waiting for browser permission
 *   denied      → mic unavailable; shows locked icon; text chat unaffected (P12.1.2)
 *   recording   → animated indicator; max 60 s enforced (P12.1.3 / P12.1.4)
 *   transcribing→ spinner while Groq processes audio
 *   error       → transient error badge; resets to idle
 *
 * Audio is NOT submitted until the user explicitly sends the form (P12.1.5).
 * The transcript is passed to onTranscript() so the parent can populate the
 * editable textarea (P12.2.4).
 *
 * Respects prefers-reduced-motion.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Square } from "lucide-react";
import { transcribeAudio, TranscriptionError } from "@/lib/assistant/transcribe";

// Maximum recording duration in seconds (P12.1.3)
const MAX_DURATION_SECONDS = 60;

// Preferred MIME types in priority order; we pick the first supported one
const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4",
];

export type VoiceState = "idle" | "requesting" | "denied" | "recording" | "transcribing" | "error";

export interface VoiceButtonProps {
  /** Called with the final transcript text when transcription succeeds. */
  onTranscript: (text: string) => void;
  /** Disabled when the assistant is already streaming a response. */
  disabled?: boolean;
}

export function VoiceButton({ onTranscript, disabled = false }: VoiceButtonProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Respect prefers-reduced-motion
  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Clean up all refs on unmount
  useEffect(() => {
    return () => {
      _stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const _stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const _resetTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    timerRef.current = null;
    maxTimerRef.current = null;
    setElapsedSeconds(0);
  };

  /** Pick the first MIME type MediaRecorder supports on this browser. */
  const _pickMime = (): string => {
    for (const mime of PREFERRED_MIME_TYPES) {
      if (MediaRecorder.isTypeSupported(mime)) return mime;
    }
    return "";
  };

  /** Stop recording and trigger transcription. */
  const _finishRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop(); // triggers onstop → _transcribe
  }, []);

  /** Perform transcription of the captured chunks. */
  const _transcribe = useCallback(
    async (blob: Blob, mimeType: string) => {
      setVoiceState("transcribing");
      abortRef.current = new AbortController();

      try {
        const result = await transcribeAudio(blob, mimeType, abortRef.current.signal);
        if (result.transcript.trim()) {
          onTranscript(result.transcript);
        } else {
          setErrorMessage("No speech detected. Please try again.");
          setVoiceState("error");
          setTimeout(() => setVoiceState("idle"), 3000);
          return;
        }
      } catch (err) {
        if (err instanceof TranscriptionError && err.code === "ABORTED") {
          // User cancelled — silently return to idle
        } else {
          const msg =
            err instanceof TranscriptionError
              ? err.message
              : "Transcription failed. Please try again.";
          setErrorMessage(msg);
          setVoiceState("error");
          setTimeout(() => setVoiceState("idle"), 4000);
          return;
        }
      } finally {
        abortRef.current = null;
      }

      setVoiceState("idle");
    },
    [onTranscript]
  );

  /** Start capture after permission is granted. */
  const _startRecording = useCallback(
    (stream: MediaStream) => {
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = _pickMime();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        _stopStream();
        _resetTimers();
        const blob = new Blob(chunksRef.current, {
          type: mimeType || recorder.mimeType || "audio/webm",
        });
        chunksRef.current = [];
        _transcribe(blob, mimeType || recorder.mimeType || "audio/webm");
      };

      recorder.start(250); // collect chunks every 250 ms
      setVoiceState("recording");
      setElapsedSeconds(0);

      // Elapsed timer — updates every second
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);

      // Hard max duration (P12.1.3)
      maxTimerRef.current = setTimeout(() => {
        _finishRecording();
      }, MAX_DURATION_SECONDS * 1000);
    },
    [_finishRecording, _transcribe]
  );

  /** User pressed the mic button — request permission then start. */
  const handleMicClick = useCallback(async () => {
    if (disabled || voiceState !== "idle") return;

    setVoiceState("requesting");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setVoiceState("denied");
      return;
    }

    _startRecording(stream);
  }, [disabled, voiceState, _startRecording]);

  /** User clicked Stop while recording. */
  const handleStop = useCallback(() => {
    _finishRecording();
  }, [_finishRecording]);

  /** User clicked Delete/Cancel — discard audio and reset. */
  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    _stopStream();
    _resetTimers();
    setVoiceState("idle");
  }, []);

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  const _formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  if (voiceState === "denied") {
    return (
      <div className="flex items-center gap-1.5" role="status" aria-live="polite">
        <button
          type="button"
          disabled
          title="Microphone access denied. Enable it in browser settings."
          aria-label="Microphone access denied"
          className="inline-flex items-center justify-center rounded p-1.5 text-muted-foreground opacity-50 cursor-not-allowed"
        >
          <MicOff className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="text-[10px] text-muted-foreground">Mic blocked</span>
      </div>
    );
  }

  if (voiceState === "recording") {
    return (
      <div className="flex items-center gap-2" role="status" aria-live="polite">
        {/* Animated red dot */}
        <span
          className={`h-2 w-2 rounded-full bg-red-500 ${prefersReduced ? "" : "animate-pulse"}`}
          aria-hidden="true"
        />
        <span className="text-[10px] tabular-nums text-muted-foreground" aria-label="Recording duration">
          {_formatTime(elapsedSeconds)} / {_formatTime(MAX_DURATION_SECONDS)}
        </span>
        <button
          type="button"
          onClick={handleStop}
          title="Stop recording"
          aria-label="Stop recording"
          className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] font-medium text-foreground hover:bg-muted"
        >
          <Square className="h-3 w-3 fill-current" aria-hidden="true" />
          Stop
        </button>
        <button
          type="button"
          onClick={handleCancel}
          title="Cancel and discard recording"
          aria-label="Cancel recording"
          className="text-[10px] text-muted-foreground hover:text-foreground underline"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (voiceState === "transcribing") {
    return (
      <div className="flex items-center gap-1.5" role="status" aria-live="polite">
        <Loader2
          className={`h-4 w-4 text-muted-foreground ${prefersReduced ? "" : "animate-spin"}`}
          aria-hidden="true"
        />
        <span className="text-[10px] text-muted-foreground">Transcribing…</span>
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Cancel transcription"
          className="text-[10px] text-muted-foreground hover:text-foreground underline"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (voiceState === "error") {
    return (
      <div className="flex items-center gap-1.5" role="alert" aria-live="assertive">
        <MicOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[160px]">
          {errorMessage}
        </span>
      </div>
    );
  }

  // idle / requesting
  return (
    <button
      id="voice-input-button"
      type="button"
      onClick={handleMicClick}
      disabled={disabled || voiceState === "requesting"}
      title={voiceState === "requesting" ? "Requesting microphone access…" : "Hold to speak"}
      aria-label={voiceState === "requesting" ? "Requesting microphone access" : "Voice input"}
      className="inline-flex items-center justify-center rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {voiceState === "requesting" ? (
        <Loader2
          className={`h-4 w-4 ${prefersReduced ? "" : "animate-spin"}`}
          aria-hidden="true"
        />
      ) : (
        <Mic className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
