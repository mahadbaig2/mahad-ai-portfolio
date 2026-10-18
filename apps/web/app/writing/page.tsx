import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowUpRight, FileText, Terminal, BookOpen } from "lucide-react";
import { getArticles } from "@/lib/sanity/loadData";

export const metadata: Metadata = {
  title: "Writing & Monographs | Mirza Mahad Baig // AI Product Engineer",
  description:
    "Engineering essays, system breakdowns, product notes, and architecture decisions by Mirza Mahad Baig.",
};

export default async function WritingPage() {
  const articles = await getArticles();
  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <div className="w-full bg-background text-on-surface">
      {/* Top Metadata Ticker */}
      <div className="w-full bg-surface-container border-b-[1.5px] border-primary px-6 py-2 flex flex-wrap justify-between items-center font-mono text-xs text-on-surface-variant overflow-x-auto gap-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-primary">MONOGRAPH SERIES: #003</span>
          <span>·</span>
          <span>DISPATCHES ON APPLIED AI & SYSTEMS DESIGN</span>
        </div>
        <div className="flex items-center gap-3">
          <span>LOC: ISLAMABAD [33.6844° N, 73.0479° E]</span>
          <span>·</span>
          <span className="text-secondary font-bold">STATUS: PUBLISHED RECORDS</span>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-16">
        {/* ========================================================================= */}
        {/* HERO PUBLICATION HEADER                                                   */}
        {/* ========================================================================= */}
        <section className="border-2 border-primary bg-surface p-6 sm:p-10 stamp-shadow">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start lg:items-end">
            <div className="lg:col-span-8">
              <div className="font-mono text-xs font-bold text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary inline-block animate-pulse" />
                <span>ENGINEERING & ARCHITECTURAL DISPATCHES</span>
              </div>
              <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-black text-primary uppercase tracking-tight leading-tight">
                Notes From Building Between Product and AI.
              </h1>
            </div>
            <div className="lg:col-span-4 lg:border-l-2 border-outline-variant lg:pl-8 space-y-3 font-mono text-xs">
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                Essays, system breakdowns, product analysis, architecture decisions, and verified lessons from engineering AI systems under real constraints.
              </p>
              <div className="pt-3 border-t border-outline-variant text-[11px] text-outline">
                FORMAT: LONG-FORM SPECIFICATION & EVIDENCE
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FEATURED MONOGRAPH SPREAD                                                 */}
        {/* ========================================================================= */}
        {featuredArticle && (
          <section className="border-2 border-primary bg-surface-container-lowest stamp-shadow">
            {/* Header Ribbon */}
            <div className="border-b-2 border-primary bg-surface-container px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2 font-bold text-primary uppercase">
                <span className="w-2 h-2 bg-primary" />
                <span>FEATURED MONOGRAPH // ISSUE 01</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <span>{featuredArticle.publishedAt}</span>
                <span>·</span>
                <span>{featuredArticle.readingTime}</span>
              </div>
            </div>

            {/* Content Spread */}
            <div className="p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-primary bg-surface-container font-mono text-[10px] font-bold text-primary uppercase mb-4">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                  <span>{featuredArticle.articleType?.replace(/_/g, " ") || "SYSTEM BREAKDOWN"}</span>
                </div>

                <h2 className="font-headline text-2xl sm:text-4xl font-black uppercase text-primary leading-tight mb-4">
                  <Link href={`/writing/${featuredArticle.slug}`} className="hover:underline">
                    {featuredArticle.title}
                  </Link>
                </h2>

                <div className="pl-4 border-l-4 border-tertiary-container bg-surface-container-low py-3 pr-4 font-sans text-sm sm:text-base text-on-surface leading-relaxed mb-6">
                  <span className="font-mono font-bold text-xs block uppercase tracking-wider text-tertiary-container mb-1">
                    THESIS ABSTRACT:
                  </span>
                  {featuredArticle.summary}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredArticle.topics.map((t) => (
                    <span
                      key={t}
                      className="border border-outline-variant bg-surface px-2 py-0.5 font-mono text-[11px] font-bold text-primary"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between border-t border-outline-variant pt-4 gap-4 font-mono text-xs">
                <Link
                  href={`/writing/${featuredArticle.slug}`}
                  className="px-6 py-3 bg-tertiary-container text-on-tertiary font-bold flex items-center gap-2 stamp-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-transform uppercase"
                >
                  <span>Read Full Monograph</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                {featuredArticle.canonicalUrl && (
                  <a
                    href={featuredArticle.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-semibold"
                  >
                    <span>Canonical Publication ↗</span>
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* ARCHIVE PUBLICATIONS GRID                                                 */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-primary pb-3 font-mono text-xs">
            <span className="font-bold text-primary uppercase">ARCHIVAL ARTICLES ({articles.length})</span>
            <span className="text-on-surface-variant">FORMAT: PEER-ACCESSIBLE DOSSIER</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {remainingArticles.map((article, idx) => (
              <article
                key={article.slug}
                className="border-2 border-primary bg-surface-container-lowest p-6 sm:p-8 flex flex-col justify-between stamp-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-xs text-outline border-b border-outline-variant pb-2 mb-4">
                    <span>INDEX // 0{idx + 2}</span>
                    <span>{article.readingTime}</span>
                  </div>

                  <div className="font-mono text-[10px] text-secondary font-bold uppercase mb-2">
                    {article.articleType?.replace(/_/g, " ") || "TECHNICAL MONOGRAPH"}
                  </div>

                  <h3 className="font-headline text-xl sm:text-2xl font-black uppercase text-primary leading-tight mb-3">
                    <Link href={`/writing/${article.slug}`} className="hover:underline">
                      {article.title}
                    </Link>
                  </h3>

                  <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
                    {article.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {article.topics.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-surface-container border border-outline-variant font-mono text-[10px] font-bold text-primary"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-outline-variant pt-4 flex items-center justify-between font-mono text-xs">
                  <span className="text-on-surface-variant">{article.publishedAt}</span>
                  <Link
                    href={`/writing/${article.slug}`}
                    className="font-bold text-primary hover:text-tertiary-container flex items-center gap-1 uppercase"
                  >
                    <span>Read Article</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
