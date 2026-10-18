import React from "react";
import { AlertCircle } from "lucide-react";

export function AnnouncementBar() {
  return (
    <aside
      aria-label="Portfolio status announcement"
      className="w-full border-b-[1.5px] border-primary bg-secondary-container px-4 py-1.5 text-center font-mono text-xs text-on-secondary-container"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 font-medium">
        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-secondary" />
        <span className="tracking-wide">
          SYSTEM NOTICE: Portfolio UI revamp in progress. Data grounded in real Sanity records.
        </span>
      </div>
    </aside>
  );
}

