type VisualPlaceholderProps = {
  label: string;
  className?: string;
};

export function VisualPlaceholder({ label, className = "" }: VisualPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={`Abstract image placeholder for ${label}`}
      className={`visual-placeholder absolute inset-0 ${className}`}
    />
  );
}
