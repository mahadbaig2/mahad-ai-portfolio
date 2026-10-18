import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  ArrowUpRight,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Terminal,
  Github,
  Layers,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Playground & Lab Experiments | Mirza Mahad Baig // AI Product Engineer",
  description:
    "Prototypes, technical explorations, hackathon builds, and experiments where Mirza Mahad Baig tests product interactions, architectures, and models.",
};

interface Experiment {
  id: string;
  title: string;
  status: "Completed Prototype" | "Active Exploration" | "Archived Experiment";
  category: string;
  date: string;
  hypothesis: string;
  built: string;
  worked: string;
  failed: string;
  next: string;
  repoUrl?: string;
  demoUrl?: string;
}

const EXPERIMENTS: Experiment[] = [
  {
    id: "LAB-01",
    title: "In-Process ONNX Query Routing & Roman Urdu Detection",
    status: "Completed Prototype",
    category: "Machine Learning / CPU Inference",
    date: "2025–2026",
    hypothesis:
      "A compact MiniLM or logistic regression classifier exported to ONNX Runtime can reliably predict intent, route (RAG vs. deterministic), and detect Roman Urdu on CPU in under 5ms, eliminating LLM latency and API spend.",
    built:
      "Trained a 4-class multi-output classifier in scikit-learn / Hugging Face, exported to ONNX format, and mounted in-process inside FastAPI at application startup.",
    worked:
      "Sub-4ms classification latency on single CPU core; 100% precision on high-confidence greetings, contact lookups, and clear Roman Urdu queries.",
    failed:
      "Boundary queries with ambiguous phrasing (e.g. asking about both design and pricing) exhibited lower confidence, requiring safe deterministic fallback routing.",
    next:
      "Benchmark INT8 quantized transformer models to improve semantic nuance while staying strictly within the 5ms latency window.",
    repoUrl: "https://github.com/mahadbaig2/mahad-ai-portfolio",
    demoUrl: "/chat",
  },
  {
    id: "LAB-02",
    title: "Automated RAG Retrieval Regression Gate in CI",
    status: "Completed Prototype",
    category: "LLMOps & Evaluation",
    date: "2025",
    hypothesis:
      "Automating Hit@5 and MRR evaluation across gold-standard questions in GitHub Actions can block PRs before inaccurate chunking degrades production answers.",
    built:
      "A deterministic normalization and Qdrant ingestion script paired with a Python test harness that executes 50 canonical test queries against staged vectors.",
    worked:
      "Successfully blocked an experimental chunk size modification that caused a 12% regression in retrieval recall for technical case studies.",
    failed:
      "Synthetic test query generation generated overly simplistic questions that did not mirror the linguistic diversity of real recruiters.",
    next:
      "Maintain a locked, human-authored evaluation dataset with strict paraphrase leakage prevention across splits.",
    repoUrl: "https://github.com/mahadbaig2/mahad-ai-portfolio",
  },
  {
    id: "LAB-03",
    title: "Conversational Companion with Server-Enforced Quota Safeguards",
    status: "Active Exploration",
    category: "Real-Time Voice AI",
    date: "2026",
    hypothesis:
      "A persistent floating widget with real-time ElevenLabs conversational voice can provide high engagement while server-enforced 120-second session limits and monthly quota degradation prevent unexpected cloud bills.",
    built:
      "React companion widget with separate Text and Voice tabs, backed by a FastAPI OpenAI-compatible proxy adapter that connects to the LangGraph RAG pipeline.",
    worked:
      "Conversational audio streaming with natural turn-taking; clear countdown timer informing the user of remaining seconds; zero client-exposed API keys.",
    failed:
      "Mobile browser autoplay restrictions require strict user-gesture initiation before audio context initialization.",
    next:
      "Implement adaptive sample-rate negotiation to improve conversational stability over high-latency cellular connections.",
    demoUrl: "/chat",
  },
  {
    id: "LAB-04",
    title: "Document Table Extraction for Enterprise Tax Filings",
    status: "Archived Experiment",
    category: "Document AI & Vision",
    date: "2024",
    hypothesis:
      "Pairing OCR bounding boxes with schema-enforced Pydantic extraction can digitize low-quality scanned IRS tax forms with zero manual data entry.",
    built:
      "Multi-stage pipeline utilizing vision models for table identification followed by structured JSON extraction using function calling.",
    worked:
      "Achieved high accuracy on clean digital PDFs and standardized 1040/W-2 schedules.",
    failed:
      "Low-resolution smartphone scans with non-uniform lighting and crumpled folds caused table boundary hallucination and digit misreads.",
    next:
      "Pre-processing pipeline utilizing perspective correction and contrast-limited adaptive histogram equalization (CLAHE).",
  },
];

