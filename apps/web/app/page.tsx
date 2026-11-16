import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { SHOWCASE, type ShowcaseItem } from '@/lib/showcase';

export default function HomePage() {
  const production = SHOWCASE.filter((item) => item.kind === 'Production systems');
  const playground = SHOWCASE.filter((item) => item.kind === 'Side projects & playground');
  return (
    <div className="portfolio-shell">
      <section className="portfolio-hero" id="top">
        <div className="portfolio-light" aria-hidden="true" />
        <div className="portfolio-hero-inner">
          <p className="portfolio-intro">Mirza Mahad Baig · AI product engineer</p>
          <h1>I make complex things <em>work beautifully.</em></h1>
          <div className="portfolio-hero-bottom">
            <p>From enterprise products to applied AI, I bring the interface and the system together.</p>
            <a href="#work" aria-label="Explore work"><ArrowDown size={25} /></a>
          </div>
        </div>
      </section>

      <section className="portfolio-statement" id="about-preview">
        <p>Design is how a system makes sense.</p>
        <h2>I turn ambitious ideas into useful products, thoughtful interfaces and working software.</h2>
        <Link href="/about">More about me <ArrowUpRight size={18} /></Link>
      </section>

      <main id="work" className="portfolio-work">
        <div className="portfolio-section-head"><h2>Built for the real world.</h2><Link href="/work">All work <ArrowUpRight size={18} /></Link></div>
        <div className="portfolio-grid">
          {production.map((item) => <ProjectCard key={item.title} item={item} />)}
        </div>
        <div className="portfolio-section-head portfolio-section-head-secondary"><h2>Ideas in motion.</h2><span>Side projects & playground</span></div>
        <div className="portfolio-grid">
          {playground.map((item) => <ProjectCard key={item.title} item={item} />)}
        </div>
      </main>

      <section className="portfolio-outro"><h2>Have a difficult problem?</h2><Link href="/contact">Let’s make it work <ArrowUpRight size={23} /></Link></section>
    </div>
  );
}

function ProjectCard({ item }: { item: ShowcaseItem }) {
  const content = <><div className="portfolio-card-art" aria-label={`Placeholder image for ${item.title}`} role="img"><span>{item.image}</span><strong>{item.title}</strong></div><div className="portfolio-card-copy"><div><h3>{item.title}</h3><p>{item.line}</p></div>{item.slug && <ArrowUpRight size={21} aria-hidden="true" />}</div></>;
  return item.slug ? <Link className="portfolio-card" href={`/work/${item.slug}`}>{content}</Link> : <div className="portfolio-card">{content}</div>;
}
