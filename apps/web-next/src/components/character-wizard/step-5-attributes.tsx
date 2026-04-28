"use client";

// Step 5 — atribuição de atributos.
//
// 3 métodos:
// - Point Buy 27: scores 8-15, custos do PHB (8=0, 9=1, 10=2, 11=3,
//   12=4, 13=5, 14=7, 15=9). Soma deve ser ≤ 27.
// - Standard Array: 15/14/13/12/10/8 — usuário arrasta entre os 6
//   atributos (representado aqui como dropdowns).
// - Manual: campos livres 1-20 (GM permite, ex: campanha Epic Tier).
//
// Bônus de raça aparecem somados em uma coluna ao lado.

import { Minus, Plus } from "lucide-react";
import {
  POINT_BUY_MAX,
  POINT_BUY_MIN,
  POINT_BUY_TOTAL,
  pointBuyCost,
  totalPointsSpent,
  useDnd5eWizardStore,
  type AbilityKey,
} from "@/lib/dnd5e-wizard-store";
import { listRaces } from "@/lib/srd";

const ABILITIES: { key: AbilityKey; label: string; full: string }[] = [
  { key: "str", label: "FOR", full: "Força" },
  { key: "dex", label: "DES", full: "Destreza" },
  { key: "con", label: "CON", full: "Constituição" },
  { key: "int", label: "INT", full: "Inteligência" },
  { key: "wis", label: "SAB", full: "Sabedoria" },
  { key: "cha", label: "CAR", full: "Carisma" },
];

function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}
function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export function Step5Attributes() {
  const method = useDnd5eWizardStore((s) => s.statMethod);
  const setMethod = useDnd5eWizardStore((s) => s.setStatMethod);
  const attrs = useDnd5eWizardStore((s) => s.attributes);
  const setAttribute = useDnd5eWizardStore((s) => s.setAttribute);
  const raceSlug = useDnd5eWizardStore((s) => s.raceSlug);

  const race = raceSlug
    ? listRaces("dnd5e").find((r) => r.slug === raceSlug)
    : null;

  const spent = totalPointsSpent(attrs);
  const remaining = POINT_BUY_TOTAL - spent;

  const isPointBuy = method === "point-buy";

  function adjust(ability: AbilityKey, delta: number) {
    const current = attrs[ability];
    const next = current + delta;
    if (isPointBuy) {
      if (next < POINT_BUY_MIN || next > POINT_BUY_MAX) return;
      // Verifica orçamento se aumentando.
      if (delta > 0) {
        const costAfter = pointBuyCost(next) - pointBuyCost(current);
        if (costAfter > remaining) return;
      }
    } else if (method === "manual") {
      if (next < 1 || next > 20) return;
    } else {
      // standard-array: trocas entre os 6 atributos. Versão simples:
      // bloqueia adjust e força edição via dropdown se quiser refinar.
      return;
    }
    setAttribute(ability, next);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-brand-text">
          Distribua os atributos
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          {isPointBuy
            ? "Ponto Buy 27: cada atributo começa em 8. Aumentar custa pontos (PHB)."
            : method === "standard-array"
              ? "Standard Array: 15/14/13/12/10/8 distribuídos. Use Manual pra ajustar."
              : "Manual: insira valores diretamente (1-20)."}
        </p>
      </div>

      <div className="flex gap-1 rounded-lg border border-brand-border p-0.5">
        {(["point-buy", "standard-array", "manual"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              method === m
                ? "bg-brand-accent/15 text-brand-accent"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            {m === "point-buy"
              ? "Point Buy 27"
              : m === "standard-array"
                ? "Array Padrão"
                : "Manual"}
          </button>
        ))}
      </div>

      {isPointBuy && (
        <div className="flex items-center justify-between rounded-md border border-brand-border bg-white/[0.02] px-3 py-2 text-xs">
          <span className="text-brand-muted">Pontos disponíveis</span>
          <span
            className={`font-bold tabular-nums ${
              remaining < 0 ? "text-red-400" : "text-brand-accent"
            }`}
          >
            {remaining} / {POINT_BUY_TOTAL}
          </span>
        </div>
      )}

      <div className="grid gap-2">
        {ABILITIES.map(({ key, label, full }) => {
          const base = attrs[key];
          const racialBonus = race?.abilityBonuses[key] ?? 0;
          const finalScore = base + racialBonus;
          const mod = abilityMod(finalScore);

          return (
            <div
              key={key}
              className="flex items-center gap-3 rounded-md border border-brand-border bg-white/[0.02] p-3"
            >
              <div className="w-20 shrink-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                  {label}
                </p>
                <p className="text-[10px] text-brand-muted/70">{full}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjust(key, -1)}
                  disabled={method === "standard-array"}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-border text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text disabled:opacity-30"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-10 text-center text-lg font-bold tabular-nums text-brand-text">
                  {base}
                </span>
                <button
                  onClick={() => adjust(key, 1)}
                  disabled={method === "standard-array"}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-border text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text disabled:opacity-30"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {racialBonus > 0 && (
                <span className="rounded bg-brand-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand-accent">
                  +{racialBonus} racial
                </span>
              )}

              <div className="ml-auto flex items-center gap-3">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-brand-muted">
                    Final
                  </p>
                  <p className="text-base font-bold tabular-nums text-brand-text">
                    {finalScore}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-brand-muted">
                    Mod
                  </p>
                  <p className="text-base font-bold tabular-nums text-brand-accent">
                    {fmtMod(mod)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!race && (
        <p className="text-[11px] text-brand-warning">
          Sem raça selecionada — bônus raciais não estão sendo somados.
          Volte ao passo 2 se quiser revisar.
        </p>
      )}
    </div>
  );
}
