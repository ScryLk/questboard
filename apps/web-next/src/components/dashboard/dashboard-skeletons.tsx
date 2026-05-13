"use client";

// Skeleton screens enquanto o dashboard carrega. Mantém as mesmas
// dimensões dos cards reais pra evitar layout shift.

export function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[108px] animate-pulse rounded-xl border border-brand-border bg-brand-surface p-5"
        >
          <div className="h-5 w-5 rounded bg-white/10" />
          <div className="mt-4 h-8 w-16 rounded bg-white/10" />
          <div className="mt-2 h-3 w-24 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ height = 120 }: { height?: number }) {
  return (
    <div
      className="animate-pulse rounded-xl border border-brand-border bg-brand-surface p-5"
      style={{ height }}
    >
      <div className="h-4 w-32 rounded bg-white/10" />
      <div className="mt-4 h-8 w-20 rounded bg-white/10" />
      <div className="mt-3 h-2 w-full rounded bg-white/10" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface">
      <div className="border-b border-brand-border px-6 py-4">
        <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
      </div>
      <div className="space-y-2 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-10 animate-pulse rounded bg-white/[0.03]"
          />
        ))}
      </div>
    </div>
  );
}

export function DashboardErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-brand-danger/30 bg-brand-danger/5 p-5">
      <p className="text-sm font-medium text-brand-danger">
        Não foi possível carregar o dashboard
      </p>
      <p className="mt-1 text-xs text-brand-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 cursor-pointer rounded-lg bg-brand-danger/10 px-3 py-1.5 text-sm text-brand-danger hover:bg-brand-danger/20"
      >
        Tentar novamente
      </button>
    </div>
  );
}
