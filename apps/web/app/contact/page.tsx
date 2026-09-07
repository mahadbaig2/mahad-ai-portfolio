import Link from "next/link";
import { Github, Linkedin, BookOpen, Mail, FileText, Terminal, ArrowRight, Download } from "lucide-react";
import { getSiteSettings } from "@/lib/sanity/loadData";

export const metadata = {
  title: "Contact & Resume | Mahad",
  description:
    "Direct contact links, professional profiles, resume, and recruiter inquiries.",
};

export default async function ContactPage() {
  const siteSettings = await getSiteSettings();

  const links = [
    {
      name: "GitHub",
      href: siteSettings.githubUrl,
      description: "Open-source repositories, architectural code, and pipelines.",
      icon: Github,
    },
    {
      name: "LinkedIn",
      href: siteSettings.linkedinUrl,
      description: "Professional background, recommendations, and direct messaging.",
      icon: Linkedin,
    },
    {
      name: "Medium",
      href: siteSettings.mediumUrl,
      description: "Long-form engineering articles and technical breakdowns.",
      icon: BookOpen,
    },
    {
      name: "Email",
      href: `mailto:${siteSettings.email}`,
      description: "Direct email inquiry for consulting, roles, and technical questions.",
      icon: Mail,
    },
  ];

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-24">
      <header className="max-w-prose">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
          Contact & Resume
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Open to AI Product Engineer roles, technical product design, and
          demonstrable AI system engineering.
        </p>
      </header>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Contact Links & Resume */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Resume Box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded border border-border p-6 bg-white gap-4">
            <div className="flex items-start gap-4">
              <div className="rounded border border-border p-2.5 bg-muted/40">
                <FileText className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Mahad — AI Product Engineering Resume
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {siteSettings.resumePdfUrl
                    ? "Verified résumé PDF managed via Sanity CMS."
                    : "Verified résumé PDF. Authorable via Sanity Studio or available upon request."}
                </p>
              </div>
            </div>
            {siteSettings.resumePdfUrl ? (
              <a
                href={siteSettings.resumePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded border border-border bg-foreground text-white px-4 py-2 text-xs font-medium transition-opacity hover:opacity-90 shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Résumé</span>
              </a>
            ) : (
              <a
                href={`mailto:${siteSettings.email}?subject=Resume%20Request%20-%20Mahad`}
                className="inline-flex items-center justify-center rounded border border-border bg-white px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-foreground shrink-0"
              >
                Request via Email
              </a>
            )}
          </div>

          {/* Direct Channels */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col justify-between rounded border border-border p-5 transition-colors hover:border-foreground"
                >
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Icon className="h-4 w-4" />
                      <span>{link.name}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                  <div className="mt-4 text-[11px] font-medium text-foreground flex items-center gap-1">
                    <span>Visit profile</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Recruiter Quick Assistant */}
        <aside className="flex flex-col gap-6 lg:border-l lg:border-border lg:pl-8">
          <div className="rounded border border-border p-6 bg-muted/30">
            <div className="flex items-center gap-2 text-foreground font-medium text-sm">
              <Terminal className="h-4 w-4" />
              <span>For Recruiters & Founders</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Evaluating candidates under tight time constraints? The &quot;Talk
              to Mahad&quot; assistant has a dedicated Recruiter Mode designed to
              give rapid, verified summaries of skills, experience, and
              availability.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/chat"
                className="inline-flex items-center justify-between rounded border border-border bg-white px-3 py-2 text-xs font-medium text-foreground hover:border-foreground transition-colors"
              >
                <span>&quot;Summarize Mahad&apos;s AI tech stack&quot;</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center justify-between rounded border border-border bg-white px-3 py-2 text-xs font-medium text-foreground hover:border-foreground transition-colors"
              >
                <span>&quot;What are his top 3 achievements?&quot;</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center justify-between rounded border border-border bg-white px-3 py-2 text-xs font-medium text-foreground hover:border-foreground transition-colors"
              >
                <span>&quot;What are his compensation & availability expectations?&quot;</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
