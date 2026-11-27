import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, FolderGit2, Terminal } from "lucide-react";
import { getProjects, getProject, getCaseStudy } from "@/lib/sanity/loadData";
import { PROJECTS } from "@/lib/data";
import { SHOWCASE } from "@/lib/showcase";
import { PortableText } from "@/components/PortableText";
import { VisualPlaceholder } from "@/components/VisualPlaceholder";

export async function generateStaticParams() {
  const projects = await getProjects();
  const slugs = new Set([
    ...projects.map((project) => project.slug),
    ...PROJECTS.map((project) => project.slug),
    ...SHOWCASE.map((project) => project.slug).filter((slug): slug is string => Boolean(slug)),
  ]);
  return [...slugs].filter((slug) => !/indkom/i.test(slug)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  return {
    title: project ? `${project.title} | Mirza Mahad Baig` : "Project not found",
    description: project?.summary,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, study] = await Promise.all([getProject(slug), getCaseStudy(slug)]);
  if (!project) notFound();

  const supportedResults =
    study?.quantitativeResults?.filter((result) => result.methodology?.trim()) || [];
  const lessons = study?.lessonsLearned?.length ? study.lessonsLearned : project.lessonsLearned;
  const distinctLessons =
    JSON.stringify(lessons) === JSON.stringify(project.decisions) ? undefined : lessons;

  return (
    <div className="w-full bg-paper min-h-screen">
      <article className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 py-10 space-y-12">
        {/* 01. Breadcrumb, Header & Metadata Grid */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-text">
              <Link href="/work" className="inline-flex items-center gap-1.5 text-primary hover:text-primary-container font-medium">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>All work</span>
              </Link>
              <span aria-hidden="true">/</span>
              <span>{project.category || "Case Study"}</span>
              <span aria-hidden="true">/</span>
              <span className="text-primary font-medium">{project.slug}</span>
            </nav>

            {project.maturityStatus && (
              <span className="text-primary text-sm font-medium">{project.maturityStatus}</span>
            )}
          </div>

          <div className="max-w-4xl space-y-3">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-normal text-primary tracking-tight leading-[1.08]">
              {project.title}
            </h1>
            {(project.tagline || project.summary) && (
              <p className="text-lg sm:text-xl text-on-surface-variant max-w-3xl leading-relaxed">
                {project.tagline || project.summary}
              </p>
            )}
          </div>

          <div className="case-meta grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {project.role && <div className="bg-surface-white border-2 border-primary p-4 shadow-editorial-sm flex flex-col justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-text">
                Role
              </span>
              <p className="text-sm font-medium text-on-surface mt-2">
                {project.role}
              </p>
            </div>}

            {(project.timeline || project.year) && <div className="bg-surface-white border-2 border-primary p-4 shadow-editorial-sm flex flex-col justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-text">
                Timeline
              </span>
              <p className="text-sm font-medium text-on-surface mt-2">
                {project.timeline || project.year}
              </p>
            </div>}

            {(project.maturityStatus || project.origin) && <div className="bg-surface-white border-2 border-primary p-4 shadow-editorial-sm flex flex-col justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-text">
                Status
              </span>
              <p className="text-sm font-medium text-primary mt-2">
                {project.maturityStatus || project.origin}
              </p>
            </div>}

            {project.technologies?.length > 0 && <div className="bg-surface-white border-2 border-primary p-4 shadow-editorial-sm flex flex-col justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-text">
                Technologies
              </span>
              <p className="font-mono text-xs text-on-surface mt-2 leading-relaxed">
                {project.technologies.slice(0, 5).join(", ")}
              </p>
            </div>}

            {(project.githubUrl || project.liveUrl) && <div className="bg-surface-white border-2 border-primary p-4 shadow-editorial-sm flex flex-col justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-text">
                Links
              </span>
              <div className="flex flex-col gap-1.5 mt-2 font-mono text-xs">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <FolderGit2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Explore the repository</span>
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </a>
                )}
                {project.liveUrl && (
                  <Link
                    href={project.liveUrl}
                    target={project.liveUrl.startsWith("http") ? "_blank" : undefined}
                    rel={project.liveUrl.startsWith("http") ? "noreferrer" : undefined}
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Open the product</span>
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>}
          </div>
        </header>

        {/* 02. Visual placeholder until approved project images are available */}
        <section>
          <figure className="bg-surface-white border-2 border-primary p-3 shadow-editorial-sm">
            <div className="relative aspect-[16/9] max-h-[560px] w-full overflow-hidden rounded-xl bg-surface-container">
              <VisualPlaceholder label={`${project.title} project imagery`} />
            </div>
          </figure>
        </section>

        {/* 03. Case Study Body Container */}
        <section className="bg-surface-white border-2 border-primary shadow-editorial-sm p-6 sm:p-10 lg:p-14">
          <div className="pb-8 border-b border-hairline/70">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-primary leading-snug max-w-3xl">
              {study?.summary || project.summary}
            </h2>
          </div>

          <div className="divide-y divide-hairline/70">
            <CaseSection
              title="The challenge"
              value={study?.contextAndProblem || project.problem}
            />
            <CaseSection
              title="The approach"
              value={study?.engineeringApproach || project.engineeringApproach || project.architecture}
            />
            <CaseSection title="My contribution" value={project.responsibilities} />
            <CaseSection title="Constraints" value={project.constraints} />
            <CaseSection title="Design process" value={project.designProcess} />
            <CaseSection
              title="Technical decisions"
              value={project.keyDecisions?.length ? project.keyDecisions : project.decisions}
            />
            <CaseSection
              title="Trade-offs"
              value={study?.tradeOffsAndFailures || project.tradeOffs}
            />

            {supportedResults.length > 0 && (
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-8">
                <h2 className="lg:col-span-4 font-serif text-2xl font-normal text-primary">
                  Measured outcomes
                </h2>
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {supportedResults.map((result) => (
                    <div
                      key={result.metric}
                      className="border-t-2 border-primary-container pt-3 bg-paper p-4 rounded-b-lg"
                    >
                      <strong className="font-serif text-3xl font-normal text-primary block">
                        {result.result}
                      </strong>
                      <span className="font-mono text-xs text-secondary font-medium block mt-1">
                        {result.metric}
                      </span>
                      {result.methodology && (
                        <p className="text-sm text-on-surface-variant mt-2">{result.methodology}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <CaseSection title="What I learned" value={distinctLessons} />
          </div>

          {(project.githubUrl || project.liveUrl) && (
            <div className="pt-8 mt-4 border-t border-hairline/70 flex flex-wrap gap-6">
              {project.githubUrl && (
                <a
                  className="inline-flex items-center gap-2 font-mono text-sm font-medium text-primary border-b border-jade pb-1 hover:text-primary-container transition-colors"
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>Explore the repository</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {project.liveUrl && (
                <Link
                  className="inline-flex items-center gap-2 font-mono text-sm font-medium text-primary border-b border-jade pb-1 hover:text-primary-container transition-colors"
                  href={project.liveUrl}
                  target={project.liveUrl.startsWith("http") ? "_blank" : undefined}
                  rel={project.liveUrl.startsWith("http") ? "noreferrer" : undefined}
                >
                  <span>Open the product</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Bottom Next Band */}
        <div className="bg-primary text-on-primary rounded-2xl p-8 sm:p-12 text-center shadow-editorial">
          <Link
            href="/work"
            className="inline-flex items-center gap-3 font-serif text-3xl sm:text-4xl font-normal text-on-primary hover:text-secondary-fixed transition-colors"
          >
            <span>More work</span>
            <ArrowUpRight className="h-7 w-7" aria-hidden="true" />
          </Link>
        </div>
      </article>
    </div>
  );
}

function CaseSection({ title, value }: { title: string; value: unknown }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-8">
      <h2 className="lg:col-span-4 font-serif text-2xl font-normal text-primary">{title}</h2>
      <div className="lg:col-span-8 text-base sm:text-[17px] leading-relaxed text-on-surface-variant max-w-prose">
        {typeof value === "string" ? (
          <p>{value}</p>
        ) : Array.isArray(value) && value.every((item) => typeof item === "string") ? (
          <ul className="space-y-3">
            {value.map((item) => (
              <li key={item} className="flex items-start gap-2.5 pb-3 border-b border-hairline/50 last:border-b-0 last:pb-0">
                <span className="font-mono text-primary mt-0.5" aria-hidden="true">↗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : Array.isArray(value) ? (
          <PortableText value={value} />
        ) : null}
      </div>
    </section>
  );
}
