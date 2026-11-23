import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getTravelJourneys, getTravelJourney } from "@/lib/sanity/loadData";
import { PortableText } from "@/components/PortableText";
import { urlForImage } from "@/lib/sanity/image";

export async function generateStaticParams() {
  return (await getTravelJourneys()).map((journey) => ({ slug: journey.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const journey = await getTravelJourney(slug);
  return journey
    ? { title: `${journey.title} | Mirza Mahad Baig`, description: journey.summary }
    : { title: "Journey not found" };
}

export default async function TravelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const journey = await getTravelJourney(slug);
  if (!journey) notFound();

  const heroUrl = journey.heroImage
    ? urlForImage(journey.heroImage)?.width(1400).url()
    : null;

  return (
    <div className="w-full bg-paper min-h-screen">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 py-10 space-y-10">
        {/* Eyebrow & Header */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/travel"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-primary hover:text-primary-container"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>All journeys</span>
            </Link>
            {journey.yearLabel && (
              <span className="px-3 py-1 rounded-full bg-sage font-mono text-xs text-primary font-medium">
                {journey.yearLabel}
              </span>
            )}
          </div>

          <div className="max-w-4xl space-y-3">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-normal text-primary tracking-tight leading-[1.08]">
              {journey.title}
            </h1>
            {journey.summary && (
              <p className="text-lg sm:text-xl text-on-surface-variant leading-relaxed">
                {journey.summary}
              </p>
            )}
          </div>

          {/* Route Facts Strip */}
          <div className="bg-surface-white rounded-xl border border-hairline/80 shadow-editorial-sm p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="font-mono text-[11px] text-muted-text uppercase block">Route</span>
              <span className="text-sm font-medium text-on-surface mt-1 block">
                {journey.origin || "Islamabad"} → {journey.destination || "Khunjerab Pass"}
              </span>
            </div>
            <div>
              <span className="font-mono text-[11px] text-muted-text uppercase block">Region</span>
              <span className="text-sm font-medium text-on-surface mt-1 block">
                {journey.region || "Karakoram Mountain Range"}
              </span>
            </div>
            <div>
              <span className="font-mono text-[11px] text-muted-text uppercase block">
                Summit Elevation
              </span>
              <span className="text-sm font-semibold text-primary mt-1 block">
                {journey.elevation || "4,693 M"}
              </span>
            </div>
            <div>
              <span className="font-mono text-[11px] text-muted-text uppercase block">Mode</span>
              <span className="text-sm font-medium text-on-surface mt-1 block">
                {journey.transportMode || "Motorcycle Touring"}
              </span>
            </div>
          </div>
        </header>

        {/* Panoramic Photo Plate */}
        <div className="bg-surface-white p-3 rounded-2xl border border-hairline/80 shadow-editorial-sm">
          <div className="relative w-full aspect-[16/9] max-h-[540px] overflow-hidden rounded-xl bg-surface-container">
            <Image
              src={heroUrl || "/images/travel/travel-karakoram-highway.png"}
              alt={`${journey.title} photographic record`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1280px"
            />
          </div>
        </div>

        {/* Story & Field Reflections */}
        <article className="bg-surface-white rounded-2xl border border-hairline/80 shadow-editorial-sm px-6 py-10 sm:px-12 lg:px-20 lg:py-14">
          <div className="max-w-prose mx-auto space-y-6">
            {journey.story ? (
              <PortableText value={journey.story} />
            ) : (
              <p className="text-lg text-on-surface-variant leading-relaxed">
                {journey.routeSummary || journey.summary}
              </p>
            )}

            {journey.reflection && (
              <blockquote className="border-l-2 border-primary-container bg-mint/50 rounded-r-lg px-6 py-4 my-6 font-serif text-xl italic text-primary leading-relaxed">
                {journey.reflection}
              </blockquote>
            )}

            {journey.challenges?.length ? (
              <section className="pt-6 border-t border-hairline">
                <h2 className="font-serif text-2xl font-normal text-primary mb-4">
                  From the road
                </h2>
                <ul className="space-y-3">
                  {journey.challenges.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 pb-3 border-b border-hairline/50 last:border-b-0 text-on-surface-variant"
                    >
                      <span className="font-mono text-primary mt-0.5" aria-hidden="true">↗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="pt-4">
              <Link
                href="/travel"
                className="inline-flex items-center gap-2 font-mono text-sm font-medium text-primary border-b border-jade pb-1 hover:text-primary-container transition-colors"
              >
                <span>More journeys</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
