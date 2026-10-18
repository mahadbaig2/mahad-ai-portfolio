"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight, Terminal } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: "WORK", href: "/work" },
  { name: "ABOUT", href: "/about" },
  { name: "WRITING", href: "/writing" },
  { name: "PLAYGROUND", href: "/playground" },
  { name: "OFF-SCREEN", href: "/travel" },
  { name: "CONTACT", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b-[1.5px] border-primary bg-surface dark:bg-primary-container">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-8">
        {/* Brand Logo / Monogram */}
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 bg-primary dark:bg-surface-container-lowest" />
          <Link
            href="/"
            className="flex items-center gap-2 font-headline text-base font-black tracking-tight text-primary dark:text-surface-container-lowest uppercase sm:text-lg"
            aria-label="Mirza Mahad Baig - Home"
          >
            <span>MAHAD BAIG</span>
            <span className="hidden text-xs font-mono font-medium text-on-surface-variant sm:inline-block">
              {`// AI PRODUCT ENGINEER`}
            </span>
          </Link>
          <span className="hidden lg:inline-block border border-primary px-2 py-0.5 font-mono text-[10px] font-semibold text-primary bg-surface-container">
            {`DS-01 // ARCHIVE-SPEC`}
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav
          className="hidden lg:flex items-center space-x-6 text-xs font-mono font-semibold uppercase tracking-wider"
          aria-label="Main Navigation"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/writing" && pathname.startsWith("/writing")) ||
              (item.href === "/work" && pathname.startsWith("/work")) ||
              (item.href === "/travel" && pathname.startsWith("/travel"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors pb-1 ${
                  isActive
                    ? "border-b-2 border-primary text-primary font-bold dark:border-surface-container-lowest dark:text-surface-container-lowest"
                    : "text-on-surface-variant hover:text-primary dark:text-outline-variant dark:hover:text-surface-container-lowest"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Trailing Action Cluster */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 border border-outline-variant bg-surface-container-low px-2.5 py-1 font-mono text-[11px] font-bold">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-primary">SYS_STATUS: ACTIVE</span>
          </div>

          {/* Talk to Mahad CTA */}
          <Link
            href="/chat"
            className="flex items-center gap-1.5 bg-tertiary-container px-3.5 py-1.5 font-mono text-xs font-bold text-on-tertiary tracking-wide stamp-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
            aria-label="Talk to Mahad AI Assistant"
          >
            <span>Talk to Mahad</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>

          {/* Mobile menu toggle button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center border border-primary bg-surface p-2 text-primary hover:bg-surface-container"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          className="border-b-2 border-primary bg-surface px-6 py-6 lg:hidden"
          aria-label="Mobile Navigation"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2 font-mono text-xs text-on-surface-variant">
              <span>NAVIGATION MATRIX</span>
              <span>v2.4.0</span>
            </div>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/writing" && pathname.startsWith("/writing")) ||
                (item.href === "/work" && pathname.startsWith("/work")) ||
                (item.href === "/travel" && pathname.startsWith("/travel"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between border-b border-outline-variant/40 py-2 font-mono text-sm uppercase tracking-wide ${
                    isActive
                      ? "font-bold text-primary border-l-4 border-l-primary pl-2"
                      : "text-on-surface hover:text-primary pl-0"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span>{item.name}</span>
                  <ArrowUpRight className="h-4 w-4 text-outline" />
                </Link>
              );
            })}
            <div className="pt-2">
              <Link
                href="/chat"
                className="flex w-full items-center justify-center gap-2 bg-tertiary-container py-3 font-mono text-xs font-bold uppercase text-on-tertiary stamp-shadow"
              >
                <Terminal className="h-4 w-4" />
                <span>Talk to Mahad (AI Assistant)</span>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
