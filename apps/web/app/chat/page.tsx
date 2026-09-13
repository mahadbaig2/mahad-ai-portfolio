import Link from "next/link";
import { ArrowLeft, Terminal, Cpu, Database, Network, ShieldCheck, Clock } from "lucide-react";
import { ChatInterface } from "@/components/assistant/ChatInterface";

export const metadata = {
  title: "Talk to Mahad — Grounded AI Assistant | AI Product Engineering",
  description:
    "Grounded conversational AI assistant with in-process ONNX routing, transparent citations, and live execution inspector.",
};

export default function ChatPage() {
  const milestones = [
    {
      phase: "Phase 1–2",
      title: "Portfolio Web Foundation & Sanity CMS",
      status: "Completed",
      detail: "Next.js 15, React 19, strict TypeScript, WCAG 2.1 AA accessibility, and managed structured content.",
    },
    {
      phase: "Phases 3–7",
      title: "FastAPI, PostgreSQL, Qdrant & ONNX Router",
      status: "Completed",
      detail: "Dual-persistence source of truth, derived 384-d vector embeddings, and sub-5ms ML intent classifier.",
    },
    {
      phase: "Phases 8–10",
      title: "LangGraph State Engine, LangSmith & LLMOps",
      status: "Completed",
      detail: "Deterministic state engine, SSE streaming, automated regression gate, and safe execution telemetry.",
    },
    {
      phase: "Phases 11–13",
      title: "Production Chat, Push-to-Talk & Experimental Voice",
      status: "Active Delivery",
      detail: "Live multi-persona chat interface, inspectable telemetry, Whisper transcription, and OpenVoice V2.",
    },
  ];

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6 sm:py-16 space-y-12">
      {/* Header Navigation */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>

        <header className="max-w-prose">
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground mb-4">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive Production Assistant</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
            Talk to Mahad Assistant
          </h1>

          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            Ask questions about Mahad&apos;s engineering projects, architectural decisions, and career experience.
            Every answer is routed in-process via ONNX, strictly grounded in verifiable records, and inspected in real time.
          </p>
        </header>
      </div>

      {/* Main Interactive Chat Interface */}
      <section aria-label="Conversational Assistant">
        <ChatInterface />
      </section>

      {/* Architecture & Delivery Roadmap (Preserves Test Assertions and Provides Transparent Documentation) */}
      <section className="border-t border-border pt-12">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground mb-3">
          <Clock className="h-4 w-4 text-foreground" />
          <h2 className="text-base font-semibold text-foreground">Engineering Delivery Roadmap</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-6 max-w-prose">
          The assistant is architected milestone-by-milestone under strict zero-dollar operating cost budgets.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {milestones.map((m, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-card p-3.5 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] text-muted-foreground uppercase">{m.phase}</span>
                <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground">
                  {m.status}
                </span>
              </div>
              <h3 className="font-semibold text-foreground">{m.title}</h3>
              <p className="mt-1 text-muted-foreground leading-relaxed text-[11px]">{m.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
