"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Square, Trash2, ExternalLink, Bot, User, Loader2 } from "lucide-react";
import { streamAssistantMessage } from "@/lib/assistant/client";
import { formatMessageContentWithCitations, extractCompactCitations, CompactCitationChip } from "@/lib/assistant/citations";
import { ChatMessage } from "@/lib/assistant/types";

export function CompactChatTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || isStreaming) return;

    setError(null);
    setInput("");

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    const assistantPlaceholderId = `ast_${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantPlaceholderId,
      role: "assistant",
      content: "",
      isStreaming: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const historyPayload = messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await streamAssistantMessage(
      {
        message: query,
        persona: "general",
        mode: "text",
        history: historyPayload,
      },
      {
        onToken: (delta) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantPlaceholderId
                ? { ...m, content: m.content + delta }
                : m
            )
          );
        },
        onDone: (res) => {
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantPlaceholderId
                ? {
                    ...m,
                    content: res.answer,
                    citations: res.citations,
                    citation_details: res.citation_details,
                    isStreaming: false,
                  }
                : m
            )
          );
        },
        onError: (err) => {
          setIsStreaming(false);
          setError(err.message || "Failed to receive response");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantPlaceholderId
                ? {
                    ...m,
                    content: err.message || "An error occurred while answering your question. Please try again or open the full chat.",
                    isError: true,
                    isStreaming: false,
                  }
                : m
            )
          );
        },
      },
      abortController.signal
    );
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground space-y-2">
            <Bot className="h-8 w-8 text-foreground/40" />
            <p className="font-medium text-foreground">Ask anything about Mahad</p>
            <p className="text-[11px] leading-relaxed">
              Explore projects, architectural decisions, and career experience grounded in verifiable data.
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center pt-2">
              {[
                "What is Mahad's tech stack?",
                "Tell me about CardioScan",
                "Why in-process ONNX routing?",
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion)}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-foreground hover:bg-muted transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === "user";
            const compactCitations: CompactCitationChip[] = !isUser
              ? extractCompactCitations(m.citations, m.citation_details)
              : [];

            return (
              <div
                key={m.id}
                className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-full bg-muted text-foreground">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-lg p-2.5 text-xs leading-relaxed ${
                    isUser
                      ? "bg-foreground text-background"
                      : m.isError
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : "bg-muted/50 text-foreground border border-border/50"
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <div>
                      {m.content ? (
                        <div className="prose prose-xs max-w-none dark:prose-invert">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ href, children, title }) => (
                                <Link
                                  href={href || "#"}
                                  title={title}
                                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline decoration-dotted hover:decoration-solid"
                                >
                                  {children}
                                </Link>
                              ),
                            }}
                          >
                            {formatMessageContentWithCitations(
                              m.content,
                              m.citations,
                              m.citation_details
                            )}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground py-1">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      )}

                      {/* Compact Citations Chips (P13P.5.6) */}
                      {compactCitations.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/40 flex flex-wrap gap-1">
                          <span className="text-[10px] text-muted-foreground w-full">Sources:</span>
                          {compactCitations.map((chip) => (
                            <Link
                              key={chip.chunk_id}
                              href={chip.url}
                              className="inline-flex items-center gap-1 rounded bg-background px-1.5 py-0.5 text-[10px] text-foreground border border-border hover:bg-muted transition-colors"
                            >
                              <span>[{chip.index}]</span>
                              <span className="truncate max-w-[120px]">{chip.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-full bg-foreground text-background">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer controls & prompt input */}
      <div className="p-3 border-t border-border bg-background">
        <div className="flex items-center justify-between mb-2 text-[11px] text-muted-foreground">
          <span>Grounded portfolio assistant</span>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              title="Clear messages"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isStreaming}
            className="flex-1 rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-50"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={handleStop}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors"
              title="Stop response"
            >
              <Square className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              title="Send message"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
