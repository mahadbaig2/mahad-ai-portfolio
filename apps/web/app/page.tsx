import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BookOpen,
  Briefcase,
  Check,
  Code2,
  Cpu,
  FileText,
  Layers,
  Mail,
  MessageSquare,
  Mic,
  Terminal,
  UserCheck,
  Workflow,
} from "lucide-react";
import { OpenAssistantButton } from "@/components/OpenAssistantButton";
import { getArticles, getProject, getSiteSettings } from "@/lib/sanity/loadData";
import { urlForImage } from "@/lib/sanity/image";

export default async function HomePage() {
  const [
    talkToMahad,
    busyfile,
    cardioscan,
    evzino,
    articles,
    siteSettings,
  ] = await Promise.all([
    getProject("talk-to-mahad"),
    getProject("busyfile"),
    getProject("cardioscan-ai"),
    getProject("evzino"),
    getArticles(),
    getSiteSettings(),
  ]);

  const touringPhotoUrl = siteSettings.touringPhoto
    ? urlForImage(siteSettings.touringPhoto)?.width(1000).url()
    : null;
  const heroImageSrc = touringPhotoUrl || "/images/travel/travel-hero-motorcycle.png";

  const recentArticles = articles.slice(0, 2);

  const capabilities = [
    {
      index: "01 / DISCIPLINE",
      title: "Product Design & UI/UX",
      description:
        "Nearly six years of product strategy, user flows, design systems, and clear visual hierarchy for dense workflows.",
      href: "/work",
      cta: "View Work Archive",
      icon: BookOpen,
    },
    {
      index: "02 / ARCHITECTURE",
      title: "Enterprise Systems",
      description:
        "Multi-tenant SaaS platforms across client, firm-admin, and internal operations with structured compliance flows.",
      href: "/work/busyfile",
      cta: "Inspect Case Studies",
      icon: Layers,
    },
    {
      index: "03 / INTELLIGENCE",
      title: "Practical AI & Agents",
      description:
        "ONNX query routing, LangGraph orchestration, Qdrant vector retrieval hydrated from PostgreSQL, and explicit citations.",
      href: "/work/talk-to-mahad",
      cta: "Examine Architecture",
      icon: Cpu,
    },
    {
      index: "04 / IMPLEMENTATION",
      title: "Full-Stack Execution",
      description:
        "TypeScript, Next.js App Router, Python, FastAPI, SQLAlchemy, SSE streaming, and verifiable evaluation harnesses.",
      href: "/writing",
      cta: "Read System Notes",
      icon: Terminal,
    },
  ];

  const overlapCards = [
    {
      title: "Product Design & UI/UX",
      description:
        "Mental models, progressive disclosure, readable typography, and accessible contrast. Knowing when an assistant should yield to structured UI.",
      focus: "Focus: Cognitive Ergonomics",
      icon: BookOpen,
      featured: false,
    },
    {
      title: "AI Engineering",
      description:
        "Grounded retrieval, in-process classification, bounded retries, and explicit refusal when portfolio evidence does not support an answer.",
      focus: "Focus: Retrieval & Guardrails",
      icon: Cpu,
      featured: false,
    },
    {
      title: "Full-Stack Execution",
      description:
        "Typed OpenAPI contracts, PostgreSQL canonical storage, rebuildable Qdrant vector indexes, and resilient streaming interfaces.",
      focus: "Focus: Systems Delivery",
      icon: Workflow,
      featured: false,
    },
    {
      title: "AI Product Engineering",
      description:
        "The unified discipline. Design judgment ensures probabilistic models become predictable, inspectable, and genuinely useful products.",
      focus: "Unified Practice",
      icon: Check,
      featured: true,
    },
  ];

  const trajectoryStages = [
    {
      period: "Stage 01",
      title: "Visual & Brand Foundations",
      description:
        "Typography, editorial composition, and brand identity systems focused on clarity over decoration.",
      tag: "Foundational Craft",
      active: false,
    },
    {
      period: "Stage 02",
      title: "Product Design & UI/UX",
      description:
        "User research, information architecture, wireframing, and end-to-end product flows for startup founders.",
      tag: "Interaction Design",
      active: false,
    },
    {
      period: "Stage 03",
      title: "Enterprise SaaS & Systems",
      description:
        "500+ screens and reusable design patterns across white-label tax, accounting, and compliance workflows.",
      tag: "Systems Design",
      active: false,
    },
    {
      period: "Stage 04",
      title: "Frontend & Full-Stack",
      description:
        "Shipping interfaces directly in React, Next.js App Router, TypeScript, Tailwind CSS, and FastAPI backends.",
      tag: "Software Execution",
      active: false,
    },
    {
      period: "Stage 05",
      title: "Applied AI & RAG",
      description:
        "LangGraph state machines, in-process ONNX routing, dual-store Qdrant + Neon retrieval, and evaluations.",
      tag: "Model Orchestration",
      active: false,
    },
    {
      period: "Current",
      title: "AI Product Engineering",
      description:
        "Working across the whole stack from user problem and interface craft to grounded intelligence and deployment.",
      tag: "Active Focus",
      active: true,
    },
  ];

  return (
    <div className="flex flex-col w-full bg-paper">
      {/* SECTION 1: EDITORIAL HERO */}
      <section className="w-full max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Editorial Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-start">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage text-primary font-mono text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                <span>{siteSettings.availabilityStatus || "Open to AI Product Engineering roles"}</span>
              </span>
              <span className="font-mono text-xs text-muted-text">
                {siteSettings.location || "Islamabad, Pakistan"} · Remote
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[4.25rem] font-normal text-primary tracking-tight leading-[1.06] mb-6">
              I design products.
              <br />
              <span className="italic text-secondary">I engineer intelligence.</span>
            </h1>

            <p className="text-lg sm:text-[1.15rem] text-on-surface-variant max-w-[620px] mb-8 leading-relaxed">
              {siteSettings.heroSupportingText ||
                "I’m Mirza Mahad Baig, an AI Product Engineer with nearly six years of product design and UI/UX experience, practical AI engineering expertise, and hands-on full-stack execution."}
            </p>

            {/* Primary CTA Cluster */}
            <div className="flex flex-wrap items-center gap-4 mb-7">
              <Link
                href="/work"
                className="inline-flex items-center gap-2 bg-primary-container text-on-primary hover:bg-primary transition-colors px-6 py-3 rounded font-sans text-sm sm:text-base font-medium shadow-editorial-sm group"
              >
                <span>Explore My Work</span>
                <ArrowRight
                  className="h-4 w-4 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </Link>

              <OpenAssistantButton
                className="inline-flex items-center gap-2 bg-sage hover:bg-secondary-container text-primary transition-colors px-5 py-3 rounded-full font-sans text-sm sm:text-base font-medium"
                label="Talk to Mahad"
              />
            </div>

            {/* Secondary Channel Strip */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-6 font-mono text-xs text-muted-text">
              <a
                href={siteSettings.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
              >
                <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>GitHub Source</span>
              </a>
              <span className="text-hairline" aria-hidden="true">/</span>
              <Link
                href={siteSettings.resumePdfUrl || "/contact"}
                className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Résumé &amp; Contact</span>
              </Link>
              <span className="text-hairline" aria-hidden="true">/</span>
              <a
                href={siteSettings.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
              >
                <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>LinkedIn</span>
              </a>
              <span className="text-hairline" aria-hidden="true">/</span>
              <Link
                href="/writing"
                className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Writing</span>
              </Link>
            </div>

            {/* Grounded Positioning Callout */}
            <div className="p-4 bg-mint/70 border border-hairline/80 rounded-xl max-w-[620px]">
              <p className="font-mono text-xs text-primary flex items-start sm:items-center gap-2 leading-relaxed">
                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 sm:mt-0 shrink-0" aria-hidden="true" />
                <span>
                  Inspectable portfolio architecture powered by Sanity CMS, Neon PostgreSQL, Qdrant, ONNX routing, and LangGraph.
                </span>
              </p>
            </div>
          </div>

          {/* Right Editorial Photographic Plate (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-surface-white p-3.5 md:p-4 rounded-2xl border border-hairline/80 shadow-editorial">
              <div className="relative overflow-hidden rounded-xl aspect-[4/5] bg-surface-container">
                <Image
                  src={heroImageSrc}
                  alt="Mirza Mahad Baig on his motorcycle expedition toward Khunjerab Pass in northern Pakistan"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute bottom-3 left-3 bg-charcoal-gutter/85 backdrop-blur-sm px-3 py-1 rounded text-surface-white font-mono text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed" aria-hidden="true" />
                  <span>Karakoram Highway · N-35</span>
                </div>
              </div>
              <div className="pt-3.5 px-1 flex flex-col gap-1.5">
                <p className="text-sm text-muted-text leading-snug">
                  {siteSettings.personalHighlight ||
                    "Rode to Khunjerab Pass, one of the world’s highest paved international border crossings, on my motorcycle."}
                </p>
                <Link
                  href="/travel/the-road-to-khunjerab"
                  className="font-mono text-xs text-primary hover:text-primary-container transition-colors inline-flex items-center gap-1.5 w-fit"
                >
                  <span>Read the Khunjerab Field Journal</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SLIM HORIZONTAL DISCIPLINE STATEMENT */}
      <div className="w-full bg-surface-container border-y border-hairline/70 py-4">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 flex flex-wrap items-center justify-between gap-y-2 font-mono text-xs uppercase tracking-wider">
          <div className="flex flex-wrap items-center gap-3 text-primary font-medium">
            <span>Product Design</span>
            <span className="text-muted-text" aria-hidden="true">→</span>
            <span>Full-Stack Implementation</span>
            <span className="text-muted-text" aria-hidden="true">→</span>
            <span>AI Integration</span>
            <span className="text-muted-text" aria-hidden="true">→</span>
            <span>Evaluation</span>
          </div>
          <a
            href="#selected-work"
            className="inline-flex items-center gap-1.5 text-secondary hover:text-primary transition-colors"
          >
            <span>Jump to Selected Work</span>
            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* SECTION 3: FOUR CAPABILITY BLOCKS */}
      <section className="w-full max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 py-12 lg:py-16">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-1">
              00 // Disciplinary Stack
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-primary tracking-tight">
              Core Applied Capabilities
            </h2>
          </div>
          <p className="text-sm text-muted-text max-w-md">
            Turning early discovery and design systems into full-stack software and inspectable AI workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.index}
                className="bg-surface-white p-6 rounded-xl border border-hairline/80 shadow-editorial-sm flex flex-col justify-between hover:shadow-editorial transition-shadow"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-mint border border-hairline/60 flex items-center justify-center text-primary mb-4">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="font-mono text-xs text-muted-text mb-1">{cap.index}</p>
                  <h3 className="font-serif text-xl font-medium text-on-surface mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-5">
                    {cap.description}
                  </p>
                </div>
                <Link
                  href={cap.href}
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-primary font-medium hover:text-primary-container group"
                >
                  <span>{cap.cta}</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: SELECTED WORK & SYSTEMS */}
      <section
        id="selected-work"
        className="w-full max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 py-12 lg:py-16"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">
              01 // Selected Projects &amp; Systems
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-primary tracking-tight mt-1">
              Selected work
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/work"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-primary border-b border-jade pb-1 hover:text-primary-container transition-colors"
            >
              <span>All projects</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Featured 1: Talk to Mahad */}
        {talkToMahad && (
          <div className="bg-surface-white rounded-2xl border border-hairline/80 shadow-editorial-sm p-6 md:p-10 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-sage text-primary font-mono text-xs font-medium inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                      <span>{talkToMahad.maturityStatus || "Implemented System"}</span>
                    </span>
                    <span className="font-mono text-xs text-muted-text">
                      {talkToMahad.role || "AI Product Engineer"}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal text-on-surface mb-3">
                    {talkToMahad.title}
                  </h3>
                  <p className="text-base text-on-surface-variant mb-5 leading-relaxed">
                    {talkToMahad.summary}
                  </p>

                  <div className="space-y-2.5">
                    <div className="p-3 bg-mint rounded-lg border border-hairline/50">
                      <div className="font-mono text-xs text-primary font-medium">
                        In-Process ONNX Routing &amp; LangGraph
                      </div>
                      <div className="text-xs text-on-surface-variant mt-0.5">
                        Separates deterministic navigation, grounded RAG retrieval, clarification, and out-of-scope refusal.
                      </div>
                    </div>
                    <div className="p-3 bg-surface-container rounded-lg border border-hairline/50">
                      <div className="font-mono text-xs text-primary font-medium">
                        Dual Storage &amp; Voice Limits
                      </div>
                      <div className="text-xs text-on-surface-variant mt-0.5">
                        Neon PostgreSQL hydrates canonical chunks matched in Qdrant; voice caps sessions at 120 seconds with text fallback.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href={`/work/${talkToMahad.slug}`}
                    className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-5 py-2.5 rounded text-sm font-medium hover:bg-primary transition-colors"
                  >
                    <span>Inspect Case Study</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <span className="font-mono text-xs text-muted-text">
                    {(talkToMahad.technologies || []).slice(0, 4).join(" · ")}
                  </span>
                </div>
              </div>

              {/* Architectural Diagram Plate (Charcoal Gutter) */}
              <div className="lg:col-span-7 bg-charcoal-gutter rounded-xl p-5 md:p-6 text-surface-white">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                  <span className="font-mono text-xs text-on-primary-container">
                    assistant_pipeline_topology
                  </span>
                  <span className="font-mono text-xs px-2.5 py-0.5 bg-primary-container text-secondary-fixed rounded">
                    Grounded RAG + ONNX
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="bg-inverse-surface border border-white/10 rounded-lg p-3.5 space-y-1.5">
                    <div className="text-secondary-fixed font-medium">1. ONNX Query Router</div>
                    <p className="text-xs text-inverse-on-surface/90 font-sans leading-snug">
                      Predicts intent, language, answerability, and route in-process at startup.
                    </p>
                  </div>
                  <div className="bg-primary-container border border-secondary-fixed/30 rounded-lg p-3.5 space-y-1.5">
                    <div className="text-secondary-fixed font-medium">2. LangGraph + Qdrant</div>
                    <p className="text-xs text-inverse-on-surface font-sans leading-snug">
                      Retrieves vector points and hydrates canonical chunk text from PostgreSQL.
                    </p>
                  </div>
                  <div className="bg-inverse-surface border border-white/10 rounded-lg p-3.5 space-y-1.5">
                    <div className="text-secondary-fixed font-medium">3. Cited Response</div>
                    <p className="text-xs text-inverse-on-surface/90 font-sans leading-snug">
                      Streams SSE tokens with retrieved chunk citations and execution trace steps.
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white/5 rounded-lg font-mono text-xs text-on-primary-container flex flex-wrap items-center justify-between gap-2">
                  <span>Canonical source: Sanity CMS → PostgreSQL</span>
                  <span className="text-secondary-fixed">Unsupported queries refuse instead of guessing</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Featured 2: Busyfile */}
        {busyfile && (
          <div className="bg-surface-white rounded-2xl border border-hairline/80 shadow-editorial-sm p-6 md:p-10 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 order-2 lg:order-1 bg-mint/70 border border-hairline/70 p-5 rounded-xl">
                <div className="bg-surface-white rounded-lg p-5 border border-hairline/60 shadow-editorial-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-hairline/60">
                    <span className="font-mono text-xs text-muted-text">
                      Specimen // {busyfile.slug}
                    </span>
                    <span className="font-mono text-xs px-2.5 py-0.5 bg-sage text-primary rounded-full font-medium">
                      Multi-Tenant SaaS
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-paper rounded-lg border border-hairline/60">
                      <span className="font-mono text-[11px] text-muted-text block">Role</span>
                      <span className="text-sm font-medium text-primary mt-0.5 block">
                        {busyfile.role || "Lead Product Designer"}
                      </span>
                    </div>
                    <div className="p-3 bg-paper rounded-lg border border-hairline/60">
                      <span className="font-mono text-[11px] text-muted-text block">Timeline</span>
                      <span className="text-sm font-medium text-primary mt-0.5 block">
                        {busyfile.timeline || busyfile.year || "2024 – 2026"}
                      </span>
                    </div>
                  </div>
                  {busyfile.decisions && busyfile.decisions.length > 0 && (
                    <div className="p-3 bg-paper rounded-lg border border-hairline/60 text-xs text-on-surface-variant leading-relaxed">
                      <span className="font-mono text-[11px] text-primary block mb-1">
                        Key Design Decision
                      </span>
                      {busyfile.decisions[0]}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-mint text-primary font-mono text-xs font-medium">
                      Case Study
                    </span>
                    <span className="font-mono text-xs text-muted-text">
                      {busyfile.role || "Senior Product Designer"}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal text-on-surface mb-3">
                    {busyfile.title}
                  </h3>
                  <p className="text-base text-on-surface-variant leading-relaxed">
                    {busyfile.summary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href={`/work/${busyfile.slug}`}
                    className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-5 py-2.5 rounded text-sm font-medium hover:bg-primary transition-colors"
                  >
                    <span>Read Case Study</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <span className="font-mono text-xs text-muted-text">
                    {(busyfile.technologies || []).slice(0, 4).join(" · ")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Pair: CardioScan AI & Evzino */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[cardioscan, evzino]
            .filter((p): p is NonNullable<typeof p> => Boolean(p))
            .map((project) => (
              <div
                key={project.slug}
                className="bg-surface-white rounded-2xl border border-hairline/80 shadow-editorial-sm p-6 md:p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-mint text-primary font-mono text-xs font-medium">
                      {project.maturityStatus || project.category || "Case Study"}
                    </span>
                    {project.year && (
                      <span className="font-mono text-xs text-muted-text">{project.year}</span>
                    )}
                  </div>
                  <h3 className="font-serif text-2xl font-normal text-on-surface mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-5">
                    {project.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-hairline/60 flex items-center justify-between gap-4">
                  <Link
                    href={`/work/${project.slug}`}
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-primary hover:text-primary-container transition-colors"
                  >
                    <span>Inspect Project</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                  <span className="font-mono text-xs text-muted-text">
                    {(project.technologies || []).slice(0, 3).join(" · ")}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* SECTION 5: THE VALUE IS IN THE OVERLAP */}
      <section className="w-full bg-mint/60 border-y border-hairline/70 py-14 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16">
          <div className="mb-10 max-w-2xl">
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">
              02 // Practice Overlap
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-primary mt-1">
              The Value Is in the Overlap
            </h2>
            <p className="text-base text-on-surface-variant mt-2 leading-relaxed">
              Bridging user intuition, visual clarity, and systems implementation reduces handoff loss between what feels good and what works reliably.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {overlapCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className={
                    card.featured
                      ? "bg-primary text-on-primary p-6 rounded-xl shadow-editorial flex flex-col justify-between"
                      : "bg-surface-white p-6 rounded-xl border border-hairline/70 shadow-editorial-sm flex flex-col justify-between"
                  }
                >
                  <div>
                    <div
                      className={
                        card.featured
                          ? "w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-secondary-fixed mb-4"
                          : "w-9 h-9 rounded-lg bg-mint flex items-center justify-center text-primary mb-4"
                      }
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <h3
                      className={
                        card.featured
                          ? "font-serif text-xl font-medium text-on-primary mb-2"
                          : "font-serif text-xl font-medium text-on-surface mb-2"
                      }
                    >
                      {card.title}
                    </h3>
                    <p
                      className={
                        card.featured
                          ? "text-sm text-on-primary-container leading-relaxed"
                          : "text-sm text-on-surface-variant leading-relaxed"
                      }
                    >
                      {card.description}
                    </p>
                  </div>
                  <div
                    className={
                      card.featured
                        ? "pt-5 font-mono text-xs text-secondary-fixed"
                        : "pt-5 font-mono text-xs text-muted-text"
                    }
                  >
                    {card.focus}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6: SIX-STAGE TRAJECTORY */}
      <section className="w-full max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 py-14 lg:py-20">
        <div className="mb-10">
          <span className="font-mono text-xs text-secondary uppercase tracking-widest">
            03 // Trajectory
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-primary mt-1">
            Not a career switch. A capability expansion.
          </h2>
          <p className="text-base text-muted-text mt-2 max-w-2xl">
            A progression from visual foundations to complex SaaS systems, full-stack web engineering, and applied AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {trajectoryStages.map((stage) => (
            <div
              key={stage.title}
              className={
                stage.active
                  ? "bg-primary text-on-primary p-5 rounded-xl shadow-editorial flex flex-col justify-between"
                  : "bg-surface-white p-5 rounded-xl border border-hairline/80 shadow-editorial-sm flex flex-col justify-between"
              }
            >
              <div>
                <span
                  className={
                    stage.active
                      ? "font-mono text-xs text-secondary-fixed block mb-1.5"
                      : "font-mono text-xs text-muted-text block mb-1.5"
                  }
                >
                  {stage.period}
                </span>
                <h3
                  className={
                    stage.active
                      ? "font-serif text-lg font-medium text-on-primary mb-2 leading-snug"
                      : "font-serif text-lg font-medium text-primary mb-2 leading-snug"
                  }
                >
                  {stage.title}
                </h3>
                <p
                  className={
                    stage.active
                      ? "text-sm text-on-primary-container leading-relaxed"
                      : "text-sm text-on-surface-variant leading-relaxed"
                  }
                >
                  {stage.description}
                </p>
              </div>
              <div
                className={
                  stage.active
                    ? "mt-4 pt-2 border-t border-white/15 font-mono text-xs text-secondary-fixed"
                    : "mt-4 pt-2 border-t border-hairline/50 font-mono text-xs text-muted-text"
                }
              >
                {stage.tag}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: INTERACTIVE ASSISTANT FEATURE PANEL */}
      <section className="w-full max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 py-6 lg:py-10">
        <div className="bg-primary text-on-primary rounded-2xl p-6 sm:p-10 lg:p-14 shadow-editorial relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-5 flex flex-col">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container text-secondary-fixed font-mono text-xs mb-5 w-fit">
                <AudioLines className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Talk to Mahad · Grounded Companion</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-on-primary leading-tight mb-4">
                Don’t search the portfolio. Ask it.
              </h2>
              <p className="text-base text-on-primary-container mb-6 leading-relaxed">
                Ask questions about Mahad’s case studies, engineering architecture, or career background. Available in text chat or real-time voice conversation with source citations.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-7">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary-container font-mono text-xs text-on-primary">
                  <MessageSquare className="h-3.5 w-3.5 text-secondary-fixed" aria-hidden="true" />
                  <span>Text Mode (SSE Stream)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary-container/80 font-mono text-xs text-secondary-fixed">
                  <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Voice Mode (120s session limit)</span>
                </span>
              </div>

              <Link
                href="/chat"
                className="inline-flex items-center gap-2 bg-secondary-fixed text-on-secondary-fixed px-6 py-3 rounded text-sm sm:text-base font-semibold hover:bg-surface-white transition-colors w-fit"
              >
                <span>Launch Full Assistant</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="lg:col-span-7 bg-charcoal-gutter rounded-xl p-5 md:p-7 border border-white/10">
              <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/10">
                <span className="font-mono text-xs text-surface-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed" aria-hidden="true" />
                  <span>Illustrative Dialogue Flow</span>
                </span>
                <span className="font-mono text-xs text-on-primary-container">
                  Cited RAG Pipeline
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-primary-container px-4 py-3 rounded-xl text-surface-white text-sm max-w-lg">
                    How does this assistant prevent ungrounded answers when information is missing?
                  </div>
                </div>

                <div className="bg-inverse-surface border border-white/10 p-4 rounded-xl text-inverse-on-surface text-sm space-y-3">
                  <p className="leading-relaxed">
                    Every factual query passes through the ONNX query router, retrieves matching Qdrant vectors hydrated from Neon PostgreSQL, and requires valid citations or explicitly clarifies / refuses.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded bg-primary-container text-secondary-fixed">
                      Route: rag_factual
                    </span>
                    <span className="px-2.5 py-1 rounded bg-primary-container text-on-primary-container">
                      Source: /work/talk-to-mahad
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 font-mono text-xs text-on-primary-container text-center">
                AI portfolio assistant · Live responses depend on backend availability
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: WRITING & FIELD NOTES */}
      <section
        id="field-notes"
        className="w-full max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 py-14 lg:py-20"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">
              04 // Writing &amp; Field Notes
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-primary mt-1">
              The same curiosity, on and off the screen.
            </h2>
          </div>
          <Link
            href="/writing"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-primary border-b border-jade pb-1 hover:text-primary-container transition-colors w-fit"
          >
            <span>All writing</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/writing/${article.slug}`}
              className="bg-surface-white rounded-xl border border-hairline/80 shadow-editorial-sm p-6 flex flex-col justify-between group hover:shadow-editorial transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-mint text-primary">
                    {article.topics?.[0] || "Engineering"}
                  </span>
                  <span className="font-mono text-xs text-muted-text">
                    {article.readingTime || "Article"}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-medium text-on-surface mb-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-5">
                  {article.summary}
                </p>
              </div>
              <div className="pt-3 border-t border-hairline/50 flex items-center justify-between font-mono text-xs text-muted-text">
                <span>{article.publishedAt}</span>
                <ArrowRight
                  className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </div>
            </Link>
          ))}

          <Link
            href="/travel/the-road-to-khunjerab"
            className="bg-surface-white rounded-xl border border-hairline/80 shadow-editorial-sm p-6 flex flex-col justify-between group hover:shadow-editorial transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-sage text-primary">
                  Expedition
                </span>
                <span className="font-mono text-xs text-muted-text">Field Journal</span>
              </div>
              <h3 className="font-serif text-xl font-medium text-on-surface mb-2 group-hover:text-primary transition-colors">
                The Road to Khunjerab (4,693m)
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-5">
                Motorcycle expedition notes along the Karakoram Highway from Islamabad to the Pakistan-China border.
              </p>
            </div>
            <div className="pt-3 border-t border-hairline/50 flex items-center justify-between font-mono text-xs text-muted-text">
              <span>Karakoram Highway · N-35</span>
              <ArrowRight
                className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              />
            </div>
          </Link>
        </div>
      </section>

      {/* SECTION 9: CONTACT / COLLABORATION BANNER */}
      <section className="w-full max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 pb-16 lg:pb-20">
        <div className="bg-surface-white rounded-2xl border border-hairline p-6 sm:p-10 lg:p-12 shadow-editorial-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 flex flex-col">
              <span className="font-mono text-xs text-secondary uppercase tracking-widest mb-1.5">
                05 // Initiate Collaboration
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-primary mb-3">
                Let’s build something deliberate.
              </h2>
              <p className="text-base text-on-surface-variant max-w-xl leading-relaxed mb-6">
                Open to AI Product Engineering, Founding Product Engineer, and Senior Product Design (AI Systems) roles where design craft and systems execution belong together.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${siteSettings.email}`}
                  className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-6 py-3 rounded text-sm sm:text-base font-medium hover:bg-primary transition-colors shadow-editorial-sm"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>Send Direct Email</span>
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-paper border border-hairline text-primary hover:bg-mint transition-colors px-5 py-3 rounded text-sm sm:text-base font-medium"
                >
                  <Briefcase className="h-4 w-4" aria-hidden="true" />
                  <span>Contact &amp; Channels</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 bg-paper border border-hairline/80 p-5 rounded-xl space-y-3 font-mono text-xs">
              <div className="text-primary font-medium uppercase tracking-wider">
                Direct Channels
              </div>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                Reach out directly via email or explore verified code and experience on the site.
              </p>
              <div className="pt-2 border-t border-hairline/60 space-y-1 text-muted-text">
                <div>Email: {siteSettings.email}</div>
                <div>Location: {siteSettings.location}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
