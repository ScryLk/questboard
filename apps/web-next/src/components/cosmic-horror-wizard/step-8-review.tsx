"use client";

import { useMemo } from "react";
import { Brain, Check, Clover, Heart, Save, Skull } from "lucide-react";
import { cosmicHorror } from "@questboard/game-engine";
import {
  COSMIC_HORROR_ATTRIBUTE_LABELS,
  COSMIC_HORROR_OCCUPATIONS,
  COSMIC_HORROR_SKILLS,
  SKILL_CATEGORY_LABELS,
} from "@questboard/constants";
import {
  createDefaultCharacter,
  useCharacterStore,
} from "@/stores/characterStore";
import { useCampaignStore } from "@/lib/campaign-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useCosmicHorrorWizardStore } from "@/lib/cosmic-horror-wizard-store";
import type {
  CampaignCharacter,
  CosmicHorrorCharacterPersisted,
} from "@/types/character";

interface Props {
  onFinish: (newCharacterId?: string) => void;
  /** Sobrescreve o `createdByCampaignId` do personagem criado. Usado
   *  pelo player view pra escopar o investigador à sessão (`play:CODE`)
   *  sem depender da campanha ativa do dashboard. */
  campaignIdOverride?: string;
}

function deriveBase(
  skill: (typeof COSMIC_HORROR_SKILLS)[number],
  attrs: Record<string, number>,
): number {
  if (skill.derivesFrom) {
    const v = attrs[skill.derivesFrom.attr] ?? 0;
    return Math.floor(v / skill.derivesFrom.divisor);
  }
  return skill.base;
}

