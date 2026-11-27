import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, Terminal, BookOpen, Clock, Calendar } from "lucide-react";
import { getArticles, getArticle } from "@/lib/sanity/loadData";
import { PortableText } from "@/components/PortableText";
import { ARTICLES } from "@/lib/data";

export async function generateStaticParams() {
  const articles = await getArticles();
  const slugs = new Set(articles.map((a) => a.slug));
  ARTICLES.forEach((a) => slugs.add(a.slug));
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
  const article = await getArticle(slug);
  if (!article) return { title: "Article Not Found | Mirza Mahad Baig" };

  return {
    title: `${article.title} // Writing | Mirza Mahad Baig`,
    description: article.summary,
  };
}

export default async function WritingArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="w-full bg-background text-on-surface">
      {/* Top Anchor Bar */}
      <div className="sticky top-16 z-40 w-full bg-surface/95 border-b-[1.5px] border-primary px-4 sm:px-8 py-2.5 flex items-center justify-between font-mono text-xs backdrop-blur-sm">
        <Link
          href="/writing"
          className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary hover:text-tertiary-container transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>WRITING MONOGRAPHS</span>
        </Link>
        <div className="flex items-center gap-3 text-on-surface-variant font-semibold">
          <span>{article.readingTime}</span>
          <span>·</span>
          <span>{article.publishedAt}</span>
        </div>
      </div>

      <article className="max-w-[1000px] mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-10">
        {/* Header Block */}
        <header className="border-2 border-primary bg-surface-container-lowest p-6 sm:p-10 stamp-shadow">
          <div className="flex items-center gap-2 font-mono text-xs text-outline mb-4">
            <span className="px-2 py-0.5 bg-primary text-on-primary font-bold uppercase">
              {article.articleType?.replace(/_/g, " ") || "SYSTEM BREAKDOWN"}
            </span>
            <span>·</span>
            <span>PUBLISHED: {article.publishedAt}</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-5xl font-black uppercase text-primary leading-tight tracking-tight mb-6">
            {article.title}
          </h1>

          <div className="pl-4 border-l-4 border-tertiary-container bg-surface-container-low py-3 pr-4 font-sans text-base sm:text-lg text-on-surface leading-relaxed mb-6">
            <span className="font-mono font-bold text-xs block uppercase tracking-wider text-tertiary-container mb-1">
              THESIS ABSTRACT:
            </span>
            {article.summary}
          </div>

          <div className="flex flex-wrap items-center justify-between border-t border-outline-variant pt-4 gap-4 font-mono text-xs">
            <div className="flex flex-wrap gap-1.5">
              {article.topics.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 bg-surface-container border border-outline-variant font-bold text-primary"
                >
                  #{t}
                </span>
              ))}
            </div>

            {article.canonicalUrl && (
              <a
                href={article.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:text-tertiary-container font-semibold"
              >
                <span>Read on Medium / Canonical Source</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </header>

        {/* Article Body Content */}
        <section className="border-2 border-primary bg-surface p-6 sm:p-12 stamp-shadow font-sans text-base leading-relaxed space-y-6">
          {article.body ? (
            <PortableText value={article.body} />
          ) : article.content ? (
            <div className="space-y-6">
              {article.content.map((paragraph, index) => (
                <p key={index} className="text-on-surface text-base sm:text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-on-surface-variant italic font-mono text-xs">
              Content body currently undergoing canonical editorial review.
            </p>
          )}
        </section>

        {/* Sources & Citations if available */}
        {article.sources && article.sources.length > 0 && (
          <section className="border-2 border-primary bg-surface-container-low p-6 font-mono text-xs stamp-shadow-sm">
            <span className="font-bold text-primary uppercase block mb-3">
              PRIMARY SOURCES & ARCHITECTURAL CITATIONS:
            </span>
            <ul className="space-y-2">
              {article.sources.map((source, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-secondary font-bold">[{i + 1}]</span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold"
                  >
                    {source.title} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Assistant Ask Action Callout */}
        <section className="border-2 border-primary bg-secondary-container p-6 sm:p-8 stamp-shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold uppercase mb-1">
              <Terminal className="h-4 w-4 text-secondary" />
              <span>EXPLORE VIA CONVERSATIONAL ASSISTANT</span>
            </div>
            <p className="font-sans text-xs text-on-secondary-container">
              Have a question about the trade-offs or implementation details in this article?
            </p>
          </div>
          <Link
            href={`/chat?q=Tell me more about the insights in the article: ${article.title}`}
            className="px-5 py-2.5 bg-primary text-on-primary font-bold uppercase tracking-wider stamp-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-transform shrink-0"
          >
            Ask Assistant →
          </Link>
        </section>
      </article>
    </div>
  );
}
