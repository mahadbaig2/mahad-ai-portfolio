import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-white py-12 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-content flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">
            Mahad — AI Product Engineering
          </p>
          <p className="text-xs">
            Intentionally over-engineered portfolio site & demonstrable AI system.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs">
          <Link
            href="https://github.com/mahadbaig2/mahad-ai-portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground hover:underline"
          >
            GitHub
          </Link>
          <Link
            href="https://linkedin.com/in/mahadbaig"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground hover:underline"
          >
            LinkedIn
          </Link>
          <Link
            href="https://medium.com/@mirza.mahad"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground hover:underline"
          >
            Medium
          </Link>
          <Link
            href="/chat"
            className="transition-colors hover:text-foreground hover:underline"
          >
            Execution Inspector
          </Link>
        </div>
      </div>
    </footer>
  );
}
