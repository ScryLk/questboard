"use client";

import { Briefcase, Check, Coins } from "lucide-react";
import { COSMIC_HORROR_OCCUPATIONS } from "@questboard/constants";
import {
  useCosmicHorrorWizardStore,
  calculateOccupationSkillPoints,
  formatOccupationFormula,
} from "@/lib/cosmic-horror-wizard-store";

export function Step3Occupation() {
  const occupationSlug = useCosmicHorrorWizardStore((s) => s.occupationSlug);
  const attributes = useCosmicHorrorWizardStore((s) => s.attributes);
  const setOccupation = useCosmicHorrorWizardStore((s) => s.setOccupation);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-white">
          Ocupação
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          A profissão do investigador define skills profissionais e o orçamento
          de pontos. Quanto maior EDU/atributo chave, mais pontos pra distribuir
          em skills depois.
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {COSMIC_HORROR_OCCUPATIONS.map((occ) => {
          const isSelected = occupationSlug === occ.slug;
          const points = calculateOccupationSkillPoints(
            occ.skillPointsFormula,
            attributes,
          );
          return (
            <button
              key={occ.slug}
              onClick={() => setOccupation(occ.slug)}
              className={`group relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors ${
                isSelected
                  ? "border-purple-400 bg-purple-500/10"
                  : "border-brand-border bg-white/[0.02] hover:border-brand-accent/40"
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Briefcase
                    className={`h-3.5 w-3.5 ${isSelected ? "text-purple-300" : "text-brand-muted"}`}
                  />
                  <h3 className="font-cinzel text-sm font-semibold text-brand-text">
                    {occ.name}
                  </h3>
                </div>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 text-purple-300" />
                )}
              </div>
              <p className="line-clamp-2 text-[11px] text-brand-muted">
                {occ.description}
              </p>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="rounded bg-purple-500/15 px-2 py-0.5 font-semibold text-purple-300">
                  {points} pts
                </span>
                <span className="rounded bg-white/[0.06] px-2 py-0.5 text-brand-muted">
                  {formatOccupationFormula(occ.skillPointsFormula)}
                </span>
                <span className="flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-300">
                  <Coins className="h-2.5 w-2.5" />
                  {occ.credit[0]}–{occ.credit[1]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
