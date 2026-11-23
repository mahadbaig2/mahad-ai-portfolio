import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Calendar, Clock } from "lucide-react";
import { getArticles, getArticle } from "@/lib/sanity/loadData";
import { PortableText } from "@/components/PortableText";
import { ARTICLES } from "@/lib/data";
import { urlForImage } from "@/lib/sanity/image";

export async function generateStaticParams() {
  const articles = await getArticles();
  return [
    ...new Set([
      ...articles.map((article) => article.slug),
      ...ARTICLES.map((article) => article.slug),
    ]),
  ].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  return article
    ? { title: `${article.title} | Mirza Mahad Baig`, description: article.summary }
    : { title: "Article not found | Mirza Mahad Baig" };
}

export default async function WritingArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const heroUrl = article.heroImage
    ? urlForImage(article.heroImage)?.width(1200).url()
    : null;

  return (
    <div className="w-full bg-paper min-h-screen">
      <article className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 py-10 space-y-10">
        {/* Top Article Hero Card */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-text">
            <Link
              href="/writing"
              className="inline-flex items-center gap-1.5 text-primary font-medium hover:text-primary-container transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>All writing</span>
            </Link>
            <span aria-hidden="true">/</span>
            <span>{article.articleType || "Engineering Essay"}</span>
          </div>

          {article.topics && article.topics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {article.topics.map((topic) => (
                <span
                  key={topic}
                  className="px-2.5 py-1 rounded bg-mint border border-hairline/60 font-mono text-xs text-primary"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          <div className="max-w-4xl space-y-4">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[3.5rem] font-normal text-primary tracking-tight leading-[1.08]">
              {article.title}
            </h1>
            {article.summary && (
              <p className="text-lg sm:text-xl text-on-surface-variant leading-relaxed max-w-3xl">
                {article.summary}
              </p>
            )}
          </div>

          {/* Author & Metadata Bar */}
          <div className="bg-surface-container-low border border-hairline/80 rounded-xl px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted-text">
            <span className="font-sans text-sm font-semibold text-primary">
              Mirza Mahad Baig
            </span>
            <span className="hidden sm:inline text-hairline" aria-hidden="true">|</span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{article.publishedAt}</span>
            </span>
            {article.readingTime && (
              <>
                <span className="hidden sm:inline text-hairline" aria-hidden="true">|</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{article.readingTime}</span>
                </span>
              </>
            )}
          </div>
        </header>

        {heroUrl && (
          <figure className="bg-surface-white rounded-2xl border border-hairline p-3 shadow-editorial-sm">
            <div className="relative aspect-[16/9] max-h-[520px] w-full overflow-hidden rounded-xl bg-surface-container">
              <Image
                src={heroUrl}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1200px"
              />
            </div>
          </figure>
        )}

        {/* Long-form Reading Canvas (68ch Measure) */}
        <div className="bg-surface-white rounded-2xl border border-hairline/80 shadow-editorial-sm px-6 py-10 sm:px-12 lg:px-20 lg:py-14">
          <div className="max-w-prose mx-auto space-y-6">
            {article.body ? (
              <PortableText value={article.body} />
            ) : article.content?.length ? (
              <div className="space-y-5 text-base sm:text-[17px] leading-[1.75] text-on-surface-variant">
                {article.content.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-base text-muted-text">
                The full article is being prepared for publication.
              </p>
            )}

            {article.sources?.length ? (
              <section className="border-t border-hairline pt-8 mt-10">
                <h2 className="font-serif text-2xl font-normal text-primary mb-4">
                  Sources &amp; References
                </h2>
                <ul className="space-y-2.5 text-sm">
                  {article.sources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary font-medium underline underline-offset-4 decoration-jade hover:text-primary-container"
                      >
                        <span>{source.title}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {article.canonicalUrl && (
              <div className="pt-4">
                <a
                  className="inline-flex items-center gap-1.5 font-mono text-sm font-medium text-primary border-b border-jade pb-1 hover:text-primary-container transition-colors"
                  href={article.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>Read original publication</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Next Reading Band */}
        <div className="bg-primary text-on-primary rounded-2xl p-8 sm:p-12 text-center shadow-editorial">
          <Link
            href="/writing"
            className="inline-flex items-center gap-3 font-serif text-3xl sm:text-4xl font-normal text-on-primary hover:text-secondary-fixed transition-colors"
          >
            <span>Explore more writing</span>
            <ArrowUpRight className="h-7 w-7" aria-hidden="true" />
          </Link>
        </div>
      </article>
    </div>
  );
}
