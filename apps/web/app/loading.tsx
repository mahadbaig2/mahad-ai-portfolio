export default function Loading() {
  return (
    <div
      className="mx-auto flex max-w-content flex-col items-center justify-center px-4 py-24 sm:px-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground"></div>
        <span>Loading content...</span>
      </div>
    </div>
  );
}
