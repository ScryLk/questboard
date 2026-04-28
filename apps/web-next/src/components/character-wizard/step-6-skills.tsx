"use client";

import { Check } from "lucide-react";
import { useDnd5eWizardStore } from "@/lib/dnd5e-wizard-store";
import { listClasses } from "@/lib/srd";

const SKILL_LABELS: Record<string, string> = {
  acrobatics: "Acrobacia",
  "animal-handling": "Adestrar Animais",
  arcana: "Arcanismo",
  athletics: "Atletismo",
  deception: "Enganação",
  history: "História",
  insight: "Intuição",
  intimidation: "Intimidação",
  investigation: "Investigação",
  medicine: "Medicina",
  nature: "Natureza",
  perception: "Percepção",
  performance: "Atuação",
  persuasion: "Persuasão",
  religion: "Religião",
  "sleight-of-hand": "Prestidigitação",
  stealth: "Furtividade",
  survival: "Sobrevivência",
};

export function Step6Skills() {
  const classSlug = useDnd5eWizardStore((s) => s.classSlug);
  const skills = useDnd5eWizardStore((s) => s.skillProficiencies);
  const toggle = useDnd5eWizardStore((s) => s.toggleSkill);

  const klass = classSlug
    ? listClasses("dnd5e").find((c) => c.slug === classSlug)
    : null;

  if (!klass) {
    return (
      <p className="text-sm text-brand-warning">
        Sem classe selecionada — volte ao passo 3 pra escolher.
      </p>
    );
  }

  const max = klass.skillChoiceCount;
  const remaining = max - skills.length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-brand-text">
          Escolha as perícias
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          {klass.name} oferece {max}{" "}
          {max === 1 ? "perícia" : "perícias"} a escolher de uma lista de{" "}
          {klass.skillChoices.length}. As do background são automáticas e não
          contam aqui.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-md border border-brand-border bg-white/[0.02] px-3 py-2 text-xs">
        <span className="text-brand-muted">Perícias disponíveis</span>
        <span
          className={`font-bold tabular-nums ${
            remaining === 0 ? "text-brand-accent" : "text-brand-text"
          }`}
        >
          {skills.length} / {max}
        </span>
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2">
        {klass.skillChoices.map((skill) => {
          const selected = skills.includes(skill);
          const disabled = !selected && remaining === 0;
          return (
            <button
              key={skill}
              onClick={() => toggle(skill, max)}
              disabled={disabled}
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                selected
                  ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                  : disabled
                    ? "cursor-not-allowed border-brand-border/40 text-brand-muted/40"
                    : "border-brand-border text-brand-muted hover:border-brand-accent/40 hover:text-brand-text"
              }`}
            >
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  selected
                    ? "border-brand-accent bg-brand-accent"
                    : "border-brand-border"
                }`}
              >
                {selected && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="flex-1">{SKILL_LABELS[skill] ?? skill}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
