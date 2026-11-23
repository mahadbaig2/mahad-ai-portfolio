import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Compass, CheckCircle2 } from "lucide-react";
import {
  getExperiences,
  getEducation,
  getSkills,
  getSiteSettings,
} from "@/lib/sanity/loadData";
import { urlForImage } from "@/lib/sanity/image";

export const metadata: Metadata = {
  title: "About | Mirza Mahad Baig",
  description:
    "Background, career trajectory, product design foundation, and applied AI engineering experience of Mirza Mahad Baig.",
};

const TRAJECTORY_STEPS = [
  {
    index: "01 / Foundation",
    period: "Visual Systems",
    title: "Visual & Brand Foundations",
    summary:
      "Grid systems, typographic hierarchy, and visual communication craft focused on clarity under constraint.",
    shift: "Mastered typographic restraint and structured information hierarchy.",
  },
  {
    index: "02 / Craft",
    period: "UI/UX Design",
    title: "Product Design & Interaction",
    summary:
      "User research, wireframing, component libraries, and usability across web and mobile applications.",
    shift: "Moved from isolated screens to coherent, testable user mental models.",
  },
  {
    index: "03 / Scale",
    period: "Enterprise SaaS",
    title: "Complex B2B Workflows",
    summary:
      "Designed 500+ screens across client, firm-admin, internal-operations, and super-admin workflows for tax and compliance SaaS.",
    shift: "Learned to organize high-density operational states without overwhelming users.",
  },
  {
    index: "04 / Code",
    period: "Full-Stack Web",
    title: "Frontend & Service Implementation",
    summary:
      "React, Next.js App Router, TypeScript strict mode, Tailwind CSS, Python FastAPI endpoints, and PostgreSQL persistence.",
    shift: "Closed the handoff gap by shipping working full-stack software directly.",
  },
  {
    index: "05 / Intelligence",
    period: "Applied AI",
    title: "RAG, Routing & Guardrails",
    summary:
      "Heading-aware document chunking, Qdrant vector retrieval hydrated from PostgreSQL, ONNX classification, and LangGraph orchestration.",
    shift: "Enclosed probabilistic generation inside inspectable, deterministic boundaries.",
  },
  {
    index: "06 / Current",
    period: "Unified Practice",
    title: "AI Product Engineering",
    summary:
      "Owning the full path from user problem and interface craft to backend APIs, evaluations, and deployment.",
    shift: "Building AI products where UX clarity and engineering rigor reinforce each other.",
  },
];

