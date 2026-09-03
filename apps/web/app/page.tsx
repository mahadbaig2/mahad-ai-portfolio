import Link from "next/link";
import { ArrowRight, Terminal, Cpu, Database, Network } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-24">
      {/* Hero Section */}
      <section className="flex flex-col gap-6 max-w-prose">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground"></span>
          AI Product Engineering Portfolio
        </div>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Hi, I&apos;m Mahad.
        </h1>

        <p className="text-base text-muted-foreground sm:text-lg leading-relaxed">
          This is an{" "}
          <strong className="font-semibold text-foreground">
            intentionally over-engineered portfolio site
          </strong>{" "}
          showcasing deep AI Product Engineering, product design, and strategic
          decision-making capabilities, architectural rigor, and end-to-end
          craftsmanship.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded bg-foreground px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Terminal className="h-4 w-4" />
            <span>Talk to Mahad Assistant</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 rounded border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground"
          >
            <span>View Selected Work</span>
          </Link>
        </div>
      </section>

      {/* System Highlights / Architecture Callouts */}
      <section className="mt-20 border-t border-border pt-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          System Architecture Highlights
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-border p-5">
            <div className="flex items-center gap-2 text-foreground font-medium text-sm">
              <Cpu className="h-4 w-4" />
              <span>In-Process ML Router</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Custom classifier exported to ONNX serving intent, route, and Roman
              Urdu predictions in &lt; 5ms without LLM latency.
            </p>
          </div>

          <div className="rounded border border-border p-5">
            <div className="flex items-center gap-2 text-foreground font-medium text-sm">
              <Database className="h-4 w-4" />
              <span>Hydrated RAG</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Qdrant vector index paired with Neon PostgreSQL canonical chunks.
              100% rebuildable, versioned, and cited.
            </p>
          </div>

          <div className="rounded border border-border p-5">
            <div className="flex items-center gap-2 text-foreground font-medium text-sm">
              <Network className="h-4 w-4" />
              <span>LangGraph Workflow</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Typed state graph with conditional edges, bounded retry, and
              observable Execution Inspector for full transparency.
            </p>
          </div>

          <div className="rounded border border-border p-5">
            <div className="flex items-center gap-2 text-foreground font-medium text-sm">
              <Terminal className="h-4 w-4" />
              <span>Strict Zero-Cost Ops</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Engineered exclusively on permanent free tiers with strict
              quota-capping and monthly audit runbooks.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
