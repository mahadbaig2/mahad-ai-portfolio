"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, FolderGit2 } from "lucide-react";
import { type CmsProject } from "@/lib/sanity/loadData";

interface WorkLibraryProps {
  initialProjects: CmsProject[];
}

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "AI Products", value: "ai_product" },
  { label: "Full Stack", value: "full_stack" },
  { label: "Product Design & UI/UX", value: "product_design" },
  { label: "Machine Learning", value: "machine_learning" },
  { label: "Automation", value: "automation" },
  { label: "Research", value: "research" },
];

function matchesProjectCategory(p: CmsProject, catValue: string): boolean {
  if (catValue === "all") return true;
  const cat = (p.category || "").toLowerCase();
  const text = `${cat} ${(p.secondaryCategories || []).join(" ")} ${p.title} ${p.tagline} ${(p.technologies || []).join(" ")}`.toLowerCase();

  if (cat === catValue) return true;
  if (catValue === "ai_product") {
    return cat.includes("ai") || cat.includes("rag") || cat.includes("assistant") || text.includes("langgraph") || text.includes("rag");
  }
  if (catValue === "product_design") {
    return cat.includes("design") || cat.includes("ui") || cat.includes("ux") || (p.role || "").toLowerCase().includes("designer");
  }
  if (catValue === "full_stack") {
    return cat.includes("full") || cat.includes("stack") || cat.includes("app") || text.includes("next.js") || text.includes("fastapi");
  }
  if (catValue === "machine_learning") {
    return cat.includes("ml") || cat.includes("machine") || text.includes("onnx") || text.includes("pytorch") || text.includes("cnn");
  }
  if (catValue === "automation") {
    return cat.includes("auto") || cat.includes("n8n") || text.includes("freqtrade") || text.includes("trading");
  }
  if (catValue === "research") {
    return cat.includes("research") || text.includes("study") || text.includes("cardioscan");
  }
  return false;
}

