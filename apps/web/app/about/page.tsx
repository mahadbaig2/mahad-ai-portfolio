import Link from "next/link";
import { ArrowRight, Terminal, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "About Mahad | AI Product Engineering",
  description:
    "Career narrative, engineering philosophy, and technical depth of Mahad.",
};

export default function AboutPage() {
  const competencies = [
    {
      area: "AI Product Engineering",
      skills:
        "FastAPI, LangGraph, Qdrant, PostgreSQL, ONNX Runtime, Groq, Whisper, OpenVoice, Prompt Engineering, Semantic Caching",
    },
    {
      area: "Product Design & Architecture",
      skills:
        "Information Hierarchy, High-Craft Interaction, WCAG AA Accessibility, Progressive Disclosure, Design Systems, State Management",
    },
    {
      area: "MLOps & LLMOps",
      skills:
        "LangSmith Evaluation, MLflow Experiment Tracking, Dataset Curation, Classification Metrics, Retrieval Evaluation (Hit@K, MRR)",
    },
    {
      area: "Frontend & Full Stack",
      skills:
        "Next.js 15, React 19, TypeScript (Strict), Tailwind CSS, Python 3.11+, Docker, Cloudflare Pages/Workers, CI/CD",
    },
  ];

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-24">
      <header className="max-w-prose">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
          About Mahad
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          AI Product Engineer focused on building robust, inspectable, and
          economically viable AI systems from research prototype to production.
        </p>
      </header>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Main Narrative */}
        <div className="flex flex-col gap-8 lg:col-span-2 text-base text-foreground leading-relaxed max-w-prose">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Career Narrative
            </h2>
            <p>
              I sit at the intersection of applied machine learning, software
              craftsmanship, and product design. Rather than viewing AI as a black
              box or treating LLMs as magic APIs, I approach AI systems with the
              same rigor expected in distributed systems: bounded latency,
              deterministic failure modes, verifiable metrics, and strict cost
              discipline.
            </p>
            <p className="mt-4">
              My engineering philosophy revolves around solving real-world
              problems with the simplest architecture that delivers the outcome.
              When an in-process ONNX classifier can route queries in 3ms, I do
              not call a 500ms LLM API. When a derived vector index can be
              rebuilt from relational truth, I avoid lock-in.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Why This Portfolio is Over-Engineered
            </h2>
            <p>
              This website is intentionally designed as a working proof of
              capability. It is not a static brochure with an LLM chat widget. It
              is a full microservice architecture featuring an in-process ML
              classifier, dual-persistence RAG (Neon + Qdrant), LangGraph state
              machine with explicit conditional recovery, push-to-talk voice, and
              a live Execution Inspector.
            </p>
            <p className="mt-4">
              Crucially, every component operates entirely on free-tier
              infrastructure with $0.00 in monthly bills, proving that
              world-class AI engineering is driven by architectural elegance
              rather than unbounded compute spending.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Core Principles
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                <span>
                  <strong>Grounded Answers Only:</strong> Factual responses must
                  cite verifiable sources; otherwise, the system clarifies or
                  refuses.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                <span>
                  <strong>Cost & Quota Safety:</strong> Zero unexpected bills.
                  Explicit quotas, circuit breakers, and automatic graceful
                  degradation.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                <span>
                  <strong>Radical Transparency:</strong> The execution inspector
                  exposes routing confidence, model versions, and pipeline timing
                  in real time.
                </span>
              </li>
            </ul>
          </section>
        </div>

        {/* Competencies Sidebar */}
        <aside className="flex flex-col gap-8 lg:border-l lg:border-border lg:pl-8">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Technical Competencies
            </h3>
            <div className="mt-4 flex flex-col gap-4">
              {competencies.map((comp) => (
                <div
                  key={comp.area}
                  className="rounded border border-border p-4"
                >
                  <div className="text-xs font-semibold text-foreground">
                    {comp.area}
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                    {comp.skills}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border border-border p-4 bg-muted/30">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5" />
              <span>Talk to Mahad</span>
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Have questions about my background, career decisions, or technical
              philosophy? Ask the AI assistant.
            </p>
            <Link
              href="/chat"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
            >
              <span>Launch Assistant &rarr;</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