export default async function AboutPage() {
  const [experiences, education, skills, settings] = await Promise.all([
    getExperiences(),
    getEducation(),
    getSkills(),
    getSiteSettings(),
  ]);

  const touringPhotoUrl = settings.touringPhoto
    ? urlForImage(settings.touringPhoto)?.width(1000).url()
    : null;
  const heroPhoto = touringPhotoUrl || "/images/travel/travel-hero-motorcycle.png";

  return (
    <div className="flex flex-col w-full bg-paper">
      {/* 01 // ESSAY HERO & PHOTOGRAPHIC PLATE */}
      <section className="w-full max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-primary font-medium tracking-widest uppercase">
                  01 // Background &amp; Perspective
                </span>
                <span className="w-8 h-px bg-hairline" aria-hidden="true" />
                <span className="font-mono text-xs text-muted-text">Mirza Mahad Baig</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-normal text-primary tracking-tight leading-[1.08] mb-6">
                I started with how products feel. Then I learned how they work.
              </h1>

              <div className="space-y-4 text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-prose">
                <p>{settings.shortBio}</p>
                <p>
                  {settings.careerNarrative ||
                    "Nearly six years of product design and UI/UX work taught me how users read interfaces, where ambiguity breaks trust, and how visual hierarchy shapes comprehension. Moving into full-stack engineering and applied AI lets me build the underlying systems directly—from FastAPI services and PostgreSQL schemas to ONNX routing and cited RAG."}
                </p>
              </div>
            </div>

            {/* 3 Compact Anchors Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-surface-container-low rounded-xl border border-hairline/70">
              <div className="p-3 bg-surface-white rounded-lg border border-hairline/60">
                <span className="font-mono text-[11px] text-muted-text uppercase tracking-wider block">
                  Design Background
                </span>
                <span className="font-serif text-lg font-medium text-primary mt-0.5 block">
                  ~6 Years UI/UX
                </span>
                <span className="text-xs text-on-surface-variant">Systems &amp; SaaS workflows</span>
              </div>
              <div className="p-3 bg-surface-white rounded-lg border border-hairline/60">
                <span className="font-mono text-[11px] text-muted-text uppercase tracking-wider block">
                  Engineering Scope
                </span>
                <span className="font-serif text-lg font-medium text-primary mt-0.5 block">
                  Full-Stack AI
                </span>
                <span className="text-xs text-on-surface-variant">Next.js, FastAPI, RAG</span>
              </div>
              <div className="p-3 bg-surface-white rounded-lg border border-hairline/60">
                <span className="font-mono text-[11px] text-muted-text uppercase tracking-wider block">
                  Base
                </span>
                <span className="font-serif text-lg font-medium text-primary mt-0.5 block">
                  Islamabad, PK
                </span>
                <span className="text-xs text-on-surface-variant">Available globally remote</span>
              </div>
            </div>
          </div>

          {/* Right Documentary Plate */}
          <div className="lg:col-span-5">
            <div className="bg-surface-white p-3.5 rounded-2xl border border-hairline/80 shadow-editorial">
              <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-surface-container">
                <Image
                  src={heroPhoto}
                  alt="Mirza Mahad Baig riding toward Khunjerab Pass in northern Pakistan"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute bottom-3 left-3 bg-charcoal-gutter/85 backdrop-blur-sm px-3 py-1 rounded text-surface-white font-mono text-xs flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-secondary-fixed" aria-hidden="true" />
                  <span>Khunjerab Pass · 4,693m</span>
                </div>
              </div>
              <div className="pt-3.5 px-1 space-y-1">
                <p className="text-sm text-muted-text leading-snug">
                  {settings.personalHighlight ||
                    "Karakoram Highway motorcycle expedition from Islamabad to Khunjerab Pass."}
                </p>
                <Link
                  href="/travel"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:text-primary-container transition-colors"
                >
                  <span>Explore the travel journal</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02 // TRAJECTORY CHRONOLOGY */}
      <section className="w-full bg-mint/60 border-y border-hairline/70 py-14 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16">
          <div className="max-w-3xl mb-10">
            <span className="font-mono text-xs text-primary font-medium tracking-widest uppercase block mb-2">
              02 // Trajectory
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-primary tracking-tight mb-3">
              Not a reinvention. An expansion.
            </h2>
            <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed">
              Every step added technical range on top of product judgment—making design intent directly executable in production code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRAJECTORY_STEPS.map((step) => (
              <div
                key={step.index}
                className="bg-surface-white p-6 rounded-xl border border-hairline/70 shadow-editorial-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-hairline/50">
                    <span className="font-mono text-xs text-primary font-medium">
                      {step.index}
                    </span>
                    <span className="font-mono text-xs bg-mint px-2.5 py-0.5 rounded text-secondary">
                      {step.period}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-medium text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-5">
                    {step.summary}
                  </p>
                </div>
                <div className="bg-paper border border-hairline/50 p-3 rounded-lg">
                  <span className="font-mono text-[11px] text-muted-text uppercase tracking-wider block mb-0.5">
                    Outcome
                  </span>
                  <p className="text-xs font-medium text-primary">{step.shift}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 // WORK EXPERIENCE */}
      <section className="w-full max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 py-14 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-hairline">
          <div>
            <span className="font-mono text-xs text-primary font-medium tracking-widest uppercase block mb-1">
              03 // Track Record
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-primary tracking-tight">
              Where I’ve worked
            </h2>
          </div>
          <p className="text-sm text-muted-text mt-2 md:mt-0 max-w-sm">
            Product design, multi-tenant SaaS systems, and applied AI engineering engagements.
          </p>
        </div>

        <div className="space-y-6">
          {experiences.map((exp) => (
            <article
              key={`${exp.company}-${exp.role}`}
              className="bg-surface-white p-6 sm:p-8 rounded-xl border border-hairline/80 shadow-editorial-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-4 mb-4 border-b border-hairline/50">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-primary">
                    {exp.role}
                  </h3>
                  <span className="font-mono text-xs bg-mint text-primary px-2.5 py-0.5 rounded-full font-medium">
                    {exp.company}
                  </span>
                  {exp.location && (
                    <span className="font-mono text-xs text-muted-text">{exp.location}</span>
                  )}
                </div>
                <span className="font-mono text-xs text-muted-text">
                  {exp.startDate} — {exp.isCurrent || !exp.endDate ? "Present" : exp.endDate}
                </span>
              </div>

              <p className="text-base text-on-surface-variant mb-4 max-w-4xl leading-relaxed">
                {exp.summary}
              </p>

              {exp.highlights && exp.highlights.length > 0 && (
                <ul className="space-y-2 mb-5">
                  {exp.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-on-surface-variant">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              {exp.technologies && exp.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="font-mono text-xs bg-paper border border-hairline/60 px-2.5 py-0.5 rounded text-primary"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* 04 // SKILLS & CAPABILITIES */}
      {skills.length > 0 && (
        <section className="w-full bg-mint/50 border-y border-hairline/70 py-14 lg:py-20">
          <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16">
            <div className="mb-10">
              <span className="font-mono text-xs text-primary font-medium tracking-widest uppercase block mb-1">
                04 // Capabilities
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-primary tracking-tight">
                Technical &amp; Design Stack
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="bg-surface-white p-6 rounded-xl border border-hairline/80 shadow-editorial-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs bg-sage text-primary px-2.5 py-0.5 rounded font-medium uppercase">
                        {skill.category.replace(/_/g, " ")}
                      </span>
                      <span className="font-mono text-xs text-muted-text capitalize">
                        {skill.proficiency}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-medium text-primary mb-2">
                      {skill.name}
                    </h3>
                    {skill.description && (
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {skill.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 05 // EDUCATION */}
      {education.length > 0 && (
        <section className="w-full max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <span className="font-mono text-xs text-primary font-medium tracking-widest uppercase block mb-1">
                05 // Academic Foundation
              </span>
              <h2 className="font-serif text-3xl font-normal text-primary tracking-tight mb-2">
                Education &amp; Credentials
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Computer science coursework paired with specialized NLP and deep learning credentials.
              </p>
            </div>

            <div className="lg:col-span-8 space-y-4">
              {education.map((edu) => (
                <div
                  key={`${edu.institution}-${edu.degree}`}
                  className="bg-surface-white p-5 rounded-xl border border-hairline/80 shadow-editorial-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-mono text-xs text-secondary uppercase tracking-wider block mb-1">
                      {edu.institution}
                    </span>
                    <h3 className="font-serif text-xl font-medium text-primary">
                      {edu.degree}
                      {edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ""}
                    </h3>
                    {edu.highlights && edu.highlights[0] && (
                      <p className="text-sm text-muted-text mt-1">{edu.highlights[0]}</p>
                    )}
                  </div>
                  <span className="font-mono text-xs bg-mint px-3 py-1 rounded text-primary font-medium shrink-0 self-start sm:self-center">
                    {edu.completionLabel || edu.graduationYear || edu.status || "Completed"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 06 // OFF-SCREEN TRAVEL & CONTACT */}
      <section className="max-w-[1440px] w-full mx-auto px-5 md:px-10 lg:px-16 pb-16 space-y-6">
        <div className="bg-primary text-on-primary rounded-2xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-editorial">
          <div className="lg:col-span-7 space-y-4">
            <span className="font-mono text-xs text-secondary-fixed uppercase tracking-widest">
              Off-Screen
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal">
              Karachi, Islamabad, and the road between.
            </h2>
            <p className="text-base text-on-primary-container leading-relaxed max-w-xl">
              From Karachi to Islamabad—and north on the Karakoram Highway to Khunjerab Pass on a motorcycle. Traveling high-altitude routes teaches quiet preparation and system resilience.
            </p>
            <Link
              href="/travel"
              className="inline-flex items-center gap-2 border-b border-on-primary pb-1 font-mono text-sm text-on-primary hover:text-secondary-fixed transition-colors w-fit"
            >
              <span>Read the travel journal</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="lg:col-span-5 bg-charcoal-gutter rounded-xl overflow-hidden border border-white/10">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src="/images/travel/travel-karakoram-highway.png"
                alt="Karakoram Highway winding through mountain valleys in northern Pakistan"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 35vw"
              />
            </div>
          </div>
        </div>

        <div className="bg-surface-white rounded-2xl border border-hairline p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-editorial-sm">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-primary">
              Let’s build something useful.
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Reach out directly for roles, architecture conversations, or product collaborations.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-6 py-3 rounded text-sm font-medium hover:bg-primary transition-colors shrink-0"
          >
            <span>Get in touch</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
