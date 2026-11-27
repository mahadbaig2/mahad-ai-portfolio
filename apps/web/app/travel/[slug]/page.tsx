import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, Compass, MapPin, AlertCircle } from "lucide-react";
import { getTravelJourneys, getTravelJourney } from "@/lib/sanity/loadData";
import { PortableText } from "@/components/PortableText";

export async function generateStaticParams() {
  const journeys = await getTravelJourneys();
  return journeys.map((j) => ({
    slug: j.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const journey = await getTravelJourney(slug);
  if (!journey) return { title: "Journey Not Found | Mirza Mahad Baig" };

  return {
    title: `${journey.title} // Field Journal | Mirza Mahad Baig`,
    description: journey.summary,
  };
}

export default async function TravelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const journey = await getTravelJourney(slug);

  if (!journey) {
    notFound();
  }

  return (
    <div className="w-full bg-background text-on-surface">
      {/* Top Anchor Bar */}
      <div className="sticky top-16 z-40 w-full bg-surface/95 border-b-[1.5px] border-primary px-4 sm:px-8 py-2.5 flex items-center justify-between font-mono text-xs backdrop-blur-sm">
        <Link
          href="/travel"
          className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary hover:text-tertiary-container transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>OFF-SCREEN EXPEDITIONS</span>
        </Link>
        <div className="flex items-center gap-3 text-on-surface-variant font-semibold">
          <span>DESTINATION: {journey.destination?.toUpperCase() || "KHUNJERAB PASS"}</span>
          <span>·</span>
          <span>{journey.elevation || "4,693 M"}</span>
        </div>
      </div>

      <article className="max-w-[1200px] mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-12">
        {/* Expedition Header */}
        <header className="border-2 border-primary bg-surface-container-lowest p-6 sm:p-10 stamp-shadow">
          <div className="flex flex-wrap items-center justify-between border-b border-outline-variant pb-3 mb-6 gap-3 font-mono text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary text-on-primary font-bold uppercase">
                FIELD JOURNAL // {journey.slug.toUpperCase()}
              </span>
              <span>·</span>
              <span className="font-semibold text-primary">{journey.region || "Karakoram Mountains"}</span>
            </div>
            <div className="text-secondary font-bold">
              STATUS: {journey.journeyStatus?.toUpperCase() || "COMPLETED"}
            </div>
          </div>

          <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-primary leading-tight tracking-tight mb-4">
            {journey.title}
          </h1>

          <p className="font-mono text-xs sm:text-sm font-bold text-secondary mb-6">
            {journey.subtitle || "Traversing high-altitude passes along the Karakoram Highway"}
          </p>

          <p className="font-sans text-base sm:text-lg text-on-surface leading-relaxed mb-8">
            {journey.summary}
          </p>

          {/* Ledger Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-2 border-primary divide-x divide-y sm:divide-y-0 divide-primary bg-surface-container-low font-mono text-xs">
            <div className="p-4">
              <span className="text-outline uppercase text-[10px] block mb-1">ORIGIN</span>
              <span className="font-bold text-primary">{journey.origin || "Islamabad"}</span>
            </div>
            <div className="p-4">
              <span className="text-outline uppercase text-[10px] block mb-1">DESTINATION</span>
              <span className="font-bold text-secondary">{journey.destination || "Khunjerab Pass"}</span>
            </div>
            <div className="p-4">
              <span className="text-outline uppercase text-[10px] block mb-1">TRANSPORT</span>
              <span className="font-bold text-primary">{journey.transportMode || "Motorcycle Touring"}</span>
            </div>
            <div className="p-4">
              <span className="text-outline uppercase text-[10px] block mb-1">ELEVATION</span>
              <span className="font-bold text-primary">{journey.elevation || "4,693 M"}</span>
            </div>
          </div>
        </header>

        {/* Narrative & Field Notes */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 border-2 border-primary bg-surface p-6 sm:p-10 stamp-shadow space-y-6 font-sans text-base leading-relaxed">
            <h2 className="font-headline text-2xl font-black uppercase text-primary mb-2">
              Field Notes from the Road
            </h2>
            {journey.story ? (
              <PortableText value={journey.story} />
            ) : (
              <>
                <p>
                  Mahad rode to Khunjerab Pass, one of the world’s highest paved international border crossings, on his motorcycle. The journey winds along the historic Karakoram Highway (N-35), carved through the jagged granites of the northern mountains.
                </p>
                <p>
                  As altitude climbs beyond 3,500 meters, ambient oxygen drops sharply, the motorcycle engine operates under altered fuel-air mixtures, and temperatures drop dramatically. Riding in these environments demands total presence, physical endurance, and mechanical mindfulness.
                </p>
                <p>
                  Reaching the border terminal at 4,693 meters (15,397 feet) is a testament to perseverance: long hours on the pegs, remote stretches with zero cellular network, and absolute reliance on situational awareness.
                </p>
              </>
            )}

            {journey.reflection && (
              <div className="mt-8 border-l-4 border-secondary bg-surface-container-low p-4 font-sans text-sm text-on-surface">
                <span className="font-mono font-bold text-xs uppercase text-secondary block mb-1">
                  PERSONAL REFLECTION:
                </span>
                &quot;{journey.reflection}&quot;
              </div>
            )}
          </div>

          {/* Challenges & Field Realities */}
          <div className="lg:col-span-4 border-2 border-primary bg-surface-container-low p-6 stamp-shadow flex flex-col justify-between font-mono text-xs">
            <div>
              <div className="font-bold text-primary uppercase border-b border-outline-variant pb-2 mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-tertiary-container" />
                <span>EXPEDITION REALITIES</span>
              </div>
              <ul className="space-y-3 font-sans text-xs text-on-surface">
                {journey.challenges && journey.challenges.length > 0 ? (
                  journey.challenges.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono font-bold text-secondary">↳</span>
                      <span>{c}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="font-mono font-bold text-secondary">↳</span>
                      <span>Altitude above 4,600m with thin ambient oxygen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono font-bold text-secondary">↳</span>
                      <span>Cold engine starts and extreme temperature fluctuations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono font-bold text-secondary">↳</span>
                      <span>Zero cellular network coverage across mountain passes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono font-bold text-secondary">↳</span>
                      <span>Rockfall and unpredictable scree conditions</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-outline-variant text-[11px] text-outline">
              DATA VERIFIED: ONLY DOCUMENTED FACTS PUBLISHED
            </div>
          </div>
        </section>

        {/* Gallery Strip */}
        <section className="border-2 border-primary bg-surface-container-lowest p-6 sm:p-10 stamp-shadow space-y-6">
          <div className="flex items-center justify-between border-b-2 border-primary pb-3 font-mono text-xs">
            <span className="font-bold text-primary uppercase">DOCUMENTARY GALLERY</span>
            <span className="text-on-surface-variant">RAW CAPTURES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-primary bg-surface-dim overflow-hidden relative aspect-[16/10]">
              <Image
                src="/images/travel/travel-hero-motorcycle.png"
                alt="Motorcycle traveler on Karakoram Highway"
                fill
                className="object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-surface text-primary border border-primary font-mono text-[10px] font-bold">
                APPROACH TO SUMMIT // 4,693M
              </div>
            </div>
            <div className="border border-primary bg-surface-dim overflow-hidden relative aspect-[16/10]">
              <Image
                src="/images/travel/travel-karakoram-highway.png"
                alt="Karakoram Highway winding through mountain pass"
                fill
                className="object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-surface text-primary border border-primary font-mono text-[10px] font-bold">
                N-35 KARAKORAM HIGHWAY
              </div>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
