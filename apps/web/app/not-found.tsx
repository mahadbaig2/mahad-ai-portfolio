import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-content flex-col items-start px-4 py-24 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        404 Not Found
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        Page does not exist
      </h1>
      <p className="mt-3 text-sm text-muted-foreground max-w-prose">
        The requested URL was not found on this portfolio. Please navigate back
        to the homepage or ask the &quot;Talk to Mahad&quot; assistant to help you locate
        information.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded border border-border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home</span>
      </Link>
    </div>
  );
}
