import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getArticles } from '@/lib/sanity/loadData';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Writing | Mirza Mahad Baig', description: 'Notes on product work, engineering and applied AI.' };

export default async function WritingPage() {
  const articles = await getArticles();
  return <div className="portfolio-shell editorial-page"><main>
    <section className="editorial-hero"><p>Writing</p><h1>Thinking out loud <em>about building.</em></h1><div className="editorial-hero-bottom"><span>Notes on product work, engineering and applied AI.</span></div></section>
    <section className="editorial-list"><h2>Latest writing</h2><div>{articles.map((article) => <Link className="writing-row" href={`/writing/${article.slug}`} key={article.slug}><div><h3>{article.title}</h3><p>{article.summary}</p></div><ArrowUpRight size={23}/></Link>)}</div></section>
  </main></div>;
}
