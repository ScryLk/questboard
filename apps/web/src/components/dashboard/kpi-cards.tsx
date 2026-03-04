import type { DashboardKPI } from "@questboard/types";

const ICONS: Record<string, string> = {
  scroll: "📜",
  clock: "⏱",
  users: "👥",
  calendar: "📅",
  pause: "⏸",
};

function KPICard({ kpi }: { kpi: DashboardKPI }) {
  const hasChange =
    kpi.changePercent !== undefined && kpi.changePercent !== 0;
  const isPositive = (kpi.changePercent ?? 0) > 0;

  return (
    <div className="rounded-xl border border-white/5 bg-surface-light p-4">
      <div className="flex items-center justify-between">
        <span className="text-lg">{ICONS[kpi.icon] ?? "📊"}</span>
        {hasChange && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              isPositive
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {kpi.changePercent}%
          </span>
        )}
      </div>
      <p className="mt-3 font-heading text-2xl font-bold text-white">
        {kpi.value}
      </p>
      <p className="mt-1 text-xs text-gray-400">{kpi.label}</p>
    </div>
  );
}

export function KPICards({ kpis }: { kpis: DashboardKPI[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {kpis.map((kpi, i) => (
        <KPICard key={i} kpi={kpi} />
      ))}
    </div>
  );
}
