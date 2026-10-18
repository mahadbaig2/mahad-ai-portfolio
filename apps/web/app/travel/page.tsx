import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { ArrowUpRight, Compass, MapPin, Camera } from "lucide-react";
import { getTravelJourneys } from "@/lib/sanity/loadData";

export const metadata: Metadata = {
  title: "Off-Screen // Roads, Altitude and Everything Between | Mirza Mahad Baig",
  description:
    "Documentary motorcycle touring photography and field notes across northern Pakistan and the Karakoram Highway by Mirza Mahad Baig.",
};

const DOCUMENTARY_PHOTOS = [
  {
    src: "/images/travel/travel-hero-motorcycle.png",
    alt: "Mirza Mahad Baig beside touring motorcycle on high-altitude mountain road",
    caption: "Plate 01 // High Pass Ascent: Standing with motorcycle on Karakoram Highway.",
    location: "Karakoram Mountain Range, Pakistan",
    elevation: "4,693 M",
    format: "35mm Equiv",
    aspect: "col-span-12 lg:col-span-8",
  },
  {
    src: "/images/travel/travel-handlebars.png",
    alt: "Close-up documentary shot of motorcycle handlebars and strapped duffel bag",
    caption: "Plate 02 // Cockpit Cockade: Handlebars, strapped duffel, and road grime.",
    location: "Karakoram Highway (N-35)",
    elevation: "High Altitude",
    format: "Macro Archival",
    aspect: "col-span-12 sm:col-span-6 lg:col-span-4",
  },
  {
    src: "/images/travel/travel-karakoram-highway.png",
    alt: "Panoramic landscape of the Karakoram Highway winding through barren jagged mountain peaks",
    caption: "Plate 03 // Highway Through Scree: Winding tarmac beneath jagged northern peaks.",
    location: "Gilgit-Baltistan",
    elevation: "3,800 M",
    format: "Panoramic Landscape",
    aspect: "col-span-12 lg:col-span-7",
  },
  {
    src: "/images/travel/travel-saddlebags.png",
    alt: "Adventure motorcycle with strapped saddlebags parked beside high mountain pass",
    caption: "Plate 04 // Field Transit Spec: Motorcycle equipped with soft saddlebags and gear.",
    location: "Khunjerab National Park",
    elevation: "4,693 M",
    format: "35mm Documentary",
    aspect: "col-span-12 sm:col-span-6 lg:col-span-5",
  },
];

