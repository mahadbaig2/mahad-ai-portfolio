"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChatMessage,
  ExecutionStep,
  PersonaType,
  RouteLabel,
} from "@/lib/assistant/types";
import { streamAssistantMessage } from "@/lib/assistant/client";
import { ModeSelector } from "./ModeSelector";
import { ExecutionInspector } from "./ExecutionInspector";
import { CitationsCard } from "./CitationsCard";
import {
  Send,
  Square,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Shield,
  Loader2,
  Sparkles,
  Bot,
  User,
  Check,
} from "lucide-react";

const SUGGESTED_PROMPTS: Record<PersonaType, string[]> = {
  recruiter: [
    "What is Mahad's core engineering tech stack and experience?",
    "Is Mahad available for remote software engineering roles?",
    "What production systems has Mahad shipped?",
  ],
  engineer: [
    "Why use an in-process ONNX model for query routing instead of an LLM?",
    "How does dual-persistence between Neon PostgreSQL and Qdrant work?",
    "What are the LangGraph state machine recursion and retry limits?",
  ],
  founder: [
    "How does the AI portfolio run on a permanent $0.00/month budget?",
    "Can Mahad build end-to-end products from UI to backend ML?",
    "What are the latency tradeoffs of this architecture?",
  ],
  general: [
    "Give me an overview of Mahad's AI engineering background.",
    "Tell me about the Grounded AI Portfolio Assistant.",
    "Mahad ka background kya hai aur usne kon se AI projects banaye hain?",
  ],
};

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [persona, setPersona] = useState<PersonaType>("general");
  const [consentGiven, setConsentGiven] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "up" | "down">>({});
  const [feedbackReason, setFeedbackReason] = useState<Record<string, string>>({});
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStep]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setCurrentStep(null);
  };

  const handleClear = () => {
    handleStop();
    setMessages([]);
    setCurrentStep(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputValue.trim();
    if (!query || isStreaming) return;

    setInputValue("");
    const userMessageId = `user_${Date.now()}`;
    const assistantMessageId = `assistant_${Date.now()}`;

    const userMsg: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const initialAssistantMsg: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      isStreaming: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      executionSteps: [],
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setIsStreaming(true);
    setCurrentStep("Classifying query with ONNX model...");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const accumulatedSteps: ExecutionStep[] = [];

    await streamAssistantMessage(
      {
        message: query,
        persona,
        consent_given: consentGiven,
        history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      },
      {
        onProgress: (step) => {
          accumulatedSteps.push(step);
          if (step.step_name === "classify_query") {
            setCurrentStep("Routing query via in-process classifier...");
          } else if (step.step_name === "retrieve_context") {
            setCurrentStep("Searching Qdrant and Neon PostgreSQL...");
          } else if (step.step_name === "generate_grounded_response") {
            setCurrentStep("Generating cited answer...");
          } else {
            setCurrentStep(`Executing: ${step.step_name}...`);
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, executionSteps: [...accumulatedSteps] }
                : msg
            )
          );
        },
        onToken: (delta) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + delta }
                : msg
            )
          );
        },
        onDone: (response) => {
          setIsStreaming(false);
          setCurrentStep(null);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: response.answer,
                    citations: response.citations,
                    route: response.route,
                    isStreaming: false,
                    executionSteps: response.execution_steps || accumulatedSteps,
                  }
                : msg
            )
          );
        },
        onError: (err) => {
          setIsStreaming(false);
          setCurrentStep(null);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: `Service temporarily unavailable (${err.message || "Network error"}). Please retry in a moment.`,
                    isStreaming: false,
                  }
                : msg
            )
          );
        },
      },
      controller.signal
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape" && isStreaming) {
      handleStop();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-content mx-auto">
      {/* Perspective Mode Selector */}
      <ModeSelector
        currentPersona={persona}
        onSelect={(p) => setPersona(p)}
        disabled={isStreaming}
      />

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="rounded-lg border border-border bg-card/40 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Suggested Inquiries ({persona.toUpperCase()})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS[persona].map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputValue(prompt);
                  textareaRef.current?.focus();
                }}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transcript Area */}
      <div
        className="flex flex-col gap-4 min-h-[320px] rounded-lg border border-border bg-background p-4 sm:p-6 overflow-y-auto max-h-[600px]"
        role="log"
        aria-live="polite"
        aria-label="Conversation history"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground my-auto">
            <Bot className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm font-medium text-foreground">Ask Mahad&apos;s Assistant</p>
            <p className="text-xs max-w-sm mt-1">
              Grounded on verified Sanity CMS records, technical case studies, and career history with transparent citations.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="h-7 w-7 rounded-full bg-foreground text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`flex flex-col max-w-[85%] sm:max-w-[75%] rounded-lg p-3.5 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-foreground text-white"
                    : "border border-border bg-card text-foreground"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content || (msg.isStreaming && "...")}</div>

                {/* Citations Card */}
                {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
                  <CitationsCard citations={msg.citations} />
                )}

                {/* Execution Inspector */}
                {msg.role === "assistant" && (
                  <ExecutionInspector
                    route={msg.route}
                    executionSteps={msg.executionSteps}
                    isStreaming={msg.isStreaming}
                  />
                )}

                {/* User Feedback */}
                {msg.role === "assistant" && !msg.isStreaming && msg.content && (
                  <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
                    <span className="font-mono">{msg.timestamp}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setFeedbackGiven((prev) => ({ ...prev, [msg.id]: "up" }))
                        }
                        className={`p-1 rounded hover:bg-muted ${
                          feedbackGiven[msg.id] === "up" ? "text-foreground font-semibold" : ""
                        }`}
                        title="Mark as helpful"
                        aria-label="Helpful response"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFeedbackGiven((prev) => ({ ...prev, [msg.id]: "down" }));
                          setActiveFeedbackId(msg.id);
                        }}
                        className={`p-1 rounded hover:bg-muted ${
                          feedbackGiven[msg.id] === "down" ? "text-foreground font-semibold" : ""
                        }`}
                        title="Mark as unhelpful"
                        aria-label="Unhelpful response"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Optional Feedback Reason Modal/Input */}
                {activeFeedbackId === msg.id && (
                  <div className="mt-2 p-2 rounded border border-border bg-background">
                    <label className="block text-[10px] text-muted-foreground mb-1">
                      Optional: Tell us what could be improved
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g., missing specific project details"
                        value={feedbackReason[msg.id] || ""}
                        onChange={(e) =>
                          setFeedbackReason((prev) => ({ ...prev, [msg.id]: e.target.value }))
                        }
                        className="flex-1 rounded border border-border px-2 py-1 text-[10px] bg-card text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => setActiveFeedbackId(null)}
                        className="px-2 py-1 rounded bg-foreground text-white text-[10px]"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="h-7 w-7 rounded-full bg-muted border border-border text-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Streaming / Functional Progress State */}
        {isStreaming && currentStep && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-1 px-2 animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>{currentStep}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Controls Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="relative rounded-lg border border-border bg-background focus-within:border-foreground transition-all">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Mahad's projects, architecture, or engineering decisions (English or Roman Urdu)..."
            className="w-full resize-none bg-transparent p-3 text-xs outline-none text-foreground placeholder:text-muted-foreground"
            aria-label="Ask a question"
          />

          <div className="flex items-center justify-between border-t border-border/60 px-3 py-2 bg-muted/10">
            {/* Affirmative Consent Checkbox (P11.1.5) */}
            <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="h-3 w-3 rounded border-border text-foreground focus:ring-0"
              />
              <Shield className="h-3 w-3" />
              <span>Allow telemetry logging for quality</span>
            </label>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isStreaming}
                  className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                  title="Clear conversation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </button>
              )}

              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="inline-flex items-center gap-1 rounded bg-muted border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/80"
                >
                  <Square className="h-3 w-3 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="inline-flex items-center gap-1 rounded bg-foreground px-3.5 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40"
                >
                  <Send className="h-3 w-3" />
                  <span>Send</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>Zero-dollar permanent free-tier architecture</span>
        </div>
      </form>
    </div>
  );
}
