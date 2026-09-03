import React from "react";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded border border-border bg-white p-5 transition-colors ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded border border-border px-2 py-0.5 text-xs font-medium text-foreground ${className}`}
    >
      {children}
    </span>
  );
}
