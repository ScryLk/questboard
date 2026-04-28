"use client";

// Wizard de criação de personagem D&D 5e (10 passos). Estado vive em
// `useDnd5eWizardStore` (não persiste — abandono reinicia). No passo
// 10 confirma e converte pra `CampaignCharacter` via `useCharacterStore`.

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useDnd5eWizardStore } from "@/lib/dnd5e-wizard-store";
import { WizardProgress } from "@/components/character-wizard/wizard-progress";
import { WizardFooter } from "@/components/character-wizard/wizard-footer";
import { Step1System } from "@/components/character-wizard/step-1-system";
import { Step2Race } from "@/components/character-wizard/step-2-race";
import { Step3Class } from "@/components/character-wizard/step-3-class";
import { Step4Background } from "@/components/character-wizard/step-4-background";
import { Step5Attributes } from "@/components/character-wizard/step-5-attributes";
import { Step6Skills } from "@/components/character-wizard/step-6-skills";
import { Step7Equipment } from "@/components/character-wizard/step-7-equipment";
import { Step8Spells } from "@/components/character-wizard/step-8-spells";
import { Step9Details } from "@/components/character-wizard/step-9-details";
import { Step10Review } from "@/components/character-wizard/step-10-review";

export default function Dnd5eCharacterWizardPage() {
  const router = useRouter();
  const step = useDnd5eWizardStore((s) => s.step);
  const reset = useDnd5eWizardStore((s) => s.reset);

  // Reseta ao montar — wizard sempre começa do zero ao entrar.
  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-20">
      <Link
        href="/characters"
        className="inline-flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Personagens
      </Link>

      <header>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
          Novo personagem · D&amp;D 5e
        </p>
        <h1 className="mt-1 font-cinzel text-2xl font-bold text-white">
          Crie seu personagem em 10 passos
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          O motor calcula CA, modificadores, perícias, slots de magia e
          ataques automaticamente conforme você avança.
        </p>
      </header>

      <WizardProgress />

      <div className="rounded-xl border border-brand-border bg-white/[0.02] p-5">
        {step === 1 && <Step1System />}
        {step === 2 && <Step2Race />}
        {step === 3 && <Step3Class />}
        {step === 4 && <Step4Background />}
        {step === 5 && <Step5Attributes />}
        {step === 6 && <Step6Skills />}
        {step === 7 && <Step7Equipment />}
        {step === 8 && <Step8Spells />}
        {step === 9 && <Step9Details />}
        {step === 10 && <Step10Review onFinish={() => router.push("/characters")} />}
      </div>

      <WizardFooter />
    </div>
  );
}
