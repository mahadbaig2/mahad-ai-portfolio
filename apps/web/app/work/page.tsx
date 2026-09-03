import Link from "next/link";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { PROJECTS } from "@/lib/data";

export const metadata = {
  title: "Work & Case Studies | Mahad",
  description:
    "Selected engineering projects, production AI architectures, and technical case studies.",
};

export default function WorkPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-24">
      <header className="max-w-prose">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
          Selected Work
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Production AI systems, architectural foundations, and verifiable
          engineering deliverables designed under real-world constraints.
        </p>
      </header>

      <div className="mt-12 flex flex-col divide-y divide-border border-y border-border">
        {PROJECTS.map((project) => (
          <article key={project.slug} className="py-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {project.year}
                  </span>
                  <span>•</span>
                  <span>{project.role}</span>
                </div>

                <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground hover:underline">
                  <Link href={`/work/${project.slug}`}>{project.title}</Link>
                </h2>

                <p className="mt-1 text-sm font-medium text-foreground">
                  {project.tagline}
                </p>

                <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {project.summary}
                </p>

                {/* Key Metrics */}
                <div className="mt-6 flex flex-wrap gap-4">
                  {project.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded border border-border px-3 py-1.5"
                    >
                      <div className="text-[11px] text-muted-foreground">
                        {metric.label}
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tech Stack */}
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex shrink-0 items-center gap-4 lg:mt-0 lg:flex-col lg:items-end">
                <Link
                  href={`/work/${project.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
                >
                  <span>Read Full Case Study</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                {project.liveUrl && (
                  <Link
                    href={project.liveUrl}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <span>Launch Experience</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}

                {project.githubUrl && (
                  <Link
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>View Repository</span>
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
