import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getProject, getProjects, type CmsProject } from "@/lib/sanity/loadData";
import { PROJECTS } from "@/lib/data";
import { WorkLibrary } from "@/components/work/WorkLibrary";

export const metadata: Metadata = {
  title: "Work | Mirza Mahad Baig",
  description: "Products, interfaces, and AI systems by Mirza Mahad Baig.",
};

const PRIORITY_SLUGS = [
  "talk-to-mahad",
  "busyfile",
  "cardioscan-ai",
  "evzino",
  "alder-legal",
  "marketing-os",
  "freqtrade",
];

export default async function WorkPage() {
  const [cmsProjects, selected] = await Promise.all([
    getProjects(),
    Promise.all(PRIORITY_SLUGS.map((slug) => getProject(slug))),
  ]);

  const bySlug = new Map<string, CmsProject>();
  for (const proj of selected) {
    if (proj && !bySlug.has(proj.slug)) {
      bySlug.set(proj.slug, proj);
    }
  }
  for (const proj of cmsProjects) {
    if (proj && !bySlug.has(proj.slug)) {
      bySlug.set(proj.slug, proj);
    }
  }
  for (const proj of PROJECTS) {
    if (proj && !bySlug.has(proj.slug)) {
      bySlug.set(proj.slug, proj as CmsProject);
    }
  }

  const projects = Array.from(bySlug.values());

  return (
    <div className="flex flex-col w-full bg-paper">
      {/* Page heading */}
      <section className="w-full pt-10 pb-10 lg:pb-14">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-normal text-primary max-w-4xl tracking-tight leading-[1.08]">
            Work, in many forms.
          </h1>
        </div>
      </section>

      {/* Filterable Work Archive */}
      <WorkLibrary initialProjects={projects} />

      {/* Deep Forest Bottom CTA Band */}
      <section className="max-w-[1440px] w-full mx-auto px-5 md:px-10 lg:px-16 pb-16">
        <div className="bg-primary text-on-primary rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 shadow-editorial">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal">
              Want the full picture behind these builds?
            </h2>
          </div>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 border-b border-on-primary pb-1 font-mono text-sm text-on-primary hover:text-secondary-fixed transition-colors shrink-0"
          >
            <span>About my approach</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
