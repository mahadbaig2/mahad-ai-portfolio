import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Github,
  Terminal,
  CheckCircle2,
  FileText,
  Layers,
  Cpu,
  ShieldAlert,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { getProjects, getProject, getCaseStudy } from "@/lib/sanity/loadData";
import { PortableText } from "@/components/PortableText";
import { urlForImage } from "@/lib/sanity/image";
import { PROJECTS } from "@/lib/data";

export async function generateStaticParams() {
  const projects = await getProjects();
  const slugs = new Set(projects.map((p) => p.slug));
  PROJECTS.forEach((p) => slugs.add(p.slug));
  return Array.from(slugs).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project Not Found | Mirza Mahad Baig" };

  return {
    title: `${project.title} // Case Study | Mirza Mahad Baig`,
    description: project.summary,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, caseStudy] = await Promise.all([
    getProject(slug),
    getCaseStudy(slug),
  ]);

  if (!project) {
    notFound();
  }

  const heroImageUrl = project.heroImage ? urlForImage(project.heroImage)?.url() : null;
  const architectureDiagramUrl = project.architectureDiagram
    ? urlForImage(project.architectureDiagram)?.url()
    : null;

  const isDesignFocus =
    project.category === "product_design" ||
    project.slug === "busyfile" ||
    project.slug.includes("design");

  return (
    <div className="w-full bg-background text-on-surface">
      {/* Top Anchor Rail */}
      <div className="sticky top-16 z-40 w-full bg-surface/95 border-b-[1.5px] border-primary px-4 sm:px-8 py-2.5 overflow-x-auto flex items-center justify-between gap-4 font-mono text-xs backdrop-blur-sm">
        <div className="flex items-center gap-4 shrink-0 font-bold uppercase tracking-wider">
          <Link
            href="/work"
            className="flex items-center gap-1.5 text-primary hover:text-tertiary-container transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>WORK ARCHIVE</span>
          </Link>
          <span className="text-outline-variant">|</span>
          <span className="text-secondary">SPEC // {project.slug.toUpperCase()}</span>
          <span className="text-outline-variant hidden sm:inline-block">|</span>
          <a href="#overview" className="hidden sm:inline-block hover:underline">
            01 OVERVIEW
          </a>
          <a href="#challenge" className="hidden md:inline-block hover:underline">
            02 CHALLENGE
          </a>
          <a href="#approach" className="hidden md:inline-block hover:underline">
            03 {isDesignFocus ? "WORKFLOWS" : "ARCHITECTURE"}
          </a>
          <a href="#evidence" className="hidden lg:inline-block hover:underline">
            04 EVIDENCE
          </a>
          <a href="#lessons" className="hidden lg:inline-block hover:underline">
            05 LESSONS
          </a>
        </div>

        <div className="flex items-center gap-3 shrink-0 font-semibold uppercase">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-tertiary-container transition-colors"
            >
              <span>[GITHUB]</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target={project.liveUrl.startsWith("http") ? "_blank" : undefined}
              rel={project.liveUrl.startsWith("http") ? "noopener noreferrer" : undefined}
              className="flex items-center gap-1 text-secondary font-bold hover:underline"
            >
              <span>[LIVE RUNTIME]</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 py-10 space-y-12">
        {/* ========================================================================= */}
        {/* HERO SPECIMEN BANNER & METADATA LEDGER                                    */}
        {/* ========================================================================= */}
        <section className="border-2 border-primary bg-surface-container-lowest p-6 sm:p-10 stamp-shadow" id="overview">
          {/* Metadata Headband */}
          <div className="flex flex-wrap items-center justify-between border-b border-outline-variant pb-3 mb-6 gap-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-on-primary px-2 py-0.5 font-bold uppercase tracking-wider">
                SPECIMEN // {project.slug.toUpperCase()}
              </span>
              <span className="text-on-surface-variant uppercase">
                {isDesignFocus ? "PRODUCT DESIGN CASE STUDY" : "APPLIED AI & SYSTEMS CASE STUDY"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant font-semibold">
              <span>DOC_STATUS: VERIFIED</span>
              <span>·</span>
              <span className="text-secondary font-bold">
                [{project.maturityStatus?.replace(/_/g, " ").toUpperCase() || "ACTIVE PRODUCT"}]
              </span>
            </div>
          </div>

          {/* Title & Tagline */}
          <div className="max-w-4xl mb-8">
            <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-black text-primary uppercase tracking-tight leading-tight mb-4">
              {project.title}
            </h1>
            <p className="font-sans text-base sm:text-lg text-on-surface-variant border-l-4 border-secondary pl-4 py-1 leading-relaxed">
              {project.shortOutcome || project.tagline || project.subtitle}
            </p>
          </div>

          {/* Swiss Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-2 border-primary divide-x divide-y md:divide-y-0 divide-primary bg-surface-container-low font-mono text-xs mb-8">
            <div className="p-4">
              <span className="text-outline uppercase text-[10px] block mb-1">ROLE / FOCUS</span>
              <span className="font-bold text-primary block">{project.role}</span>
            </div>
            <div className="p-4">
              <span className="text-outline uppercase text-[10px] block mb-1">YEAR / TIMELINE</span>
              <span className="font-bold text-primary block">{project.year}</span>
            </div>
            <div className="p-4">
              <span className="text-outline uppercase text-[10px] block mb-1">CATEGORY</span>
              <span className="font-bold text-primary block uppercase">
                {project.category?.replace(/_/g, " ") || "AI Product"}
              </span>
            </div>
            <div className="p-4">
              <span className="text-outline uppercase text-[10px] block mb-1">ORIGIN</span>
              <span className="font-bold text-primary block uppercase">
                {project.origin?.replace(/_/g, " ") || project.clientOrOrg || "Independent"}
              </span>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target={project.liveUrl.startsWith("http") ? "_blank" : undefined}
                rel={project.liveUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                className="px-5 py-2.5 bg-tertiary-container text-on-tertiary font-bold flex items-center gap-1.5 stamp-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-transform uppercase"
              >
                <span>{project.slug === "talk-to-mahad" ? "Open Live Inspector" : "Launch Live System"}</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 border-2 border-primary bg-surface text-primary font-bold hover:bg-surface-container flex items-center gap-1.5 transition-colors uppercase"
              >
                <Github className="h-4 w-4" />
                <span>Inspect Source Code</span>
              </a>
            )}
            <Link
              href={`/chat?q=Tell me about the engineering decisions in ${project.title}`}
              className="px-5 py-2.5 border border-outline-variant bg-surface text-on-surface hover:border-primary font-bold flex items-center gap-1.5 transition-colors uppercase"
            >
              <Terminal className="h-4 w-4 text-secondary" />
              <span>Ask Assistant About This Project</span>
            </Link>
          </div>

          {/* Hero Media */}
          {heroImageUrl && (
            <div className="mt-8 border-2 border-primary overflow-hidden bg-surface-container-high">
              <img
                src={heroImageUrl}
                alt={project.heroImage?.alt || project.title}
                className="w-full h-auto max-h-[600px] object-cover"
              />
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: EXECUTIVE SUMMARY & PROBLEM STATEMENT                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="challenge">
          {/* Executive Overview */}
          <div className="lg:col-span-6 border-2 border-primary bg-surface p-6 sm:p-8 stamp-shadow flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-tertiary-container uppercase mb-2">
                01 // EXECUTIVE SUMMARY
              </div>
              <h2 className="font-headline text-2xl sm:text-3xl font-black uppercase text-primary mb-4">
                Overview & Context
              </h2>
              <p className="font-sans text-base text-on-surface leading-relaxed mb-6">
                {caseStudy?.summary || project.summary}
              </p>
            </div>
            {project.targetUsers && (
              <div className="bg-surface-container p-4 border border-outline-variant font-mono text-xs">
                <span className="text-outline uppercase block mb-1">TARGET PERSONA:</span>
                <span className="font-semibold text-primary">{project.targetUsers}</span>
              </div>
            )}
          </div>

          {/* The Problem / Challenge */}
          <div className="lg:col-span-6 border-2 border-primary bg-surface p-6 sm:p-8 stamp-shadow flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-secondary uppercase mb-2">
                02 // THE CHALLENGE
              </div>
              <h2 className="font-headline text-2xl sm:text-3xl font-black uppercase text-primary mb-4">
                {isDesignFocus ? "User & Business Problem" : "Engineering Constraints"}
              </h2>
              {Array.isArray(caseStudy?.contextAndProblem) ? (
                <div className="font-sans text-sm text-on-surface leading-relaxed">
                  <PortableText value={caseStudy.contextAndProblem} />
                </div>
              ) : (
                <p className="font-sans text-base text-on-surface leading-relaxed mb-6">
                  {project.problem ||
                    "Translating ambiguous multi-stakeholder requirements into deterministic, verifiable software under strict latency, cost, and usability boundaries."}
                </p>
              )}
            </div>
            {project.constraints && project.constraints.length > 0 && (
              <div className="bg-surface-container p-4 border border-outline-variant font-mono text-xs">
                <span className="text-outline uppercase block mb-1">GOVERNING CONSTRAINTS:</span>
                <ul className="list-disc pl-4 space-y-1 text-primary">
                  {project.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: SYSTEM TOPOLOGY / WORKFLOWS & ARCHITECTURE                      */}
        {/* ========================================================================= */}
        <section className="border-2 border-primary bg-surface p-6 sm:p-10 stamp-shadow" id="approach">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-primary pb-4 mb-8 gap-4">
            <div>
              <div className="font-mono text-xs font-bold uppercase text-tertiary-container mb-1">
                03 // {isDesignFocus ? "WORKFLOW ARCHITECTURE & DESIGN SYSTEM" : "SYSTEM TOPOLOGY & ARCHITECTURE"}
              </div>
              <h2 className="font-headline text-3xl font-black uppercase text-primary">
                {isDesignFocus ? "Product Evolution & System Workflows" : "Technical Architecture & Approach"}
              </h2>
            </div>
            <div className="font-mono text-xs text-on-surface-variant font-semibold">
              ROLE: {project.role}
            </div>
          </div>

          {/* Architecture Diagram if available */}
          {architectureDiagramUrl && (
            <figure className="mb-8 border-2 border-primary bg-surface-container-high overflow-hidden">
              <img
                src={architectureDiagramUrl}
                alt={project.architectureDiagram?.alt || `${project.title} Architecture Diagram`}
                className="w-full h-auto object-contain max-h-[550px] p-4 bg-white"
              />
              {project.architectureDiagram?.caption && (
                <figcaption className="border-t-2 border-primary bg-surface-container px-4 py-2 font-mono text-xs text-on-surface-variant">
                  {project.architectureDiagram.caption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Engineering Approach / Design Process Text */}
          <div className="font-sans text-base text-on-surface leading-relaxed max-w-4xl space-y-4">
            {Array.isArray(caseStudy?.engineeringApproach) ? (
              <PortableText value={caseStudy.engineeringApproach} />
            ) : (
              <p>{project.architecture || project.engineeringApproach || project.designProcess}</p>
            )}
          </div>

          {/* Technology Stack Matrix */}
          <div className="mt-8 pt-6 border-t border-outline-variant">
            <span className="font-mono text-xs font-bold uppercase text-primary block mb-3">
              IMPLEMENTATION STACK & TOOLS:
            </span>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 bg-surface-container-low border border-primary font-mono text-xs font-bold text-primary"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: STRATEGIC DECISIONS, TRADE-OFFS & EVIDENCE                      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="evidence">
          {/* Key Decisions */}
          <div className="lg:col-span-7 border-2 border-primary bg-surface p-6 sm:p-8 stamp-shadow flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-tertiary-container uppercase mb-2">
                04 // STRATEGIC DECISIONS & TRADE-OFFS
              </div>
              <h2 className="font-headline text-2xl sm:text-3xl font-black uppercase text-primary mb-6">
                Technical Trade-offs
              </h2>

              <div className="space-y-4">
                {project.decisions && project.decisions.length > 0 ? (
                  project.decisions.map((decision, idx) => (
                    <div key={idx} className="border border-primary bg-surface-container-low p-4">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-primary mb-1">
                        <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                        <span>DECISION 0{idx + 1}</span>
                      </div>
                      <p className="font-sans text-sm text-on-surface leading-relaxed">
                        {decision}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="font-sans text-sm text-on-surface-variant">
                    Specific trade-offs documented in the engineering monograph.
                  </p>
                )}
              </div>
            </div>

            {/* Trade-offs & Failures callout */}
            {project.tradeOffs && project.tradeOffs.length > 0 && (
              <div className="mt-6 pt-4 border-t border-outline-variant">
                <span className="font-mono text-xs font-bold text-primary uppercase block mb-2">
                  ARCHITECTURAL BOUNDARIES:
                </span>
                <ul className="list-disc pl-4 font-mono text-xs text-on-surface-variant space-y-1">
                  {project.tradeOffs.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Quantitative Results & Evidence */}
          <div className="lg:col-span-5 border-2 border-primary bg-surface-container-low p-6 sm:p-8 stamp-shadow flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-secondary uppercase mb-2">
                05 // EMPIRICAL EVIDENCE
              </div>
              <h2 className="font-headline text-2xl sm:text-3xl font-black uppercase text-primary mb-6">
                Results & Metrics
              </h2>

              {project.metrics && project.metrics.length > 0 ? (
                <div className="space-y-4">
                  {project.metrics.map((m) => (
                    <div key={m.label} className="border-2 border-primary bg-surface p-4 stamp-shadow-sm">
                      <span className="font-mono text-[10px] text-outline uppercase block mb-1">
                        {m.label}
                      </span>
                      <span className="font-headline text-3xl font-black text-primary block">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-outline-variant bg-surface p-6 font-mono text-xs text-on-surface-variant">
                  Production artifact delivered and verified. Detailed analytical logs archived in internal project documentation.
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-outline-variant font-mono text-xs text-outline">
              AUDIT PROTOCOL: ZERO UNVERIFIED CLAIMS
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: LESSONS LEARNED & ASSISTANT INQUIRY                            */}
        {/* ========================================================================= */}
        <section className="border-2 border-primary bg-surface-container-lowest p-6 sm:p-10 stamp-shadow" id="lessons">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Lessons Learned */}
            <div className="lg:col-span-7">
              <div className="font-mono text-xs font-bold uppercase text-tertiary-container mb-2">
                06 // RETROSPECTIVE & LESSONS
              </div>
              <h2 className="font-headline text-2xl sm:text-3xl font-black uppercase text-primary mb-4">
                What This Project Proved
              </h2>
              <ul className="space-y-3 font-sans text-sm text-on-surface leading-relaxed">
                {caseStudy?.lessonsLearned && caseStudy.lessonsLearned.length > 0 ? (
                  caseStudy.lessonsLearned.map((lesson, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="font-mono font-bold text-secondary text-xs mt-0.5">↳</span>
                      <span>{lesson}</span>
                    </li>
                  ))
                ) : project.decisions && project.decisions.length > 0 ? (
                  project.decisions.slice(0, 3).map((d, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="font-mono font-bold text-secondary text-xs mt-0.5">↳</span>
                      <span>{d}</span>
                    </li>
                  ))
                ) : (
                  <li>
                    Designing and deploying production AI systems requires simultaneous command over interface ergonomics, data boundaries, and latency budgets.
                  </li>
                )}
              </ul>
            </div>

            {/* Assistant Queries */}
            <div className="lg:col-span-5 border-2 border-primary bg-surface p-6 font-mono text-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3 text-secondary font-bold">
                  <Terminal className="h-4 w-4" />
                  <span className="uppercase">Ask Mahad&apos;s Assistant</span>
                </div>
                <p className="font-sans text-xs text-on-surface-variant mb-4">
                  Test the RAG retrieval pipeline by asking specific questions about this case study:
                </p>
                <div className="space-y-2">
                  <Link
                    href={`/chat?q=What were the major technical trade-offs in ${project.title}?`}
                    className="block p-2 border border-outline-variant hover:border-primary bg-surface-container-low text-primary hover:bg-surface-container font-semibold transition-colors"
                  >
                    → &quot;What were the major trade-offs in {project.title}?&quot;
                  </Link>
                  <Link
                    href={`/chat?q=How was ${project.title} evaluated and tested?`}
                    className="block p-2 border border-outline-variant hover:border-primary bg-surface-container-low text-primary hover:bg-surface-container font-semibold transition-colors"
                  >
                    → &quot;How was this project evaluated?&quot;
                  </Link>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-outline-variant text-[11px] text-outline">
                CONNECTED TO FASTAPI INTELLIGENCE LAYER
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
