import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getArticles } from '@/lib/sanity/loadData';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Writing | Mirza Mahad Baig', description: 'Notes on product work, engineering and applied AI.' };

export default async function WritingPage() {
  const articles = await getArticles();
  const [featured, ...rest] = articles;
  return <div className="folio-page writing-page">
    <header className="folio-page-hero folio-panel"><h1>Thinking out loud about building.</h1><p>Ideas, decisions and lessons from product design and AI engineering.</p></header>
    <main>
      {featured && <Link className="writing-feature folio-panel" href={`/writing/${featured.slug}`}><div className="writing-feature-art folio-placeholder" role="img" aria-label={`Image placeholder for ${featured.title}`}/><div><h2>{featured.title}</h2><p>{featured.summary}</p><span className="folio-link">Read article <ArrowUpRight size={18}/></span></div></Link>}
      {rest.length > 0 && <div className="writing-list folio-panel">{rest.map((article) => <Link href={`/writing/${article.slug}`} key={article.slug}><h2>{article.title}</h2><ArrowUpRight size={22} aria-hidden="true"/></Link>)}</div>}
    </main>
  </div>;
}
