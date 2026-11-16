import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { getProjects, getProject, getCaseStudy } from '@/lib/sanity/loadData';
import { PROJECTS } from '@/lib/data';
import { SHOWCASE } from '@/lib/showcase';
import { PortableText } from '@/components/PortableText';

export async function generateStaticParams() {
  const projects = await getProjects();
  const slugs = new Set([...projects.map((p) => p.slug), ...PROJECTS.map((p) => p.slug), ...SHOWCASE.map((p) => p.slug).filter((slug): slug is string => Boolean(slug))]);
  return Array.from(slugs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{slug: string}> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  return { title: project ? `${project.title} | Mirza Mahad Baig` : 'Project not found', description: project?.summary };
}

export default async function CaseStudyPage({ params }: { params: Promise<{slug: string}> }) {
  const { slug } = await params;
  const [project, study] = await Promise.all([getProject(slug), getCaseStudy(slug)]);
  if (!project) notFound();
  const section = SHOWCASE.find((item) => item.slug === slug)?.kind;
  const facts = [project.role, project.year, ...(project.technologies || [])].filter(Boolean);
  return <div className="portfolio-shell case-page">
    <main>
      <section className="case-hero">
        <Link href="/work" className="case-back"><ArrowLeft size={17}/> All work</Link>
        <div><p>{section || 'Selected work'}</p><h1>{project.title}</h1><strong>{project.tagline}</strong></div>
      </section>
      <div className="case-placeholder" role="img" aria-label={`Placeholder image for ${project.title}`}><span>Project imagery coming soon</span><strong>{project.title}</strong></div>
      <div className="case-content">
        <div className="case-intro"><h2>{study?.summary || project.summary}</h2><div className="case-facts">{facts.map((fact) => <span key={fact}>{fact}</span>)}</div></div>
        {(study?.contextAndProblem || project.problem) && <section><h2>The challenge</h2><CaseBody value={study?.contextAndProblem || project.problem}/></section>}
        {(study?.engineeringApproach || project.architecture) && <section><h2>The approach</h2><CaseBody value={study?.engineeringApproach || project.architecture}/></section>}
        {!!project.decisions?.length && <section><h2>Decisions that mattered</h2><ul>{project.decisions.map((decision) => <li key={decision}>{decision}</li>)}</ul></section>}
        {!!study?.quantitativeResults?.length && <section><h2>Reported outcomes</h2><div className="case-results">{study.quantitativeResults.map((result) => <div key={result.metric}><strong>{result.result}</strong><span>{result.metric}</span></div>)}</div></section>}
        {project.githubUrl && <a className="case-source" href={project.githubUrl} target="_blank" rel="noreferrer">Explore the repository <ArrowUpRight size={18}/></a>}
        {project.liveUrl && <a className="case-source" href={project.liveUrl} target="_blank" rel="noreferrer">Open the product <ArrowUpRight size={18}/></a>}
      </div>
      <div className="case-next"><Link href="/work">Explore more work <ArrowUpRight size={21}/></Link></div>
    </main>
  </div>;
}

function CaseBody({ value }: { value: unknown }) {
  if (typeof value === 'string') return <p>{value}</p>;
  if (Array.isArray(value)) return <PortableText value={value}/>;
  return null;
}
