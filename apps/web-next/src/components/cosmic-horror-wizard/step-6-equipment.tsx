"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { COSMIC_HORROR_OCCUPATIONS } from "@questboard/constants";
import { useCosmicHorrorWizardStore } from "@/lib/cosmic-horror-wizard-store";
import type { CosmicHorrorWeaponEntry } from "@/types/character";

const STARTER_WEAPONS: CosmicHorrorWeaponEntry[] = [
  { name: "Punhos", skillSlug: "brawl", damage: "1d3" },
  { name: "Faca", skillSlug: "brawl", damage: "1d4" },
  { name: "Cassetete", skillSlug: "brawl", damage: "1d6" },
  { name: "Pistola .22", skillSlug: "firearms-handgun", damage: "1d6", range: "10m", ammo: 6 },
  { name: "Pistola .38", skillSlug: "firearms-handgun", damage: "1d10", range: "15m", ammo: 6 },
  { name: "Espingarda 12", skillSlug: "firearms-rifle", damage: "4d6/2d6/1d6", range: "5/15/30m", ammo: 2 },
  { name: "Rifle .30-06", skillSlug: "firearms-rifle", damage: "2d6+4", range: "110m", ammo: 5 },
];

export function Step6Equipment() {
  const occupationSlug = useCosmicHorrorWizardStore((s) => s.occupationSlug);
  const weapons = useCosmicHorrorWizardStore((s) => s.weapons);
  const belongings = useCosmicHorrorWizardStore((s) => s.belongings);
  const creditRating = useCosmicHorrorWizardStore((s) => s.creditRating);
  const addWeapon = useCosmicHorrorWizardStore((s) => s.addWeapon);
  const removeWeapon = useCosmicHorrorWizardStore((s) => s.removeWeapon);
  const addBelonging = useCosmicHorrorWizardStore((s) => s.addBelonging);
  const removeBelonging = useCosmicHorrorWizardStore((s) => s.removeBelonging);
  const setCreditRating = useCosmicHorrorWizardStore((s) => s.setCreditRating);

  const [newBelonging, setNewBelonging] = useState("");
  const occupation = COSMIC_HORROR_OCCUPATIONS.find(
    (o) => o.slug === occupationSlug,
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-white">
          Equipamento Inicial
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Investigador médio começa com poucas coisas: uma arma talvez, peças
          significativas, dinheiro de bolso. Adicione livremente.
        </p>
      </div>

      <div className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            Status Financeiro (Credit Rating)
          </p>
          {occupation && (
            <p className="text-[10px] text-brand-muted/70">
              {occupation.name}: faixa {occupation.credit[0]}–
              {occupation.credit[1]}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-syne text-3xl font-bold text-amber-300">
            {creditRating}
          </span>
          <input
            type="range"
            min={0}
            max={99}
            value={creditRating}
            onChange={(e) =>
              setCreditRating(parseInt(e.target.value, 10) || 0)
            }
            className="flex-1 accent-amber-400"
          />
        </div>
      </div>

      <div className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
          Armas
        </p>

        {weapons.length === 0 ? (
          <p className="mb-3 text-xs text-brand-muted/70">
            Sem armas escolhidas — investigadores frequentemente começam
            desarmados.
          </p>
        ) : (
          <div className="mb-3 space-y-1.5">
            {weapons.map((w, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 rounded-md border border-brand-border bg-brand-primary px-3 py-1.5 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-brand-text">{w.name}</p>
                  <p className="text-[10px] text-brand-muted">
                    {w.skillSlug} · {w.damage}
                    {w.range && ` · ${w.range}`}
                  </p>
                </div>
                <button
                  onClick={() => removeWeapon(i)}
                  className="text-brand-muted/70 hover:text-rose-400"
                  aria-label="Remover"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="mb-2 text-[10px] uppercase tracking-wider text-brand-muted/70">
          Adicionar arma sugerida
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STARTER_WEAPONS.filter(
            (s) => !weapons.some((w) => w.name === s.name),
          ).map((s) => (
            <button
              key={s.name}
              onClick={() => addWeapon(s)}
              className="flex items-center gap-1 rounded-md border border-brand-border bg-white/[0.02] px-2 py-1 text-[11px] text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
            >
              <Plus className="h-2.5 w-2.5" />
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
          Posses
        </p>
        {belongings.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {belongings.map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md border border-brand-border bg-brand-primary px-2 py-1 text-[11px] text-brand-text"
              >
                {b}
                <button
                  onClick={() => removeBelonging(i)}
                  className="text-brand-muted/70 hover:text-rose-400"
                  aria-label="Remover"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newBelonging}
            onChange={(e) => setNewBelonging(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addBelonging(newBelonging);
                setNewBelonging("");
              }
            }}
            placeholder="Ex: Caderno de campo, lanterna, crucifixo de prata"
            className="h-9 flex-1 rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text placeholder:text-brand-muted/50 focus:border-purple-400 focus:outline-none"
          />
          <button
            onClick={() => {
              addBelonging(newBelonging);
              setNewBelonging("");
            }}
            disabled={!newBelonging.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-purple-500/15 px-3 py-2 text-xs font-medium text-purple-300 transition-colors hover:bg-purple-500/25 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