export default function PlaygroundPage() {
  return (
    <div className="w-full bg-background text-on-surface">
      {/* Top Subheader Metrics Strip */}
      <div className="w-full bg-surface-container border-b-[1.5px] border-primary px-6 py-2 flex flex-wrap justify-between items-center font-mono text-xs text-on-surface-variant overflow-x-auto gap-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-primary">SECTION: 004 // LAB & R&D PROTOTYPES</span>
          <span>·</span>
          <span>DIR: /EXPERIMENTS/PROTOTYPES</span>
        </div>
        <div className="flex items-center gap-3">
          <span>COORDS: 33.6844° N, 73.0479° E</span>
          <span>·</span>
          <span className="text-secondary font-bold">STATUS: UNCONSTRAINED</span>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-16">
        {/* ========================================================================= */}
        {/* HERO SECTION                                                              */}
        {/* ========================================================================= */}
        <section className="border-2 border-primary bg-surface-container-lowest p-6 sm:p-10 stamp-shadow">
          <div className="max-w-4xl mb-8">
            <div className="font-mono text-xs font-bold text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-secondary" />
              <span>APPLIED R&D & TECHNICAL EXPLORATIONS</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-black text-primary uppercase tracking-tight leading-none mb-4">
              Small Builds.
              <br />
              Unfinished Ideas.
              <br />
              Useful Experiments.
            </h1>
            <p className="font-sans text-base sm:text-lg text-on-surface-variant border-l-4 border-tertiary-container pl-4 py-1 leading-relaxed">
              Experiments where I test a product interaction, architecture, model, workflow, or technical assumption. No polished theater—each entry records what worked, what failed, and what to test next.
            </p>
          </div>

          {/* Lab Metadata Ticker */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-2 border-primary divide-y md:divide-y-0 md:divide-x-2 divide-primary bg-surface-container-low font-mono text-xs">
            <div className="p-4 flex items-center justify-between">
              <span className="text-outline uppercase">TOTAL LOGGED:</span>
              <span className="font-bold text-primary">04 ARCHIVED</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-outline uppercase">RUNTIME ENVIRONMENT:</span>
              <span className="font-bold text-primary">CPU / FASTAPI / ONNX</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-outline uppercase">ACCURACY STANDARD:</span>
              <span className="font-bold text-secondary">VERIFIED EVIDENCE</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* EXPERIMENTS SPECIMEN CARDS                                                */}
        {/* ========================================================================= */}
        <section className="space-y-10">
          <div className="flex items-center justify-between border-b-2 border-primary pb-3 font-mono text-xs">
            <span className="font-bold text-primary uppercase">LOGGED EXPERIMENTS ({EXPERIMENTS.length})</span>
            <span className="text-on-surface-variant">PROTOCOL: HONEST FAILURE LABELS</span>
          </div>

          <div className="grid grid-cols-1 gap-10">
            {EXPERIMENTS.map((exp) => (
              <article
                key={exp.id}
                className="border-2 border-primary bg-surface-container-lowest stamp-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
              >
                {/* Card Header Bar */}
                <div className="bg-surface-container-high px-6 py-2.5 border-b-2 border-primary flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">{exp.id}</span>
                    <span className="text-outline">/</span>
                    <span className="text-on-surface-variant uppercase">{exp.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 border border-primary bg-surface text-primary font-bold text-[10px] uppercase">
                      {exp.status}
                    </span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="font-headline text-2xl sm:text-3xl font-black uppercase text-primary mb-3">
                      {exp.title}
                    </h2>
                  </div>

                  {/* Hypothesis Box */}
                  <div className="border border-primary bg-surface-container-low p-4 font-mono text-xs">
                    <span className="font-bold text-tertiary-container uppercase block mb-1">
                      HYPOTHESIS UNDER TEST:
                    </span>
                    <p className="font-sans text-sm text-on-surface leading-relaxed">
                      &quot;{exp.hypothesis}&quot;
                    </p>
                  </div>

                  {/* 4-Column Technical Audit Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
                    {/* What Was Built */}
                    <div className="border border-outline-variant bg-surface p-4 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-primary uppercase block mb-2 pb-1 border-b border-outline-variant">
                          WHAT WAS BUILT
                        </span>
                        <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                          {exp.built}
                        </p>
                      </div>
                    </div>

                    {/* What Worked */}
                    <div className="border border-secondary bg-secondary-container/20 p-4 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-secondary uppercase block mb-2 pb-1 border-b border-secondary/40 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>WHAT WORKED</span>
                        </span>
                        <p className="font-sans text-xs text-on-surface leading-relaxed">
                          {exp.worked}
                        </p>
                      </div>
                    </div>

                    {/* What Failed */}
                    <div className="border border-tertiary-container bg-surface-container-low p-4 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-tertiary-container uppercase block mb-2 pb-1 border-b border-outline-variant flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>WHAT FAILED</span>
                        </span>
                        <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                          {exp.failed}
                        </p>
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="border border-outline-variant bg-surface p-4 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-primary uppercase block mb-2 pb-1 border-b border-outline-variant">
                          NEXT HYPOTHESIS
                        </span>
                        <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                          {exp.next}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Repositories */}
                  <div className="flex flex-wrap items-center justify-between pt-4 border-t border-outline-variant font-mono text-xs gap-3">
                    <div className="flex items-center gap-3">
                      {exp.repoUrl && (
                        <a
                          href={exp.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 border border-primary bg-surface hover:bg-surface-container text-primary font-bold flex items-center gap-1.5 transition-colors uppercase"
                        >
                          <Github className="h-3.5 w-3.5" />
                          <span>Source Code</span>
                        </a>
                      )}
                      {exp.demoUrl && (
                        <Link
                          href={exp.demoUrl}
                          className="px-3.5 py-1.5 bg-tertiary-container text-on-tertiary font-bold flex items-center gap-1.5 stamp-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-transform uppercase"
                        >
                          <Terminal className="h-3.5 w-3.5" />
                          <span>Interactive Demo</span>
                        </Link>
                      )}
                    </div>
                    <span className="text-outline text-[11px]">DATE: {exp.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
