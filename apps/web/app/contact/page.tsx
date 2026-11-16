import { ArrowUpRight } from 'lucide-react';
import { getSiteSettings } from '@/lib/sanity/loadData';

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return <div className="portfolio-shell editorial-page"><main>
    <section className="editorial-hero"><p>Contact</p><h1>Good work starts <em>with a conversation.</em></h1><div className="editorial-hero-bottom"><span>For product design, applied AI and engineering collaborations.</span></div></section>
    <section className="contact-main"><h2>Tell me what you’re working on.</h2><a href={`mailto:${settings.email}`}>{settings.email} <ArrowUpRight size={26}/></a><div><a href={settings.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={17}/></a><a href={settings.githubUrl} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={17}/></a></div></section>
  </main></div>;
}
