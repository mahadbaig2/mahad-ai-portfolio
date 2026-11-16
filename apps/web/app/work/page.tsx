import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { getProjects } from '@/lib/sanity/loadData';
import { SHOWCASE } from '@/lib/showcase';
import { PROJECTS } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Work | Mirza Mahad Baig',
  description: 'Production systems, product design and applied AI projects by Mirza Mahad Baig.',
};

export default async function WorkPage() {
  const cmsProjects = await getProjects();
  const entries = SHOWCASE.map((item) => ({ ...item, slug: [...cmsProjects, ...PROJECTS].some((project) => project.slug === item.slug) ? item.slug : undefined }));
  const extras = cmsProjects.filter((project) => !SHOWCASE.some((item) => item.slug === project.slug));
  return <div className="portfolio-shell work-index">
    <header className="work-index-hero"><h1>Work that holds up <em>in the real world.</em></h1><p>Products, systems and experiments. Each one reflects a different problem worth solving.</p></header>
    <main className="portfolio-work">
      {(['Production systems', 'Side projects & playground'] as const).map((kind) => <section key={kind}>
        <div className="portfolio-section-head"><h2>{kind === 'Production systems' ? 'Production systems.' : 'Side projects & playground.'}</h2></div>
        <div className="portfolio-grid">
          {entries.filter((item) => item.kind === kind).map((item) => <article className="portfolio-card" key={item.title}>
            {item.slug ? <Link href={`/work/${item.slug}`}><div className="portfolio-card-art" role="img" aria-label={`Placeholder image for ${item.title}`}><span>{item.image}</span><strong>{item.title}</strong></div><div className="portfolio-card-copy"><div><h3>{item.title}</h3><p>{item.line}</p></div><ArrowUpRight size={21}/></div></Link> : <><div className="portfolio-card-art" role="img" aria-label={`Placeholder image for ${item.title}`}><span>{item.image}</span><strong>{item.title}</strong></div><div className="portfolio-card-copy"><div><h3>{item.title}</h3><p>{item.line}</p></div></div></>}
          </article>)}
        </div>
      </section>)}
      {extras.length > 0 && <section><div className="portfolio-section-head"><h2>More work.</h2></div><div className="portfolio-grid">{extras.map((project) => <Link className="portfolio-card" key={project.slug} href={`/work/${project.slug}`}><div className="portfolio-card-art"><strong>{project.title}</strong></div><div className="portfolio-card-copy"><div><h3>{project.title}</h3><p>{project.tagline}</p></div><ArrowUpRight size={21}/></div></Link>)}</div></section>}
    </main>
  </div>;
}
