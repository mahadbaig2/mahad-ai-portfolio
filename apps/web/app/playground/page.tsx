import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SHOWCASE } from '@/lib/showcase';

export default function PlaygroundPage() {
  const items = SHOWCASE.filter((item) => item.kind === 'Side projects & playground' && item.slug);
  return <div className="folio-page playground-page">
    <header className="folio-page-hero folio-panel"><h1>Curiosity made concrete.</h1><p>Experiments, prototypes and ideas still in motion.</p></header>
    <main className="playground-grid">{items.map((item) => <Link className="playground-tile folio-panel" href={`/work/${item.slug}`} key={item.slug}><div className="folio-placeholder" role="img" aria-label={`Image placeholder for ${item.title}`}/><div><h2>{item.title}</h2><ArrowUpRight size={20}/></div></Link>)}</main>
  </div>;
}
