"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCosmicHorrorWizardStore } from "@/lib/cosmic-horror-wizard-store";

export function CosmicHorrorWizardFooter() {
  const step = useCosmicHorrorWizardStore((s) => s.step);
  const next = useCosmicHorrorWizardStore((s) => s.next);
  const prev = useCosmicHorrorWizardStore((s) => s.prev);

  const canProceed = useCosmicHorrorWizardStore((s) => {
    switch (s.step) {
      case 1:
        return s.name.trim().length >= 2 && s.age >= 15 && s.age <= 90;
      case 2:
        // Validação simples: todos atributos > 0.
        return Object.values(s.attributes).every((v) => v > 0);
      case 3:
        return Boolean(s.occupationSlug);
      case 4:
        return true; // distribuição livre — passa sempre
      case 5:
        return s.luck !== null && s.luck > 0;
      case 6:
        return true; // equipamento opcional
      case 7:
        return true; // backstory opcional
      default:
        return true;
    }
  });

  if (step === 8) {
    return (
      <div className="flex justify-start">
        <button
          onClick={prev}
          className="flex items-center gap-1.5 rounded-lg border border-brand-border px-4 py-2 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Anterior
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-between gap-2">
      <button
        onClick={prev}
        disabled={step === 1}
        className="flex items-center gap-1.5 rounded-lg border border-brand-border px-4 py-2 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Anterior
      </button>
      <button
        onClick={next}
        disabled={!canProceed}
        className="flex items-center gap-1.5 rounded-lg bg-purple-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-500/80 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Próximo
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
