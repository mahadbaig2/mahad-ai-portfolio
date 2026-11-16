import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { getArticles, getArticle } from '@/lib/sanity/loadData';
import { PortableText } from '@/components/PortableText';
import { ARTICLES } from '@/lib/data';

export async function generateStaticParams() {
  const articles = await getArticles();
  return [...new Set([...articles.map((article) => article.slug), ...ARTICLES.map((article) => article.slug)])]
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  return article
    ? { title: `${article.title} | Mirza Mahad Baig`, description: article.summary }
    : { title: 'Article not found | Mirza Mahad Baig' };
}

export default async function WritingArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return <div className="portfolio-shell editorial-article">
    <main>
      <header className="article-hero">
        <Link href="/writing" className="case-back"><ArrowLeft size={17}/> All writing</Link>
        <div>
          <p>{article.publishedAt}{article.readingTime ? ` · ${article.readingTime}` : ''}</p>
          <h1>{article.title}</h1>
          <strong>{article.summary}</strong>
        </div>
      </header>
      <article className="article-content">
        <div className="article-body">
          {article.body ? <PortableText value={article.body}/> : article.content?.length
            ? article.content.map((paragraph, index) => <p key={index}>{paragraph}</p>)
            : <p>The full article is being prepared for publication.</p>}
        </div>
        {article.sources?.length ? <section className="article-sources"><h2>Sources</h2><ul>{article.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title} <ArrowUpRight size={16}/></a></li>)}</ul></section> : null}
        {article.canonicalUrl && <a className="case-source" href={article.canonicalUrl} target="_blank" rel="noreferrer">Read the original article <ArrowUpRight size={17}/></a>}
      </article>
      <div className="case-next"><Link href="/writing">Explore more writing <ArrowUpRight size={21}/></Link></div>
    </main>
  </div>;
}
