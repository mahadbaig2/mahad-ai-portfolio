import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Cpu, Layers, Terminal } from "lucide-react";
import { OpenAssistantButton } from "@/components/OpenAssistantButton";
import { getArticles, getFeaturedProjects, getSiteSettings } from "@/lib/sanity/loadData";

const capabilities = [
  { title: "Product Design & UI/UX", detail: "Product discovery, enterprise workflows, and design systems.", icon: Layers },
  { title: "AI Engineering", detail: "Grounded retrieval, ONNX routing, and LangGraph orchestration.", icon: Cpu },
  { title: "Full-Stack Product", detail: "Next.js interfaces, FastAPI services, and PostgreSQL.", icon: Terminal },
];

const milestones = [
  "Brand & Visual Design",
  "Product Design & UI/UX",
  "Enterprise SaaS",
  "Frontend & Full Stack",
  "Applied AI Engineering",
  "AI Product Engineering",
];

export default async function HomePage() {
  const [featuredProjects, articles, settings] = await Promise.all([
    getFeaturedProjects(),
    getArticles(),
    getSiteSettings(),
  ]);

  return (
    <div className="w-full bg-surface text-on-surface">
      <section className="border-b-2 border-primary">
        <div className="mx-auto grid max-w-content lg:grid-cols-12">
          <div className="flex flex-col justify-center border-b-2 border-primary p-6 sm:p-10 lg:col-span-7 lg:border-b-0 lg:border-r-2 lg:p-14">
            <h1 className="mb-7 font-headline text-4xl font-black uppercase leading-[1.08] tracking-tight text-primary sm:text-5xl lg:text-6xl">
              I design products.<br />{" "}I engineer intelligence.
            </h1>
            <div className="flex flex-wrap gap-4">
              <Link href="/work" className="inline-flex items-center gap-2 bg-tertiary-container px-6 py-3 font-mono text-xs font-bold uppercase text-on-tertiary shadow-stamp hover:underline">
                Explore My Work <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <OpenAssistantButton
                label="Talk to Mahad"
                className="inline-flex items-center gap-2 border-2 border-primary bg-surface-container-lowest px-6 py-3 font-mono text-xs font-bold uppercase text-primary hover:bg-surface-container-high"
              />
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-outline-variant pt-5 font-mono text-xs font-semibold">
              <a href={settings.githubUrl} className="hover:underline">GitHub</a>
              <Link href={settings.resumePdfUrl || "/contact#resume"} className="hover:underline">Résumé</Link>
              <a href={settings.linkedinUrl} className="hover:underline">LinkedIn</a>
              <a href={settings.mediumUrl} className="hover:underline">Medium</a>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 sm:p-10 lg:col-span-5">
            <Link href="/travel/the-road-to-khunjerab" className="group block border-2 border-primary bg-surface-container-lowest p-3 shadow-stamp">
              <div className="relative aspect-[4/3] overflow-hidden border border-primary bg-surface-dim">
                <Image
                  src="/images/travel/travel-hero-motorcycle.png"
                  alt="Mirza Mahad Baig on a motorcycle tour in the Karakoram mountains"
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 40vw"
                  className="object-cover grayscale contrast-125 transition duration-500 group-hover:grayscale-0"
                />
              </div>
              <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-3 font-mono text-xs font-semibold">
                The Road to Khunjerab <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Experience at a glance" className="border-b-2 border-primary">
        <dl className="mx-auto grid max-w-content grid-cols-2 gap-px bg-primary lg:grid-cols-4">
          {[
            ["~6 Years", "Product Design & UI/UX"],
            ["Enterprise", "Multi-tenant SaaS"],
            ["Grounded", "Retrieval & Query Routing"],
            ["Full-Stack", "Next.js, FastAPI & PostgreSQL"],
          ].map(([value, label]) => (
            <div key={label} className="flex flex-col gap-2 bg-surface p-5 sm:p-8">
              <dt className="order-2 font-mono text-xs font-semibold uppercase text-tertiary-container">{label}</dt>
              <dd className="font-headline text-2xl font-black text-primary sm:text-4xl">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="selected-work" className="border-b-2 border-primary px-6 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-content">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 border-b-2 border-primary pb-4">
            <h2 className="font-headline text-3xl font-black uppercase sm:text-4xl">Selected work</h2>
            <Link href="/work" className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase hover:underline">
              All projects <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-7 lg:grid-cols-2">
            {featuredProjects.map((project) => (
              <article key={project.slug} className="flex flex-col border-2 border-primary bg-surface-container-lowest shadow-stamp">
                <div className="grow p-6 sm:p-8">
                  <h3 className="mb-3 font-headline text-2xl font-black uppercase sm:text-3xl">
                    <Link href={`/work/${project.slug}`} className="hover:underline">{project.title}</Link>
                  </h3>
                  <p className="text-sm text-on-surface-variant">{project.tagline || project.summary}</p>
                </div>
                <div className="border-t-2 border-primary bg-surface-container p-4">
                  <Link href={`/work/${project.slug}`} aria-label={`Read case study: ${project.title}`} className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase hover:underline">
                    Read Case Study <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-2 border-primary bg-surface-container-low px-6 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-content">
          <h2 className="mb-7 border-b-2 border-primary pb-4 font-headline text-3xl font-black uppercase sm:text-4xl">Where Design Meets Intelligence</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {capabilities.map(({ title, detail, icon: Icon }) => (
              <article key={title} className="border-2 border-primary bg-surface-container-lowest p-6">
                <Icon className="mb-4 h-6 w-6" aria-hidden="true" />
                <h3 className="mb-2 font-headline text-xl font-bold uppercase">{title}</h3>
                <p className="text-sm text-on-surface-variant">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-2 border-primary px-6 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-content">
          <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4 border-b-2 border-primary pb-4">
            <h2 className="font-headline text-3xl font-black uppercase sm:text-4xl">How I Got Here</h2>
            <Link href="/about" className="font-mono text-xs font-bold uppercase hover:underline">Full biography</Link>
          </div>
          <ol className="grid grid-cols-2 gap-px border border-primary bg-primary md:grid-cols-3 lg:grid-cols-6">
            {milestones.map((milestone) => (
              <li key={milestone} className="bg-surface-container-lowest p-4 font-headline text-sm font-bold">{milestone}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b-2 border-primary bg-surface-container-high px-6 py-14 sm:px-8">
        <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-5 border-2 border-primary bg-surface p-6 shadow-stamp sm:p-8">
          <h2 className="font-headline text-3xl font-black uppercase">Talk to Mahad</h2>
          <Link href="/chat" className="inline-flex items-center gap-2 bg-primary px-5 py-3 font-mono text-xs font-bold uppercase text-on-primary hover:underline">
            Open full assistant <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="border-b-2 border-primary px-6 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-content">
          <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4 border-b-2 border-primary pb-4">
            <h2 className="font-headline text-3xl font-black uppercase sm:text-4xl">Writing</h2>
            <Link href="/writing" className="font-mono text-xs font-bold uppercase hover:underline">All articles</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {articles.slice(0, 3).map((article) => (
              <article key={article.slug} className="border-2 border-primary bg-surface-container-lowest p-6">
                <h3 className="font-headline text-xl font-bold uppercase">
                  <Link href={`/writing/${article.slug}`} className="hover:underline">{article.title}</Link>
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-5">
          <h2 className="font-headline text-3xl font-black uppercase sm:text-4xl">Roads, Altitude and Everything Between</h2>
          <Link href="/travel" className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase hover:underline">
            Travel journal <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
