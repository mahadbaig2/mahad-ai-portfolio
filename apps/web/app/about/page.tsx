import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getExperiences, getEducation, getSiteSettings } from '@/lib/sanity/loadData';

export default async function AboutPage() {
  const [experiences, education, settings] = await Promise.all([getExperiences(), getEducation(), getSiteSettings()]);
  return <div className="folio-page about-page">
    <header className="about-hero folio-panel"><div><h1>A designer’s eye.<br/>An engineer’s mind.</h1><p>{settings.shortBio}</p><Link className="folio-link folio-link-light" href="/contact">Get in touch <ArrowUpRight size={18}/></Link></div><div className="about-portrait folio-placeholder" role="img" aria-label="Portrait image placeholder for Mirza Mahad Baig"/></header>
    <section className="about-point folio-panel"><h2>I work across the whole product.</h2><p>From understanding a user problem and shaping the interface to building the services and AI systems behind it.</p></section>
    <section className="about-experience folio-panel"><h2>Where I’ve worked</h2><div>{experiences.map((item) => <article key={item.company + item.role}><div><h3>{item.company}</h3><p>{item.role}</p></div><div><span>{item.startDate} — {item.endDate || 'Now'}</span><p>{item.summary}</p></div></article>)}</div></section>
    <section className="about-journey folio-panel"><div className="about-journey-image folio-placeholder" role="img" aria-label="Motorcycle journey image placeholder"/><div><h2>Karachi, Islamabad, and the road between.</h2><p>I’m from Karachi and now based in Islamabad. Outside work, I ride and travel, including a motorcycle journey to Khunjerab Pass.</p><Link className="folio-link folio-link-light" href="/travel">The travel journal <ArrowUpRight size={18}/></Link></div></section>
    {education.length > 0 && <section className="about-education folio-panel"><h2>Education</h2><div>{education.map((item) => <article key={item.institution + item.degree}><h3>{item.institution}</h3><p>{item.degree}{item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ''}</p></article>)}</div></section>}
    <section className="about-end folio-panel"><h2>Let’s make something useful.</h2><Link className="folio-link folio-link-light" href="/contact">Start a conversation <ArrowUpRight size={19}/></Link></section>
  </div>;
}
