import Link from "next/link";
import { ArrowLeft, Clock, Terminal, Shield, Cpu } from "lucide-react";
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
    <div className="bg-[#fcf9f2] min-h-screen">
      {/* Top Telemetry Header */}
      <div className="border-b-2 border-[#11110f] bg-[#f3f0e9] py-1.5 px-4 font-mono text-[10px] uppercase tracking-wider text-[#11110f]/80">
        <div className="mx-auto max-w-content flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 bg-[#416654]" />
            <span>AI ASSISTANT TERMINAL // ACTIVE</span>
          </div>
          <div className="hidden sm:block">
            <span>MODEL: ONNX-QUANTIZED // STREAM: SSE // ZERO-DOLLAR INFRA</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-content px-4 py-10 sm:px-6 sm:py-14 space-y-10">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#11110f] hover:text-[#861933] transition-colors mb-6 font-bold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>

          <header className="border-2 border-[#11110f] bg-white p-6 sm:p-8 stamp-shadow">
            <div className="inline-flex items-center gap-2 border border-[#11110f] bg-[#fcf9f2] px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-[#11110f] mb-4">
              <span className="h-2 w-2 bg-[#416654]" />
              <span>Interactive Production Assistant</span>
            </div>

            <h1 className="font-display text-3xl font-black uppercase tracking-tight sm:text-5xl text-[#11110f]">
              Talk to Mahad Assistant
            </h1>

            <p className="mt-4 text-base text-[#11110f]/85 font-sans leading-relaxed max-w-3xl">
              Ask questions about Mahad&apos;s engineering projects, architectural decisions, and career experience.
              Every answer is routed in-process via ONNX, strictly grounded in verifiable records, and inspected in real time.
            </p>

            <div className="mt-5 pt-4 border-t border-[#11110f]/15 flex flex-wrap gap-4 font-mono text-[11px] uppercase tracking-wider text-[#11110f]/75">
              <span>● English &amp; Roman Urdu</span>
              <span>● Verifiable Citations</span>
              <span>● Inspectable Telemetry</span>
              <span>● Read-Only / Zero Hallucination</span>
            </div>
          </header>
        </div>

        {/* Main Interactive Chat Interface */}
        <section aria-label="Conversational Assistant">
          <ChatInterface />
        </section>

        {/* Architecture & Delivery Roadmap */}
        <section className="border-2 border-[#11110f] bg-white p-6 sm:p-8 stamp-shadow">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-[#11110f]" />
            <h2 className="font-mono text-base font-bold uppercase tracking-wider text-[#11110f]">
              Engineering Delivery Roadmap
            </h2>
          </div>
          <p className="font-sans text-xs text-[#11110f]/75 mb-6 max-w-prose leading-relaxed">
            The assistant is architected milestone-by-milestone under strict zero-dollar operating cost budgets.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {milestones.map((m, idx) => (
              <div key={idx} className="border border-[#11110f] bg-[#fcf9f2] p-4 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold text-[#861933] uppercase tracking-wider">
                    {m.phase}
                  </span>
                  <span className="border border-[#11110f] bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-[#11110f]">
                    {m.status}
                  </span>
                </div>
                <h3 className="font-mono font-bold text-sm uppercase text-[#11110f]">{m.title}</h3>
                <p className="mt-2 font-sans text-xs text-[#11110f]/80 leading-relaxed">{m.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
