import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ARTICLES } from "@/lib/data";

export const metadata = {
  title: "Blog & Technical Notes | Mahad",
  description:
    "Engineering articles, architecture breakdowns, and system design notes by Mahad.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-24">
      <header className="max-w-prose">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
          Articles & Notes
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Technical deep dives into applied machine learning, zero-cost
          infrastructure, in-process routing, and production AI system design.
        </p>
      </header>

      <div className="mt-12 flex flex-col divide-y divide-border border-y border-border">
        {ARTICLES.map((article) => (
          <article key={article.slug} className="py-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <div className="max-w-2xl">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                  {article.topics.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-border px-1.5 py-0.5 text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <h2 className="text-lg font-semibold text-foreground hover:underline">
                  <Link href={`/blog/${article.slug}`}>{article.title}</Link>
                </h2>

                <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {article.summary}
                </p>

                <div className="mt-4">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground sm:mt-0 shrink-0">
                <span>{article.readingTime}</span>
                <span>•</span>
                <span>{article.publishedAt}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
