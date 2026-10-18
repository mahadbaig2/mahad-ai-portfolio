import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  ArrowUpRight,
  Terminal,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Layers,
  Cpu,
  Database,
  Code2,
  ShieldCheck,
  Compass,
} from "lucide-react";
import {
  getExperiences,
  getEducation,
  getSkills,
  getSiteSettings,
} from "@/lib/sanity/loadData";

export const metadata: Metadata = {
  title: "About & Trajectory | Mirza Mahad Baig // AI Product Engineer",
  description:
    "Mirza Mahad Baig is an AI Product Engineer with nearly six years of product design and UI/UX experience, practical AI engineering expertise, and hands-on full-stack experience.",
};

export default async function AboutPage() {
  const [experiences, educations, skills, siteSettings] = await Promise.all([
    getExperiences(),
    getEducation(),
    getSkills(),
    getSiteSettings(),
  ]);

  // Group skills by category
  const skillCategories = [
    { key: "product_design", title: "Product Design & UI/UX" },
    { key: "ai_ml", title: "AI & Machine Learning" },
    { key: "backend", title: "Backend & Systems Engineering" },
    { key: "frontend", title: "Frontend Product Engineering" },
    { key: "cloud_data", title: "Data, Vector Stores & Cloud" },
    { key: "llmops", title: "Evaluation & LLMOps" },
  ];

  return (
    <div className="w-full bg-background text-on-surface">
      {/* Top Subheader Metrics Strip */}
      <div className="w-full bg-surface-container border-b-[1.5px] border-primary px-6 py-2 flex flex-wrap justify-between items-center font-mono text-xs text-on-surface-variant overflow-x-auto gap-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-primary">DOSSIER REF: MMB-ABOUT-01</span>
          <span>·</span>
          <span>DISCIPLINE: APPLIED AI × SYSTEMS DESIGN</span>
        </div>
        <div className="flex items-center gap-3">
          <span>LOCATION: ISLAMABAD [33.6844° N, 73.0479° E]</span>
          <span>·</span>
          <span className="text-secondary font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block animate-pulse" />
            RECORD: VERIFIED
          </span>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-16">
        {/* ========================================================================= */}
        {/* HERO SECTION: IDENTITY & EDITORIAL STANCE                                 */}
        {/* ========================================================================= */}
        <section className="border-2 border-primary bg-surface-container-lowest p-6 sm:p-10 stamp-shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-8 border-b border-outline-variant gap-2 font-mono text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary text-on-primary font-bold">DOSSIER // 01</span>
              <span className="font-semibold text-primary uppercase">IDENTITY & TRAJECTORY</span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <span>ORIGIN: KARACHI</span>
              <span>→</span>
              <span>POST: ISLAMABAD</span>
              <span>→</span>
              <span className="text-secondary font-bold">STATUS: DEPLOYED</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column (7 cols): Stance */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-block px-2 py-0.5 font-mono text-[11px] font-semibold bg-surface-container border border-outline-variant text-on-surface-variant uppercase">
                  ORIGIN STAMP // KARACHI-BORN • ISLAMABAD-BASED • BUILDING ACROSS PRODUCT & ENGINEERING
                </div>
                <h1 className="font-headline text-3xl sm:text-5xl font-black text-primary tracking-tight leading-tight uppercase">
                  I STARTED WITH HOW PRODUCTS FEEL. THEN I LEARNED HOW THEY WORK.
                </h1>
                <div className="p-4 bg-surface-container-low border-l-4 border-primary">
                  <p className="font-sans text-base sm:text-lg text-on-surface leading-relaxed">
                    My foundation is product design and UI/UX. Over nearly six years, I designed complex enterprise workflows, multi-tenant SaaS architectures, and more than 500 screens for Busyfile. Along the way, I expanded into frontend implementation, full-stack systems, machine learning, and applied AI. Today, I operate as an <strong className="font-bold text-primary">AI Product Engineer</strong>.
                  </p>
                </div>
                <p className="font-sans text-sm sm:text-base text-on-surface-variant leading-relaxed">
                  Design systems without runtime understanding decay into static prototypes. Machine learning systems without human ergonomics become unapproachable black boxes. I eliminate the boundary between what is conceived in Figma, verified in code, and executed across neural runtime models.
                </p>
              </div>

              {/* Technical Spec Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-outline-variant font-mono text-xs">
                <div className="p-3 bg-surface-container border border-outline-variant">
                  <div className="text-outline text-[10px] uppercase">Core Discipline</div>
                  <div className="text-primary font-bold mt-1 uppercase">AI Product Engineering</div>
                </div>
                <div className="p-3 bg-surface-container border border-outline-variant">
                  <div className="text-outline text-[10px] uppercase">Architecture Depth</div>
                  <div className="text-primary font-bold mt-1 uppercase">Full-Stack / Graph RAG</div>
                </div>
                <div className="p-3 bg-surface-container border border-outline-variant col-span-2 sm:col-span-1">
                  <div className="text-outline text-[10px] uppercase">Execution Modality</div>
                  <div className="text-secondary font-bold mt-1 uppercase">Deterministic Systems</div>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Authentic Portrait Plate */}
            <div className="lg:col-span-5 flex flex-col border-2 border-primary bg-surface-container-low p-3 stamp-shadow-sm">
              <div className="relative overflow-hidden bg-surface-dim border border-primary aspect-[4/5] w-full">
                <Image
                  src="/images/travel/travel-hero-motorcycle.png"
                  alt="Mirza Mahad Baig with motorcycle on high-altitude touring expedition"
                  fill
                  className="object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute top-2 right-2 bg-primary text-on-primary font-mono text-[10px] font-bold px-2 py-0.5">
                  36.8522° N, 75.4312° E
                </div>
                <div className="absolute bottom-2 left-2 bg-surface border border-primary font-mono text-[10px] font-bold text-primary px-2 py-0.5">
                  ALT: 4,693 METERS
                </div>
              </div>
              <div className="mt-3 p-3 bg-surface border-t border-outline-variant font-mono text-xs flex flex-col gap-1">
                <div className="flex justify-between items-center text-primary font-bold">
                  <span>FIG. 01 — EXPEDITIONARY FIELD NOTE</span>
                  <span className="text-secondary">VERIFIED</span>
                </div>
                <p className="font-sans text-[11px] leading-tight text-on-surface-variant">
                  Rode to Khunjerab Pass, one of the world’s highest paved international border crossings, on my motorcycle. Unforgiving altitude, cold starts, and zero cell service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1: CAREER TRAJECTORY & ESSAY                                      */}
        {/* ========================================================================= */}
        <section className="border-2 border-primary bg-surface p-6 sm:p-10 stamp-shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-3 mb-8 border-b-2 border-primary gap-2">
            <div>
              <span className="font-mono text-xs font-bold text-tertiary-container uppercase tracking-widest block">
                SECTION 01 // EVOLUTIONARY NARRATIVE
              </span>
              <h2 className="font-headline text-3xl sm:text-4xl font-black text-primary tracking-tight uppercase mt-1">
                Not a Reinvention. An Expansion.
              </h2>
            </div>
            <span className="font-mono text-xs text-on-surface-variant">CADENCE: 2019 — PRESENT</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Part 1 */}
            <article className="p-5 border-2 border-primary bg-surface-container-lowest flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-outline pb-2 border-b border-outline-variant mb-3">
                  <span>PART 01</span>
                  <span>2019–2022</span>
                </div>
                <h3 className="font-headline text-lg font-bold uppercase text-primary mb-2">
                  Brand & Visual Foundations
                </h3>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                  Began in visual design and brand identity, mastering typography, color theory, layout grids, and communication hierarchy. Developed a strong intuition for clarity and user perception.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-outline-variant font-mono text-[10px] text-primary font-bold">
                FOCUS: VISUAL ARCHITECTURE
              </div>
            </article>

            {/* Part 2 */}
            <article className="p-5 border-2 border-primary bg-surface-container-lowest flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-outline pb-2 border-b border-outline-variant mb-3">
                  <span>PART 02</span>
                  <span>2022–2023</span>
                </div>
                <h3 className="font-headline text-lg font-bold uppercase text-primary mb-2">
                  Product Design & UI/UX
                </h3>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                  Shifted into software interface design, product discovery, user flows, and wireframing for web and mobile startups. Learned to translate ambiguous business goals into testable interface workflows.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-outline-variant font-mono text-[10px] text-primary font-bold">
                FOCUS: USER FLOWS & DISCOVERY
              </div>
            </article>

            {/* Part 3 */}
            <article className="p-5 border-2 border-primary bg-surface-container-lowest flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-outline pb-2 border-b border-outline-variant mb-3">
                  <span>PART 03</span>
                  <span>2023–2024</span>
                </div>
                <h3 className="font-headline text-lg font-bold uppercase text-primary mb-2">
                  Complex Enterprise SaaS
                </h3>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                  Designed Busyfile, an enterprise taxation and compliance platform. Created more than 500 screens across client portals, firm admins, and internal operations, establishing reusable design systems.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-outline-variant font-mono text-[10px] text-primary font-bold">
                FOCUS: 500+ BUSYFILE SCREENS
              </div>
            </article>

            {/* Part 4 */}
            <article className="p-5 border-2 border-primary bg-surface-container-lowest flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-outline pb-2 border-b border-outline-variant mb-3">
                  <span>PART 04</span>
                  <span>2024–2025</span>
                </div>
                <h3 className="font-headline text-lg font-bold uppercase text-primary mb-2">
                  Frontend & Full Stack
                </h3>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                  Bridged design into production code using Next.js 15, React 19, TypeScript strict mode, and Tailwind CSS. Built custom REST endpoints and integrated state management for client applications.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-outline-variant font-mono text-[10px] text-primary font-bold">
                FOCUS: NEXT.JS & TYPESCRIPT
              </div>
            </article>

            {/* Part 5 */}
            <article className="p-5 border-2 border-primary bg-surface-container-lowest flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-outline pb-2 border-b border-outline-variant mb-3">
                  <span>PART 05</span>
                  <span>2025–2026</span>
                </div>
                <h3 className="font-headline text-lg font-bold uppercase text-primary mb-2">
                  Applied AI & Machine Learning
                </h3>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                  Engineered production AI features at Techomatrix and independently: RAG pipelines with Qdrant, in-process ONNX query routing, LangGraph state machines, and LangSmith evaluation.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-outline-variant font-mono text-[10px] text-primary font-bold">
                FOCUS: ONNX & RAG SYSTEMS
              </div>
            </article>

            {/* Part 6 */}
            <article className="p-5 border-2 border-primary bg-secondary-container flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-secondary font-bold pb-2 border-b border-secondary mb-3">
                  <span>PART 06</span>
                  <span>PRESENT</span>
                </div>
                <h3 className="font-headline text-lg font-bold uppercase text-primary mb-2">
                  AI Product Engineer
                </h3>
                <p className="font-sans text-xs text-on-surface leading-relaxed">
                  Unifying the loop: moving from product discovery and Figma systems through backend architecture, model routing, and production evaluation. Owning the space between idea and working intelligence.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-secondary font-mono text-[10px] text-secondary font-bold">
                FOCUS: END-TO-END EXECUTION
              </div>
            </article>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: VERIFIED WORK EXPERIENCE                                       */}
        {/* ========================================================================= */}
        <section className="border-2 border-primary bg-surface p-6 sm:p-10 stamp-shadow" id="experience">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-3 mb-8 border-b-2 border-primary gap-2">
            <div>
              <span className="font-mono text-xs font-bold text-tertiary-container uppercase tracking-widest block">
                SECTION 02 // CHRONOLOGICAL EVIDENCE
              </span>
              <h2 className="font-headline text-3xl sm:text-4xl font-black text-primary tracking-tight uppercase mt-1">
                Verified Work History
              </h2>
            </div>
            <span className="font-mono text-xs text-on-surface-variant">SOURCE: RESUME & CMS RECORDS</span>
          </div>

          <div className="space-y-6">
            {experiences.map((exp, idx) => (
              <div
                key={exp.company + exp.startDate}
                className="border-2 border-primary bg-surface-container-lowest p-6 stamp-shadow-sm"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-outline-variant pb-3 mb-4 gap-2 font-mono text-xs">
                  <div>
                    <span className="font-bold text-primary text-base sm:text-lg uppercase">
                      {exp.role}
                    </span>
                    <span className="text-outline mx-2">@</span>
                    <span className="font-bold text-secondary text-sm sm:text-base">
                      {exp.company}
                    </span>
                  </div>
                  <div className="text-on-surface-variant font-semibold">
                    <span>{exp.startDate}</span>
                    <span> — </span>
                    <span className={exp.isCurrent ? "text-secondary font-bold" : ""}>
                      {exp.isCurrent ? "PRESENT" : exp.endDate || "CONCLUDED"}
                    </span>
                    <span className="ml-2">({exp.location || "Remote"})</span>
                  </div>
                </div>

                <p className="font-sans text-sm text-on-surface mb-4 leading-relaxed">
                  {exp.summary}
                </p>

                <ul className="space-y-1.5 font-sans text-xs text-on-surface-variant list-disc pl-5 mb-4 leading-relaxed">
                  {exp.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>

                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-outline-variant">
                    {exp.technologies.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-surface-container border border-outline-variant font-mono text-[10px] font-bold text-primary"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: GROUPED TECHNICAL & PRODUCT SKILLS                             */}
        {/* ========================================================================= */}
        <section className="border-2 border-primary bg-surface p-6 sm:p-10 stamp-shadow" id="skills">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-3 mb-8 border-b-2 border-primary gap-2">
            <div>
              <span className="font-mono text-xs font-bold text-tertiary-container uppercase tracking-widest block">
                SECTION 03 // TAXONOMY OF CAPABILITIES
              </span>
              <h2 className="font-headline text-3xl sm:text-4xl font-black text-primary tracking-tight uppercase mt-1">
                Grouped Skill Groups
              </h2>
            </div>
            <span className="font-mono text-xs text-on-surface-variant">CATEGORIZED DOMAINS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillCategories.map((cat) => {
              const matchedSkills = skills.filter((s) => s.category === cat.key);
              if (matchedSkills.length === 0) return null;

              return (
                <div
                  key={cat.key}
                  className="border-2 border-primary bg-surface-container-lowest p-5 flex flex-col justify-between stamp-shadow-sm"
                >
                  <div>
                    <h3 className="font-headline text-lg font-black uppercase text-primary pb-2 border-b border-primary mb-4">
                      {cat.title}
                    </h3>
                    <div className="space-y-3">
                      {matchedSkills.map((s) => (
                        <div key={s.name} className="border-b border-outline-variant/50 pb-2">
                          <div className="flex items-center justify-between font-mono text-xs">
                            <span className="font-bold text-primary">{s.name}</span>
                            <span className="text-[10px] text-outline uppercase font-semibold">
                              {s.proficiency}
                            </span>
                          </div>
                          {s.description && (
                            <p className="font-sans text-[11px] text-on-surface-variant mt-1 leading-normal">
                              {s.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: EDUCATION & CERTIFICATIONS (NO 'CLASS OF COMPLETED')           */}
        {/* ========================================================================= */}
        <section className="border-2 border-primary bg-surface p-6 sm:p-10 stamp-shadow" id="education">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-3 mb-8 border-b-2 border-primary gap-2">
            <div>
              <span className="font-mono text-xs font-bold text-tertiary-container uppercase tracking-widest block">
                SECTION 04 // ACADEMIC & PROFESSIONAL CREDENTIALS
              </span>
              <h2 className="font-headline text-3xl sm:text-4xl font-black text-primary tracking-tight uppercase mt-1">
                Education & Certifications
              </h2>
            </div>
            <span className="font-mono text-xs text-on-surface-variant">STRICT RECORD INTEGRITY</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {educations.map((edu, idx) => {
              const recordType = edu.recordType || (edu.degree.includes("Bachelor") ? "Degree" : "Certification");
              const isOngoing = edu.status === "ongoing" || edu.graduationYear === "2026";
              const label =
                edu.completionLabel ||
                (isOngoing ? `Expected ${edu.graduationYear || "2026"}` : `Completed ${edu.graduationYear || ""}`);

              return (
                <div
                  key={edu.degree + idx}
                  className="border-2 border-primary bg-surface-container-lowest p-6 flex flex-col justify-between stamp-shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between font-mono text-[10px] text-outline uppercase pb-2 border-b border-outline-variant mb-3">
                      <span>TYPE: {recordType}</span>
                      <span className={isOngoing ? "text-secondary font-bold" : "text-primary font-bold"}>
                        {label}
                      </span>
                    </div>

                    <h3 className="font-headline text-lg font-black uppercase text-primary mb-1">
                      {edu.degree}
                    </h3>

                    <p className="font-mono text-xs font-bold text-secondary mb-3">
                      {edu.institution}
                    </p>

                    <p className="font-sans text-xs text-on-surface-variant mb-4">
                      Specialization: {edu.fieldOfStudy}
                    </p>

                    {edu.highlights && edu.highlights.length > 0 && (
                      <ul className="space-y-1 font-sans text-xs text-on-surface list-disc pl-4">
                        {edu.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-outline-variant font-mono text-[10px] text-outline flex justify-between items-center">
                    <span>RECORD STATUS: VERIFIED</span>
                    {edu.credentialUrl && (
                      <a
                        href={edu.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-bold hover:underline"
                      >
                        CREDENTIAL ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: CORE WORKING PRINCIPLES & OFF-SCREEN PERSPECTIVE               */}
        {/* ========================================================================= */}
        <section className="border-2 border-primary bg-surface-container-low p-6 sm:p-10 stamp-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <span className="font-mono text-xs font-bold text-tertiary-container uppercase tracking-widest block mb-2">
                SECTION 05 // WORKING PRINCIPLES
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl font-black text-primary uppercase mb-6">
                How I Build Software
              </h2>
              <div className="space-y-4 font-sans text-sm text-on-surface leading-relaxed">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary font-bold">1. Grounded Intelligence Only:</strong>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Factual AI systems must expose verifiable citations and deterministic guardrails. If context is missing, the model must clarify or refuse, never hallucinate from training weights.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary font-bold">2. Latency & Cost Boundaries:</strong>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Do not use a 500ms LLM call when a 3ms in-process ONNX classifier solves the problem. Respect latency budgets and cloud quotas with the same rigor applied to design systems.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary font-bold">3. Full Spectrum Ownership:</strong>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      True product craftsmanship means moving freely between user research, Figma component tokens, TypeScript frontend state, Python backend graphs, and evaluation telemetry.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 border-2 border-primary bg-surface p-6 flex flex-col justify-between font-mono text-xs">
              <div>
                <div className="font-bold text-primary uppercase mb-2">ACTIONS & CONTACT</div>
                <p className="font-sans text-xs text-on-surface-variant mb-4">
                  Open to AI Product Engineering, applied AI, and lead product design opportunities.
                </p>
                <div className="space-y-2">
                  <Link
                    href="/contact"
                    className="block w-full py-2.5 bg-tertiary-container text-on-tertiary font-bold text-center stamp-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-transform uppercase"
                  >
                    Initiate Inquiry (/contact)
                  </Link>
                  <Link
                    href={siteSettings.resumePdfUrl || "/contact#resume"}
                    className="block w-full py-2.5 border border-primary bg-surface text-primary font-bold text-center hover:bg-surface-container transition-colors uppercase"
                  >
                    Download Verified Résumé (PDF)
                  </Link>
                  <Link
                    href="/travel"
                    className="block w-full py-2.5 border border-outline-variant bg-surface text-on-surface hover:border-primary font-bold text-center transition-colors uppercase"
                  >
                    View Off-Screen Travel Journal →
                  </Link>
                </div>
              </div>
              <div className="pt-4 border-t border-outline-variant text-[10px] text-outline">
                LOCATION: ISLAMABAD, PAKISTAN [REMOTE READY]
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
