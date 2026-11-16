import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { OpenAssistantButton } from '@/components/OpenAssistantButton';
import { getArticle, getProject } from '@/lib/sanity/loadData';

const featuredSlugs = ['busyfile', 'talk-to-mahad', 'evzino', 'alder-legal'];

export default async function HomePage() {
  const [projects, article] = await Promise.all([
    Promise.all(featuredSlugs.map((slug) => getProject(slug))),
    getArticle('i-decided-my-portfolio-should-be-the-project'),
  ]);
  const featured = projects.filter((project) => project !== undefined);

  return <div className="folio-page home-page">
    <section className="home-hero folio-panel">
      <div className="home-hero-copy">
        <h1>I design products and engineer their intelligence.</h1>
        <p>I’m Mirza Mahad Baig, an AI Product Engineer with deep product design and UI/UX experience. I work from the interface through the systems behind it.</p>
        <div className="folio-actions"><OpenAssistantButton className="folio-link folio-link-light"/><Link className="folio-link folio-link-light" href="/work">Explore work <ArrowUpRight size={19}/></Link></div>
      </div>
      <div className="home-hero-art folio-placeholder" role="img" aria-label="Portrait image placeholder for Mirza Mahad Baig"><span className="hero-art-ring" aria-hidden="true"/><span className="hero-art-title" aria-hidden="true">Mahad.</span></div>
      <a className="home-scroll" href="#selected-work" aria-label="Scroll to selected work"><ArrowDown size={22}/></a>
    </section>

    <section className="home-intro folio-panel">
      <h2>Product thinking.<br/>Engineering depth.</h2>
      <div><p>Nearly six years shaping digital products, then building more of the stack myself: interfaces, services, retrieval and applied AI.</p><Link className="folio-link" href="/about">The story so far <ArrowUpRight size={18}/></Link></div>
    </section>

    <section id="selected-work" className="home-work">
      <div className="folio-section-heading"><h2>Selected work</h2><Link className="folio-link" href="/work">All projects <ArrowUpRight size={18}/></Link></div>
      <div className="home-work-grid">
        {featured.map((project, index) => <Link className={`home-project folio-panel home-project-${index + 1}`} href={`/work/${project.slug}`} key={project.slug}>
          <div className="home-project-image folio-placeholder" role="img" aria-label={`Image placeholder for ${project.title}`} />
          <div className="home-project-content"><h3>{project.title}</h3>{index < 2 && <p>{project.tagline || project.summary}</p>}<ArrowUpRight size={22} aria-hidden="true"/></div>
        </Link>)}
      </div>
    </section>

    <section className="home-process folio-panel">
      <div><h2>From first sketch to working system.</h2><Link className="folio-link folio-link-light" href="/about">How I work <ArrowUpRight size={18}/></Link></div>
      <p>Product design, frontend and backend engineering, and AI delivery belong in the same conversation. The work changes shape; the focus stays on making it useful.</p>
    </section>

    <section className="home-notes-grid">
      <Link className="home-travel folio-panel" href="/travel"><div className="home-travel-image folio-placeholder" role="img" aria-label="Motorcycle travel image placeholder"/><div><h2>Beyond the screen</h2><p>From Karachi to Islamabad, with a motorcycle journey to Khunjerab Pass along the way.</p><span className="folio-link">Travel journal <ArrowUpRight size={18}/></span></div></Link>
      <div className="home-writing folio-panel"><h2>In writing</h2><p>Notes from the work of designing and building.</p>{article && <Link href={`/writing/${article.slug}`} className="home-writing-article">{article.title}<ArrowUpRight size={19}/></Link>}<Link className="folio-link" href="/writing">All writing <ArrowUpRight size={18}/></Link></div>
    </section>

    <section className="home-end folio-panel"><h2>Have a good problem to solve?</h2><Link className="folio-link folio-link-light" href="/contact">Let’s talk <ArrowUpRight size={20}/></Link></section>
  </div>;
}
