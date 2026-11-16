import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getTravelJourneys, getTravelJourney } from "@/lib/sanity/loadData";
import { PortableText } from "@/components/PortableText";

export async function generateStaticParams() {
  return (await getTravelJourneys()).map((journey) => ({ slug: journey.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journey = await getTravelJourney(slug);
  return journey ? { title: `${journey.title} | Mirza Mahad Baig`, description: journey.summary } : { title: "Journey not found" };
}

export default async function TravelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journey = await getTravelJourney(slug);
  if (!journey) notFound();
  return <div className="folio-page travel-detail">
    <header className="travel-detail-hero folio-panel"><Link className="case-back" href="/travel"><ArrowLeft size={18}/> All journeys</Link><div><h1>{journey.title}</h1><p>{journey.summary}</p></div></header>
    <div className="travel-detail-image folio-panel folio-placeholder" role="img" aria-label={`Journey image placeholder for ${journey.title}`}/>
    <article className="travel-story folio-panel">
      {journey.story ? <PortableText value={journey.story}/> : <p>{journey.summary}</p>}
      {journey.reflection && <blockquote>{journey.reflection}</blockquote>}
      {journey.challenges?.length ? <section><h2>From the road</h2><ul>{journey.challenges.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
      <Link className="folio-link" href="/travel">More journeys <ArrowUpRight size={18}/></Link>
    </article>
  </div>;
}
