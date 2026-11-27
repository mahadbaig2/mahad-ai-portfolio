import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t-2 border-primary bg-surface">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-hairline/70 items-start">
          <div className="space-y-2 md:col-span-1">
            <Link
              href="/"
              className="font-serif text-xl font-medium text-primary hover:text-primary-container transition-colors"
            >
              Mirza Mahad Baig
            </Link>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-wider text-muted-text">
              Explore
            </div>
            <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm pt-1">
              <Link href="/work" className="text-on-surface-variant hover:text-primary transition-colors">
                Work
              </Link>
              <Link href="/about" className="text-on-surface-variant hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/writing" className="text-on-surface-variant hover:text-primary transition-colors">
                Writing
              </Link>
              <Link href="/playground" className="text-on-surface-variant hover:text-primary transition-colors">
                Playground
              </Link>
              <Link href="/travel" className="text-on-surface-variant hover:text-primary transition-colors">
                Travel
              </Link>
              <Link href="/contact" className="text-on-surface-variant hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          <div className="space-y-2">
            <div className="pt-1">
              <Link
                href="/chat"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-container underline underline-offset-4 decoration-jade transition-colors"
              >
                <span>Talk to Mahad</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-wider text-muted-text">
              Direct Channels
            </div>
            <ul className="space-y-1.5 text-sm pt-1">
              <li>
                <a
                  href="https://github.com/mahadbaig2"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary underline-offset-4 hover:underline decoration-jade transition-colors"
                >
                  <span>GitHub</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/in/mahadbaig"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary underline-offset-4 hover:underline decoration-jade transition-colors"
                >
                  <span>LinkedIn</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary underline-offset-4 hover:underline decoration-jade transition-colors"
                >
                  <span>Contact &amp; Résumé</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs text-muted-text">
          <span>© {new Date().getFullYear()} Mirza Mahad Baig.</span>
        </div>
      </div>
    </footer>
  );
}
