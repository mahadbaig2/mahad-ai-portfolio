import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t-2 border-primary bg-surface-container py-12 text-sm text-on-surface">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-primary" />
            <p className="font-headline text-base font-bold uppercase tracking-tight text-primary">
              Mirza Mahad Baig // AI Product Engineer
            </p>
          </div>
          <p className="font-mono text-xs text-on-surface-variant max-w-md">
            Product design, UI/UX systems architecture, and production AI engineering. Grounded RAG, ONNX routing, and LangGraph orchestration.
          </p>
          <div className="flex items-center gap-3 font-mono text-[11px] text-outline pt-1">
            <span>ISLAMABAD [33.6844° N, 73.0479° E]</span>
            <span>·</span>
            <span>SYSTEM_SPEC: DS-01</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs font-semibold uppercase">
          <Link
            href="https://github.com/mahadbaig2/mahad-ai-portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-tertiary-container transition-colors"
          >
            <span>GitHub</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <Link
            href="https://linkedin.com/in/mahadbaig"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-tertiary-container transition-colors"
          >
            <span>LinkedIn</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <Link
            href="https://medium.com/@mirza.mahad"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-tertiary-container transition-colors"
          >
            <span>Medium</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-1 text-secondary hover:text-primary transition-colors"
          >
            <span>Execution Inspector</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <Link
            href="/travel"
            className="flex items-center gap-1 hover:text-tertiary-container transition-colors"
          >
            <span>Off-Screen</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-[1440px] border-t border-outline-variant px-6 sm:px-8 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-[11px] text-on-surface-variant">
        <span>© {new Date().getFullYear()} Mirza Mahad Baig. Content strictly verified against real project artifacts.</span>
        <span>ZERO-DOLLAR OPERATING RUNTIME // CLOUDFLARE PAGES</span>
      </div>
    </footer>
  );
}
