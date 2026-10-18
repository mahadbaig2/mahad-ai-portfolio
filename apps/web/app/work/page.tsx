import React from "react";
import { Metadata } from "next";
import { getProjects } from "@/lib/sanity/loadData";
import { WorkLibrary } from "@/components/work/WorkLibrary";

export const metadata: Metadata = {
  title: "Selected Work & Technical Archive | Mirza Mahad Baig",
  description:
    "AI products, enterprise SaaS systems, full-stack architectures, and product-design case studies designed and engineered by Mirza Mahad Baig.",
};

export default async function WorkPage() {
  const projects = await getProjects();

  return (
    <main className="w-full max-w-[1440px] mx-auto px-6 sm:px-8 py-10 sm:py-16">
      {/* Top Metadata Strip */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-primary pb-3 mb-8 gap-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-on-primary px-2 py-0.5 font-bold">
            SELECTED WORK // 2019–NOW
          </span>
          <span className="text-on-surface-variant border border-outline-variant px-2 py-0.5 hidden sm:inline-block">
            [DOC: MMB-WRK-2025 // 12-COL MONOGRAPH]
          </span>
        </div>
        <div className="text-on-surface-variant flex items-center gap-3">
          <span>SYS.SPEC: VERIFIED ARCHIVAL RECORDS</span>
          <span className="text-outline">·</span>
          <span className="inline-flex items-center gap-1.5 text-secondary font-bold">
            <span className="w-2 h-2 rounded-full bg-secondary inline-block animate-pulse" />
            SYSTEM VERIFIED
          </span>
        </div>
      </div>

      {/* Editorial Hero Title & Proposition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b-2 border-outline-variant mb-6">
        <div className="lg:col-span-8">
          <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-black text-primary uppercase tracking-tight leading-tight mb-4">
            Work That Moves From Interface to Intelligence.
          </h1>
          <p className="font-sans text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            A verified collection of AI products, full-stack applications, enterprise SaaS platforms, machine-learning projects, automation workflows, and product-design case studies.
          </p>
        </div>
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div className="p-4 bg-surface-container-low border-2 border-primary stamp-shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant pb-1.5 mb-2 font-mono text-[11px]">
              <span className="font-bold text-primary">AUDIT MANDATE</span>
              <span className="text-outline">VERIFIED 1.0</span>
            </div>
            <p className="font-sans text-xs text-on-surface leading-normal">
              Each project identifies my role, what was actually completed, and the current maturity of the work. No theoretical mockups represented as live software.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-on-surface-variant border-t border-dashed border-outline-variant pt-2">
            <span>PORTFOLIO_LATENCY: OPTIMIZED</span>
            <span>COORDINATES: 33.6844° N, 73.0479° E</span>
          </div>
        </div>
      </div>

      {/* Interactive Work Library */}
      <WorkLibrary initialProjects={projects} />
    </main>
  );
}
