import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, AudioLines, BookOpen, Code2, FileText, Mail } from "lucide-react";
import { getSiteSettings } from "@/lib/sanity/loadData";

export const metadata: Metadata = {
  title: "Contact | Mirza Mahad Baig",
  description: "Direct contact channels, résumé links, and collaboration guidance for Mirza Mahad Baig.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col w-full bg-paper min-h-screen">
      {/* Top Section: Header & Quick Summary Grid */}
      <section className="max-w-[1440px] mx-auto w-full px-5 md:px-10 lg:px-16 pt-12 pb-10 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint border border-hairline/60 font-mono text-xs text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
              <span>Direct Contact &amp; Collaboration</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.75rem] font-normal text-primary tracking-tight leading-[1.06]">
              Let’s talk about a <span className="italic text-secondary">real problem</span>.
            </h1>
            <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Good work starts with a clear conversation. Reach out directly for AI Product Engineering roles, senior product design collaborations, or technical discussions about anything in this portfolio.
            </p>
          </div>

          <div className="hidden lg:block max-w-xs bg-surface-white p-4 rounded-xl border border-hairline shadow-editorial-sm space-y-2">
            <div className="font-serif text-lg font-medium text-primary">
              {settings.authorName}
            </div>
            <div className="font-mono text-xs text-muted-text">{settings.location}</div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Direct email and verified public links below—no third-party forms or intermediary queues required.
            </p>
          </div>
        </div>

        {/* Four-Cell Information Band */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-surface-white rounded-2xl border border-hairline/80 shadow-editorial-sm">
          <div className="p-3.5 rounded-xl bg-surface-container-low/70 space-y-1">
            <div className="font-mono text-[11px] text-muted-text uppercase tracking-wider">
              Location
            </div>
            <div className="text-base font-medium text-primary">{settings.location}</div>
            <div className="font-mono text-xs text-muted-text">Remote-ready worldwide</div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low/70 space-y-1">
            <div className="font-mono text-[11px] text-muted-text uppercase tracking-wider">
              Target Roles
            </div>
            <div className="text-base font-medium text-primary">
              {settings.roleInterests?.[0] || "AI Product Engineer"}
            </div>
            <div className="font-mono text-xs text-muted-text">Product Design to AI Stack</div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low/70 space-y-1">
            <div className="font-mono text-[11px] text-muted-text uppercase tracking-wider">
              Core Stack
            </div>
            <div className="text-base font-medium text-primary">
              Next.js · FastAPI · RAG
            </div>
            <div className="font-mono text-xs text-muted-text">Design Systems, ONNX, LangGraph</div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low/70 space-y-1">
            <div className="font-mono text-[11px] text-muted-text uppercase tracking-wider">
              Direct Email
            </div>
            <div className="text-base font-medium text-primary break-all select-all">
              {settings.email}
            </div>
            <div className="font-mono text-xs text-muted-text">Preferred first contact</div>
          </div>
        </div>
      </section>

      {/* Primary Contact & Verified Channels Band */}
      <section className="w-full bg-surface-container-low border-y border-hairline/70 py-14">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <span className="font-mono text-xs text-secondary uppercase tracking-widest">
                Verified Channels
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-primary mt-1">
                Direct ways to connect
              </h2>
            </div>
            <p className="text-sm text-muted-text max-w-md">
              Choose the channel that works best for sharing context, viewing code, or reviewing experience.
            </p>
          </div>

          {/* Primary Cards: Email + LinkedIn */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-white p-7 sm:p-8 rounded-2xl border border-hairline shadow-editorial-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs bg-sage text-primary px-3 py-1 rounded-full font-medium">
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Direct Email</span>
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-normal text-primary mb-2">
                  Tell me what you’re working on
                </h3>
                <p className="text-sm sm:text-base text-on-surface-variant mb-5 leading-relaxed">
                  Best for role conversations, founding engineering opportunities, product architecture discussions, and direct briefs.
                </p>
                <div className="bg-paper p-3.5 rounded-lg border border-hairline/70 font-mono text-sm text-primary select-all break-all">
                  {settings.email}
                </div>
              </div>
              <div className="pt-6 mt-5 border-t border-hairline/60">
                <a
                  href={`mailto:${settings.email}`}
                  className="inline-flex items-center gap-2 bg-primary-container text-on-primary hover:bg-primary px-5 py-2.5 rounded text-sm font-medium transition-colors"
                >
                  <span>Email {settings.email}</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="bg-surface-white p-7 sm:p-8 rounded-2xl border border-hairline shadow-editorial-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs bg-mint text-primary px-3 py-1 rounded-full font-medium">
                    <span>Professional Profile</span>
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-normal text-primary mb-2">
                  LinkedIn
                </h3>
                <p className="text-sm sm:text-base text-on-surface-variant mb-5 leading-relaxed">
                  View chronological work history, role tenure, and connect directly for recruiting outreach.
                </p>
                <div className="bg-paper p-3.5 rounded-lg border border-hairline/70 font-mono text-xs sm:text-sm text-primary break-all">
                  {settings.linkedinUrl}
                </div>
              </div>
              <div className="pt-6 mt-5 border-t border-hairline/60">
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-primary-container text-on-primary hover:bg-primary px-5 py-2.5 rounded text-sm font-medium transition-colors"
                >
                  <span>Open LinkedIn</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          {/* Secondary Cards: GitHub, Writing/Medium, Résumé / Photo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-white p-6 rounded-xl border border-hairline shadow-editorial-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between font-mono text-xs text-muted-text uppercase">
                  <span>Repositories</span>
                  <Code2 className="h-4 w-4 text-secondary" aria-hidden="true" />
                </div>
                <h3 className="font-serif text-xl font-medium text-primary">GitHub</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Inspect source code for Talk to Mahad, evaluation harnesses, pipelines, and full-stack projects.
                </p>
              </div>
              <a
                href={settings.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-container pt-3 border-t border-hairline/50"
              >
                <span>Open GitHub</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="bg-surface-white p-6 rounded-xl border border-hairline shadow-editorial-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between font-mono text-xs text-muted-text uppercase">
                  <span>Publications</span>
                  <BookOpen className="h-4 w-4 text-secondary" aria-hidden="true" />
                </div>
                <h3 className="font-serif text-xl font-medium text-primary">Writing &amp; Medium</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Read architecture notes and essays on product design, ONNX routing, and observability.
                </p>
              </div>
              <div className="pt-3 border-t border-hairline/50 flex flex-wrap gap-4">
                <Link
                  href="/writing"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-container"
                >
                  <span>Writing Index</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                {settings.mediumUrl && (
                  <a
                    href={settings.mediumUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:text-primary"
                  >
                    <span>Medium</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>

            <div className="bg-surface-white p-6 rounded-xl border border-hairline shadow-editorial-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between font-mono text-xs text-muted-text uppercase">
                  <span>Credentials &amp; Context</span>
                  <FileText className="h-4 w-4 text-secondary" aria-hidden="true" />
                </div>
                <h3 className="font-serif text-xl font-medium text-primary">
                  {settings.resumePdfUrl ? "Résumé PDF" : "Background & Assistant"}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Review full experience, education, or ask the portfolio assistant specific diligence questions.
                </p>
              </div>
              <div className="pt-3 border-t border-hairline/50 flex flex-wrap gap-4">
                {settings.resumePdfUrl ? (
                  <a
                    href={settings.resumePdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-container"
                  >
                    <span>Open Résumé</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ) : (
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-container"
                  >
                    <span>About &amp; Track Record</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Fast-Signal / Photo Split */}
      <section className="max-w-[1440px] mx-auto w-full px-5 md:px-10 lg:px-16 py-14">
        <div className="bg-primary text-on-primary rounded-2xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-editorial">
          <div className="lg:col-span-7 space-y-4">
            <span className="font-mono text-xs text-secondary-fixed uppercase tracking-widest">
              Fast Paths to Signal
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal">
              Evaluating fit? Inspect the work or ask the assistant directly.
            </h2>
            <p className="text-base text-on-primary-container leading-relaxed max-w-xl">
              Skip introductory back-and-forth by jumping straight to case studies or querying the grounded AI portfolio assistant.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/work"
                className="inline-flex items-center gap-2 bg-secondary-fixed text-on-secondary-fixed px-5 py-2.5 rounded text-sm font-semibold hover:bg-surface-white transition-colors"
              >
                <span>Browse Work Archive</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-5 py-2.5 rounded text-sm font-medium hover:bg-tertiary-container transition-colors border border-white/15"
              >
                <AudioLines className="h-4 w-4 text-secondary-fixed" aria-hidden="true" />
                <span>Talk to Mahad</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/15">
              <Image
                src="/images/travel/travel-handlebars.png"
                alt="Motorcycle handlebars overlooking a northern Pakistan mountain pass road"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
