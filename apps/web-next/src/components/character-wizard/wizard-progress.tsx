"use client";

import { Check } from "lucide-react";
import { useDnd5eWizardStore } from "@/lib/dnd5e-wizard-store";

const STEP_LABELS = [
  "Sistema",
  "Raça",
  "Classe",
  "Background",
  "Atributos",
  "Perícias",
  "Equipamento",
  "Magias",
  "Detalhes",
  "Revisão",
];

export function WizardProgress() {
  const step = useDnd5eWizardStore((s) => s.step);
  const setStep = useDnd5eWizardStore((s) => s.setStep);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[11px] text-brand-muted">
        <span>
          Passo {step} de 10 · {STEP_LABELS[step - 1]}
        </span>
        <span>{Math.round((step / 10) * 100)}%</span>
      </div>
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className="h-full rounded-full bg-brand-accent transition-all"
          style={{ width: `${(step / 10) * 100}%` }}
        />
      </div>
      {/* Step pills (desktop) */}
      <div className="hidden flex-wrap gap-1 md:flex">
        {STEP_LABELS.map((label, i) => {
          const num = i + 1;
          const done = num < step;
          const current = num === step;
          return (
            <button
              key={label}
              onClick={() => num <= step && setStep(num)}
              disabled={num > step}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                current
                  ? "bg-brand-accent/15 text-brand-accent"
                  : done
                    ? "text-brand-muted hover:bg-white/[0.05] hover:text-brand-text"
                    : "text-brand-muted/50"
              }`}
            >
              {done ? (
                <Check className="h-2.5 w-2.5" />
              ) : (
                <span className="font-bold">{num}</span>
              )}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
