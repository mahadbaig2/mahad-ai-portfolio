import { ArrowUpRight } from 'lucide-react';
import { getSiteSettings } from '@/lib/sanity/loadData';

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return <div className="folio-page contact-page">
    <header className="folio-page-hero folio-panel"><h1>Good work starts with a conversation.</h1></header>
    <main className="contact-grid"><section className="contact-primary folio-panel"><h2>Tell me what you’re working on.</h2><a href={`mailto:${settings.email}`}>{settings.email} <ArrowUpRight size={27}/></a></section><div className="contact-art folio-panel folio-placeholder" role="img" aria-label="Contact portrait image placeholder"/></main>
    <section className="contact-links folio-panel"><h2>Elsewhere</h2><div><a href={settings.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={18}/></a><a href={settings.githubUrl} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={18}/></a>{settings.mediumUrl && <a href={settings.mediumUrl} target="_blank" rel="noreferrer">Medium <ArrowUpRight size={18}/></a>}{settings.resumePdfUrl && <a href={settings.resumePdfUrl} target="_blank" rel="noreferrer">Résumé <ArrowUpRight size={18}/></a>}</div></section>
  </div>;
}
