"use client";

import { useMemo } from "react";
import { SKILL_CATEGORY_LABELS } from "@questboard/constants";
import type { CosmicHorrorSheetContext } from "@/hooks/use-cosmic-horror-derived";

interface Props {
  ctx: CosmicHorrorSheetContext;
}

export function CosmicHorrorTabSkills({ ctx }: Props) {
  const grouped = useMemo(() => {
    const map = new Map<string, typeof ctx.skillEntries>();
    for (const skill of ctx.skillEntries) {
      const list = map.get(skill.category) ?? [];
      list.push(skill);
      map.set(skill.category, list);
    }
    return Array.from(map.entries()).map(([cat, list]) => ({
      cat,
      list: [...list].sort((a, b) => b.value - a.value),
    }));
  }, [ctx.skillEntries]);

  return (
    <div className="space-y-3">
      {grouped.map(({ cat, list }) => (
        <div
          key={cat}
          className="rounded-xl border border-brand-border bg-white/[0.02] p-4"
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
            {SKILL_CATEGORY_LABELS[cat as keyof typeof SKILL_CATEGORY_LABELS]}
          </p>
          <div className="grid gap-1.5 md:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <div
                key={s.slug}
                className={`flex items-baseline justify-between rounded px-2 py-1.5 text-xs hover:bg-white/[0.03] ${
                  s.rare ? "border-l-2 border-amber-400/40" : ""
                }`}
              >
                <span className="text-brand-text">
                  {s.name}
                  {s.rare && (
                    <span className="ml-1 text-[9px] text-amber-300">✦</span>
                  )}
                </span>
                <span className="flex items-baseline gap-1">
                  <span className="font-syne font-semibold text-brand-text">
                    {s.value}
                  </span>
                  <span className="text-[9px] text-brand-muted/70">
                    ½{s.halfValue} ⅕{s.extremeValue}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="text-[10px] text-brand-muted/70">
        Rolar abaixo do valor = sucesso · ≤ ½ = sucesso difícil · ≤ ⅕ = sucesso
        extremo. Rolar acima = falha. Skills marcadas com ✦ exigem
        circunstância especial pra subir.
      </p>
    </div>
  );
}
