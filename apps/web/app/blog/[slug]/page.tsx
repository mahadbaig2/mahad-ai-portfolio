import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ARTICLES } from "@/lib/data";

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({
    slug: a.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return { title: "Article Not Found" };

  return {
    title: `${article.title} | Mahad`,
    description: article.summary,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-24">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Articles</span>
      </Link>

      <article className="max-w-prose">
        <header className="border-b border-border pb-8">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
            {article.topics.map((t) => (
              <span
                key={t}
                className="rounded border border-border px-2 py-0.5 text-[11px]"
              >
                {t}
              </span>
            ))}
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
            {article.title}
          </h1>

          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span>By Mahad</span>
            <span>•</span>
            <span>{article.publishedAt}</span>
            <span>•</span>
            <span>{article.readingTime}</span>
          </div>
        </header>

        <div className="mt-8 flex flex-col gap-6 text-base sm:text-lg text-foreground leading-relaxed">
          {article.content.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
