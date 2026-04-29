"use client";

import { Coins, Package } from "lucide-react";
import type { CosmicHorrorSheetContext } from "@/hooks/use-cosmic-horror-derived";

interface Props {
  ctx: CosmicHorrorSheetContext;
}

const CREDIT_LEVELS = [
  { min: 0, max: 1, label: "Indigente", color: "#94a3b8" },
  { min: 2, max: 9, label: "Pobre", color: "#a3a3a3" },
  { min: 10, max: 49, label: "Médio", color: "#34d399" },
  { min: 50, max: 89, label: "Rico", color: "#fbbf24" },
  { min: 90, max: 98, label: "Muito rico", color: "#f59e0b" },
  { min: 99, max: 99, label: "Super rico", color: "#a855f7" },
];

function getCreditLevel(credit: number) {
  return (
    CREDIT_LEVELS.find((l) => credit >= l.min && credit <= l.max) ?? CREDIT_LEVELS[2]!
  );
}

export function CosmicHorrorTabEquipamento({ ctx }: Props) {
  const { data } = ctx;
  const credit = getCreditLevel(data.creditRating);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-brand-muted">
          <Coins className="h-3.5 w-3.5 text-amber-300" />
          Status financeiro
        </div>
        <div className="flex items-baseline gap-3">
          <span
            className="font-syne text-3xl font-bold"
            style={{ color: credit.color }}
          >
            {data.creditRating}
          </span>
          <span
            className="rounded px-2 py-0.5 text-[11px] font-semibold uppercase"
            style={{
              backgroundColor: credit.color + "20",
              color: credit.color,
              border: `1px solid ${credit.color}40`,
            }}
          >
            {credit.label}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
        <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
          <Package className="h-3.5 w-3.5" />
          Posses
        </p>
        {data.belongings.length === 0 ? (
          <p className="text-xs text-brand-muted/70">
            Investigador veste a roupa do corpo. Adicione posses no wizard.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {data.belongings.map((b, i) => (
              <span
                key={i}
                className="rounded-md border border-brand-border bg-brand-primary px-2 py-1 text-[11px] text-brand-text"
              >
                {b}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
