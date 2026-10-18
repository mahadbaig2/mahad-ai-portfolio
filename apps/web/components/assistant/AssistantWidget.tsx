"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { MessageSquare, Mic, X, Maximize2, Sparkles, Terminal, ArrowRight } from "lucide-react";
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
      {/* 1. Compact 5-Second Invitation Toast (Non-intrusive Section 17 Specification) */}
      {invitationVisible && !isOpen && (
        <aside
          role="complementary"
          aria-label="Assistant Inquiry Invitation"
          className="fixed bottom-24 right-5 z-40 w-80 max-w-[calc(100vw-2.5rem)] rounded-none border-2 border-[#11110f] bg-[#fcf9f2] p-4 text-[#11110f] stamp-shadow animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#416654]">
              <span className="inline-block h-2 w-2 bg-[#416654]" />
              <span>Looking for something specific?</span>
            </div>
            <button
              onClick={dismissInvitation}
              aria-label="Dismiss inquiry invitation"
              className="p-0.5 text-[#11110f]/60 hover:text-[#11110f] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#11110f]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="mt-2 text-xs font-sans text-[#11110f] leading-relaxed">
            &ldquo;Ask about my work, experience, or technical decisions.&rdquo;
          </p>

          <div className="mt-3.5 pt-2.5 border-t border-[#11110f]/15 flex items-center gap-2">
            <button
              onClick={() => openWidget("chat")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#11110f] text-[#fcf9f2] text-[11px] font-mono uppercase tracking-wider py-1.5 px-2 hover:bg-[#360d11] transition-colors font-bold"
            >
              <MessageSquare className="h-3 w-3" />
              <span>Ask a Question</span>
            </button>
            <button
              onClick={() => openWidget("voice")}
              className="inline-flex items-center justify-center gap-1 border border-[#11110f] bg-transparent text-[#11110f] text-[11px] font-mono uppercase tracking-wider py-1.5 px-2.5 hover:bg-[#11110f]/10 transition-colors font-bold"
            >
              <Mic className="h-3 w-3 text-[#416654]" />
              <span>Try Voice</span>
            </button>
          </div>
        </aside>
      )}

      {/* 2. Floating Bottom-Right Launcher (Fixed h-14 w-14 with Neo-brutalist stamp-shadow) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={toggleWidget}
          aria-expanded={isOpen}
          aria-controls="assistant-companion-panel"
          aria-label={isOpen ? "Close Talk to Mahad assistant" : "Open Talk to Mahad assistant"}
          className="group relative flex h-14 w-14 items-center justify-center rounded-none border-2 border-[#11110f] bg-[#11110f] text-[#fcf9f2] stamp-shadow transition-transform duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11110f] focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-[#fcf9f2] transition-transform duration-200 motion-reduce:transition-none" />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Terminal className="h-5 w-5 text-[#8AAB7A] group-hover:scale-110 transition-transform duration-200" />
              <span className="font-mono text-[8px] font-bold tracking-tighter uppercase text-[#fcf9f2] mt-0.5">AI</span>
            </div>
          )}
          {/* Subtle status pulse when closed */}
          {!isOpen && (
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping bg-[#8AAB7A] opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex h-3.5 w-3.5 border-2 border-[#11110f] bg-[#416654]" />
            </span>
          )}
        </button>
      </div>

      {/* 3. Responsive Companion Panel (Neo-brutalist styling) */}
      {isOpen && (
        <div
          id="assistant-companion-panel"
          ref={panelRef}
          role="region"
          aria-label="Talk to Mahad conversational companion"
          className="fixed inset-x-0 bottom-0 z-50 flex flex-col h-[85vh] sm:h-[600px] sm:w-[420px] sm:bottom-22 sm:right-5 sm:left-auto rounded-none border-2 border-[#11110f] bg-[#fcf9f2] stamp-shadow overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#11110f] px-4 py-3 bg-[#fcf9f2]">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 bg-[#416654]" />
              <div>
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#11110f]">
                  TALK TO MAHAD <span className="text-[#861933] font-normal">{`// AI COMPANION`}</span>
                </h2>
                <p className="font-mono text-[9px] uppercase tracking-wider text-[#11110f]/70">
                  ONNX ROUTED · ZERO-DOLLAR ARCH
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Open Full Chat Link */}
              <Link
                href="/chat"
                onClick={closeWidget}
                title="Open full chat with execution inspector"
                className="flex h-8 w-8 items-center justify-center border border-[#11110f] bg-white text-[#11110f] hover:bg-[#11110f] hover:text-[#fcf9f2] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#11110f]"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="sr-only">Open full chat page</span>
              </Link>

              {/* Close Button */}
              <button
                onClick={closeWidget}
                title="Close companion"
                className="flex h-8 w-8 items-center justify-center border border-[#11110f] bg-white text-[#11110f] hover:bg-[#861933] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#11110f]"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close widget</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs: Chat & Voice */}
          <div className="grid grid-cols-2 border-b-2 border-[#11110f] bg-[#f3f0e9] p-1 font-mono text-[11px] font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab("chat")}
              aria-selected={activeTab === "chat"}
              role="tab"
              className={`flex items-center justify-center gap-1.5 py-1.5 border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#11110f] ${
                activeTab === "chat"
                  ? "border-[#11110f] bg-[#11110f] text-[#fcf9f2]"
                  : "border-transparent text-[#11110f]/70 hover:text-[#11110f] hover:bg-white"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>TEXT CHAT</span>
            </button>

            <button
              onClick={() => setActiveTab("voice")}
              aria-selected={activeTab === "voice"}
              role="tab"
              className={`flex items-center justify-center gap-1.5 py-1.5 border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#11110f] ${
                activeTab === "voice"
                  ? "border-[#11110f] bg-[#11110f] text-[#fcf9f2]"
                  : "border-transparent text-[#11110f]/70 hover:text-[#11110f] hover:bg-white"
              }`}
            >
              <Mic className="h-3.5 w-3.5 text-[#8AAB7A]" />
              <span>VOICE AGENT</span>
            </button>
          </div>

          {/* Active Tab View */}
          <div className="flex-1 overflow-y-auto bg-[#fcf9f2]">
            {activeTab === "chat" ? <CompactChatTab /> : <ConversationalVoiceTab />}
          </div>
        </div>
      )}
    </>
  );
}
