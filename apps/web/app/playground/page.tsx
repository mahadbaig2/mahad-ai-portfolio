import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, FlaskConical, ShieldAlert, CheckCircle2, Layers } from "lucide-react";
import { SHOWCASE } from "@/lib/showcase";

export const metadata: Metadata = {
  title: "Playground | Mirza Mahad Baig",
  description: "Applied AI prototypes, engineering explorations, and experiments in motion.",
};

const PROTOCOLS = [
  {
    index: "Protocol 01",
    title: "Honest Labeling",
    description:
      "Call prototypes prototypes. Explorations and demonstration pilots are clearly distinguished from shipped production software.",
    standard: "Zero inflated claims",
    icon: CheckCircle2,
  },
  {
    index: "Protocol 02",
    title: "Divergent Maturity",
    description:
      "Not every experiment needs to become a finished product. Some exist purely to test UX ergonomics, routing ideas, or workflow assumptions.",
    standard: "Learning artifacts",
    icon: Layers,
  },
  {
    index: "Protocol 03",
    title: "Visible Constraints",
    description:
      "Where a demo relies on mock data, paper trading, or synthetic datasets, those boundaries remain transparent on the record.",
    standard: "Explicit scope",
    icon: ShieldAlert,
  },
];

export default function PlaygroundPage() {
  const items = SHOWCASE.filter(
    (item) => item.kind === "Side projects & playground" && item.slug
  );

  return (
    <div className="flex flex-col w-full bg-paper min-h-screen">
      {/* Top Archival Header */}
      <section className="max-w-[1440px] mx-auto w-full px-5 md:px-10 lg:px-16 pt-12 pb-10 space-y-6">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary tracking-widest uppercase">
            <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Playground // Prototypes &amp; Explorations</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.75rem] font-normal text-primary tracking-tight leading-[1.08]">
            Small builds. Unfinished ideas. Useful experiments.
          </h1>
          <p className="text-lg text-on-surface-variant max-w-3xl leading-relaxed">
            Applied prototypes, paper-trading sandboxes, healthcare triage studies, and bounded AI workflows built to stress-test ideas in code and interface design.
          </p>
        </div>

        {/* Operating Protocol Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          {PROTOCOLS.map((proto) => {
            const Icon = proto.icon;
            return (
              <div
                key={proto.index}
                className="bg-surface-container-low p-6 rounded-xl border border-hairline/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-primary font-medium uppercase tracking-wider">
                      {proto.index}
                    </span>
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  </div>
                  <h2 className="font-serif text-xl font-medium text-on-surface mb-2">
                    {proto.title}
                  </h2>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {proto.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-hairline/60 font-mono text-xs text-muted-text">
                  Standard: {proto.standard}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Experiments Grid */}
      <section className="max-w-[1440px] mx-auto w-full px-5 md:px-10 lg:px-16 pb-16">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-hairline">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-primary">
            Tracked Experiments ({items.length})
          </h2>
          <Link
            href="/work"
            className="font-mono text-xs text-primary hover:underline"
          >
            View full work archive →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <Link
              key={item.slug}
              href={`/work/${item.slug}`}
              className="bg-surface-white rounded-xl border border-hairline/80 shadow-editorial-sm overflow-hidden flex flex-col justify-between group hover:shadow-editorial transition-shadow"
            >
              <div className="h-40 bg-gradient-to-br from-primary via-primary-container to-charcoal-gutter p-5 flex flex-col justify-between text-on-primary">
                <div className="flex items-center justify-between font-mono text-xs text-secondary-fixed">
                  <span>EXP // {String(idx + 1).padStart(2, "0")}</span>
                  <span>Prototype / Study</span>
                </div>
                <span className="font-serif text-2xl font-normal text-surface-white">
                  {item.title}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {item.line}
                </p>
                <div className="pt-3 border-t border-hairline/60 flex items-center justify-between font-mono text-xs text-primary font-medium">
                  <span>Inspect experiment</span>
                  <ArrowRight
                    className="h-4 w-4 group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
