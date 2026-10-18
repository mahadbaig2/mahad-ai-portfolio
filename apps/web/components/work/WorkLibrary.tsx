"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, Github, ExternalLink, Layers, Terminal } from "lucide-react";
import { type CmsProject } from "@/lib/sanity/loadData";

interface WorkLibraryProps {
  initialProjects: CmsProject[];
}

const CATEGORIES = [
  { label: "ALL", value: "all" },
  { label: "AI PRODUCTS", value: "ai_product" },
  { label: "FULL STACK", value: "full_stack" },
  { label: "PRODUCT DESIGN & UIUX", value: "product_design" },
  { label: "MACHINE LEARNING", value: "machine_learning" },
  { label: "AUTOMATION", value: "automation" },
  { label: "RESEARCH", value: "research" },
];

export function WorkLibrary({ initialProjects }: WorkLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "all") return initialProjects;
    return initialProjects.filter((p) => {
      const cat = p.category?.toLowerCase() || "";
      const matchesCategory =
        cat === selectedCategory ||
        (selectedCategory === "ai_product" && (cat.includes("ai") || cat.includes("assistant") || cat.includes("rag"))) ||
        (selectedCategory === "product_design" && (cat.includes("design") || cat.includes("ui") || cat.includes("ux"))) ||
        (selectedCategory === "full_stack" && (cat.includes("full") || cat.includes("stack") || cat.includes("app"))) ||
        (selectedCategory === "machine_learning" && (cat.includes("ml") || cat.includes("machine") || cat.includes("learning"))) ||
        (selectedCategory === "automation" && (cat.includes("auto") || cat.includes("n8n"))) ||
        (selectedCategory === "research" && cat.includes("research"));

      const matchesSecondary =
        p.secondaryCategories?.some((sc) => sc.toLowerCase().includes(selectedCategory)) || false;

      return matchesCategory || matchesSecondary;
    });
  }, [initialProjects, selectedCategory]);

  return (
    <div className="w-full">
      {/* Category Filter Controls */}
      <section className="py-6 border-b-2 border-primary mb-10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => {
                const count =
                  cat.value === "all"
                    ? initialProjects.length
                    : initialProjects.filter((p) => {
                        const c = p.category?.toLowerCase() || "";
                        return (
                          c === cat.value ||
                          (cat.value === "ai_product" && (c.includes("ai") || c.includes("rag"))) ||
                          (cat.value === "product_design" && (c.includes("design") || c.includes("ui"))) ||
                          (cat.value === "full_stack" && (c.includes("full") || c.includes("app"))) ||
                          (cat.value === "machine_learning" && c.includes("machine")) ||
                          (cat.value === "automation" && c.includes("auto")) ||
                          (cat.value === "research" && c.includes("research"))
                        );
                      }).length;

                const isActive = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider border transition-colors ${
                      isActive
                        ? "bg-tertiary-container text-on-tertiary border-primary font-bold stamp-shadow-sm"
                        : "bg-surface hover:bg-surface-container text-on-surface border-outline-variant hover:border-primary"
                    }`}
                  >
                    {cat.label} [{count}]
                  </button>
                );
              })}
            </div>
            <div className="font-mono text-xs font-bold text-secondary flex items-center gap-1.5 bg-secondary-container px-3 py-1 border border-secondary">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
              <span>DISPLAYING {filteredProjects.length} VERIFIED SPECIMENS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="border-2 border-primary bg-surface p-12 text-center font-mono text-xs text-on-surface-variant">
          NO SPECIMENS FOUND FOR THE SELECTED TAXONOMY FILTER.
        </div>
      ) : (
        <div className="space-y-10">
          {filteredProjects.map((project, idx) => {
            const specimenId = String(idx + 1).padStart(2, "0");
            const maturity = project.maturityStatus || "ACTIVE PRODUCT";
            const isProduction =
              maturity.toLowerCase().includes("production") || maturity.toLowerCase().includes("active");

            return (
              <article
                key={project.slug}
                className="bg-surface-container-lowest border-2 border-primary stamp-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
              >
                {/* Specimen Header Bar */}
                <div className="bg-surface-container-high px-6 py-2.5 border-b-2 border-primary flex flex-wrap items-center justify-between text-on-surface font-mono text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-primary">
                      SPECIMEN ID: {specimenId} {`//`} {project.slug.toUpperCase()}
                    </span>
                    <span className="text-outline">/</span>
                    <span className="bg-surface px-1.5 border border-outline-variant">
                      YEAR: {project.year}
                    </span>
                    <span className="text-outline">/</span>
                    <span className="text-primary font-semibold">
                      ROLE: {project.role.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 border font-mono text-[10px] font-bold flex items-center gap-1 uppercase ${
                        isProduction
                          ? "bg-secondary-container text-on-secondary-container border-secondary"
                          : "bg-surface-container text-on-surface-variant border-outline-variant"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isProduction ? "bg-secondary animate-pulse" : "bg-outline"
                        }`}
                      />
                      <span>[{maturity.replace(/_/g, " ")}]</span>
                    </span>
                  </div>
                </div>

                {/* Main Card Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Left Column (8 cols): Title, Outcome, Narrative */}
                  <div className="lg:col-span-8 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r-2 border-primary flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2 font-mono text-[10px] text-outline uppercase tracking-wider">
                        <span>CATEGORY: {project.category?.replace(/_/g, " ") || "AI Product"}</span>
                        {project.clientOrOrg && (
                          <>
                            <span>·</span>
                            <span>ORG: {project.clientOrOrg}</span>
                          </>
                        )}
                      </div>

                      <h2 className="font-headline text-2xl sm:text-3xl font-black uppercase text-primary leading-tight mb-2">
                        <Link href={`/work/${project.slug}`} className="hover:underline">
                          {project.title}
                        </Link>
                      </h2>

                      {project.shortOutcome && (
                        <p className="font-mono text-xs font-bold text-tertiary-container mb-4">
                          ↳ {project.shortOutcome}
                        </p>
                      )}

                      <p className="font-sans text-sm text-on-surface leading-relaxed mb-6">
                        {project.summary}
                      </p>

                      {/* Technology Chips */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 bg-surface-container border border-outline-variant font-mono text-[10px] font-bold text-primary"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions Strip */}
                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-outline-variant font-mono text-xs">
                      <Link
                        href={`/work/${project.slug}`}
                        className="px-4 py-2 bg-tertiary-container text-on-tertiary font-bold flex items-center gap-1.5 stamp-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-transform"
                      >
                        <span>Read Case Study</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>

                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target={project.liveUrl.startsWith("http") ? "_blank" : undefined}
                          rel={project.liveUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="px-4 py-2 border border-primary bg-surface text-primary font-bold hover:bg-surface-container transition-colors flex items-center gap-1.5"
                        >
                          <span>Live System</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}

                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-outline-variant bg-surface text-on-surface hover:text-primary hover:border-primary transition-colors flex items-center gap-1.5"
                        >
                          <Github className="h-3.5 w-3.5" />
                          <span>Repository</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right Column (4 cols): Metrics & Evidence Box */}
                  <div className="lg:col-span-4 p-6 sm:p-8 bg-surface-container-low flex flex-col justify-between">
                    <div>
                      <div className="font-mono text-[11px] font-bold uppercase text-primary border-b border-outline-variant pb-2 mb-4">
                        EMPIRICAL METRICS & EVIDENCE
                      </div>

                      {project.metrics && project.metrics.length > 0 ? (
                        <div className="space-y-4">
                          {project.metrics.map((m) => (
                            <div key={m.label} className="border border-primary bg-surface p-3 stamp-shadow-sm">
                              <div className="font-mono text-[10px] text-outline uppercase">{m.label}</div>
                              <div className="font-headline text-2xl font-black text-primary my-0.5">
                                {m.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border border-outline-variant bg-surface p-4 font-mono text-[11px] text-on-surface-variant">
                          Verified structural deliverable. Detailed metrics documented in full case study.
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-outline-variant font-mono text-[10px] text-outline flex items-center justify-between">
                      <span>DOC: VERIFIED SANITY RECORD</span>
                      <Link href={`/work/${project.slug}`} className="text-primary font-bold hover:underline">
                        EXPLORE →
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