export default async function TravelPage() {
  const journeys = await getTravelJourneys();
  const featuredJourney = journeys[0];

  return (
    <div className="w-full bg-background text-on-surface">
      {/* Sub-header Coordinate & Telemetry Band */}
      <div className="w-full bg-surface-container border-b-[1.5px] border-primary px-6 py-2 flex flex-wrap items-center justify-between font-mono text-xs text-on-surface-variant overflow-x-auto gap-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-primary">DISPATCH: 005 // EXPEDITION LOG</span>
          <span>·</span>
          <span>LAT: 36.8500° N, LONG: 75.4200° E</span>
          <span>·</span>
          <span>TERRAIN: HIGH KARAKORAM</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-secondary font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block animate-pulse" />
            RECORD: VERIFIED
          </span>
          <span>·</span>
          <span>DESTINATION: KHUNJERAB PASS (4,693M)</span>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-16">
        {/* ========================================================================= */}
        {/* HERO / EXPEDITION ARCHIVE HEADER                                          */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-outline-variant font-mono text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-on-primary px-2 py-0.5 font-bold uppercase">
                EXPEDITION LOG
              </span>
              <span>{`// ARCHIVAL DISPATCH 005 // ROUTE: ISB → KHJ`}</span>
            </div>
            <div>
              <span>SERIES: OFF-SCREEN EXPLORATION</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-black text-primary uppercase tracking-tight leading-none mb-6">
                Roads, Altitude and Everything Between.
              </h1>
              <p className="font-sans text-base sm:text-lg text-on-surface leading-relaxed max-w-3xl">
                I’m originally from Karachi and currently based in Islamabad. Outside software engineering and product design, I explore Pakistan on my motorcycle, following roads into high-altitude mountain passes, unfamiliar valleys, and places that make the map feel real.
              </p>
            </div>

            {/* Archival Stamped Fact Badge */}
            <div className="lg:col-span-4 bg-surface-container-low border-2 border-primary p-6 stamp-shadow">
              <div className="flex justify-between items-start border-b border-outline-variant pb-2 mb-3 font-mono text-xs">
                <span className="font-bold uppercase tracking-widest text-primary">DESTINATION RECORD</span>
                <span className="px-2 py-0.5 bg-secondary text-surface font-bold text-[10px]">SUMMIT PASS</span>
              </div>
              <div className="font-headline text-2xl font-black text-primary uppercase mb-1">
                KHUNJERAB PASS
              </div>
              <div className="font-mono text-xs text-secondary font-bold mb-2">
                PAKISTAN–CHINA BORDER // 4,693 M
              </div>
              <p className="font-sans text-xs text-on-surface-variant border-t border-outline-variant pt-2 mt-2 leading-relaxed">
                One of the world&apos;s highest paved international border crossings, traversed by motorcycle along the Karakoram Highway.
              </p>
              <div className="mt-4 pt-3 border-t border-dashed border-outline-variant flex items-center justify-between font-mono text-[11px] text-outline">
                <span>COORD: 36.85° N, 75.42° E</span>
                <span>PEAK: 15,397 FT</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1: FEATURED EXPEDITION DISPATCH                                   */}
        {/* ========================================================================= */}
        {featuredJourney && (
          <section className="border-2 border-primary bg-surface-container-lowest stamp-shadow">
            <div className="border-b-2 border-primary bg-surface-container px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2 font-bold text-primary uppercase">
                <span className="w-2 h-2 bg-primary" />
                <span>FEATURED FIELD JOURNAL // {featuredJourney.title.toUpperCase()}</span>
              </div>
              <div className="text-on-surface-variant font-semibold">
                ROUTE: N-35 KARAKORAM HIGHWAY
              </div>
            </div>

            <div className="p-6 sm:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
                <div className="lg:col-span-8">
                  <h2 className="font-headline text-2xl sm:text-4xl font-black text-primary uppercase mb-3">
                    {featuredJourney.title}
                  </h2>
                  <p className="font-mono text-xs font-bold text-secondary mb-6">
                    {featuredJourney.subtitle}
                  </p>
                  <p className="font-sans text-base text-on-surface leading-relaxed mb-6">
                    {featuredJourney.summary}
                  </p>
                  {featuredJourney.reflection && (
                    <div className="border-l-4 border-tertiary-container bg-surface-container-low p-4 font-sans text-sm text-on-surface leading-relaxed mb-6">
                      <span className="font-mono font-bold text-xs uppercase text-tertiary-container block mb-1">
                        FIELD NOTE REFLECTION:
                      </span>
                      &quot;{featuredJourney.reflection}&quot;
                    </div>
                  )}

                  <Link
                    href={`/travel/${featuredJourney.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-tertiary-container text-on-tertiary font-mono text-xs font-bold uppercase stamp-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-transform"
                  >
                    <span>Read Complete Field Journal</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Metadata Ledger */}
                <div className="lg:col-span-4 border-2 border-primary bg-surface-container-low p-5 font-mono text-xs space-y-3">
                  <div className="font-bold text-primary uppercase border-b border-outline-variant pb-2">
                    EXPEDITION PARAMETERS
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/60 pb-1.5">
                    <span className="text-outline uppercase">ORIGIN:</span>
                    <span className="font-semibold text-primary">{featuredJourney.origin || "Islamabad"}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/60 pb-1.5">
                    <span className="text-outline uppercase">DESTINATION:</span>
                    <span className="font-bold text-secondary">{featuredJourney.destination || "Khunjerab Pass"}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/60 pb-1.5">
                    <span className="text-outline uppercase">TRANSPORT:</span>
                    <span className="font-semibold text-primary">{featuredJourney.transportMode || "Motorcycle Touring"}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/60 pb-1.5">
                    <span className="text-outline uppercase">PEAK ELEVATION:</span>
                    <span className="font-bold text-primary">{featuredJourney.elevation || "4,693 M"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline uppercase">REGION:</span>
                    <span className="font-semibold text-primary">{featuredJourney.region || "Karakoram Mountains"}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: DOCUMENTARY 35MM PHOTO GALLERY                                 */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-primary pb-3 font-mono text-xs">
            <span className="font-bold text-primary uppercase">DOCUMENTARY ARCHIVE // 35MM FRAMES</span>
            <span className="text-on-surface-variant">KARAKORAM FIELD RECORD</span>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {DOCUMENTARY_PHOTOS.map((photo, idx) => (
              <div
                key={idx}
                className={`${photo.aspect} border-2 border-primary bg-surface-container-lowest p-3 stamp-shadow flex flex-col justify-between`}
              >
                <div className="relative w-full aspect-[16/10] overflow-hidden border border-primary bg-surface-dim mb-3">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-on-primary font-mono text-[10px] font-bold">
                    {photo.format.toUpperCase()}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-surface border border-primary font-mono text-[10px] font-bold text-primary">
                    {photo.elevation}
                  </div>
                </div>

                <div className="p-2 border-t border-outline-variant font-mono text-xs flex flex-col gap-1">
                  <p className="font-sans text-xs text-on-surface leading-tight">
                    {photo.caption}
                  </p>
                  <div className="flex justify-between text-[10px] text-outline pt-1">
                    <span>{photo.location}</span>
                    <span>RAW CAPTURE</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
