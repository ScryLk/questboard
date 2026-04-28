"use client";

import { Check, Wand2 } from "lucide-react";
import { useDnd5eWizardStore } from "@/lib/dnd5e-wizard-store";
import { listClasses } from "@/lib/srd";

export function Step3Class() {
  const classes = listClasses("dnd5e");
  const classSlug = useDnd5eWizardStore((s) => s.classSlug);
  const setClass = useDnd5eWizardStore((s) => s.setClass);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-brand-text">
          Escolha a classe
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Define hit die (HP por nível), proficiências em armas e
          armaduras, perícias disponíveis e se você conjura magias.
          Subclasses entram no nível 3 — fora do MVP.
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {classes.map((c) => {
          const selected = classSlug === c.slug;
          return (
            <button
              key={c.slug}
              onClick={() => setClass(c.slug)}
              className={`flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors ${
                selected
                  ? "border-brand-accent bg-brand-accent/10"
                  : "border-brand-border bg-white/[0.02] hover:border-brand-accent/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-cinzel text-sm font-semibold text-brand-text">
                    {c.name}
                  </h3>
                  <p className="text-[10px] text-brand-muted">
                    Atrib: {c.primaryAbility.map((a) => a.toUpperCase()).join("/")}
                  </p>
                </div>
                {selected && (
                  <Check className="h-4 w-4 shrink-0 text-brand-accent" />
                )}
              </div>

              <div className="flex flex-wrap gap-1 text-[9px]">
                <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-brand-muted">
                  d{c.hitDie} HP
                </span>
                <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-brand-muted">
                  Resist: {c.savingThrowProficiencies.map((s) => s.toUpperCase()).join("/")}
                </span>
                {c.spellcastingAbility && (
                  <span className="rounded bg-purple-500/15 px-1.5 py-0.5 font-semibold text-purple-300">
                    <Wand2 className="mr-0.5 inline h-2 w-2" />
                    Conjurador ({c.spellcastingAbility.toUpperCase()})
                  </span>
                )}
              </div>

              <p className="line-clamp-2 text-[11px] text-brand-muted/90">
                {c.description}
              </p>

              <p className="text-[10px] text-brand-muted">
                <span className="font-semibold text-brand-text/80">
                  Perícias:
                </span>{" "}
                escolha {c.skillChoiceCount} de {c.skillChoices.length}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
