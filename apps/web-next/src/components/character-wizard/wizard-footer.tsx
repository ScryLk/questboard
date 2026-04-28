"use client";

// Rodapé fixo do wizard com Anterior / Próximo. Próximo bloqueia
// quando o passo atual ainda não tem dados suficientes (validação
// inline). Step 10 não tem Próximo — tem o botão "Criar personagem"
// próprio do step.

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useDnd5eWizardStore, totalPointsSpent, POINT_BUY_TOTAL } from "@/lib/dnd5e-wizard-store";

export function WizardFooter() {
  const step = useDnd5eWizardStore((s) => s.step);
  const next = useDnd5eWizardStore((s) => s.next);
  const prev = useDnd5eWizardStore((s) => s.prev);

  const canProceed = useDnd5eWizardStore((s) => {
    switch (s.step) {
      case 1:
        return s.systemSlug === "dnd5e";
      case 2:
        return Boolean(s.raceSlug);
      case 3:
        return Boolean(s.classSlug);
      case 4:
        return Boolean(s.background);
      case 5:
        if (s.statMethod === "point-buy") {
          return totalPointsSpent(s.attributes) <= POINT_BUY_TOTAL;
        }
        return true;
      case 6:
        return true; // Pelo menos validar via UI; passa-se com 0 ao usuário escolher
      case 7:
        return true; // Equipamento opcional
      case 8:
        return true; // Magias opcional pra não-conjuradores
      case 9:
        return s.name.trim().length >= 2;
      default:
        return true;
    }
  });

  if (step === 10) {
    // Step 10 tem botão próprio "Criar personagem". Mantém só o
    // Anterior aqui pra simetria visual.
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
        className="flex items-center gap-1.5 rounded-lg bg-brand-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent/80 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Próximo
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
