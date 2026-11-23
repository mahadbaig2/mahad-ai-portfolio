"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, AudioLines } from "lucide-react";

const NAV_LINKS = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Writing", href: "/writing" },
  { label: "Playground", href: "/playground" },
  { label: "Travel", href: "/travel" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/writing" && pathname.startsWith("/blog")) return true;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-paper/90 backdrop-blur-md border-b border-hairline/70 shadow-editorial-sm">
      <div className="h-20 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 flex items-center justify-between gap-2 sm:gap-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 sm:gap-3 group min-w-0"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary font-serif text-lg leading-none shadow-editorial-sm group-hover:bg-primary-container transition-colors"
          >
            M
          </span>
          <span className="flex flex-col text-left min-w-0">
            <span className="font-serif text-base sm:text-xl font-medium text-primary tracking-tight leading-tight group-hover:text-primary-container transition-colors truncate">
              Mirza Mahad Baig
            </span>
            <span className="hidden sm:block font-mono text-[11px] text-muted-text leading-tight">
              AI Product Engineer &amp; Designer
            </span>
          </span>
        </Link>

        <nav
          id="main-navigation"
          aria-label="Main navigation"
          className={
            open
              ? "flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-1 absolute lg:static top-20 left-0 right-0 max-h-[calc(100vh-5rem)] overflow-y-auto bg-paper lg:bg-transparent border-b lg:border-b-0 border-hairline px-5 py-5 lg:p-0 shadow-editorial lg:shadow-none"
              : "hidden lg:flex lg:items-center lg:gap-1"
          }
        >
          {NAV_LINKS.map(({ label, href }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "rounded-lg bg-mint px-3 py-2 text-sm font-medium text-primary transition-colors min-h-[44px] lg:min-h-0 flex items-center"
                    : "rounded-lg px-3 py-2 text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-mint/60 transition-colors min-h-[44px] lg:min-h-0 flex items-center"
                }
              >
                {label}
              </Link>
            );
          })}
          {open && (
            <div className="sm:hidden pt-2 mt-1 border-t border-hairline/70">
              <Link
                href="/chat"
                onClick={() => setOpen(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-container px-4 py-3 text-sm font-medium text-on-primary shadow-editorial-sm hover:bg-primary transition-colors"
              >
                <AudioLines className="h-4 w-4 text-secondary-fixed" aria-hidden="true" />
                <span>Talk to Mahad</span>
              </Link>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/chat"
            onClick={() => setOpen(false)}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-xs sm:text-sm font-medium text-on-primary shadow-editorial-sm hover:bg-primary transition-colors"
          >
            <AudioLines className="h-4 w-4 text-secondary-fixed" aria-hidden="true" />
            <span>Talk to Mahad</span>
          </Link>

          <button
            type="button"
            className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg border border-hairline bg-surface-white text-primary hover:bg-mint transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="main-navigation"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
