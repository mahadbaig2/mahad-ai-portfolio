import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getTravelJourneys } from "@/lib/sanity/loadData";

export const metadata = {
  title: "Travel | Mirza Mahad Baig",
  description: "Motorcycle journeys and notes from the road.",
};

export default async function TravelPage() {
  const journeys = await getTravelJourneys();
  return <div className="folio-page travel-page">
    <header className="folio-page-hero folio-panel"><h1>Beyond the screen.</h1><p>Roads, places, and moments that stay with me.</p></header>
    <div className="travel-hero-image folio-panel folio-placeholder" role="img" aria-label="Motorcycle journey image placeholder" />
    <main className="travel-main folio-panel"><h2>On the road</h2><p>Originally from Karachi, now based in Islamabad. I ride and travel across Pakistan, including a motorcycle journey to Khunjerab Pass.</p>
      <div className="travel-list">{journeys.map((journey) => <Link key={journey.slug} href={`/travel/${journey.slug}`}><span>{journey.title}</span><ArrowUpRight size={22}/></Link>)}</div>
    </main>
  </div>;
}
