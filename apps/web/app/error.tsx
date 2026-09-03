"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log safe error info without private data
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div
      className="mx-auto flex max-w-content flex-col items-start px-4 py-24 sm:px-6"
      role="alert"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span>Application Error</span>
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        Something unexpected occurred
      </h1>
      <p className="mt-3 text-sm text-muted-foreground max-w-prose">
        An error prevented this section from rendering. You can attempt to
        recover by retrying the action.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 inline-flex items-center gap-2 rounded bg-foreground px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <RotateCcw className="h-4 w-4" />
        <span>Try again</span>
      </button>
    </div>
  );
}
