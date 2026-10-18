import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Terminal,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  Compass,
  FileText,
  Code2,
} from "lucide-react";
import {
  getFeaturedProjects,
  getArticles,
  getSiteSettings,
  getExperiences,
} from "@/lib/sanity/loadData";

export default async function HomePage() {
  const [featuredProjects, articles, siteSettings, experiences] = await Promise.all([
    getFeaturedProjects(),
    getArticles(),
    getSiteSettings(),
    getExperiences(),
  ]);

  const recentArticles = articles.slice(0, 3);

  return (
    <div className="w-full bg-background text-on-surface">
      {/* ========================================================================= */}
      {/* SECTION 1: ASYMMETRICAL TWO-COLUMN EDITORIAL HERO                         */}
      {/* ========================================================================= */}
      <section className="w-full border-b-2 border-primary" id="hero">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Editorial & Credentials */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-between border-b-2 lg:border-b-0 lg:border-r-2 border-primary bg-surface">
            <div>
              {/* Eyebrow & Coordinates */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="px-2 py-0.5 bg-primary text-on-primary font-mono text-[11px] font-bold">
                  {siteSettings.heroEyebrow || "DOSSIER_REF: 001-AI"}
                </span>
                <span className="font-mono text-[11px] text-on-surface-variant font-semibold">
                  ISLAMABAD, PAKISTAN [33.6844° N, 73.0479° E]
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-black text-primary tracking-tight uppercase mb-6 leading-[1.08]">
                I DESIGN PRODUCTS.
                <br />
                I ENGINEER INTELLIGENCE.
              </h1>

              {/* Supporting Statement */}
              <p className="font-sans text-base sm:text-lg text-on-surface mb-8 max-w-2xl leading-relaxed">
                {siteSettings.heroSupportingText || (
                  <>
                    I’m <span className="font-bold text-primary">Mirza Mahad Baig</span>, an AI Product Engineer with nearly six years of product design and UI/UX experience, practical AI engineering expertise, and hands-on full-stack experience. I turn complex ideas into understandable, working AI products.
                  </>
                )}
              </p>

              {/* Core Call-to-Actions */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Link
                  href="/work"
                  className="px-6 py-3 bg-tertiary-container text-on-tertiary font-mono text-xs font-bold flex items-center gap-2 stamp-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-transform tracking-wider uppercase"
                >
                  <span>Explore My Work</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/chat"
                  className="px-6 py-3 bg-surface-container-lowest text-primary border-2 border-primary font-mono text-xs font-bold hover:bg-surface-container-high transition-colors tracking-wider uppercase flex items-center gap-2"
                >
                  <Terminal className="h-4 w-4" />
                  <span>Talk to Mahad</span>
                </Link>
              </div>

              {/* Secondary Monospace Technical Links */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-6 border-t border-outline-variant font-mono text-xs">
                <a
                  href={siteSettings.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-tertiary-container transition-colors flex items-center gap-1 font-semibold"
                >
                  <span>→ [GITHUB]</span>
                </a>
                <span className="text-outline-variant">·</span>
                <Link
                  href={siteSettings.resumePdfUrl || "/contact#resume"}
                  className="hover:text-tertiary-container transition-colors flex items-center gap-1 font-semibold"
                >
                  <span>→ [DOWNLOAD_RÉSUMÉ]</span>
                </Link>
                <span className="text-outline-variant">·</span>
                <a
                  href={siteSettings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-tertiary-container transition-colors flex items-center gap-1 font-semibold"
                >
                  <span>→ [LINKEDIN]</span>
                </a>
                <span className="text-outline-variant">·</span>
                <a
                  href={siteSettings.mediumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-tertiary-container transition-colors flex items-center gap-1 font-semibold"
                >
                  <span>→ [MEDIUM]</span>
                </a>
              </div>
            </div>

            {/* Availability Indicator Pill */}
            <div className="mt-10 pt-4 border-t-2 border-primary flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-secondary shrink-0 animate-pulse" />
              <span className="font-mono text-[11px] font-bold text-secondary uppercase tracking-wider">
                ● {siteSettings.availabilityStatus || "OPEN TO AI PRODUCT ENGINEERING AND APPLIED AI OPPORTUNITIES"}
              </span>
            </div>
          </div>

          {/* Right Column: Archival Field Evidence & Motorcycle Dossier */}
          <div className="lg:col-span-5 p-6 sm:p-10 lg:p-10 bg-surface-container-low flex flex-col justify-between">
            {/* Image Card Container */}
            <div className="border-2 border-primary bg-surface-container-lowest p-3 stamp-shadow">
              <div className="relative w-full aspect-[4/3] overflow-hidden border border-primary mb-3 bg-surface-dim">
                <Image
                  src="/images/travel/travel-hero-motorcycle.png"
                  alt="Mirza Mahad Baig on motorcycle tour in Karakoram mountains"
                  fill
                  priority
                  className="object-cover object-center grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-on-primary font-mono text-[10px] font-bold">
                  PLATE 01 // FIELD NOTEBOOK
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-surface-container-lowest border border-primary font-mono text-[10px] font-bold text-primary">
                  PAKISTAN-CHINA HIGHWAY
                </div>
              </div>

              {/* Taped Tag / Field Metadata */}
              <div className="p-3 bg-surface border-t border-outline-variant">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-tertiary-container">
                    OFF-SCREEN: TWO WHEELS, LONG ROADS, HIGH PLACES.
                  </span>
                  <span className="font-mono text-[10px] text-on-surface-variant font-semibold">
                    ALT: 4,693M
                  </span>
                </div>
                <p className="font-sans text-xs text-on-surface leading-snug">
                  {siteSettings.personalHighlight ||
                    "Rode to Khunjerab Pass, one of the world’s highest paved international border crossings, on my motorcycle. Unforgiving altitude, cold starts, and zero cell service."}
                </p>
              </div>
            </div>

            {/* Geodetic Coordinate Strip */}
            <div className="mt-6 pt-4 border-t border-primary/20 flex flex-col gap-1 font-mono text-[11px] text-on-surface-variant">
              <div className="flex justify-between">
                <span>ROUTE_REF: N-35 KARAKORAM HIGHWAY</span>
                <span className="text-primary font-bold">KHUNJERAB PASS // 4,693 M</span>
              </div>
              <div className="flex justify-between">
                <span>COORDINATES: 36.8497° N, 75.4292° E</span>
                <span className="text-primary font-semibold">DOCUMENTARY ARCHIVE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: CAPABILITY FULL-WIDTH BORDERED TICKER STRIP                    */}
      {/* ========================================================================= */}
      <section className="w-full border-b-2 border-primary bg-primary text-surface-container-lowest py-3 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs font-bold tracking-widest uppercase">
            <span className="text-secondary-fixed">●</span>
            <span>PRODUCT DESIGN</span>
            <span className="text-outline">→</span>
            <span>FULL-STACK IMPLEMENTATION</span>
            <span className="text-outline">→</span>
            <span>AI INTEGRATION</span>
            <span className="text-outline">→</span>
            <span>EVALUATION</span>
          </div>
          <div className="font-mono text-xs italic text-primary-fixed opacity-90">
            “I like owning the space between the idea and the working system.”
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: PROOF GRID (4 EVIDENCE CELLS)                                  */}
      {/* ========================================================================= */}
      <section className="w-full border-b-2 border-primary bg-surface" id="proof-grid">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-primary">
          {/* Proof 01 */}
          <div className="p-8 flex flex-col justify-between hover:bg-surface-container-high transition-colors">
            <div>
              <div className="font-mono text-[11px] text-outline mb-2">METRIC BLOCK // 01</div>
              <div className="font-headline text-4xl lg:text-5xl font-black text-primary mb-2">
                ~6 Years
              </div>
              <div className="font-mono text-xs font-bold uppercase text-tertiary-container mb-3">
                Product Design & UI/UX Experience
              </div>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Nearly six years designing complex SaaS applications, user flows, design systems, and developer-ready interfaces across enterprise domains.
              </p>
            </div>
            <div className="pt-6 font-mono text-[10px] text-outline uppercase">
              STATUS: PRODUCTION VERIFIED
            </div>
          </div>

          {/* Proof 02 */}
          <div className="p-8 flex flex-col justify-between hover:bg-surface-container-high transition-colors">
            <div>
              <div className="font-mono text-[11px] text-outline mb-2">METRIC BLOCK // 02</div>
              <div className="font-headline text-4xl lg:text-5xl font-black text-primary mb-2">
                500+
              </div>
              <div className="font-mono text-xs font-bold uppercase text-tertiary-container mb-3">
                Busyfile Production Screens
              </div>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Designed comprehensive end-to-end architectures for client, firm-admin, operations, and super-admin multi-tenant taxation workflows.
              </p>
            </div>
            <div className="pt-6 font-mono text-[10px] text-outline uppercase">
              STATUS: ENTERPRISE DEPLOYED
            </div>
          </div>

          {/* Proof 03 */}
          <div className="p-8 flex flex-col justify-between hover:bg-surface-container-high transition-colors">
            <div>
              <div className="font-mono text-[11px] text-outline mb-2">METRIC BLOCK // 03</div>
              <div className="font-headline text-4xl lg:text-5xl font-black text-primary mb-2">
                Grounded
              </div>
              <div className="font-mono text-xs font-bold uppercase text-secondary mb-3">
                RAG, Agents & ML Query Routing
              </div>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Hands-on AI systems: In-process ONNX routing (&lt;5ms), LangGraph deterministic workflows, Qdrant vector retrieval, and strictly cited RAG.
              </p>
            </div>
            <div className="pt-6 font-mono text-[10px] text-outline uppercase">
              STATUS: ARCHITECTURE TESTED
            </div>
          </div>

          {/* Proof 04 */}
          <div className="p-8 flex flex-col justify-between hover:bg-surface-container-high transition-colors">
            <div>
              <div className="font-mono text-[11px] text-outline mb-2">METRIC BLOCK // 04</div>
              <div className="font-headline text-4xl lg:text-5xl font-black text-primary mb-2">
                Full-Stack
              </div>
              <div className="font-mono text-xs font-bold uppercase text-tertiary-container mb-3">
                Next.js, FastAPI & PostgreSQL
              </div>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Production-grade implementations using React 19, TypeScript strict mode, Python 3.11, SQLAlchemy async, and Dockerized infrastructure.
              </p>
            </div>
            <div className="pt-6 font-mono text-[10px] text-outline uppercase">
              STATUS: ZERO-DOLLAR RUNTIME
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: SELECTED WORK (DELIBERATELY ORDERED PROJECTS)                  */}
      {/* ========================================================================= */}
      <section className="w-full border-b-2 border-primary py-14 sm:py-20 bg-surface" id="selected-work">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b-2 border-primary gap-4">
            <div>
              <div className="font-mono text-xs font-bold uppercase text-tertiary-container mb-1">
                INDEX 01 // PRODUCTION WORK & ARCHITECTURES
              </div>
              <h2 className="font-headline text-3xl sm:text-4xl font-black text-primary uppercase tracking-tight">
                Selected Work
              </h2>
            </div>
            <Link
              href="/work"
              className="inline-flex items-center gap-1 font-mono text-xs font-bold text-primary hover:text-tertiary-container uppercase tracking-wider"
            >
              <span>View Full Archive ({featuredProjects.length}+ Projects)</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredProjects.map((project, idx) => (
              <div
                key={project.slug}
                className="border-2 border-primary bg-surface-container-lowest flex flex-col justify-between stamp-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
              >
                <div className="p-6 sm:p-8">
                  {/* Card Header Stamp */}
                  <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4 font-mono text-[11px]">
                    <span className="font-bold text-primary">
                      CASE // 0{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant font-semibold border border-outline-variant uppercase">
                      {project.category?.replace(/_/g, " ") || "AI Product"}
                    </span>
                  </div>

                  <h3 className="font-headline text-2xl sm:text-3xl font-black uppercase text-primary mb-2">
                    <Link href={`/work/${project.slug}`} className="hover:underline">
                      {project.title}
                    </Link>
                  </h3>

                  <p className="font-mono text-xs font-semibold text-tertiary-container mb-4">
                    {project.tagline || project.subtitle}
                  </p>

                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-6 line-clamp-3">
                    {project.summary}
                  </p>

                  {/* Technology Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.technologies.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="border border-primary px-2 py-0.5 font-mono text-[10px] font-bold text-primary bg-surface-container-low"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="border-t-2 border-primary bg-surface-container p-4 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="font-bold text-primary">{project.year}</span>
                    <span>·</span>
                    <span>{project.role}</span>
                  </div>
                  <Link
                    href={`/work/${project.slug}`}
                    className="flex items-center gap-1 font-bold text-primary hover:text-tertiary-container uppercase"
                  >
                    <span>Read Case Study</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: CAPABILITY INTERSECTION (THE VALUE PROPOSITION)                 */}
      {/* ========================================================================= */}
      <section className="w-full border-b-2 border-primary py-14 sm:py-20 bg-surface-container-low" id="capability">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8">
          <div className="mb-10 pb-4 border-b-2 border-primary">
            <div className="font-mono text-xs font-bold uppercase text-tertiary-container mb-1">
              SYSTEM ARCHITECTURE // THE INTERSECTION
            </div>
            <h2 className="font-headline text-3xl sm:text-4xl font-black text-primary uppercase tracking-tight">
              Where Design Meets Intelligence
            </h2>
            <p className="font-sans text-base text-on-surface-variant mt-2 max-w-3xl">
              Most teams suffer from a gap between product designers who don’t understand model constraints, and AI engineers who struggle with user experience and product flows. I operate directly at the intersection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1: Product Design */}
            <div className="border-2 border-primary bg-surface p-6 flex flex-col justify-between stamp-shadow">
              <div>
                <div className="h-10 w-10 border-2 border-primary bg-surface-container flex items-center justify-center mb-4">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-headline text-xl font-bold uppercase text-primary mb-2">
                  1. Product Design & UI/UX
                </h3>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed mb-4">
                  Nearly six years leading product discovery, complex SaaS workflow architecture, enterprise design systems in Figma, user research, and comprehensive developer handoffs.
                </p>
              </div>
              <ul className="font-mono text-[11px] text-on-surface space-y-1.5 border-t border-outline-variant pt-3">
                <li>→ 500+ Busyfile SaaS Screens</li>
                <li>→ Information Architecture & User Flows</li>
                <li>→ Multi-Tenant Design Systems</li>
              </ul>
            </div>

            {/* Pillar 2: AI Engineering */}
            <div className="border-2 border-primary bg-surface p-6 flex flex-col justify-between stamp-shadow">
              <div>
                <div className="h-10 w-10 border-2 border-primary bg-surface-container flex items-center justify-center mb-4">
                  <Cpu className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-headline text-xl font-bold uppercase text-primary mb-2">
                  2. AI Engineering
                </h3>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed mb-4">
                  Building deterministic agent workflows, heading-aware RAG pipelines, Qdrant vector retrieval, in-process ML classifiers with ONNX Runtime, and LangSmith automated evaluation.
                </p>
              </div>
              <ul className="font-mono text-[11px] text-on-surface space-y-1.5 border-t border-outline-variant pt-3">
                <li>→ &lt;5ms ONNX Query Router (CPU)</li>
                <li>→ LangGraph State Machine & Guardrails</li>
                <li>→ Strictly Cited Retrieval (Hit@K)</li>
              </ul>
            </div>

            {/* Pillar 3: Full-Stack Engineering */}
            <div className="border-2 border-primary bg-surface p-6 flex flex-col justify-between stamp-shadow">
              <div>
                <div className="h-10 w-10 border-2 border-primary bg-surface-container flex items-center justify-center mb-4">
                  <Code2 className="h-5 w-5 text-tertiary-container" />
                </div>
                <h3 className="font-headline text-xl font-bold uppercase text-primary mb-2">
                  3. Full-Stack Product
                </h3>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed mb-4">
                  Shipping responsive, accessible web applications with Next.js 15 App Router, React 19, strict TypeScript, Python FastAPI async backends, Neon PostgreSQL, and Cloudflare Pages.
                </p>
              </div>
              <ul className="font-mono text-[11px] text-on-surface space-y-1.5 border-t border-outline-variant pt-3">
                <li>→ Next.js 15 & Static Export Native</li>
                <li>→ Async FastAPI & SSE Telemetry</li>
                <li>→ Zero-Dollar Operating Budget</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: CAREER EVOLUTION TIMELINE                                      */}
      {/* ========================================================================= */}
      <section className="w-full border-b-2 border-primary py-14 sm:py-20 bg-surface">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8">
          <div className="mb-10 pb-4 border-b-2 border-primary flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs font-bold uppercase text-tertiary-container mb-1">
                CAREER TRAJECTORY // PROGRESSION
              </div>
              <h2 className="font-headline text-3xl sm:text-4xl font-black text-primary uppercase tracking-tight">
                How I Got Here
              </h2>
            </div>
            <Link
              href="/about"
              className="font-mono text-xs font-bold uppercase text-primary hover:text-tertiary-container flex items-center gap-1"
            >
              <span>Full Biography & Principles</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 border-2 border-primary divide-y-2 md:divide-y-0 md:divide-x-2 divide-primary bg-surface-container-lowest stamp-shadow font-mono text-xs">
            <div className="p-4 flex flex-col justify-between">
              <span className="text-outline font-bold">01 // 2019–2022</span>
              <div className="my-2 font-bold text-primary">Brand & Visual Design</div>
              <p className="font-sans text-[11px] text-on-surface-variant">Design fundamentals, typography, and identity systems.</p>
            </div>
            <div className="p-4 flex flex-col justify-between">
              <span className="text-outline font-bold">02 // 2022–2023</span>
              <div className="my-2 font-bold text-primary">Product Design & UI/UX</div>
              <p className="font-sans text-[11px] text-on-surface-variant">Web and mobile interfaces, user flows, and wireframing.</p>
            </div>
            <div className="p-4 flex flex-col justify-between">
              <span className="text-outline font-bold">03 // 2023–2024</span>
              <div className="my-2 font-bold text-primary">Complex Enterprise SaaS</div>
              <p className="font-sans text-[11px] text-on-surface-variant">Busyfile multi-tenant tax architecture and 500+ screens.</p>
            </div>
            <div className="p-4 flex flex-col justify-between">
              <span className="text-outline font-bold">04 // 2024–2025</span>
              <div className="my-2 font-bold text-primary">Frontend & Full Stack</div>
              <p className="font-sans text-[11px] text-on-surface-variant">Next.js, TypeScript, React Server Components, and APIs.</p>
            </div>
            <div className="p-4 flex flex-col justify-between">
              <span className="text-outline font-bold">05 // 2025–2026</span>
              <div className="my-2 font-bold text-primary">Applied AI Engineering</div>
              <p className="font-sans text-[11px] text-on-surface-variant">RAG systems, LangGraph graphs, and FastAPI backends.</p>
            </div>
            <div className="p-4 flex flex-col justify-between bg-secondary-container">
              <span className="text-secondary font-bold">06 // PRESENT</span>
              <div className="my-2 font-bold text-primary">AI Product Engineer</div>
              <p className="font-sans text-[11px] text-on-surface">Owning the entire loop: discovery, design, code, and evaluation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: DEMONSTRABLE AI ASSISTANT TERMINAL PREVIEW                     */}
      {/* ========================================================================= */}
      <section className="w-full border-b-2 border-primary py-14 sm:py-20 bg-surface-container-high" id="assistant">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8">
          <div className="border-2 border-primary bg-surface-container-lowest p-6 sm:p-10 stamp-shadow">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 border-b-2 border-primary gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-secondary text-surface font-mono text-[10px] font-bold">
                    SYSTEM_FEATURE: TALK TO MAHAD
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant">
                    SSE STREAMING + ONNX ROUTER + STRICT CITATIONS
                  </span>
                </div>
                <h2 className="font-headline text-3xl font-black uppercase text-primary">
                  Inspectable AI Assistant & Companion
                </h2>
              </div>
              <Link
                href="/chat"
                className="px-6 py-3 bg-tertiary-container text-on-tertiary font-mono text-xs font-bold uppercase flex items-center gap-2 stamp-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
              >
                <Terminal className="h-4 w-4" />
                <span>Launch Full Assistant (/chat)</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <p className="font-sans text-base text-on-surface leading-relaxed mb-4">
                    Unlike standard portfolio assistants that merely wrap an OpenAI prompt, <strong>Talk to Mahad</strong> is an inspectable RAG pipeline. Every answer is grounded in verified Sanity CMS documents, classified with an in-process ONNX model in &lt;5ms, and orchestrated through a LangGraph state machine.
                  </p>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-6">
                    Also available as a conversational voice companion via ElevenLabs real-time transport with honest 120-second session limits and monthly quota protection.
                  </p>
                </div>

                <div className="font-mono text-xs bg-surface-container p-4 border border-primary">
                  <div className="text-outline uppercase mb-2 font-bold">TRY ASKING:</div>
                  <div className="space-y-1.5 text-primary">
                    <div>→ &quot;What were Mahad&apos;s key design contributions on Busyfile?&quot;</div>
                    <div>→ &quot;Why use ONNX Runtime instead of an LLM for query routing?&quot;</div>
                    <div>→ &quot;What are the trade-offs of the $0.00/mo Cloudflare and Neon architecture?&quot;</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 border-2 border-primary bg-surface p-4 font-mono text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-outline-variant pb-2 mb-3">
                    <span className="font-bold text-primary">TELEMETRY_PIPELINE</span>
                    <span className="text-secondary font-bold">STATUS: READY</span>
                  </div>
                  <div className="space-y-2 text-on-surface-variant text-[11px]">
                    <div className="flex justify-between">
                      <span>ROUTER_LATENCY:</span>
                      <span className="text-primary font-bold">&lt; 5 MS (CPU)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VECTOR_INDEX:</span>
                      <span className="text-primary font-bold">QDRANT COSINE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CANONICAL_SOURCE:</span>
                      <span className="text-primary font-bold">NEON POSTGRESQL</span>
                    </div>
                    <div className="flex justify-between">
                      <span>EVAL_GATE:</span>
                      <span className="text-primary font-bold">LANGSMITH TRACED</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VOICE_CHANNEL:</span>
                      <span className="text-primary font-bold">ELEVENLABS CONV.</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-outline-variant">
                  <Link
                    href="/chat"
                    className="w-full py-2 bg-surface-container text-primary font-bold text-center block border border-primary hover:bg-surface-container-high transition-colors"
                  >
                    Open Live Execution Inspector →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: WRITING & PUBLICATIONS                                         */}
      {/* ========================================================================= */}
      <section className="w-full border-b-2 border-primary py-14 sm:py-20 bg-surface" id="writing">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b-2 border-primary mb-10 gap-4">
            <div>
              <div className="font-mono text-xs font-bold uppercase text-tertiary-container mb-1">
                PUBLICATIONS // ARTICLES & MONOGRAPHS
              </div>
              <h2 className="font-headline text-3xl sm:text-4xl font-black text-primary uppercase tracking-tight">
                Writing
              </h2>
            </div>
            <Link
              href="/writing"
              className="font-mono text-xs font-bold uppercase text-primary hover:text-tertiary-container flex items-center gap-1"
            >
              <span>View All Articles</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentArticles.map((article) => (
              <div
                key={article.slug}
                className="border-2 border-primary bg-surface-container-lowest p-6 flex flex-col justify-between stamp-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-outline mb-3">
                    <span>{article.publishedAt}</span>
                    <span>{article.readingTime}</span>
                  </div>
                  <h3 className="font-headline text-xl font-bold uppercase text-primary mb-3">
                    <Link href={`/writing/${article.slug}`} className="hover:underline">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed mb-4 line-clamp-3">
                    {article.summary}
                  </p>
                </div>
                <div className="border-t border-outline-variant pt-3 flex items-center justify-between font-mono text-xs">
                  <div className="flex flex-wrap gap-1">
                    {article.topics.slice(0, 2).map((t) => (
                      <span key={t} className="text-outline uppercase text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/writing/${article.slug}`}
                    className="font-bold text-primary hover:text-tertiary-container flex items-center gap-1"
                  >
                    <span>Read</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 9: OFF-SCREEN TRAVEL PREVIEW                                      */}
      {/* ========================================================================= */}
      <section className="w-full py-14 sm:py-20 bg-surface-container-low" id="off-screen">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8">
          <div className="border-2 border-primary bg-surface p-6 sm:p-10 stamp-shadow flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="font-mono text-xs font-bold uppercase text-tertiary-container mb-2">
                OFF-SCREEN // EXPEDITIONS & EXPANSES
              </div>
              <h2 className="font-headline text-3xl sm:text-4xl font-black text-primary uppercase tracking-tight mb-4">
                Roads, Altitude and Everything Between
              </h2>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                Beyond interface design and model architectures, I ride motorcycles through remote high-altitude mountain passes. Explore 35mm documentary photography and field notes from the Karakoram Highway to Khunjerab Pass.
              </p>
            </div>
            <Link
              href="/travel"
              className="px-8 py-4 bg-primary text-on-primary font-mono text-xs font-bold uppercase tracking-wider stamp-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-transform flex items-center gap-2 shrink-0"
            >
              <span>Explore Off-Screen Gallery</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
