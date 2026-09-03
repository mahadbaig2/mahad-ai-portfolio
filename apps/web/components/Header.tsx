"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Terminal } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  isAi?: boolean;
}

const navItems: NavItem[] = [
  { name: "Work", href: "/work" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Talk to Mahad", href: "/chat", isAi: true },
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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
          aria-label="Mahad - Home"
        >
          <span>Mahad</span>
          <span className="text-xs font-normal text-muted-foreground">/</span>
          <span className="text-xs font-normal text-muted-foreground">
            AI Product Engineer
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex md:items-center md:gap-6"
          aria-label="Main Navigation"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? "font-medium text-foreground underline underline-offset-4"
                    : "text-muted-foreground hover:text-foreground"
                } ${
                  item.isAi
                    ? "inline-flex items-center gap-1.5 rounded border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:border-foreground"
                    : ""
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.isAi && <Terminal className="h-3.5 w-3.5" />}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded p-2 text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          className="border-b border-border bg-white px-4 py-4 md:hidden"
          aria-label="Mobile Navigation"
        >
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded px-3 py-2 text-sm ${
                    isActive
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="flex items-center gap-2">
                    {item.isAi && <Terminal className="h-4 w-4" />}
                    {item.name}
                  </span>
                  {item.isAi && (
                    <span className="text-xs text-muted-foreground">AI System</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
