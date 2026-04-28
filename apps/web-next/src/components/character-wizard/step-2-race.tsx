"use client";

import { Check } from "lucide-react";
import { useDnd5eWizardStore } from "@/lib/dnd5e-wizard-store";
import { listRaces } from "@/lib/srd";

const ABILITY_LABEL: Record<string, string> = {
  str: "FOR",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",
};

export function Step2Race() {
  const races = listRaces("dnd5e");
  const raceSlug = useDnd5eWizardStore((s) => s.raceSlug);
  const setRace = useDnd5eWizardStore((s) => s.setRace);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-brand-text">
          Escolha a raça
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          A raça determina bônus de atributo, velocidade, traços inatos
          e idiomas. Os bônus aparecem somados aos atributos finais no
          passo de Atributos.
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {races.map((race) => {
          const selected = raceSlug === race.slug;
          return (
            <button
              key={race.slug}
              onClick={() => setRace(race.slug)}
              className={`group flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors ${
                selected
                  ? "border-brand-accent bg-brand-accent/10"
                  : "border-brand-border bg-white/[0.02] hover:border-brand-accent/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-cinzel text-sm font-semibold text-brand-text">
                    {race.name}
                  </h3>
                  <p className="text-[10px] text-brand-muted">
                    {race.size === "small" ? "Pequeno" : "Médio"} · velocidade {race.speed}m
                  </p>
                </div>
                {selected && (
                  <Check className="h-4 w-4 shrink-0 text-brand-accent" />
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {Object.entries(race.abilityBonuses).map(([k, v]) => (
                  <span
                    key={k}
                    className="rounded bg-brand-accent/15 px-1.5 py-0.5 text-[9px] font-semibold text-brand-accent"
                  >
                    {ABILITY_LABEL[k]} +{v}
                  </span>
                ))}
              </div>

              <p className="line-clamp-2 text-[11px] text-brand-muted/90">
                {race.description}
              </p>

              {race.traits.length > 0 && (
                <p className="text-[10px] text-brand-muted">
                  <span className="font-semibold text-brand-text/80">
                    {race.traits.length} traços:
                  </span>{" "}
                  {race.traits.map((t) => t.name).join(", ")}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
