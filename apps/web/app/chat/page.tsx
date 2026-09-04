import Link from "next/link";
import { Terminal, ArrowRight, ArrowLeft, Cpu, Database, Network, ShieldCheck, Clock } from "lucide-react";

export const metadata = {
  title: "Talk to Mahad (In Development) | AI Product Engineering",
  description:
    "Grounded AI assistant and execution inspector roadmap for Mahad's portfolio.",
};

export default function ChatPlaceholderPage() {
  const milestones = [
    {
      phase: "Phase 1",
      title: "Portfolio Web Foundation & Quality Gate",
      status: "Verified",
      detail: "Next.js 15, React 19, strict TypeScript, WCAG 2.1 AA accessibility, and automated CI tests.",
    },
    {
      phase: "Phase 2",
      title: "Sanity CMS & Managed Structured Content",
      status: "In Progress",
      detail: "Headless CMS schemas for projects, case studies, articles, and citations.",
    },
    {
      phase: "Phases 3–5",
      title: "FastAPI, Neon PostgreSQL & Qdrant Hybrid RAG",
      status: "Planned",
      detail: "Relational source-of-truth, derived 384-d vector embeddings, and in-process ONNX router.",
    },
    {
      phase: "Phases 6–8",
      title: "LangGraph State Engine, SSE Streaming & Voice",
      status: "Planned",
      detail: "Typed state machine, Server-Sent Events live streaming, and Execution Inspector telemetry.",
    },
  ];

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-24">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Home</span>
      </Link>

      <header className="max-w-prose">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground mb-4">
          <Clock className="h-3 w-3 text-foreground" />
          <span>Milestone Roadmap • Phases 3–8</span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
          Talk to Mahad Assistant
        </h1>

        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          The conversational assistant and live Execution Inspector are currently
          in active development. In accordance with this repository&apos;s strict
          engineering discipline (<strong className="text-foreground">AGENTS.md</strong>),
          the interface will be activated once the underlying ML router, Neon
          PostgreSQL persistence, and Qdrant RAG pipeline are fully built and
          verified.
        </p>
      </header>

      {/* Target Architecture Overview */}
      <div className="mt-12 rounded border border-border p-6 sm:p-8 bg-white max-w-3xl">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          <span>Planned System Topology</span>
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          When deployed, the assistant will answer technical questions regarding
          Mahad&apos;s experience, case studies, and engineering decisions using
          strictly cited sources. Every request will expose real-time routing
          confidence, latency budgets, and retrieval scores via the Execution
          Inspector.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded border border-border p-4 bg-muted/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Cpu className="h-3.5 w-3.5" />
              <span>In-Process ML Classifier</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Target latency &lt; 5ms for intent classification, route prediction,
              and Roman Urdu detection without LLM API overhead.
            </p>
          </div>

          <div className="rounded border border-border p-4 bg-muted/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Database className="h-3.5 w-3.5" />
              <span>Dual-Persistence RAG</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Qdrant derived vector index paired with Neon PostgreSQL canonical
              chunks for 100% rebuildable, grounded retrieval.
            </p>
          </div>

          <div className="rounded border border-border p-4 bg-muted/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Network className="h-3.5 w-3.5" />
              <span>LangGraph Orchestration</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Typed state graph with conditional retry boundaries and Server-Sent
              Events token streaming.
            </p>
          </div>

          <div className="rounded border border-border p-4 bg-muted/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Zero-Cost Operational Guardrails</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Circuit breakers, quota monitoring, and graceful fallback across
              permanent free-tier cloud resources.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 border-t border-border pt-6">
          <Link
            href="/work/talk-to-mahad"
            className="inline-flex items-center gap-1.5 rounded bg-foreground px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            <span>Inspect System Architecture Case Study</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 rounded border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-foreground"
          >
            <span>Browse Completed Work</span>
          </Link>
        </div>
      </div>

      {/* Engineering Milestone Progress */}
      <section className="mt-16 max-w-3xl border-t border-border pt-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Engineering Delivery Roadmap
        </h2>

        <div className="mt-6 flex flex-col divide-y divide-border border-y border-border">
          {milestones.map((m) => (
            <div key={m.phase} className="py-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <div>
                <span className="text-xs font-medium text-foreground mr-2">{m.phase}:</span>
                <span className="text-xs sm:text-sm font-semibold text-foreground">{m.title}</span>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{m.detail}</p>
              </div>
              <span className={`text-[11px] font-medium shrink-0 self-start sm:self-auto rounded px-2 py-0.5 border ${
                m.status === "Verified"
                  ? "border-foreground text-foreground bg-muted/20"
                  : m.status === "In Progress"
                  ? "border-border text-foreground font-semibold"
                  : "border-border text-muted-foreground"
              }`}>
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
