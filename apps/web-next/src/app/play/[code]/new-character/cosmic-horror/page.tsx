"use client";

// Wizard cosmic-horror dentro do player view (sem chrome do dashboard).
// Reusa as mesmas step components da rota /(dashboard); a única
// diferença é o cabeçalho, o link de voltar e o destino do submit:
// volta pra `/play/CODE` com `?createdId=ID` pra o JoinScreen
// auto-selecionar o personagem recém-criado.

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCosmicHorrorWizardStore } from "@/lib/cosmic-horror-wizard-store";
import { CosmicHorrorWizardProgress } from "@/components/cosmic-horror-wizard/wizard-progress";
import { CosmicHorrorWizardFooter } from "@/components/cosmic-horror-wizard/wizard-footer";
import { Step1Identity } from "@/components/cosmic-horror-wizard/step-1-identity";
import { Step2Attributes } from "@/components/cosmic-horror-wizard/step-2-attributes";
import { Step3Occupation } from "@/components/cosmic-horror-wizard/step-3-occupation";
import { Step4Skills } from "@/components/cosmic-horror-wizard/step-4-skills";
import { Step5SanityLuck } from "@/components/cosmic-horror-wizard/step-5-sanity-luck";
import { Step6Equipment } from "@/components/cosmic-horror-wizard/step-6-equipment";
import { Step7Backstory } from "@/components/cosmic-horror-wizard/step-7-backstory";
import { Step8Review } from "@/components/cosmic-horror-wizard/step-8-review";

export default function PlayerCosmicHorrorWizardPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string)?.toUpperCase() ?? "";
  const playCampaignId = `play:${code}`;
  const returnTo = `/play/${code}`;

  const step = useCosmicHorrorWizardStore((s) => s.step);
  const reset = useCosmicHorrorWizardStore((s) => s.reset);

  // Reseta o wizard ao montar — jogador vem do JoinScreen do zero.
  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <div className="mx-auto max-w-3xl space-y-5 overflow-y-auto p-5 pb-20 h-dvh">
      <Link
        href={returnTo}
        className="inline-flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar pra mesa
      </Link>

      <header>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-300">
          Novo investigador · Sessão {code}
        </p>
        <h1 className="mt-1 font-cinzel text-2xl font-bold text-white">
          Crie seu investigador em 8 passos
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          O motor d100 calcula HP, MP, Sanidade máxima, bônus de dano e
          movimento conforme você define os atributos.
        </p>
      </header>

      <CosmicHorrorWizardProgress />

      <div className="rounded-xl border border-brand-border bg-white/[0.02] p-5">
        {step === 1 && <Step1Identity />}
        {step === 2 && <Step2Attributes />}
        {step === 3 && <Step3Occupation />}
        {step === 4 && <Step4Skills />}
        {step === 5 && <Step5SanityLuck />}
        {step === 6 && <Step6Equipment />}
        {step === 7 && <Step7Backstory />}
        {step === 8 && (
          <Step8Review
            campaignIdOverride={playCampaignId}
            onFinish={(newId) => {
              const dest = newId
                ? `${returnTo}?createdId=${newId}`
                : returnTo;
              router.push(dest);
            }}
          />
        )}
      </div>

      <CosmicHorrorWizardFooter />
    </div>
  );
}
