"use client";

import React from "react";
import { ExternalLink, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface CitationsCardProps {
  citations: string[];
}

export function CitationsCard({ citations }: CitationsCardProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 rounded-md border border-border bg-muted/20 p-2.5 text-xs">
      <div className="flex items-center gap-1.5 font-medium text-foreground mb-2">
        <CheckCircle2 className="h-3.5 w-3.5 text-foreground" />
        <span>Grounded Sources & Citations ({citations.length})</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {citations.map((cid, idx) => {
          const isCaseStudy = cid.includes("case") || cid.includes("talk") || cid.includes("portfolio");
          const targetUrl = isCaseStudy ? "/work/talk-to-mahad" : "/about";

          return (
            <Link
              key={idx}
              href={targetUrl}
              className="inline-flex items-center gap-1.5 rounded border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span>{cid}</span>
              <ExternalLink className="h-2.5 w-2.5 opacity-60" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
