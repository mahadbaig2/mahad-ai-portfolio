import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Github,
  Linkedin,
  BookOpen,
  Mail,
  FileText,
  Terminal,
  ArrowUpRight,
  Download,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { getSiteSettings } from "@/lib/sanity/loadData";

export const metadata: Metadata = {
  title: "Contact & Dispatch // Mirza Mahad Baig // AI Product Engineer",
  description:
    "Direct contact links, professional profiles, verified résumé, and recruiter inquiries for Mirza Mahad Baig.",
};

export default async function ContactPage() {
  const siteSettings = await getSiteSettings();

  const channels = [
    {
      name: "ELECTRONIC MAIL",
      label: "PRIMARY INQUIRY",
      value: siteSettings.email,
      href: `mailto:${siteSettings.email}`,
      description: "Direct transmission for confidential product specs, advisory briefs, and engineering inquiries.",
      icon: Mail,
      action: "SEND EMAIL",
    },
    {
      name: "LINKEDIN NETWORK",
      label: "PROFESSIONAL PROFILE",
      value: "linkedin.com/in/mahadbaig",
      href: siteSettings.linkedinUrl,
      description: "Professional background, direct messaging, verified work recommendations, and updates.",
      icon: Linkedin,
      action: "CONNECT ON LINKEDIN",
    },
    {
      name: "GITHUB ARCHIVE",
      label: "SOURCE REPOSITORIES",
      value: "github.com/mahadbaig2",
      href: siteSettings.githubUrl,
      description: "Open-source RAG pipelines, FastAPI backends, LangGraph agents, and Next.js frontend code.",
      icon: Github,
      action: "INSPECT REPOSITORIES",
    },
    {
      name: "MEDIUM PUBLICATIONS",
      label: "TECHNICAL MONOGRAPHS",
      value: "medium.com/@mirza.mahad",
      href: siteSettings.mediumUrl,
      description: "In-depth system breakdowns, architectural trade-offs, and product design methodologies.",
      icon: BookOpen,
      action: "READ ARTICLES",
    },
  ];

  return (
    <div className="w-full bg-background text-on-surface">
      {/* Top System Marginalia Bar */}
      <div className="w-full bg-surface-container border-b-[1.5px] border-primary px-6 py-2 flex flex-wrap justify-between items-center font-mono text-xs text-on-surface-variant overflow-x-auto gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="font-bold text-primary">SYS_STATUS: ACTIVE</span>
          <span className="text-outline">·</span>
          <span>LOCATION: ISLAMABAD, PK [33.6844° N, 73.0479° E]</span>
        </div>
        <div className="flex items-center gap-3 text-primary font-semibold">
          <span>ENGAGEMENT: OPEN TO AI PRODUCT ROLES</span>
          <span className="text-outline">·</span>
          <span>RESPONSE: &lt; 24H SLA</span>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-16">
        {/* ========================================================================= */}
        {/* HERO SECTION: INQUIRY DISPATCH                                            */}
        {/* ========================================================================= */}
        <section className="border-2 border-primary bg-surface-container-lowest p-6 sm:p-10 stamp-shadow">
          <div className="flex flex-wrap justify-between items-center border-b border-outline-variant pb-4 mb-6 gap-2 font-mono text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary text-on-primary font-bold uppercase">
                DISPATCH REF
              </span>
              <span className="text-primary font-semibold">
                DOSSIER // 007 — DIRECT DISPATCH & INQUIRY CHANNELS
              </span>
            </div>
            <div>STATUS: DIRECT TRANSMISSION OPEN</div>
          </div>

          <div className="max-w-4xl mb-8">
            <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-primary leading-tight mb-4">
              Let&apos;s Talk About a Real Problem.
            </h1>
            <p className="font-sans text-base sm:text-lg text-on-surface leading-relaxed max-w-3xl">
              I’m open to AI Product Engineering, Applied AI, and technical product design opportunities where product judgment, user experience, and implementation depth both matter.
            </p>
          </div>

          {/* Quick Status Meta Strip: 4-Column Technical Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 border-2 border-primary divide-y md:divide-y-0 md:divide-x-2 divide-primary bg-surface font-mono text-xs">
            <div className="p-4 flex flex-col justify-between">
              <span className="text-outline mb-1 font-bold uppercase">COORDINATES</span>
              <div className="font-bold text-primary flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Islamabad, Pakistan [PK]</span>
              </div>
            </div>

            <div className="p-4 flex flex-col justify-between">
              <span className="text-outline mb-1 font-bold uppercase">ENGAGEMENT WINDOW</span>
              <div className="font-bold text-secondary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                <span>Open: AI Product Engineering</span>
              </div>
            </div>

            <div className="p-4 flex flex-col justify-between">
              <span className="text-outline mb-1 font-bold uppercase">CORE OPERATING DOMAINS</span>
              <div className="font-semibold text-primary truncate">
                AI Prod Eng, Applied AI, UX Systems
              </div>
            </div>

            <div className="p-4 flex flex-col justify-between bg-surface-container-low">
              <span className="text-outline mb-1 font-bold uppercase">PRIMARY INBOX</span>
              <a
                href={`mailto:${siteSettings.email}`}
                className="font-bold text-primary hover:underline truncate"
              >
                {siteSettings.email}
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1: VERIFIED TRANSMISSION CHANNELS (BENTO GRID)                     */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-primary pb-3 font-mono text-xs">
            <span className="font-bold text-primary uppercase">01 // VERIFIED TRANSMISSION CHANNELS</span>
            <span className="text-on-surface-variant">[SLA: &lt; 24H DIRECT ASYNC]</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {channels.map((ch) => {
              const Icon = ch.icon;
              return (
                <div
                  key={ch.name}
                  className="border-2 border-primary bg-surface-container-lowest p-6 sm:p-8 flex flex-col justify-between stamp-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
                >
                  <div>
                    <div className="flex justify-between items-start border-b border-outline-variant pb-3 mb-4 font-mono text-xs">
                      <div className="flex items-center gap-2 font-bold text-primary">
                        <Icon className="h-4 w-4" />
                        <span>{ch.name}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-surface-container border border-outline-variant text-[10px] text-outline uppercase font-semibold">
                        {ch.label}
                      </span>
                    </div>

                    <p className="font-sans text-sm text-on-surface-variant mb-4 leading-relaxed">
                      {ch.description}
                    </p>

                    <div className="p-3 bg-surface-container border border-outline-variant font-mono text-xs text-primary font-bold mb-6">
                      {ch.value}
                    </div>
                  </div>

                  <a
                    href={ch.href}
                    target={ch.href.startsWith("http") ? "_blank" : undefined}
                    rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="px-5 py-2.5 bg-primary text-on-primary font-mono text-xs font-bold uppercase flex items-center justify-between hover:bg-tertiary-container transition-colors tracking-wider stamp-shadow-sm"
                  >
                    <span>{ch.action}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: VERIFIED RÉSUMÉ DOSSIER                                        */}
        {/* ========================================================================= */}
        <section className="border-2 border-primary bg-surface p-6 sm:p-10 stamp-shadow" id="resume">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="font-mono text-xs font-bold text-tertiary-container uppercase mb-2">
                02 // VERIFIED RÉSUMÉ DOSSIER
              </div>
              <h2 className="font-headline text-2xl sm:text-3xl font-black uppercase text-primary mb-2">
                Mirza Mahad Baig — AI Product Engineering Résumé
              </h2>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                Comprehensive one-page technical curriculum vitae detailing ~6 years of product design, multi-tenant SaaS architecture (500+ Busyfile screens), RAG retrieval pipelines, and full-stack implementations.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3 font-mono text-xs">
              {siteSettings.resumePdfUrl ? (
                <a
                  href={siteSettings.resumePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-tertiary-container text-on-tertiary font-bold uppercase flex items-center gap-2 stamp-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-transform"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Résumé (PDF)</span>
                </a>
              ) : (
                <a
                  href={`mailto:${siteSettings.email}?subject=Resume%20Request%20-%20Mirza%20Mahad%20Baig`}
                  className="px-6 py-3 bg-primary text-on-primary font-bold uppercase flex items-center gap-2 stamp-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-transform"
                >
                  <Mail className="h-4 w-4" />
                  <span>Request Résumé via Email</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: RECRUITER ASSISTANT INQUIRY PROMPTS                            */}
        {/* ========================================================================= */}
        <section className="border-2 border-primary bg-surface-container-low p-6 sm:p-10 stamp-shadow">
          <div className="font-mono text-xs font-bold text-secondary uppercase mb-2 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-secondary" />
            <span>03 // ASSISTANT SCREENING PROMPTS FOR RECRUITERS & FOUNDERS</span>
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl font-black uppercase text-primary mb-4">
            Screen My Background Interactively
          </h2>
          <p className="font-sans text-sm text-on-surface-variant mb-6 max-w-3xl leading-relaxed">
            Short on time? You can question my grounded AI assistant directly. It answers using strictly indexed Sanity documents with precise citation references:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <Link
              href="/chat?q=Summarize Mahad's 6 years of product design and UI/UX experience."
              className="p-4 border-2 border-primary bg-surface hover:bg-surface-container transition-colors flex flex-col justify-between stamp-shadow-sm"
            >
              <div>
                <span className="font-bold text-primary block mb-2">FOR DESIGN LEADERS:</span>
                <p className="font-sans text-xs text-on-surface-variant">
                  &quot;Summarize Mahad&apos;s product design and UI/UX experience across complex SaaS.&quot;
                </p>
              </div>
              <span className="text-secondary font-bold pt-3 block">Ask Assistant →</span>
            </Link>

            <Link
              href="/chat?q=What are Mahad's technical skills in RAG, LangGraph, and ML query routing?"
              className="p-4 border-2 border-primary bg-surface hover:bg-surface-container transition-colors flex flex-col justify-between stamp-shadow-sm"
            >
              <div>
                <span className="font-bold text-primary block mb-2">FOR AI & ENG MANAGERS:</span>
                <p className="font-sans text-xs text-on-surface-variant">
                  &quot;What are Mahad&apos;s technical skills in RAG, LangGraph, and ML query routing?&quot;
                </p>
              </div>
              <span className="text-secondary font-bold pt-3 block">Ask Assistant →</span>
            </Link>

            <Link
              href="/chat?q=Why does Mahad position himself as an AI Product Engineer rather than just a designer or developer?"
              className="p-4 border-2 border-primary bg-surface hover:bg-surface-container transition-colors flex flex-col justify-between stamp-shadow-sm"
            >
              <div>
                <span className="font-bold text-primary block mb-2">FOR FOUNDERS & EXECS:</span>
                <p className="font-sans text-xs text-on-surface-variant">
                  &quot;Why does Mahad position himself as an AI Product Engineer rather than just a designer?&quot;
                </p>
              </div>
              <span className="text-secondary font-bold pt-3 block">Ask Assistant →</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
