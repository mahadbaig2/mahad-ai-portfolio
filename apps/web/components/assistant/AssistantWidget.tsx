"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { MessageSquare, Mic, X, Maximize2 } from "lucide-react";
import { useAssistantWidget } from "./AssistantWidgetContext";
import { CompactChatTab } from "./CompactChatTab";
import { ConversationalVoiceTab } from "./ConversationalVoiceTab";

export function AssistantWidget() {
  const {
    isOpen,
    invitationVisible,
    activeTab,
    toggleWidget,
    closeWidget,
    openWidget,
    dismissInvitation,
    setActiveTab,
  } = useAssistantWidget();
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* 1. Compact 5-Second Invitation Toast (Non-intrusive visual-only prompt) */}
      {invitationVisible && !isOpen && (
        <aside
          role="complementary"
          aria-label="Assistant Inquiry Invitation"
          className="assistant-invitation fixed bottom-24 right-5 z-40 w-80 max-w-[calc(100vw-2.5rem)] rounded-xl border border-hairline bg-surface-white p-4 text-on-surface shadow-widget animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-primary">
              <span className="inline-block h-2 w-2 rounded-full bg-primary-container" />
              <span>Ask about my work</span>
            </div>
            <button
              type="button"
              onClick={dismissInvitation}
              aria-label="Dismiss inquiry invitation"
              className="rounded p-0.5 text-muted-text hover:text-primary hover:bg-mint transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-2 text-xs font-sans text-on-surface-variant leading-relaxed">
            Projects, experience, and the engineering decisions behind them.
          </p>

          <div className="mt-3.5 pt-2.5 border-t border-hairline/70 flex items-center gap-2">
            <button
              type="button"
              onClick={() => openWidget("chat")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded bg-primary-container text-on-primary text-xs font-medium py-2 px-3 hover:bg-primary transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Ask a Question</span>
            </button>
            <button
              type="button"
              onClick={() => openWidget("voice")}
              className="inline-flex items-center justify-center gap-1 rounded border border-hairline bg-paper text-primary text-xs font-medium py-2 px-3 hover:bg-mint transition-colors"
            >
              <Mic className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
              <span>Try Voice</span>
            </button>
          </div>
        </aside>
      )}

      {/* 2. Floating Bottom-Right Launcher */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={toggleWidget}
          aria-expanded={isOpen}
          aria-controls="assistant-companion-panel"
          aria-label={isOpen ? "Close Talk to Mahad assistant" : "Open Talk to Mahad assistant"}
          className="assistant-launcher group relative flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary-container text-on-primary shadow-widget transition-transform duration-200 hover:bg-primary hover:-translate-y-0.5 motion-reduce:transition-none"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-on-primary" />
          ) : (
            <MessageSquare className="h-5 w-5 text-on-primary" />
          )}
        </button>
      </div>

      {/* 3. Responsive Companion Panel (Green Editorial Styling) */}
      {isOpen && (
        <div
          id="assistant-companion-panel"
          ref={panelRef}
          role="region"
          aria-label="Talk to Mahad conversational companion"
          className="assistant-panel fixed inset-x-0 bottom-0 z-50 flex flex-col h-[85vh] sm:h-[600px] sm:w-[420px] sm:bottom-24 sm:right-5 sm:left-auto rounded-t-2xl sm:rounded-2xl border border-hairline bg-paper shadow-widget overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3 bg-surface-white">
            <div className="flex items-center gap-2.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary-container" />
              <div>
                <h2 className="font-serif text-base font-medium text-primary leading-tight">
                  Talk to Mahad
                </h2>
                <p className="font-mono text-[11px] text-muted-text">
                  Grounded portfolio companion
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/chat"
                onClick={closeWidget}
                title="Open full chat with execution inspector"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-paper text-primary hover:bg-mint transition-colors"
              >
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">Open full chat page</span>
              </Link>

              <button
                type="button"
                onClick={closeWidget}
                title="Close companion"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-paper text-primary hover:bg-error-container hover:text-on-error-container transition-colors"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Close widget</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs: Chat & Voice */}
          <div
            role="tablist"
            aria-label="Assistant mode"
            className="grid grid-cols-2 border-b border-hairline bg-mint/60 p-1.5 gap-1 font-mono text-xs font-medium"
          >
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              aria-selected={activeTab === "chat"}
              role="tab"
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-colors ${
                activeTab === "chat"
                  ? "bg-primary-container text-on-primary shadow-editorial-sm"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-white"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Text Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("voice")}
              aria-selected={activeTab === "voice"}
              role="tab"
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-colors ${
                activeTab === "voice"
                  ? "bg-primary-container text-on-primary shadow-editorial-sm"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-white"
              }`}
            >
              <Mic className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Voice Agent</span>
            </button>
          </div>

          {/* Active Tab View */}
          <div className="flex-1 overflow-y-auto bg-paper">
            {activeTab === "chat" ? <CompactChatTab /> : <ConversationalVoiceTab />}
          </div>
        </div>
      )}
    </>
  );
}
