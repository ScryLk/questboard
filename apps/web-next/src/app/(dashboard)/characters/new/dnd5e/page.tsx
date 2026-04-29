"use client";

// Wizard de criação de personagem D&D 5e (10 passos). Estado vive em
// `useDnd5eWizardStore` (não persiste — abandono reinicia). No passo
// 10 confirma e converte pra `CampaignCharacter` via `useCharacterStore`.
// Modo edição: `?edit=ID` hidrata o store com os dados existentes e o
// submit atualiza em vez de criar.

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCharacterStore } from "@/stores/characterStore";
import { useDnd5eWizardStore } from "@/lib/dnd5e-wizard-store";
import { listRaces } from "@/lib/srd";
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
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const returnTo = searchParams.get("returnTo");
  const campaignIdOverride = searchParams.get("campaignId") ?? undefined;
  const step = useDnd5eWizardStore((s) => s.step);
  const editingCharacterId = useDnd5eWizardStore((s) => s.editingCharacterId);
  const reset = useDnd5eWizardStore((s) => s.reset);
  const hydrateFromCharacter = useDnd5eWizardStore(
    (s) => s.hydrateFromCharacter,
  );
  const characters = useCharacterStore((s) => s.characters);

  // Reseta ao montar — exceto quando estiver no modo "Editar 5e", aí
  // hidrata com os dados do personagem.
  useEffect(() => {
    if (editId) {
      const character = characters.find((c) => c.id === editId);
      if (character?.dnd5eData) {
        // Subtrai bônus de raça pra mostrar o "base score" no point
        // buy. Como o dnd5eData guarda atributos finais, recalcula a
        // base subtraindo os bônus de raça.
        const race = listRaces("dnd5e").find(
          (r) => r.slug === character.dnd5eData!.raceSlug,
        );
        const finalAttrs = character.dnd5eData.attributes;
        const baseAttrs = (Object.keys(finalAttrs) as Array<keyof typeof finalAttrs>).reduce(
          (acc, ab) => {
            acc[ab] = finalAttrs[ab] - (race?.abilityBonuses[ab] ?? 0);
            return acc;
          },
          {} as typeof finalAttrs,
        );
        hydrateFromCharacter(editId, {
          name: character.name,
          classSlug: character.dnd5eData.classSlug,
          raceSlug: character.dnd5eData.raceSlug,
          background: character.dnd5eData.background,
          alignment: character.dnd5eData.alignment,
          attributes: baseAttrs,
          skillProficiencies: character.dnd5eData.skillProficiencies,
          equipment: character.dnd5eData.equipment.map((e) => e.itemSlug),
          cantrips: character.dnd5eData.spells.cantrips,
          firstLevelSpells: character.dnd5eData.spells.firstLevel,
          personalityTraits: character.dnd5eData.personalityTraits,
          ideals: character.dnd5eData.ideals,
          bonds: character.dnd5eData.bonds,
          flaws: character.dnd5eData.flaws,
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
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
          {isEditing ? "Editar personagem" : "Novo personagem"} · D&amp;D 5e
        </p>
        <h1 className="mt-1 font-cinzel text-2xl font-bold text-white">
          {isEditing
            ? "Ajuste o que precisar"
            : "Crie seu personagem em 10 passos"}
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          {isEditing
            ? "Pulamos pra revisão. Volte pelas pílulas pra editar qualquer passo. O motor recalcula tudo automaticamente."
            : "O motor calcula CA, modificadores, perícias, slots de magia e ataques automaticamente conforme você avança."}
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
        {step === 10 && (
          <Step10Review
            campaignIdOverride={campaignIdOverride}
            onFinish={(newId) => {
              if (returnTo) {
                const sep = returnTo.includes("?") ? "&" : "?";
                router.push(
                  newId ? `${returnTo}${sep}createdId=${newId}` : returnTo,
                );
              } else {
                router.push("/characters");
              }
            }}
          />
        )}
      </div>

      <WizardFooter />
    </div>
  );
}
