import Link from "next/link";
import { ArrowRight, Terminal, Cpu, Database, Network, ExternalLink } from "lucide-react";
import { PROJECTS, ARTICLES } from "@/lib/data";

export default function HomePage() {
  const featuredProjects = PROJECTS.slice(0, 2);
  const featuredArticles = ARTICLES.slice(0, 2);

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-24">
      {/* Hero Section */}
      <section className="flex flex-col gap-6 max-w-prose">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground"></span>
          AI Product Engineering Portfolio
        </div>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
          Hi, I&apos;m Mahad.
        </h1>

        <p className="text-base text-muted-foreground sm:text-lg leading-relaxed">
          This is an{" "}
          <strong className="font-semibold text-foreground">
            intentionally over-engineered portfolio site
          </strong>{" "}
          showcasing deep AI Product Engineering, product design, and strategic
          decision-making capabilities, architectural rigor, and end-to-end
          craftsmanship.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded bg-foreground px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Terminal className="h-4 w-4" />
            <span>Talk to Mahad Assistant</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 rounded border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground"
          >
            <span>View Selected Work</span>
          </Link>
        </div>
      </section>

      {/* Selected Work Section */}
      <section className="mt-20 border-t border-border pt-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Selected Work & Case Studies
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Production AI systems and engineering architectures.
            </p>
          </div>
          <Link
            href="/work"
            className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
          >
            <span>All Projects</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {featuredProjects.map((project) => (
            <div
              key={project.slug}
              className="flex flex-col justify-between rounded border border-border bg-white p-6 transition-colors hover:border-foreground"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{project.year}</span>
                  <span>{project.role}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                  <Link
                    href={`/work/${project.slug}`}
                    className="hover:underline"
                  >
                    {project.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {project.summary}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 4 && (
                    <span className="text-[11px] text-muted-foreground self-center">
                      +{project.technologies.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs font-medium">
                <Link
                  href={`/work/${project.slug}`}
                  className="inline-flex items-center gap-1 text-foreground hover:underline"
                >
                  <span>Read Case Study</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                {project.liveUrl && (
                  <Link
                    href={project.liveUrl}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <span>Launch</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Engineering Articles */}
      <section className="mt-16 border-t border-border pt-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Technical Writing & Decisions
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Deep dives on AI architecture, ML routing, and observability.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
          >
            <span>All Articles</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-6 flex flex-col divide-y divide-border border-y border-border">
          {featuredArticles.map((article) => (
            <article
              key={article.slug}
              className="py-5 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div className="max-w-prose">
                <h3 className="text-sm font-semibold text-foreground hover:underline">
                  <Link href={`/blog/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 mt-2 sm:mt-0">
                <span>{article.readingTime}</span>
                <span>•</span>
                <span>{article.publishedAt}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* System Highlights / Architecture Callouts */}
      <section className="mt-16 border-t border-border pt-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Core Engineering Principles
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-border p-5">
            <div className="flex items-center gap-2 text-foreground font-medium text-sm">
              <Cpu className="h-4 w-4" />
              <span>In-Process ML Router</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Custom classifier exported to ONNX serving intent, route, and Roman
              Urdu predictions in &lt; 5ms without LLM latency.
            </p>
          </div>

          <div className="rounded border border-border p-5">
            <div className="flex items-center gap-2 text-foreground font-medium text-sm">
              <Database className="h-4 w-4" />
              <span>Hydrated RAG</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Qdrant vector index paired with Neon PostgreSQL canonical chunks.
              100% rebuildable, versioned, and cited.
            </p>
          </div>

          <div className="rounded border border-border p-5">
            <div className="flex items-center gap-2 text-foreground font-medium text-sm">
              <Network className="h-4 w-4" />
              <span>LangGraph Workflow</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Typed state graph with conditional edges, bounded retry, and
              observable Execution Inspector for full transparency.
            </p>
          </div>

          <div className="rounded border border-border p-5">
            <div className="flex items-center gap-2 text-foreground font-medium text-sm">
              <Terminal className="h-4 w-4" />
              <span>Strict Zero-Cost Ops</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Engineered exclusively on permanent free tiers with strict
              quota-capping and monthly audit runbooks.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
