"use client";

import { Check } from "lucide-react";
import { useCosmicHorrorWizardStore } from "@/lib/cosmic-horror-wizard-store";

const STEP_LABELS = [
  "Identidade",
  "Atributos",
  "Ocupação",
  "Skills",
  "Sanidade",
  "Equipamento",
  "Backstory",
  "Revisão",
];

export function CosmicHorrorWizardProgress() {
  const step = useCosmicHorrorWizardStore((s) => s.step);
  const setStep = useCosmicHorrorWizardStore((s) => s.setStep);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[11px] text-brand-muted">
        <span>
          Passo {step} de 8 · {STEP_LABELS[step - 1]}
        </span>
        <span>{Math.round((step / 8) * 100)}%</span>
      </div>
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className="h-full rounded-full bg-purple-400 transition-all"
          style={{ width: `${(step / 8) * 100}%` }}
        />
      </div>
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
                  ? "bg-purple-500/15 text-purple-300"
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
