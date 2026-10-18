"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Mic, X, Maximize2, Sparkles, ExternalLink } from "lucide-react";
import { useAssistantWidget } from "./AssistantWidgetContext";
import { CompactChatTab } from "./CompactChatTab";
import { ConversationalVoiceTab } from "./ConversationalVoiceTab";

export function AssistantWidget() {
  const { isOpen, activeTab, toggleWidget, closeWidget, setActiveTab } = useAssistantWidget();
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* 1. Floating Bottom-Right Launcher (P13P.6.4) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={toggleWidget}
          aria-expanded={isOpen}
          aria-controls="assistant-companion-panel"
          aria-label={isOpen ? "Close Talk to Mahad assistant" : "Open Talk to Mahad assistant"}
          className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          {isOpen ? (
            <X className="h-5 w-5 transition-transform duration-200 motion-reduce:transition-none" />
          ) : (
            <div className="flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-200 motion-reduce:transition-none" />
              <span className="sr-only">Talk to Mahad</span>
            </div>
          )}
          {/* Subtle status pulse when closed */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background" />
            </span>
          )}
        </button>
      </div>

      {/* 2. Responsive Companion Panel (P13P.6.5 & P13P.6.6) */}
      {isOpen && (
        <div
          id="assistant-companion-panel"
          ref={panelRef}
          role="region"
          aria-label="Talk to Mahad conversational companion"
          className="fixed inset-x-0 bottom-0 z-50 flex flex-col h-[85vh] sm:h-[560px] sm:w-[380px] sm:bottom-20 sm:right-5 sm:left-auto rounded-t-2xl sm:rounded-2xl border border-border bg-background shadow-2xl overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">Talk to Mahad</h2>
                <p className="text-[11px] text-muted-foreground">AI Companion</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* P13P.6.9: Open Full Chat Link */}
              <Link
                href="/chat"
                onClick={closeWidget}
                title="Open full chat with execution inspector"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              >
                <Maximize2 className="h-4 w-4" />
                <span className="sr-only">Open full chat page</span>
              </Link>

              {/* Close Button */}
              <button
                onClick={closeWidget}
                title="Close companion"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close widget</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs: Chat & Voice (P13P.6.7) */}
          <div className="grid grid-cols-2 border-b border-border bg-muted/10 p-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab("chat")}
              aria-selected={activeTab === "chat"}
              role="tab"
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground ${
                activeTab === "chat"
                  ? "bg-background font-semibold text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => setActiveTab("voice")}
              aria-selected={activeTab === "voice"}
              role="tab"
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground ${
                activeTab === "voice"
                  ? "bg-background font-semibold text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mic className="h-3.5 w-3.5 text-emerald-500" />
              <span>Voice</span>
            </button>
          </div>

          {/* Active Tab View */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "chat" ? <CompactChatTab /> : <ConversationalVoiceTab />}
          </div>
        </div>
      )}
    </>
  );
}
