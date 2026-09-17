import React from "react";
import { AlertCircle } from "lucide-react";

export function AnnouncementBar() {
  return (
    <aside
      aria-label="Portfolio status announcement"
      className="w-full border-b border-border bg-neutral-50 px-4 py-2 text-center text-xs text-muted-foreground transition-colors"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-1.5 font-medium text-foreground">
        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span>I&apos;m currently working on this Portfolio so some things might break!</span>
      </div>
    </aside>
  );
}
