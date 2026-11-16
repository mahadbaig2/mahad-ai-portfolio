import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getExperiences, getEducation, getSiteSettings } from '@/lib/sanity/loadData';

export default async function AboutPage() {
  const [experiences, education, settings] = await Promise.all([getExperiences(), getEducation(), getSiteSettings()]);
  return <div className="portfolio-shell editorial-page"><main>
    <section className="editorial-hero"><p>Mirza Mahad Baig</p><h1>A designer’s eye. <em>An engineer’s mind.</em></h1><div className="editorial-hero-bottom"><span>AI product engineering · Islamabad, Pakistan</span><Link href="/contact">Get in touch <ArrowUpRight size={19}/></Link></div></section>
    <section className="editorial-lead"><h2>I work across the distance between an idea and a useful product.</h2><p>{settings.shortBio}</p></section>
    <section className="editorial-list"><h2>Where I’ve worked</h2><div>{experiences.map((item) => <article key={item.company + item.role}><div><h3>{item.company}</h3><span>{item.startDate} — {item.endDate || 'Now'}</span></div><h4>{item.role}</h4><p>{item.summary}</p></article>)}</div></section>
    {education.length > 0 && <section className="editorial-list"><h2>Education</h2><div>{education.map((item) => <article key={item.institution + item.degree}><h3>{item.institution}</h3><p>{item.degree}{item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ''}</p></article>)}</div></section>}
    <section className="editorial-outro"><h2>Let’s build something meaningful.</h2><Link href="/contact">Start a conversation <ArrowUpRight size={20}/></Link></section>
  </main></div>;
}
