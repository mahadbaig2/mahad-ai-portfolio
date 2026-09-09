import Link from "next/link";
import { ArrowRight, Terminal, CheckCircle2, Briefcase, GraduationCap } from "lucide-react";
import { getExperiences, getEducation, getSkills, getSiteSettings } from "@/lib/sanity/loadData";

export const metadata = {
  title: "About Mahad | AI Product Engineering",
  description:
    "Career narrative, engineering philosophy, and technical depth of Mahad.",
};

export default async function AboutPage() {
  const [experiences, educations, skills, siteSettings] = await Promise.all([
    getExperiences(),
    getEducation(),
    getSkills(),
    getSiteSettings(),
  ]);

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-24">
      <header className="max-w-prose">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
          About Mahad
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          AI Product Engineer focused on building robust, inspectable, and
          economically viable AI systems from research prototype to production.
        </p>
      </header>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Main Narrative */}
        <div className="flex flex-col gap-8 lg:col-span-2 text-base text-foreground leading-relaxed max-w-prose">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Career Narrative
            </h2>
            <p>
              I sit at the intersection of applied machine learning, software
              craftsmanship, and product design. Rather than viewing AI as a black
              box or treating LLMs as magic APIs, I approach AI systems with the
              same rigor expected in distributed systems: bounded latency,
              deterministic failure modes, verifiable metrics, and strict cost
              discipline.
            </p>
            <p className="mt-4">
              My engineering philosophy revolves around solving real-world
              problems with the simplest architecture that delivers the outcome.
              When an in-process ONNX classifier can route queries in 3ms, I do
              not call a 500ms LLM API. When a derived vector index can be
              rebuilt from relational truth, I avoid lock-in.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Why This Portfolio is Over-Engineered
            </h2>
            <p>
              This website is being built milestone-by-milestone as an observable
              proof of capability. Rather than a static brochure with an ungrounded
              API call, its target architecture spans an in-process ML query router,
              dual-persistence RAG (Neon + Qdrant), LangGraph orchestration with
              conditional recovery, push-to-talk voice, and an inspectable execution
              trace.
            </p>
            <p className="mt-4">
              Every phase is implemented under strict quality gates and governed by
              permanent free-tier constraints ($0.00/mo operating cost target),
              demonstrating that world-class AI engineering is rooted in
              architectural rigor rather than unbounded cloud spend.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Core Principles
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                <span>
                  <strong>Grounded Answers Only:</strong> Factual responses must
                  cite verifiable sources; otherwise, the system clarifies or
                  refuses.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                <span>
                  <strong>Cost & Quota Safety:</strong> Zero unexpected bills.
                  Explicit quotas, circuit breakers, and automatic graceful
                  degradation.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                <span>
                  <strong>Radical Transparency:</strong> The execution inspector
                  exposes routing confidence, model versions, and pipeline timing
                  in real time.
                </span>
              </li>
            </ul>
          </section>

          {/* Work Experience */}
          <section className="border-t border-border pt-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Career Experience</span>
            </h2>
            <div className="flex flex-col gap-8">
              {experiences.map((exp, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between text-sm">
                    <h3 className="font-semibold text-foreground">
                      {exp.role} · <span className="font-normal text-muted-foreground">{exp.company}</span>
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate || ""}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {exp.summary}
                  </p>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="mt-1 space-y-1 list-disc list-inside text-xs text-muted-foreground">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="leading-relaxed">{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          {educations.length > 0 && (
            <section className="border-t border-border pt-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span>Education</span>
              </h2>
              <div className="flex flex-col gap-4">
                {educations.map((edu, idx) => (
                  <div key={idx} className="text-sm">
                    <h3 className="font-semibold text-foreground">
                      {edu.degree} in {edu.fieldOfStudy}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {edu.institution} · Class of {edu.graduationYear}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Competencies Sidebar */}
        <aside className="flex flex-col gap-8 lg:border-l lg:border-border lg:pl-8">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Technical Competencies
            </h3>
            <div className="mt-4 flex flex-col gap-4">
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="rounded border border-border p-4"
                >
                  <div className="text-xs font-semibold text-foreground">
                    {skill.name}
                  </div>
                  {skill.description && (
                    <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                      {skill.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border border-border p-4 bg-muted/30">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5" />
              <span>Talk to Mahad</span>
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Have questions about my background, career decisions, or technical
              philosophy? Ask the AI assistant.
            </p>
            <Link
              href="/chat"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
            >
              <span>View Development Status &rarr;</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
