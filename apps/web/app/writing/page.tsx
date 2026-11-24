import Link from "next/link";
import type { Metadata } from "next";
import { VisualPlaceholder } from "@/components/VisualPlaceholder";
import { ArrowRight, ArrowUpRight, AudioLines, BookOpen } from "lucide-react";
import { getArticles } from "@/lib/sanity/loadData";
import { urlForImage } from "@/lib/sanity/image";

export const metadata: Metadata = {
  title: "Writing | Mirza Mahad Baig",
  description: "Essays, engineering breakdowns, and notes on product design and applied AI.",
};

export default async function WritingPage() {
  const articles = await getArticles();
  const [featured, ...rest] = articles;
  const featuredHero = featured?.heroImage
    ? urlForImage(featured.heroImage)?.width(1000).url()
    : null;

  return (
    <div className="flex flex-col w-full bg-paper min-h-screen">
      <div className="max-w-[1440px] mx-auto w-full px-5 md:px-10 lg:px-16 py-12 lg:py-16 space-y-12">
        {/* Hero Editorial Section */}
        <section className="space-y-5">
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            <span className="font-mono text-xs text-muted-text uppercase tracking-wider">
              Essays, Architecture Notes &amp; Writing
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[4rem] font-normal text-primary tracking-tight leading-[1.08] max-w-4xl">
            Notes from building between product and AI.
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2 items-start">
            <div className="lg:col-span-8">
              <p className="text-lg text-on-surface leading-relaxed max-w-prose">
                Architectural breakdowns, routing notes, and practical lessons written directly from building interfaces, RAG pipelines, and full-stack software.
              </p>
            </div>
            <div className="lg:col-span-4 bg-surface-white rounded-xl border border-hairline/80 p-5 shadow-editorial-sm">
              <div className="font-mono text-xs text-secondary uppercase tracking-wider mb-1">
                Publication Approach
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Grounded technical writing focused on architecture trade-offs, evaluation constraints, and product clarity rather than generic commentary.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Article Split Card */}
        {featured && (
          <article className="bg-surface-white rounded-2xl border border-hairline/80 shadow-editorial-sm overflow-hidden p-6 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded bg-sage text-primary font-medium">
                      Featured Essay
                    </span>
                    <span className="text-muted-text">{featured.publishedAt}</span>
                    {featured.readingTime && (
                      <>
                        <span className="text-hairline" aria-hidden="true">•</span>
                        <span className="text-muted-text">{featured.readingTime}</span>
                      </>
                    )}
                  </div>

                  <h2 className="font-serif text-3xl sm:text-4xl font-normal text-primary tracking-tight">
                    <Link
                      href={`/writing/${featured.slug}`}
                      className="hover:text-primary-container transition-colors"
                    >
                      {featured.title}
                    </Link>
                  </h2>

                  <p className="text-base text-on-surface-variant leading-relaxed">
                    {featured.summary}
                  </p>

                  {featured.topics && featured.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {featured.topics.map((topic) => (
                        <span
                          key={topic}
                          className="font-mono text-xs bg-mint text-primary px-2.5 py-1 rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/writing/${featured.slug}`}
                    className="inline-flex items-center gap-2 bg-primary-container text-on-primary hover:bg-primary transition-colors px-5 py-2.5 rounded text-sm font-medium shadow-editorial-sm"
                  >
                    <span>Read full article</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between bg-charcoal-gutter text-surface-white rounded-xl p-6">
                {featuredHero ? (
                  <div className="relative w-full h-56 rounded-lg overflow-hidden mb-4">
                    <VisualPlaceholder label={`${featured.title} article imagery`} />
                  </div>
                ) : (
                  <div className="space-y-4 my-auto">
                    <div className="flex items-center justify-between font-mono text-xs text-secondary-fixed pb-3 border-b border-white/10">
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Monograph // 01</span>
                      </span>
                      <span>{featured.readingTime}</span>
                    </div>
                    <p className="font-serif text-xl sm:text-2xl italic text-surface-white leading-snug">
                      “{featured.keyTakeaway || featured.summary}”
                    </p>
                  </div>
                )}
                <div className="pt-4 border-t border-white/10 font-mono text-xs text-on-primary-container">
                  Slug: /writing/{featured.slug}
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Chronological Index of Remaining Articles */}
        {rest.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-hairline">
              <div>
                <span className="font-mono text-xs text-muted-text uppercase tracking-wider block">
                  Archive // All Essays &amp; Breakdowns
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-primary mt-1">
                  Chronological Index
                </h2>
              </div>
              <span className="font-mono text-xs text-muted-text">
                {articles.length} published notes
              </span>
            </div>

            <div className="space-y-4">
              {rest.map((article, idx) => (
                <article
                  key={article.slug}
                  className="bg-surface-white rounded-xl border border-hairline/80 p-6 lg:p-8 shadow-editorial-sm hover:shadow-editorial transition-shadow group"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    <div className="lg:col-span-3 space-y-1 font-mono text-xs">
                      <div className="text-primary font-medium">
                        NOTE // {String(idx + 2).padStart(2, "0")}
                      </div>
                      <div className="text-muted-text">
                        {article.publishedAt}
                        {article.readingTime ? ` · ${article.readingTime}` : ""}
                      </div>
                    </div>

                    <div className="lg:col-span-7 space-y-2.5">
                      <h3 className="font-serif text-2xl font-normal text-primary group-hover:text-primary-container transition-colors">
                        <Link href={`/writing/${article.slug}`}>{article.title}</Link>
                      </h3>
                      <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                        {article.summary}
                      </p>
                      {article.topics && article.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {article.topics.map((topic) => (
                            <span
                              key={topic}
                              className="font-mono text-xs bg-mint text-primary px-2.5 py-0.5 rounded"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-2 lg:text-right pt-1 lg:pt-0">
                      <Link
                        href={`/writing/${article.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-container transition-colors"
                      >
                        <span>Read article</span>
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Deep Forest Assistant Query Banner */}
        <section className="bg-primary text-on-primary rounded-2xl p-8 sm:p-12 shadow-editorial flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-secondary-fixed uppercase tracking-wider">
              <AudioLines className="h-4 w-4" aria-hidden="true" />
              <span>Portfolio Assistant</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-on-primary">
              Have a question about these articles?
            </h2>
            <p className="text-base text-on-primary-container leading-relaxed">
              Indexed articles and architecture notes can be queried interactively through the grounded portfolio assistant.
            </p>
          </div>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-secondary-fixed text-on-secondary-fixed px-6 py-3 rounded text-sm font-semibold hover:bg-surface-white transition-colors shrink-0"
          >
            <span>Open Assistant</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </div>
  );
}
