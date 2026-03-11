const VARIANTS = {
  success: "bg-brand-success/15 text-brand-success",
  warning: "bg-brand-warning/15 text-brand-warning",
  danger: "bg-brand-danger/15 text-brand-danger",
  info: "bg-brand-info/15 text-brand-info",
  muted: "bg-white/5 text-brand-muted",
  accent: "bg-brand-accent/15 text-brand-accent",
} as const;

interface StatusBadgeProps {
  label: string;
  variant: keyof typeof VARIANTS;
  className?: string;
}

export function StatusBadge({ label, variant, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${VARIANTS[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
