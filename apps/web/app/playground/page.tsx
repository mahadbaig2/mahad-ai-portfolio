import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SHOWCASE } from '@/lib/showcase';

export default function PlaygroundPage() {
  const items = SHOWCASE.filter((item) => item.kind === 'Side projects & playground');
  return <div className="portfolio-shell editorial-page"><main>
    <section className="editorial-hero"><p>Playground</p><h1>Curiosity made <em>concrete.</em></h1><div className="editorial-hero-bottom"><span>Prototypes, experiments and ideas still in motion.</span></div></section>
    <section className="editorial-list"><h2>Explore</h2><div>{items.map((item) => item.slug ? <Link className="writing-row" href={`/work/${item.slug}`} key={item.title}><div><h3>{item.title}</h3><p>{item.line}</p></div><ArrowUpRight size={23}/></Link> : null)}</div></section>
  </main></div>;
}
