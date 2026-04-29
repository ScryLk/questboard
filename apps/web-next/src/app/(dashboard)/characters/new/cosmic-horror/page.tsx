"use client";

// Wizard de criação de personagem Horror Investigativo (8 passos).
// Estado vive em `useCosmicHorrorWizardStore` (não persiste — abandono
// reinicia). No passo 8 confirma e converte pra `CampaignCharacter` via
// `useCharacterStore`. Modo edição: `?edit=ID` hidrata e atualiza.

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCharacterStore } from "@/stores/characterStore";
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

export default function CosmicHorrorWizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const step = useCosmicHorrorWizardStore((s) => s.step);
  const editingCharacterId = useCosmicHorrorWizardStore(
    (s) => s.editingCharacterId,
  );
  const reset = useCosmicHorrorWizardStore((s) => s.reset);
  const hydrateFromCharacter = useCosmicHorrorWizardStore(
    (s) => s.hydrateFromCharacter,
  );
  const characters = useCharacterStore((s) => s.characters);

  useEffect(() => {
    if (editId) {
      const character = characters.find((c) => c.id === editId);
      if (character?.cosmicHorrorData) {
        const d = character.cosmicHorrorData;
        hydrateFromCharacter(editId, {
          name: character.name,
          age: d.age,
          birthplace: d.birthplace,
          residence: d.residence,
          occupation: d.occupation,
          attributes: d.attributes,
          skills: d.skills,
          luck: d.luck,
          weapons: d.weapons,
          belongings: d.belongings,
          creditRating: d.creditRating,
          personalDescription: d.personalDescription,
          ideologyBeliefs: d.ideologyBeliefs,
          significantPeople: d.significantPeople,
          meaningfulLocations: d.meaningfulLocations,
          treasuredPossessions: d.treasuredPossessions,
          traits: d.traits,
          injuriesScars: d.injuriesScars,
          phobiasManias: d.phobiasManias,
        });
        return;
      }
    }
    reset();
  }, [editId, characters, reset, hydrateFromCharacter]);

  const isEditing = Boolean(editingCharacterId);

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
        <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-300">
          {isEditing ? "Editar investigador" : "Novo investigador"} · Horror d100
        </p>
        <h1 className="mt-1 font-cinzel text-2xl font-bold text-white">
          {isEditing
            ? "Ajuste o que precisar"
            : "Crie seu investigador em 8 passos"}
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          {isEditing
            ? "Pulamos pra revisão. Volte pelas pílulas pra editar qualquer passo. O motor recalcula HP, MP, SAN e bônus de dano automaticamente."
            : "O motor d100 calcula HP, MP, Sanidade máxima, bônus de dano e movimento conforme você define os atributos. Sistema próprio, inspirado em obras de Lovecraft em domínio público."}
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
          <Step8Review onFinish={() => router.push("/characters")} />
        )}
      </div>

      <CosmicHorrorWizardFooter />
    </div>
  );
}
