"use client";

import { Brain, Clover, Dice5, Droplet, Heart } from "lucide-react";
import { cosmicHorror } from "@questboard/game-engine";
import { useCosmicHorrorWizardStore } from "@/lib/cosmic-horror-wizard-store";

export function Step5SanityLuck() {
  const attributes = useCosmicHorrorWizardStore((s) => s.attributes);
  const luck = useCosmicHorrorWizardStore((s) => s.luck);
  const rollLuck = useCosmicHorrorWizardStore((s) => s.rollLuck);
  const setLuck = useCosmicHorrorWizardStore((s) => s.setLuck);

  const sanityMax = attributes.pod;
  const hp = cosmicHorror.calculateHitPoints({
    con: attributes.con,
    tam: attributes.tam,
  });
  const mp = cosmicHorror.calculateMagicPoints(attributes.pod);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-white">
          Sanidade, Sorte & Vitalidade
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Sanidade inicial = POD. Pontos de Mágica = POD/5. HP = (CON+TAM)/10.
          Sorte é rolada em 3d6×5 (15-90) — pode ser gasta para alterar
          rolagens em momentos críticos.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
          <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-brand-muted">
            <Brain className="h-3.5 w-3.5 text-purple-300" />
            Sanidade
          </p>
          <p className="font-syne text-3xl font-bold text-purple-300">
            {sanityMax}
          </p>
          <p className="mt-1 text-[11px] text-brand-muted/80">
            SAN máxima inicial = POD ({attributes.pod}). Cada ponto de
            Conhecimento do Mythos derruba esse teto 1:1.
          </p>
        </div>

        <div className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
          <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-brand-muted">
            <Heart className="h-3.5 w-3.5 text-rose-300" />
            HP / MP
          </p>
          <div className="flex items-baseline gap-3">
            <span className="font-syne text-3xl font-bold text-rose-300">
              {hp}
            </span>
            <span className="text-brand-muted">·</span>
            <span className="font-syne text-3xl font-bold text-blue-300">
              <Droplet className="-mb-1 mr-1 inline h-5 w-5" />
              {mp}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-brand-muted/80">
            HP = ⌊(CON+TAM)/10⌋ · MP = ⌊POD/5⌋
          </p>
        </div>

        <div className="md:col-span-2 rounded-xl border border-brand-border bg-white/[0.02] p-4">
          <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-brand-muted">
            <Clover className="h-3.5 w-3.5 text-emerald-300" />
            Sorte (Luck)
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {luck === null ? (
              <button
                onClick={rollLuck}
                className="flex items-center gap-2 rounded-lg border border-purple-400 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-300 transition-colors hover:bg-purple-500/20"
              >
                <Dice5 className="h-4 w-4" />
                Rolar 3d6 × 5
              </button>
            ) : (
              <>
                <span className="font-syne text-4xl font-bold text-emerald-300">
                  {luck}
                </span>
                <input
                  type="number"
                  min={15}
                  max={99}
                  value={luck}
                  onChange={(e) =>
                    setLuck(parseInt(e.target.value, 10) || luck)
                  }
                  className="h-9 w-20 rounded border border-brand-border bg-brand-primary px-2 text-center text-sm text-brand-text focus:border-purple-400 focus:outline-none"
                />
                <button
                  onClick={rollLuck}
                  className="rounded-lg border border-brand-border px-3 py-2 text-xs font-medium text-brand-muted transition-colors hover:text-brand-text"
                >
                  Rolar de novo
                </button>
              </>
            )}
          </div>
          <p className="mt-2 text-[11px] text-brand-muted/80">
            Pontos de Sorte podem ser gastos pra ajustar rolagens — quanto
            você gasta, é quanto adiciona/subtrai. Não regenera com facilidade.
          </p>
        </div>
      </div>
    </div>
  );
}
