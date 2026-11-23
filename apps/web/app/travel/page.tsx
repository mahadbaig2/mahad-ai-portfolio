import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Mountain } from "lucide-react";
import { getTravelJourneys } from "@/lib/sanity/loadData";

export const metadata = {
  title: "Travel | Mirza Mahad Baig",
  description: "Motorcycle journeys and field notes across northern Pakistan.",
};

const FIELD_GALLERY = [
  {
    src: "/images/travel/travel-karakoram-highway.png",
    caption: "Karakoram Highway mountain corridor across northern valleys.",
    tag: "Landscape",
  },
  {
    src: "/images/travel/travel-handlebars.png",
    caption: "Cockpit view and mountain highway ahead during high-altitude touring.",
    tag: "Road Ahead",
  },
  {
    src: "/images/travel/travel-saddlebags.png",
    caption: "Minimalist motorcycle luggage setup prepared for long remote stretches.",
    tag: "Touring Rig",
  },
];

export default async function TravelPage() {
  const journeys = await getTravelJourneys();

  return (
    <div className="flex flex-col w-full bg-paper min-h-screen">
      {/* Header & Destination Metric */}
      <section className="max-w-[1440px] mx-auto w-full px-5 md:px-10 lg:px-16 pt-12 pb-10 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-secondary tracking-widest uppercase">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Off-Screen // Travel &amp; Field Journal</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.75rem] font-normal text-primary tracking-tight leading-[1.08]">
              Roads, altitude and everything between.
            </h1>
            <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              From Karachi to Islamabad, and north on two wheels along the Karakoram Highway to Khunjerab Pass. Notes on endurance, altitude, and disconnected terrain.
            </p>
          </div>

          <div className="bg-surface-container border border-hairline p-5 rounded-xl max-w-sm w-full shadow-editorial-sm">
            <div className="flex items-center justify-between pb-2">
              <span className="font-mono text-xs text-muted-text uppercase">Landmark</span>
              <span className="px-2.5 py-0.5 rounded-full font-mono text-xs bg-sage text-primary font-medium">
                Mountain Pass
              </span>
            </div>
            <div className="font-serif text-xl font-medium text-primary">
              Khunjerab Pass
            </div>
            <div className="font-mono text-sm text-secondary mt-0.5">4,693 M Elevation</div>
            <div className="text-xs text-muted-text mt-1">
              Pakistan–China Border · N-35 Karakoram Highway
            </div>
          </div>
        </div>

        {/* Main Hero Plate */}
        <div className="bg-surface-white rounded-2xl border border-hairline/80 overflow-hidden shadow-editorial">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[560px] bg-surface-container-high">
            <Image
              src="/images/travel/travel-hero-motorcycle.png"
              alt="Mirza Mahad Baig with his motorcycle on the Karakoram Highway approach toward Khunjerab Pass"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 1400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-gutter/70 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-surface-white">
              <div>
                <span className="font-mono text-xs text-secondary-fixed uppercase tracking-wider block">
                  Field Documentation
                </span>
                <p className="text-sm sm:text-base text-surface-white">
                  Motorcycle journey along the Karakoram Highway toward Khunjerab Pass.
                </p>
              </div>
              <span className="font-mono text-xs bg-charcoal-gutter/80 px-3 py-1 rounded text-on-primary-container w-fit">
                Route: N-35 · Pakistan
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Strip Gallery + Journeys Index */}
      <section className="max-w-[1440px] mx-auto w-full px-5 md:px-10 lg:px-16 pb-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FIELD_GALLERY.map((item) => (
            <figure
              key={item.src}
              className="bg-surface-white rounded-xl border border-hairline/80 overflow-hidden shadow-editorial-sm"
            >
              <div className="relative aspect-[4/3] bg-surface-container">
                <Image
                  src={item.src}
                  alt={item.caption}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <figcaption className="p-4 space-y-1">
                <span className="font-mono text-xs text-secondary uppercase">{item.tag}</span>
                <p className="text-sm text-on-surface-variant leading-snug">{item.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Logged Journeys List */}
        <div className="bg-surface-white rounded-2xl border border-hairline/80 p-6 sm:p-10 shadow-editorial-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-hairline">
            <div>
              <span className="font-mono text-xs text-secondary uppercase tracking-wider">
                Journal Entries
              </span>
              <h2 className="font-serif text-3xl font-normal text-primary mt-1">
                On the road
              </h2>
            </div>
            <p className="text-sm text-muted-text max-w-md">
              Field reflections from riding through remote terrain where connectivity drops away.
            </p>
          </div>

          <div className="divide-y divide-hairline/70">
            {journeys.map((journey) => (
              <Link
                key={journey.slug}
                href={`/travel/${journey.slug}`}
                className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-secondary">
                    <Mountain className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{journey.origin || "Islamabad"} → {journey.destination || "Khunjerab Pass"}</span>
                    {journey.elevation && (
                      <>
                        <span aria-hidden="true">•</span>
                        <span>{journey.elevation}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal text-primary group-hover:text-primary-container transition-colors">
                    {journey.title}
                  </h3>
                  {journey.summary && (
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {journey.summary}
                    </p>
                  )}
                </div>

                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-primary shrink-0">
                  <span>Read journal</span>
                  <ArrowRight
                    className="h-4 w-4 group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
