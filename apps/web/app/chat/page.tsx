import Link from "next/link";
import { ArrowLeft, BookOpen, FolderGit2, ShieldCheck } from "lucide-react";
import { ChatInterface } from "@/components/assistant/ChatInterface";

export const metadata = {
  title: "Talk to Mahad | Mirza Mahad Baig",
  description: "Ask grounded questions about Mirza Mahad Baig’s projects, architecture decisions, and engineering experience.",
};

export default function ChatPage() {
  return (
    <div className="w-full bg-paper min-h-screen">
      {/* Top Editorial Header & Scope Disclosure */}
      <section className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 pt-10 pb-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sage text-primary font-mono text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                Grounded Retrieval Assistant
              </span>
              <span className="font-mono text-xs text-muted-text">
                ONNX Routing · LangGraph · Cited RAG
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-primary tracking-tight">
              Talk to the portfolio.
            </h1>
            <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Ask grounded questions about Mahad’s projects, technical architecture decisions, experience, and product design work. Answers depend on the connected assistant service being available.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/work"
              className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface-white hover:bg-mint px-4 py-2 text-sm font-medium text-primary transition-colors shadow-editorial-sm"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Work Archive</span>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface-white hover:bg-mint px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors shadow-editorial-sm"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>Background</span>
            </Link>
            <Link
              href="/writing"
              className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface-white hover:bg-mint px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors shadow-editorial-sm"
            >
              <FolderGit2 className="h-4 w-4" aria-hidden="true" />
              <span>Writing</span>
            </Link>
          </div>
        </div>

        {/* Explicit Non-Human Disclosure Banner */}
        <div className="w-full bg-mint/70 border border-hairline rounded-xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <div className="p-2 rounded-lg bg-surface-white border border-hairline text-primary shrink-0">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-medium text-primary uppercase tracking-wider">
                  AI Portfolio Assistant
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sage font-mono text-[11px] text-primary">
                  Explicit Non-Human Disclosure
                </span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                This is an automated AI assistant grounded on Mahad’s published portfolio records—you are not speaking directly with Mahad. Factual answers cite retrieved chunks; unsupported questions clarify or refuse rather than guessing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Chat Panel Container */}
      <section className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 pb-16">
        <div className="rounded-2xl border border-hairline bg-surface-white p-4 sm:p-6 shadow-editorial">
          <ChatInterface />
        </div>
      </section>
    </div>
  );
}
