"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChatMessage,
  ExecutionStep,
  PersonaType,
  RouteLabel,
} from "@/lib/assistant/types";
import { streamAssistantMessage, checkAssistantHealth } from "@/lib/assistant/client";
import { ModeSelector } from "./ModeSelector";
import { ExecutionInspector } from "./ExecutionInspector";
import { CitationsCard } from "./CitationsCard";
import { VoiceButton } from "./VoiceButton";
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
  RefreshCw,
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

const CHAT_STORAGE_KEY = "mahad_chat_history_v1";

function formatMessageContentWithCitations(
  content: string,
  citations?: string[],
  citationDetails?: any[]
): string {
  if (!content) return content;
  let formatted = content;

  // 1. Normalize fullwidth Chinese/Japanese citation brackets into standard brackets
  formatted = formatted.replace(/【([0-9a-fA-F-]{36})】/g, "[$1]");

  // 2. Map chunk UUIDs to clean indexed links
  if (citationDetails && citationDetails.length > 0) {
    for (const item of citationDetails) {
      if (!item.chunk_id) continue;
      const escaped = item.chunk_id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`[\\\[【]${escaped}[\\\]】]?`, "gi");
      const titleAttr = item.title ? ` "${item.title.replace(/"/g, "'")}"` : "";
      formatted = formatted.replace(
        pattern,
        `[[${item.index}]](${item.url || "/about"}${titleAttr})`
      );

      // Also map bare numeric brackets e.g. [1] to [[1]](url) if not already linked
      const numPattern = new RegExp(`(?<!\\[)\\[${item.index}\\](?!\\]|\\()`, "g");
      formatted = formatted.replace(
        numPattern,
        `[[${item.index}]](${item.url || "/about"}${titleAttr})`
      );
    }
  } else if (citations && citations.length > 0) {
    citations.forEach((cid, idx) => {
      const escaped = cid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`[\\\[【]${escaped}[\\\]】]?`, "gi");
      const isCaseStudy =
        cid.includes("case") || cid.includes("talk") || cid.includes("portfolio");
      const targetUrl = isCaseStudy ? "/work/talk-to-mahad" : "/about";
      formatted = formatted.replace(pattern, `[[${idx + 1}]](${targetUrl})`);

      const numPattern = new RegExp(`(?<!\\[)\\[${idx + 1}\\](?!\\]|\\()`, "g");
      formatted = formatted.replace(numPattern, `[[${idx + 1}]](${targetUrl})`);
    });
  }

  // 3. Purge any remaining raw UUID brackets, partial UUIDs, or truncated brackets (e.g. 【99158c88-445f... or [99158c88...)
  formatted = formatted.replace(
    /[\[【][0-9a-fA-F]{8}(-[0-9a-fA-F]{0,4})*[\]】]?/g,
    ""
  );

  // 4. Clean up any accidental double spaces
  formatted = formatted.replace(/  +/g, " ");

  return formatted;
}

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

  const [lastUserQuery, setLastUserQuery] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Proactively ping health endpoint on mount to wake up sleeping free-tier backend (Hugging Face Spaces)
  useEffect(() => {
    checkAssistantHealth().catch(() => {});
  }, []);

  // Restore persisted chat from sessionStorage across page navigation
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.map((m: ChatMessage) => ({ ...m, isStreaming: false })));
        }
      }
    } catch (e) {
      console.warn("Failed to load chat history from sessionStorage", e);
    }
  }, []);

  // Persist messages whenever chat updates (and not actively streaming)
  useEffect(() => {
    try {
      if (messages.length > 0 && !isStreaming) {
        sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch (e) {
      // ignore
    }
  }, [messages, isStreaming]);

  /** P12.2.4 — transcript from VoiceButton lands here for user review before submit. */
  const handleTranscript = (text: string) => {
    setInputValue(text);
    // Focus the textarea so the user can edit before sending
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

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
    setLastUserQuery(null);
    try {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  const handleSubmit = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const query = (overrideQuery ?? inputValue).trim();
    if (!query || isStreaming) return;

    setLastUserQuery(query);
    if (!overrideQuery) setInputValue("");
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
        history: messages
          .filter((m) => !m.isError && (m.role === "user" || m.role === "assistant") && m.content)
          .slice(-10)
          .map((m) => ({
            role: m.role,
            content: m.content.slice(0, 3900),
          })),
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
                    citation_details: response.citation_details,
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
                    content: `⚠️ **Service temporarily unreachable** (${err.message || "Connection failed"}).\n\nIf the AI service is waking up from free-tier sleep, it takes ~20 seconds to boot. Please retry shortly.`,
                    isStreaming: false,
                    isError: true,
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
                {msg.role === "user" ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div className="prose prose-neutral dark:prose-invert max-w-none text-xs leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-sm font-bold text-foreground mt-3 mb-1.5 first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xs font-bold text-foreground mt-2.5 mb-1 first:mt-0">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xs font-semibold text-foreground mt-2 mb-0.5 first:mt-0">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0 leading-relaxed text-foreground">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-4 space-y-1 mb-2 last:mb-0 text-foreground">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-4 space-y-1 mb-2 last:mb-0 text-foreground">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-foreground">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target={href?.startsWith("http") ? "_blank" : undefined}
                            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="font-medium underline underline-offset-2 text-foreground hover:opacity-80 transition-opacity"
                          >
                            {children}
                          </a>
                        ),
                        code: ({ inline, children }: any) =>
                          inline ? (
                            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                              {children}
                            </code>
                          ) : (
                            <pre className="my-2 overflow-x-auto rounded border border-border bg-muted/50 p-2.5 font-mono text-[11px] text-foreground">
                              <code>{children}</code>
                            </pre>
                          ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-border pl-3 my-2 italic text-muted-foreground">
                            {children}
                          </blockquote>
                        ),
                        table: ({ children }) => (
                          <div className="my-2.5 overflow-x-auto rounded border border-border">
                            <table className="min-w-full divide-y divide-border text-left text-[11px]">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-muted/60">{children}</thead>
                        ),
                        tbody: ({ children }) => (
                          <tbody className="divide-y divide-border/60 bg-card">{children}</tbody>
                        ),
                        tr: ({ children }) => (
                          <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
                        ),
                        th: ({ children }) => (
                          <th className="px-2.5 py-1.5 font-semibold text-foreground whitespace-nowrap">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-2.5 py-1.5 text-foreground/90 align-top">
                            {children}
                          </td>
                        ),
                      }}
                    >
                      {formatMessageContentWithCitations(
                        msg.content,
                        msg.citations,
                        msg.citation_details
                      ) || (msg.isStreaming ? "..." : "")}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Error Retry Control */}
                {msg.role === "assistant" && msg.isError && lastUserQuery && (
                  <button
                    type="button"
                    onClick={() => handleSubmit(undefined, lastUserQuery)}
                    disabled={isStreaming}
                    className="mt-2.5 inline-flex items-center gap-1.5 self-start rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Retry Request</span>
                  </button>
                )}

                {/* Citations Card */}
                {msg.role === "assistant" &&
                  ((msg.citations && msg.citations.length > 0) ||
                    (msg.citation_details && msg.citation_details.length > 0)) && (
                    <CitationsCard
                      citations={msg.citations}
                      citationDetails={msg.citation_details}
                    />
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
              {/* Voice input — always available as alternative to typing (P12.1.1) */}
              <VoiceButton
                onTranscript={handleTranscript}
                disabled={isStreaming}
              />

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