export function Step8Review({ onFinish, campaignIdOverride }: Props) {
  const wizard = useCosmicHorrorWizardStore();
  const reset = useCosmicHorrorWizardStore((s) => s.reset);
  const createCharacter = useCharacterStore((s) => s.createCharacter);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const addToast = useGameplayStore((s) => s.addToast);
  const isEditing = Boolean(wizard.editingCharacterId);

  const occupation = COSMIC_HORROR_OCCUPATIONS.find(
    (o) => o.slug === wizard.occupationSlug,
  );

  // Derived stats
  const hp = cosmicHorror.calculateHitPoints({
    con: wizard.attributes.con,
    tam: wizard.attributes.tam,
  });
  const mp = cosmicHorror.calculateMagicPoints(wizard.attributes.pod);
  const damageBonus = cosmicHorror.calculateDamageBonus({
    for: wizard.attributes.for,
    tam: wizard.attributes.tam,
  });
  const build = cosmicHorror.calculateBuild({
    for: wizard.attributes.for,
    tam: wizard.attributes.tam,
  });
  const moveRate = cosmicHorror.calculateMoveRate({
    attrs: wizard.attributes,
    age: wizard.age,
  });
  const dodge = cosmicHorror.calculateDodgeBase(wizard.attributes.des);
  const sanityMax = wizard.attributes.pod;

  const finalSkills = useMemo(() => {
    const map: Record<string, number> = {};
    for (const skill of COSMIC_HORROR_SKILLS) {
      const base = deriveBase(skill, wizard.attributes);
      map[skill.slug] = wizard.skills[skill.slug] ?? base;
    }
    // Dodge base se não foi treinado, recalcula sempre baseado em DES.
    map["dodge"] = Math.max(map["dodge"] ?? 0, dodge);
    return map;
  }, [wizard.skills, wizard.attributes, dodge]);

  function handleFinish() {
    if (!occupation) {
      addToast({ message: "Selecione uma ocupação primeiro.", level: "error" });
      return;
    }
    if (wizard.luck === null) {
      addToast({
        message: "Role a Sorte antes de criar.",
        level: "error",
      });
      return;
    }

    const persisted: CosmicHorrorCharacterPersisted = {
      occupation: occupation.slug,
      age: wizard.age,
      birthplace: wizard.birthplace || undefined,
      residence: wizard.residence || undefined,
      attributes: { ...wizard.attributes },
      hpCurrent: hp,
      hpMax: hp,
      mpCurrent: mp,
      mpMax: mp,
      luck: wizard.luck,
      sanityCurrent: sanityMax,
      sanityMax,
      sanityStartingMax: sanityMax,
      mythosKnowledge: 0,
      madness: "SANE",
      skills: finalSkills,
      weapons: [...wizard.weapons],
      belongings: [...wizard.belongings],
      creditRating: wizard.creditRating,
      personalDescription: wizard.personalDescription || undefined,
      ideologyBeliefs: wizard.ideologyBeliefs || undefined,
      significantPeople: wizard.significantPeople || undefined,
      meaningfulLocations: wizard.meaningfulLocations || undefined,
      treasuredPossessions: wizard.treasuredPossessions || undefined,
      traits: wizard.traits || undefined,
      injuriesScars: wizard.injuriesScars || undefined,
      phobiasManias: wizard.phobiasManias || undefined,
    };

    if (isEditing && wizard.editingCharacterId) {
      updateCharacter(wizard.editingCharacterId, {
        name: wizard.name,
        description: occupation.description,
        cosmicHorrorData: persisted,
        stats: {
          hp,
          maxHp: hp,
          ac: 10,
          speed: moveRate * 5,
          str: wizard.attributes.for,
          dex: wizard.attributes.des,
          con: wizard.attributes.con,
          int: wizard.attributes.int,
          wis: wizard.attributes.pod,
          cha: wizard.attributes.apa,
        },
      });
      addToast({ message: "Investigador atualizado.", level: "success" });
      reset();
      onFinish(wizard.editingCharacterId);
      return;
    }

    const character: CampaignCharacter = createDefaultCharacter({
      name: wizard.name,
      description: occupation.description,
      category: "npc",
      createdByCampaignId: campaignIdOverride ?? activeCampaignId ?? undefined,
      cosmicHorrorData: persisted,
      stats: {
        hp,
        maxHp: hp,
        ac: 10,
        speed: moveRate * 5,
        str: wizard.attributes.for,
        dex: wizard.attributes.des,
        con: wizard.attributes.con,
        int: wizard.attributes.int,
        wis: wizard.attributes.pod,
        cha: wizard.attributes.apa,
      },
    });
    createCharacter(character);
    addToast({ message: "Investigador criado.", level: "success" });
    reset();
    onFinish(character.id);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-white">
          Revisão
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Stats derivados pelo motor d100 — confira antes de criar.
        </p>
      </div>

      {/* Identidade */}
      <div className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
        <p className="font-cinzel text-lg font-semibold text-white">
          {wizard.name || "(sem nome)"}
        </p>
        <p className="mt-0.5 text-xs text-brand-muted">
          {occupation?.name ?? "(sem ocupação)"} · {wizard.age} anos
          {wizard.residence && ` · ${wizard.residence}`}
        </p>
      </div>

      {/* Derived */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <DerivedCard
          label="Sanidade"
          value={`${sanityMax}/${sanityMax}`}
          icon={<Brain className="h-3.5 w-3.5 text-purple-300" />}
          accent="purple"
        />
        <DerivedCard
          label="HP"
          value={`${hp}/${hp}`}
          icon={<Heart className="h-3.5 w-3.5 text-rose-300" />}
          accent="rose"
        />
        <DerivedCard
          label="MP"
          value={`${mp}/${mp}`}
          icon={<Skull className="h-3.5 w-3.5 text-blue-300" />}
          accent="blue"
        />
        <DerivedCard
          label="Sorte"
          value={`${wizard.luck ?? "?"}`}
          icon={<Clover className="h-3.5 w-3.5 text-emerald-300" />}
          accent="emerald"
        />
        <DerivedCard label="Bônus de Dano" value={damageBonus} />
        <DerivedCard label="Build" value={String(build)} />
        <DerivedCard label="Movimento" value={String(moveRate)} />
        <DerivedCard label="Esquivar" value={String(dodge)} />
      </div>

      {/* Atributos */}
      <div className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
          Atributos
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.entries(wizard.attributes) as Array<[
            keyof typeof wizard.attributes,
            number,
          ]>).map(([key, value]) => {
            const lbl = COSMIC_HORROR_ATTRIBUTE_LABELS[key];
            return (
              <div
                key={key}
                className="rounded-md border border-brand-border bg-brand-primary px-2 py-1.5 text-center"
              >
                <p className="text-[10px] uppercase tracking-wider text-brand-muted">
                  {lbl.short}
                </p>
                <p className="font-syne text-lg font-bold text-brand-text">
                  {value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills (somente as relevantes ≥ 30%) */}
      <div className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
          Skills relevantes (≥ 30%)
        </p>
        <div className="grid gap-1.5 md:grid-cols-2">
          {COSMIC_HORROR_SKILLS.filter(
            (s) => (finalSkills[s.slug] ?? 0) >= 30,
          )
            .sort((a, b) => (finalSkills[b.slug] ?? 0) - (finalSkills[a.slug] ?? 0))
            .map((skill) => (
              <div
                key={skill.slug}
                className="flex items-baseline justify-between rounded px-2 py-1 text-xs hover:bg-white/[0.03]"
              >
                <span className="text-brand-text">
                  {skill.name}
                  <span className="ml-1 text-[9px] text-brand-muted/70">
                    {SKILL_CATEGORY_LABELS[skill.category]}
                  </span>
                </span>
                <span className="font-syne font-semibold text-purple-300">
                  {finalSkills[skill.slug]}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Equipamento */}
      {(wizard.weapons.length > 0 || wizard.belongings.length > 0) && (
        <div className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            Equipamento
          </p>
          {wizard.weapons.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 text-[10px] uppercase text-brand-muted/70">
                Armas
              </p>
              <ul className="space-y-1">
                {wizard.weapons.map((w, i) => (
                  <li key={i} className="text-xs text-brand-text">
                    {w.name} · {w.damage}
                    {w.range && ` · ${w.range}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {wizard.belongings.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] uppercase text-brand-muted/70">
                Posses
              </p>
              <p className="text-xs text-brand-text">
                {wizard.belongings.join(", ")}
              </p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleFinish}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500/85"
      >
        {isEditing ? (
          <>
            <Save className="h-4 w-4" />
            Salvar alterações
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            Criar investigador
          </>
        )}
      </button>
    </div>
  );
}

function DerivedCard({
  label,
  value,
  icon,
  accent = "muted",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  accent?: "purple" | "rose" | "blue" | "emerald" | "muted";
}) {
  const colorMap: Record<string, string> = {
    purple: "text-purple-300",
    rose: "text-rose-300",
    blue: "text-blue-300",
    emerald: "text-emerald-300",
    muted: "text-brand-text",
  };
  return (
    <div className="rounded-lg border border-brand-border bg-white/[0.02] p-3">
      <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-brand-muted">
        {icon}
        {label}
      </div>
      <p className={`font-syne text-xl font-bold ${colorMap[accent]}`}>
        {value}
      </p>
    </div>
  );
}
