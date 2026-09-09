import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, Terminal, CheckCircle2, FileText } from "lucide-react";
import { getProjects, getProject, getCaseStudy } from "@/lib/sanity/loadData";
import { PortableText } from "@/components/PortableText";
import { urlForImage } from "@/lib/sanity/image";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project Not Found" };

  return {
    title: `${project.title} | Case Study`,
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

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-24">
      {/* Back Link */}
      <Link
        href="/work"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Selected Work</span>
      </Link>

      {/* Case Study Header */}
      <header className="border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{project.year}</span>
          <span>•</span>
          <span>{project.role}</span>
          {caseStudy && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 font-medium text-foreground">
                <FileText className="h-3 w-3" />
                <span>Deep Case Study Attached</span>
              </span>
            </>
          )}
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
          {project.title}
        </h1>

        <p className="mt-2 text-base font-medium text-muted-foreground leading-relaxed">
          {project.tagline}
        </p>

        {/* Action Links */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium">
          {project.liveUrl && (
            <Link
              href={project.liveUrl}
              className="inline-flex items-center gap-1.5 rounded bg-foreground px-3.5 py-2 text-white hover:opacity-90"
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>
                {project.slug === "talk-to-mahad"
                  ? "View Development Roadmap"
                  : "Launch Live System"}
              </span>
            </Link>
          )}

          {project.githubUrl && (
            <Link
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-border px-3.5 py-2 text-foreground hover:border-foreground"
            >
              <Github className="h-3.5 w-3.5" />
              <span>Inspect Source Code</span>
            </Link>
          )}
        </div>

        {/* Hero Image */}
        {heroImageUrl && (
          <div className="mt-8 overflow-hidden rounded border border-border bg-muted/10">
            <img
              src={heroImageUrl}
              alt={project.heroImage?.alt || project.title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}
      </header>

      {/* Case Study Body */}
      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Main Content */}
        <div className="flex flex-col gap-10 lg:col-span-2">
          {/* Executive Summary */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Overview & Summary
            </h2>
            <p className="mt-3 text-base text-foreground leading-relaxed">
              {caseStudy?.summary || project.summary}
            </p>
          </section>

          {/* Problem Statement */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              The Engineering Challenge
            </h2>
            {Array.isArray(caseStudy?.contextAndProblem) ? (
              <div className="mt-3">
                <PortableText value={caseStudy.contextAndProblem} />
              </div>
            ) : (
              <p className="mt-3 text-base text-foreground leading-relaxed">
                {project.problem}
              </p>
            )}
          </section>

          {/* Architecture */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              System Architecture & Topology
            </h2>
            {architectureDiagramUrl && (
              <figure className="my-4 overflow-hidden rounded border border-border bg-white">
                <img
                  src={architectureDiagramUrl}
                  alt={project.architectureDiagram?.alt || `${project.title} Architecture Diagram`}
                  className="w-full h-auto object-contain max-h-[500px]"
                />
                {project.architectureDiagram?.caption && (
                  <figcaption className="border-t border-border bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
                    {project.architectureDiagram.caption}
                  </figcaption>
                )}
              </figure>
            )}
            {Array.isArray(caseStudy?.engineeringApproach) ? (
              <div className="mt-3">
                <PortableText value={caseStudy.engineeringApproach} />
              </div>
            ) : (
              <p className="mt-3 text-base text-foreground leading-relaxed">
                {project.architecture}
              </p>
            )}
          </section>

          {/* Trade-offs & Failures */}
          {caseStudy?.tradeOffsAndFailures && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Trade-offs, Failures & Mitigations
              </h2>
              <div className="mt-3">
                {Array.isArray(caseStudy.tradeOffsAndFailures) ? (
                  <PortableText value={caseStudy.tradeOffsAndFailures} />
                ) : (
                  <p className="mt-3 text-base text-foreground leading-relaxed">
                    {caseStudy.tradeOffsAndFailures}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Lessons Learned */}
          {caseStudy?.lessonsLearned && caseStudy.lessonsLearned.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Engineering Lessons Learned
              </h2>
              <ul className="mt-4 space-y-2.5">
                {caseStudy.lessonsLearned.map((lesson, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                    <span>{lesson}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Key Architectural Decisions (Progressive Disclosure) */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Strategic Architectural Decisions
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {project.decisions.map((decision, index) => (
                <details
                  key={index}
                  className="group rounded border border-border bg-white p-4 transition-colors"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-foreground shrink-0" />
                      <span>Decision {index + 1}: Key Trade-off</span>
                    </span>
                    <span className="text-muted-foreground transition-transform group-open:rotate-180">
                      ↓
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                    {decision}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Specifications */}
        <aside className="flex flex-col gap-8 lg:border-l lg:border-border lg:pl-8">
          {/* Measured Outcomes */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Target & System Metrics
            </h3>
            {caseStudy?.quantitativeResults && caseStudy.quantitativeResults.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                {caseStudy.quantitativeResults.map((metric, i) => (
                  <div key={i} className="rounded border border-border p-3">
                    <div className="text-[11px] text-muted-foreground font-medium">
                      {metric.metric}
                    </div>
                    <div className="mt-1 text-base font-semibold text-foreground">
                      {metric.result}
                    </div>
                    {metric.baseline && (
                      <div className="mt-2 text-[11px] text-muted-foreground border-t border-border pt-2 leading-relaxed">
                        <span className="font-medium text-foreground">Baseline: </span>
                        {metric.baseline}
                      </div>
                    )}
                    {metric.methodology && (
                      <div className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
                        <span className="font-medium text-foreground">Methodology: </span>
                        {metric.methodology}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {project.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded border border-border p-3"
                  >
                    <div className="text-[11px] text-muted-foreground">
                      {metric.label}
                    </div>
                    <div className="mt-1 text-base font-semibold text-foreground">
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Technologies Used */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Technology Stack
            </h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Ask the Assistant */}
          <div className="rounded border border-border p-4 bg-muted/30">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5" />
              <span>Ask About This Project</span>
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              The &quot;Talk to Mahad&quot; assistant can answer in-depth technical
              questions about this case study with cited sources.
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