export function WorkLibrary({ initialProjects }: WorkLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProjects = useMemo(() => {
    return initialProjects.filter((p) => matchesProjectCategory(p, selectedCategory));
  }, [initialProjects, selectedCategory]);

  const [featuredProject, ...gridProjects] = filteredProjects;

  return (
    <div className="w-full">
      {/* Sticky Filter & Classification Bar */}
      <section className="w-full bg-surface-white border-y border-hairline/80 py-4 sticky top-28 z-30 shadow-editorial-sm">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter projects by discipline">
            {CATEGORIES.map((cat) => {
              const count = initialProjects.filter((p) => matchesProjectCategory(p, cat.value)).length;
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  aria-pressed={isActive}
                  className={`px-3.5 py-1.5 rounded-full font-mono text-xs transition-colors ${
                    isActive
                      ? "bg-primary-container text-on-primary font-medium"
                      : "bg-paper text-on-surface-variant hover:bg-mint hover:text-primary border border-hairline/70"
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-muted-text shrink-0">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            <span>Showing {filteredProjects.length} projects</span>
          </div>
        </div>
      </section>

      {/* Main Archive Body */}
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 py-12 lg:py-16 space-y-12">
        {filteredProjects.length === 0 ? (
          <div className="bg-surface-white rounded-2xl border border-hairline p-12 text-center font-mono text-sm text-muted-text">
            No projects match the selected discipline filter.
          </div>
        ) : (
          <>
            {/* Featured Specimen 01 */}
            {featuredProject && (
              <article className="bg-surface-white rounded-2xl border border-hairline/80 shadow-editorial overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage text-primary font-mono text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                        <span>{featuredProject.maturityStatus || "Featured Specimen"}</span>
                      </span>
                      {featuredProject.year && (
                        <span className="font-mono text-xs text-muted-text">{featuredProject.year}</span>
                      )}
                    </div>

                    <h2 className="font-serif text-3xl sm:text-4xl font-normal text-primary tracking-tight">
                      <Link href={`/work/${featuredProject.slug}`} className="hover:text-primary-container transition-colors">
                        {featuredProject.title}
                      </Link>
                    </h2>

                    {featuredProject.role && (
                      <div className="bg-mint/70 px-4 py-2.5 rounded-lg border border-hairline/60">
                        <span className="font-mono text-[11px] text-muted-text block uppercase tracking-wider">
                          Role &amp; Scope
                        </span>
                        <span className="text-sm text-primary font-medium">{featuredProject.role}</span>
                      </div>
                    )}

                    <p className="text-base text-on-surface-variant leading-relaxed">
                      {featuredProject.summary}
                    </p>

                    {(featuredProject.technologies || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(featuredProject.technologies || []).slice(0, 6).map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-1 bg-surface-container-high text-on-surface font-mono text-xs rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      href={`/work/${featuredProject.slug}`}
                      className="inline-flex items-center gap-2 bg-primary-container text-on-primary hover:bg-primary transition-colors px-5 py-2.5 rounded text-sm font-medium shadow-editorial-sm"
                    >
                      <span>View Case Study</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>

                    {featuredProject.githubUrl && (
                      <a
                        href={featuredProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary underline underline-offset-4 decoration-hairline transition-colors"
                      >
                        <FolderGit2 className="h-4 w-4" aria-hidden="true" />
                        <span>Repository</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Visual Diagram Specimen Plate */}
                <div className="lg:col-span-5 bg-charcoal-gutter p-6 sm:p-8 flex flex-col justify-between text-surface-white">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 font-mono text-xs">
                      <span className="text-secondary-fixed">{featuredProject.slug}</span>
                      <span className="text-on-primary-container">Specimen 01</span>
                    </div>

                    <div className="space-y-3">
                      {featuredProject.tagline && (
                        <div className="bg-inverse-surface p-3.5 rounded-lg border border-white/10">
                          <span className="font-mono text-[11px] text-secondary-fixed block mb-1">
                            Thesis
                          </span>
                          <p className="text-sm text-surface-white leading-relaxed">
                            {featuredProject.tagline}
                          </p>
                        </div>
                      )}

                      {featuredProject.architecture && (
                        <div className="bg-inverse-surface p-3.5 rounded-lg border border-white/10">
                          <span className="font-mono text-[11px] text-secondary-fixed block mb-1">
                            System Shape
                          </span>
                          <p className="text-xs text-inverse-on-surface/90 leading-relaxed">
                            {featuredProject.architecture}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="pt-4 font-mono text-xs text-on-primary-container">
                    Open case study to inspect decisions, constraints, and status.
                  </p>
                </div>
              </article>
            )}

            {/* Remaining Projects Bento Grid */}
            {gridProjects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {gridProjects.map((project, idx) => (
                  <article
                    key={project.slug}
                    className="bg-surface-white rounded-2xl border border-hairline/80 shadow-editorial-sm p-6 sm:p-7 flex flex-col justify-between hover:shadow-editorial transition-all group"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-sage text-primary font-mono text-xs font-medium">
                          {project.maturityStatus || project.category || "Project"}
                        </span>
                        <span className="font-mono text-xs text-muted-text">
                          {project.year || `Specimen ${String(idx + 2).padStart(2, "0")}`}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-serif text-2xl font-normal text-primary group-hover:text-primary-container transition-colors">
                          <Link href={`/work/${project.slug}`}>{project.title}</Link>
                        </h3>
                        {project.tagline && (
                          <p className="text-sm text-secondary font-medium mt-1">
                            {project.tagline}
                          </p>
                        )}
                      </div>

                      {project.role && (
                        <div className="bg-paper border border-hairline/60 px-3.5 py-2 rounded-lg">
                          <span className="font-mono text-[11px] text-muted-text block uppercase">
                            Scope
                          </span>
                          <span className="text-sm text-primary font-medium">{project.role}</span>
                        </div>
                      )}

                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {project.summary}
                      </p>

                      {(project.technologies || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(project.technologies || []).slice(0, 5).map((tech) => (
                            <span
                              key={tech}
                              className="px-2.5 py-0.5 bg-paper border border-hairline/60 text-muted-text font-mono text-xs rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-5 mt-5 border-t border-hairline/60 flex items-center justify-between gap-4">
                      <Link
                        href={`/work/${project.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-container transition-colors"
                      >
                        <span>Inspect Case Study</span>
                        <ArrowRight
                          className="h-4 w-4 group-hover:translate-x-0.5 transition-transform"
                          aria-hidden="true"
                        />
                      </Link>
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-muted-text hover:text-primary inline-flex items-center gap-1"
                        >
                          <span>Source</span>
                          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
