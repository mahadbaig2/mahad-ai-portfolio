import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { getProject, getProjects, type CmsProject } from '@/lib/sanity/loadData';

export const metadata: Metadata = {
  title: 'Work | Mirza Mahad Baig',
  description: 'Products, interfaces and AI systems by Mirza Mahad Baig.',
};

const selectedSlugs = ['busyfile', 'talk-to-mahad', 'cardioscan-ai', 'evzino', 'alder-legal', 'marketing-os', 'freqtrade'];

export default async function WorkPage() {
  const [cmsProjects, selected] = await Promise.all([getProjects(), Promise.all(selectedSlugs.map(getProject))]);
  const selectedProjects = selected.filter((project): project is CmsProject => Boolean(project));
  const remaining = cmsProjects.filter((project) => !selectedSlugs.includes(project.slug));
  const projects = [...selectedProjects, ...remaining];

  return <div className="folio-page work-page">
    <header className="folio-page-hero folio-panel"><h1>Work, in many forms.</h1><p>Products, interfaces, experiments and AI systems. Open a project to see the problem, decisions and source.</p></header>
    <main className="work-main">
      <div className="folio-section-heading"><h2>Projects</h2><span>{projects.length} selected</span></div>
      <div className="work-grid">{projects.map((project, index) => <Link className={`work-tile folio-panel work-tile-${index % 4}`} href={`/work/${project.slug}`} key={project.slug}>
        <div className="work-tile-art folio-placeholder" role="img" aria-label={`Image placeholder for ${project.title}`}/>
        <div className="work-tile-copy"><h3>{project.title}</h3>{index < 2 && <p>{project.tagline || project.summary}</p>}<ArrowUpRight size={22} aria-hidden="true"/></div>
      </Link>)}</div>
    </main>
    <section className="work-end folio-panel"><h2>Want the full picture?</h2><Link className="folio-link folio-link-light" href="/about">About my approach <ArrowUpRight size={18}/></Link></section>
  </div>;
}
