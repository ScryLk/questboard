"use client";

// Tab Resumo — visão geral. Mostra Sanity tracker grande, atributos
// compactos e top skills.

import { COSMIC_HORROR_ATTRIBUTE_LABELS } from "@questboard/constants";
import type { CosmicHorrorSheetContext } from "@/hooks/use-cosmic-horror-derived";
import { SanityTracker } from "./sanity-tracker";

interface Props {
  ctx: CosmicHorrorSheetContext;
}

export function CosmicHorrorTabResumo({ ctx }: Props) {
  const { data, skillEntries } = ctx;

  const topSkills = [...skillEntries]
    .filter((s) => s.value >= 30)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <SanityTracker ctx={ctx} />
      </div>

      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            Atributos
          </p>
          <div className="grid grid-cols-4 gap-2">
            {(Object.entries(data.attributes) as Array<[keyof typeof data.attributes, number]>).map(([key, value]) => {
              const lbl = COSMIC_HORROR_ATTRIBUTE_LABELS[key];
              return (
                <div
                  key={key}
                  className="rounded-md border border-brand-border bg-brand-primary px-2 py-2 text-center"
                  title={lbl.description}
                >
                  <p className="text-[10px] uppercase tracking-wider text-brand-muted">
                    {lbl.short}
                  </p>
                  <p className="font-syne text-xl font-bold text-brand-text">
                    {value}
                  </p>
                  <p className="text-[9px] text-brand-muted/70">
                    ½ {Math.floor(value / 2)} · ⅕ {Math.floor(value / 5)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {topSkills.length > 0 && (
          <div className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Skills mais altas
            </p>
            <div className="grid gap-1.5 md:grid-cols-2">
              {topSkills.map((s) => (
                <div
                  key={s.slug}
                  className="flex items-baseline justify-between rounded px-2 py-1 text-xs"
                >
                  <span className="text-brand-text">{s.name}</span>
                  <span className="font-syne font-semibold text-purple-300">
                    {s.value}
                    <span className="ml-1 text-[9px] text-brand-muted/70">
                      ½{s.halfValue} ⅕{s.extremeValue}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
