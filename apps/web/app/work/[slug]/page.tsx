import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { getProjects, getProject, getCaseStudy } from '@/lib/sanity/loadData';
import { PROJECTS } from '@/lib/data';
import { SHOWCASE } from '@/lib/showcase';
import { PortableText } from '@/components/PortableText';

export async function generateStaticParams() {
  const projects = await getProjects();
  const slugs = new Set([...projects.map((project) => project.slug), ...PROJECTS.map((project) => project.slug), ...SHOWCASE.map((project) => project.slug).filter((slug): slug is string => Boolean(slug))]);
  return [...slugs].filter((slug) => !/indkom/i.test(slug)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  return { title: project ? `${project.title} | Mirza Mahad Baig` : 'Project not found', description: project?.summary };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, study] = await Promise.all([getProject(slug), getCaseStudy(slug)]);
  if (!project) notFound();
  const facts = [project.role, project.year, ...(project.technologies || []).slice(0, 5)].filter(Boolean);
  const supportedResults = study?.quantitativeResults?.filter((result) => result.methodology?.trim()) || [];
  const lessons = study?.lessonsLearned?.length ? study.lessonsLearned : project.lessonsLearned;
  const distinctLessons = JSON.stringify(lessons) === JSON.stringify(project.decisions) ? undefined : lessons;

  return <div className="folio-page case-study-page">
    <main>
      <header className="case-hero folio-panel"><Link href="/work" className="case-back"><ArrowLeft size={17}/> All work</Link><div><h1>{project.title}</h1><p>{project.tagline || project.summary}</p></div></header>
      <div className="case-placeholder folio-panel folio-placeholder" role="img" aria-label={`Image placeholder for ${project.title}`} />
      <div className="case-content folio-panel">
        <div className="case-intro"><h2>{study?.summary || project.summary}</h2>{facts.length > 0 && <p className="case-facts">{facts.join(' · ')}</p>}</div>
        <CaseSection title="The challenge" value={study?.contextAndProblem || project.problem}/>
        <CaseSection title="The approach" value={study?.engineeringApproach || project.engineeringApproach || project.architecture}/>
        <CaseSection title="My contribution" value={project.responsibilities}/>
        <CaseSection title="Constraints" value={project.constraints}/>
        <CaseSection title="Design process" value={project.designProcess}/>
        <CaseSection title="Technical decisions" value={project.keyDecisions?.length ? project.keyDecisions : project.decisions}/>
        <CaseSection title="Trade-offs" value={study?.tradeOffsAndFailures || project.tradeOffs}/>
        {supportedResults.length > 0 && <section className="case-section"><h2>Measured outcomes</h2><div className="case-results">{supportedResults.map((result) => <div key={result.metric}><strong>{result.result}</strong><span>{result.metric}</span><p>{result.methodology}</p></div>)}</div></section>}
        <CaseSection title="What I learned" value={distinctLessons}/>
        <div className="case-links">{project.githubUrl && <a className="folio-link" href={project.githubUrl} target="_blank" rel="noreferrer">Explore the repository <ArrowUpRight size={18}/></a>}{project.liveUrl && <a className="folio-link" href={project.liveUrl} target={project.liveUrl.startsWith('http') ? '_blank' : undefined} rel="noreferrer">Open the product <ArrowUpRight size={18}/></a>}</div>
      </div>
      <div className="case-next folio-panel"><Link href="/work">More work <ArrowUpRight size={23}/></Link></div>
    </main>
  </div>;
}

function CaseSection({ title, value }: { title: string; value: unknown }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return <section className="case-section"><h2>{title}</h2><div className="case-section-body">{typeof value === 'string' ? <p>{value}</p> : Array.isArray(value) && value.every((item) => typeof item === 'string') ? <ul>{value.map((item) => <li key={item}>{item}</li>)}</ul> : Array.isArray(value) ? <PortableText value={value}/> : null}</div></section>;
}
