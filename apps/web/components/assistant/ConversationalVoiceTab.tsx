"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Mic, MicOff, Square, PhoneOff, Volume2, ShieldCheck, Clock, AlertCircle, MessageSquare, ExternalLink } from "lucide-react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { requestVoiceToken, endVoiceSession, fetchVoiceConfig, fetchLatestVoiceCitations } from "@/lib/assistant/client";
import { extractCompactCitations, CompactCitationChip } from "@/lib/assistant/citations";
import { useAssistantWidget } from "./AssistantWidgetContext";

interface VoiceTranscriptEntry {
  id: string;
  source: "user" | "ai";
  text: string;
  citations?: string[];
  citation_details?: any[];
}

function ConversationalVoiceContent() {
  const { setActiveTab } = useAssistantWidget();
  const [sessionState, setSessionState] = useState<
    "idle" | "requesting_permission" | "connecting" | "active" | "ended" | "quota_exhausted" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(120);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<VoiceTranscriptEntry[]>([]);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  activeSessionIdRef.current = activeSessionId;

  const handleSessionEnd = useCallback((reason?: string) => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    if (activeSessionIdRef.current) {
      endVoiceSession(activeSessionIdRef.current);
      activeSessionIdRef.current = null;
      setActiveSessionId(null);
    }

    setSessionState("ended");
  }, []);

  const conversation = useConversation({
    onConnect: () => {
      setSessionState("active");
      setRemainingSeconds(120);
      setTranscripts([]);
    },
    onDisconnect: (details: any) => {
      handleSessionEnd(details?.reason || "Conversation ended");
    },
    onMessage: async (message: any) => {
      if (message && message.message) {
        const isAi = message.source !== "user";
        const entryId = `turn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newEntry: VoiceTranscriptEntry = {
          id: entryId,
          source: isAi ? "ai" : "user",
          text: message.message,
        };

        setTranscripts((prev) => [...prev.slice(-4), newEntry]);

        if (isAi) {
          // Fetch citations for this latest AI turn (Milestone 13P.13: P13P.13.5, P13P.13.6)
          try {
            const citData = await fetchLatestVoiceCitations(activeSessionIdRef.current || undefined);
            if (citData && citData.citation_details && citData.citation_details.length > 0) {
              setTranscripts((prev) =>
                prev.map((item) =>
                  item.id === entryId
                    ? {
                        ...item,
                        citations: citData.citations,
                        citation_details: citData.citation_details,
                      }
                    : item
                )
              );
            }
          } catch (err) {
            console.warn("Failed to retrieve turn citations:", err);
          }
        }
      }
    },
    onError: (err) => {
      console.error("ElevenLabs conversation error:", err);
      const errStr = String(err);
      if (errStr.includes("quota") || errStr.includes("401") || errStr.includes("429")) {
        setSessionState("quota_exhausted");
        setErrorMessage("Monthly voice conversation allowance reached. Please continue in text chat.");
      } else {
        setSessionState("error");
        setErrorMessage("Voice connection lost. You can continue in text chat.");
      }
    },
  });

  const conversationRef = useRef(conversation);
  conversationRef.current = conversation;

  // Handle page unload or tab closing safely (P13P.9.17)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (conversationRef.current?.status === "connected") {
        conversationRef.current.endSession();
      }
      if (activeSessionIdRef.current) {
        endVoiceSession(activeSessionIdRef.current);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Enforce strict 120-second session countdown (P13P.9.14)
  useEffect(() => {
    if (sessionState === "active") {
      countdownTimerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            conversationRef.current?.endSession();
            handleSessionEnd("Session duration limit reached (120s)");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [sessionState, handleSessionEnd]);

  // Clean up SDK and mic resources ONLY on unmount
  useEffect(() => {
    return () => {
      if (conversationRef.current?.status === "connected") {
        conversationRef.current.endSession();
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, []);

  const handleStartVoice = async () => {
    try {
      setSessionState("requesting_permission");
      setErrorMessage(null);

      // P13P.9.5: Request microphone permission ONLY after explicit start
      await navigator.mediaDevices.getUserMedia({ audio: true });

      setSessionState("connecting");
      const sessionId = `voice_${Date.now()}`;
      setActiveSessionId(sessionId);

      // P13P.4.1: Obtain short-lived token from backend
      const tokenData = await requestVoiceToken(sessionId);

      // P13P.4.1: Connect via ElevenLabs signedUrl (WebSocket) or token (WebRTC)
      if (tokenData.signed_url) {
        await conversation.startSession({
          signedUrl: tokenData.signed_url,
          connectionType: "websocket",
        });
      } else if (tokenData.token) {
        await conversation.startSession({
          conversationToken: tokenData.token,
          connectionType: "webrtc",
        });
      } else {
        await conversation.startSession({
          agentId: tokenData.agent_id,
          connectionType: "websocket",
        });
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setSessionState("error");
        setErrorMessage("Microphone access was denied. You can continue in text chat.");
      } else if (err.code === "PROVIDER_QUOTA_EXHAUSTED") {
        setSessionState("quota_exhausted");
        setErrorMessage("Monthly voice conversation allowance reached. Please continue in text chat.");
      } else if (err.code === "CONCURRENCY_LIMIT_REACHED") {
        setSessionState("error");
        setErrorMessage("Another voice conversation is currently active. Please try again shortly or use text chat.");
      } else {
        console.error("Failed to start voice session:", err);
        setSessionState("error");
        setErrorMessage(err.message || "Unable to start voice session. Please continue in text chat.");
      }
    }
  };

  const handleStopSpeaking = () => {
    // If agent is speaking, interrupt it
    if (conversation.isSpeaking) {
      conversation.sendUserActivity();
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      conversation.setVolume({ volume: 1.0 });
      setIsMuted(false);
    } else {
      conversation.setVolume({ volume: 0 });
      setIsMuted(true);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-between p-4 bg-background text-center">
      {/* 1. Header Disclosures */}
      <div className="space-y-1.5 w-full">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-2.5 py-0.5 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>2-minute session limit</span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Grounded conversational voice companion with real-time speech synthesis.
        </p>
      </div>

      {/* 2. Main Visual Indicator & Session Controls */}
      <div className="my-auto flex flex-col items-center justify-center space-y-4">
        {/* Pulsing Visualizer Circle */}
        <div className="relative flex items-center justify-center">
          <div
            className={`h-24 w-24 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
              sessionState === "active"
                ? conversation.isSpeaking
                  ? "border-emerald-500 bg-emerald-500/10 scale-105"
                  : "border-emerald-400 bg-emerald-400/5 animate-pulse"
                : sessionState === "connecting" || sessionState === "requesting_permission"
                ? "border-amber-400 bg-amber-400/5 animate-spin"
                : "border-border bg-muted/20"
            }`}
          >
            {sessionState === "active" ? (
              conversation.isSpeaking ? (
                <Volume2 className="h-10 w-10 text-emerald-500 animate-pulse" />
              ) : (
                <Mic className="h-10 w-10 text-emerald-500" />
              )
            ) : isMuted ? (
              <MicOff className="h-10 w-10 text-muted-foreground" />
            ) : (
              <Mic className="h-10 w-10 text-muted-foreground/60" />
            )}
          </div>

          {/* Active Status Badge */}
          {sessionState === "active" && (
            <span className="absolute -bottom-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              {conversation.isSpeaking ? "Speaking" : "Listening"}
            </span>
          )}
        </div>

        {/* Status / Countdown Text */}
        {sessionState === "active" ? (
          <div className="space-y-1">
            <p className="font-mono text-sm font-semibold text-foreground">
              {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, "0")} remaining
            </p>
            {remainingSeconds <= 10 ? (
              <p className="text-[11px] text-destructive font-semibold animate-pulse">
                Session ending in {remainingSeconds}s
              </p>
            ) : remainingSeconds <= 30 ? (
              <p className="text-[11px] text-amber-500 font-medium">Session ending soon (30s remaining)</p>
            ) : null}

            {transcripts.length > 0 && (
              <div className="max-w-[285px] text-left text-[11px] max-h-24 overflow-y-auto px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border/50 space-y-2 mt-2">
                {transcripts.slice(-2).map((t) => {
                  const compactCitations =
                    t.source === "ai" && t.citation_details
                      ? extractCompactCitations(t.citations, t.citation_details)
                      : [];

                  return (
                    <div key={t.id} className="space-y-1">
                      <p className={t.source === "user" ? "text-foreground font-medium" : "text-muted-foreground leading-relaxed"}>
                        <span className="font-semibold mr-1">{t.source === "user" ? "You:" : "Mahad:"}</span>
                        {t.text}
                      </p>

                      {/* Compact source chips beneath voice transcript entries (P13P.13.6) */}
                      {t.source === "ai" && compactCitations.length > 0 && (
                        <div className="pt-1 flex flex-wrap items-center gap-1">
                          <span className="text-[9px] font-semibold text-muted-foreground/80">Sources:</span>
                          {compactCitations.map((chip) => (
                            <Link
                              key={chip.chunk_id}
                              href={chip.url}
                              className="inline-flex items-center gap-1 rounded bg-background px-1.5 py-0.5 text-[9px] font-medium text-foreground border border-border hover:bg-muted transition-colors"
                            >
                              <span className="truncate max-w-[140px]">{chip.title}</span>
                              <ExternalLink className="h-2 w-2 opacity-60" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : sessionState === "connecting" ? (
          <p className="text-xs text-muted-foreground">Connecting to ElevenLabs...</p>
        ) : sessionState === "requesting_permission" ? (
          <p className="text-xs text-muted-foreground">Please grant microphone access...</p>
        ) : sessionState === "ended" ? (
          <div className="space-y-1">
            <p className="text-xs font-medium text-foreground">Session completed</p>
            <p className="text-[11px] text-muted-foreground">You can continue exploring in text chat.</p>
          </div>
        ) : sessionState === "quota_exhausted" ? (
          <div className="space-y-1 text-amber-500">
            <AlertCircle className="h-5 w-5 mx-auto" />
            <p className="text-xs font-semibold">Monthly Voice Allowance Reached</p>
            <p className="text-[11px] text-muted-foreground">{errorMessage}</p>
          </div>
        ) : sessionState === "error" ? (
          <div className="space-y-1 text-destructive">
            <AlertCircle className="h-5 w-5 mx-auto" />
            <p className="text-xs font-semibold">Voice Unavailable</p>
            <p className="text-[11px] text-muted-foreground">{errorMessage}</p>
          </div>
        ) : null}

        {/* Primary Action Button */}
        {sessionState === "idle" || sessionState === "ended" || sessionState === "error" ? (
          <button
            onClick={handleStartVoice}
            className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold text-background shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          >
            <Mic className="h-4 w-4 text-emerald-400" />
            <span>Start Voice Conversation</span>
          </button>
        ) : sessionState === "active" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            {conversation.isSpeaking && (
              <button
                onClick={handleStopSpeaking}
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                title="Interrupt spoken response"
              >
                <Square className="h-3 w-3" />
                <span>Stop speaking</span>
              </button>
            )}

            <button
              onClick={() => {
                conversation.endSession();
                handleSessionEnd("User stopped");
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              title="End conversation"
            >
              <PhoneOff className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      {/* 3. Footer Fallback & Disclaimer */}
      <div className="w-full pt-2 border-t border-border/40 space-y-2">
        <button
          onClick={() => setActiveTab("chat")}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline transition-all"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Continue in text chat</span>
        </button>

        <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
          AI-generated synthetic voice. Spoken answers are strictly grounded in portfolio records.
        </p>
      </div>
    </div>
  );
}

export function ConversationalVoiceTab() {
  return (
    <ConversationProvider>
      <ConversationalVoiceContent />
    </ConversationProvider>
  );
}
