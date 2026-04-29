"use client";

// Step 10 — Revisão. Roda `deriveDnd5eCharacter` ao vivo pra mostrar
// CA, mods, perícias, ataques e slots já calculados. Confirma criando
// `CampaignCharacter` no characterStore canônico.

import { Check, Crown, Save } from "lucide-react";
import { dnd5e } from "@questboard/game-engine";
import {
  createDefaultCharacter,
  useCharacterStore,
} from "@/stores/characterStore";
import {
  useDnd5eWizardStore,
  type AbilityKey,
} from "@/lib/dnd5e-wizard-store";
import { listClasses, listItems, listRaces } from "@/lib/srd";
import { useCampaignStore } from "@/lib/campaign-store";
import { useGameplayStore } from "@/lib/gameplay-store";

const ABILITIES: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];
const ABILITY_LABEL: Record<AbilityKey, string> = {
  str: "FOR",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",
};

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

function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

interface Props {
  onFinish: (newCharacterId?: string) => void;
  /** Sobrescreve o `createdByCampaignId` do personagem criado. Usado
   *  pelo player view pra escopar o aventureiro à sessão (`play:CODE`)
   *  sem depender da campanha ativa do dashboard. */
  campaignIdOverride?: string;
}

export function Step10Review({ onFinish, campaignIdOverride }: Props) {
  const wizard = useDnd5eWizardStore();
  const createCharacter = useCharacterStore((s) => s.createCharacter);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const addToast = useGameplayStore((s) => s.addToast);
  const reset = useDnd5eWizardStore((s) => s.reset);
  const isEditing = Boolean(wizard.editingCharacterId);

  const klass = wizard.classSlug
    ? listClasses("dnd5e").find((c) => c.slug === wizard.classSlug)
    : null;
  const race = wizard.raceSlug
    ? listRaces("dnd5e").find((r) => r.slug === wizard.raceSlug)
    : null;

  // Calcula atributos finais (base + bônus de raça)
  const finalAttrs: Record<AbilityKey, number> = ABILITIES.reduce(
    (acc, ab) => {
      acc[ab] = wizard.attributes[ab] + (race?.abilityBonuses[ab] ?? 0);
      return acc;
    },
    {} as Record<AbilityKey, number>,
  );

  // Engine: deriva ficha calculada
  const equippedItems = listItems("dnd5e").filter((i) =>
    wizard.equipment.includes(i.slug),
  );
  const equippedArmor = equippedItems.find(
    (i) => i.category === "armor" && i.armorClass && !i.subcategory?.includes("SHIELD"),
  );
  const equippedShield = equippedItems.find(
    (i) => i.subcategory === "SHIELD" && i.armorClass,
  );
  const equippedWeapons = equippedItems.filter((i) => i.category === "weapon");

  const derived = klass
    ? dnd5e.deriveDnd5eCharacter({
        level: 1,
        classSlug: klass.slug,
        attributes: finalAttrs,
        hpMax: klass.hitDie + dnd5e.abilityModifier(finalAttrs.con),
        speed: race?.speed ?? 30,
        skillProficiencies: wizard.skillProficiencies,
        expertiseSkills: [],
        savingThrowProficiencies: klass.savingThrowProficiencies as AbilityKey[],
        equippedArmor: equippedArmor
          ? {
              name: equippedArmor.name,
              armorClass: equippedArmor.armorClass!,
            }
          : null,
        equippedShield: equippedShield
          ? { name: equippedShield.name, bonus: equippedShield.armorClass!.base }
          : null,
        equippedWeapons: equippedWeapons.map((w) => ({
          weapon: {
            name: w.name,
            damageDice: w.damageDice ?? "1d4",
            damageType: w.damageType ?? "bludgeoning",
            subcategory: w.subcategory,
            weaponProperties: w.weaponProperties ?? [],
            weaponRange: w.weaponRange,
          },
          // No MVP assume proficiência total — refinamento (proficient
          // only se class.weaponProficiencies cobre) fica pra ficha viva.
          proficient: true,
        })),
      })
    : null;

  function handleCreate() {
    if (!klass || !race || !wizard.name.trim()) return;

    const hpMax = derived?.hitPointsMax ?? klass.hitDie;

    const dnd5eData = {
      level: 1,
      classSlug: klass.slug,
      raceSlug: race.slug,
      background: wizard.background ?? "acolyte",
      alignment: wizard.alignment || undefined,
      attributes: finalAttrs,
      hpCurrent: hpMax,
      hpTemp: 0,
      hitDiceUsed: 0,
      skillProficiencies: wizard.skillProficiencies,
      expertiseSkills: [] as string[],
      savingThrowProficiencies:
        klass.savingThrowProficiencies as Array<"str" | "dex" | "con" | "int" | "wis" | "cha">,
      equipment: wizard.equipment.map((slug) => ({
        itemSlug: slug,
        equipped: true,
        quantity: 1,
      })),
      spells: {
        cantrips: wizard.cantrips,
        firstLevel: wizard.firstLevelSpells,
      },
      spellSlotsExpended: {},
      deathSavesSuccesses: 0,
      deathSavesFailures: 0,
      personalityTraits: wizard.personalityTraits || undefined,
      ideals: wizard.ideals || undefined,
      bonds: wizard.bonds || undefined,
      flaws: wizard.flaws || undefined,
    };

    if (isEditing && wizard.editingCharacterId) {
      // Modo edit: preserva HP atual e nível existentes; só atualiza
      // o que o wizard controla. Se class/race mudou, recalcula HP max.
      const existing = useCharacterStore
        .getState()
        .characters.find((c) => c.id === wizard.editingCharacterId);
      if (existing?.dnd5eData) {
        const preservedLevel = existing.dnd5eData.level;
        const preservedHpCurrent = existing.stats.hp;
        const preservedHpMax = existing.stats.maxHp;
        const preservedSlotsExpended = existing.dnd5eData.spellSlotsExpended;
        const preservedHpTemp = existing.dnd5eData.hpTemp;

        updateCharacter(wizard.editingCharacterId, {
          name: wizard.name.trim(),
          title: `${race.name} ${klass.name} Nv. ${preservedLevel}`,
          description: [wizard.personalityTraits, wizard.ideals, wizard.bonds]
            .filter(Boolean)
            .join("\n\n"),
          stats: {
            ...existing.stats,
            ac: derived?.armorClass.total ?? existing.stats.ac,
            speed: race.speed * 5,
            str: finalAttrs.str,
            dex: finalAttrs.dex,
            con: finalAttrs.con,
            int: finalAttrs.int,
            wis: finalAttrs.wis,
            cha: finalAttrs.cha,
            savingThrows: klass.savingThrowProficiencies,
            skills: wizard.skillProficiencies,
          },
          dnd5eData: {
            ...dnd5eData,
            level: preservedLevel,
            hpCurrent: preservedHpCurrent,
            hpTemp: preservedHpTemp,
            spellSlotsExpended: preservedSlotsExpended,
          },
        });
        // Apenas atualiza maxHp se classe ou con mudou (recalcula).
        // Já está dentro de stats acima — pular extra-update.
        void preservedHpMax;
        addToast(`${wizard.name.trim()} atualizado.`);
        reset();
        onFinish(wizard.editingCharacterId);
        return;
      }
    }

    const newChar = createDefaultCharacter({
      name: wizard.name.trim(),
      title: `${race.name} ${klass.name} Nv. 1`,
      description: [wizard.personalityTraits, wizard.ideals, wizard.bonds]
        .filter(Boolean)
        .join("\n\n"),
      category: "npc", // PCs ficam como categoria genérica até ter um tipo "pc"
      role: "ally",
      stats: {
        hp: hpMax,
        maxHp: hpMax,
        ac: derived?.armorClass.total ?? 10,
        speed: race.speed * 5, // m → ft (1.5m = 5ft, mas race.speed já vem em m, multiplicar simples)
        str: finalAttrs.str,
        dex: finalAttrs.dex,
        con: finalAttrs.con,
        int: finalAttrs.int,
        wis: finalAttrs.wis,
        cha: finalAttrs.cha,
        savingThrows: klass.savingThrowProficiencies,
        skills: wizard.skillProficiencies,
      },
      createdByCampaignId: campaignIdOverride ?? activeCampaignId ?? undefined,
      dnd5eData: {
        level: 1,
        classSlug: klass.slug,
        raceSlug: race.slug,
        background: wizard.background ?? "acolyte",
        alignment: wizard.alignment || undefined,
        attributes: finalAttrs,
        hpCurrent: hpMax,
        hpTemp: 0,
        hitDiceUsed: 0,
        skillProficiencies: wizard.skillProficiencies,
        expertiseSkills: [],
        savingThrowProficiencies:
          klass.savingThrowProficiencies as Array<"str" | "dex" | "con" | "int" | "wis" | "cha">,
        equipment: wizard.equipment.map((slug) => ({
          itemSlug: slug,
          equipped: true,
          quantity: 1,
        })),
        spells: {
          cantrips: wizard.cantrips,
          firstLevel: wizard.firstLevelSpells,
        },
        spellSlotsExpended: {},
        deathSavesSuccesses: 0,
        deathSavesFailures: 0,
        personalityTraits: wizard.personalityTraits || undefined,
        ideals: wizard.ideals || undefined,
        bonds: wizard.bonds || undefined,
        flaws: wizard.flaws || undefined,
      },
    });
    createCharacter(newChar);
    addToast(`${newChar.name} criado.`);
    reset();
    onFinish(newChar.id);
  }

  if (!klass || !race) {
    return (
      <p className="text-sm text-brand-warning">
        Faltam escolhas básicas (raça/classe) — volte e complete.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-brand-text">
          Revisão e confirmação
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Tudo o que o motor calculou ao vivo. Hover em cada campo
          mostraria o breakdown — implementado quando essa ficha entra
          em modo &ldquo;ficha viva&rdquo;.
        </p>
      </div>

      {/* Identidade */}
      <section className="rounded-lg border border-brand-border bg-white/[0.02] p-4">
        <h3 className="font-cinzel text-base font-semibold text-brand-text">
          {wizard.name || "(sem nome)"}
        </h3>
        <p className="text-xs text-brand-muted">
          {race.name} · {klass.name} Nv. 1
          {wizard.alignment && ` · ${wizard.alignment}`}
        </p>
      </section>

      {/* Stats principais */}
      <section className="grid grid-cols-3 gap-3 rounded-lg border border-brand-border bg-white/[0.02] p-4">
        <Stat
          label="CA"
          value={derived?.armorClass.total.toString() ?? "10"}
          hint={derived?.armorClass.breakdown[0]?.source}
        />
        <Stat
          label="HP"
          value={derived?.hitPointsMax.toString() ?? "—"}
          hint={`d${klass.hitDie} + Con`}
        />
        <Stat
          label="Iniciativa"
          value={fmtMod(derived?.initiative ?? 0)}
        />
        <Stat
          label="Velocidade"
          value={`${race.speed}m`}
        />
        <Stat
          label="Prof. bonus"
          value={fmtMod(derived?.proficiencyBonus ?? 2)}
        />
        <Stat
          label="Percepção passiva"
          value={(derived?.passivePerception ?? 10).toString()}
        />
      </section>

      {/* Atributos */}
      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
          Atributos
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {ABILITIES.map((ab) => {
            const score = finalAttrs[ab];
            const mod = derived?.abilityModifiers[ab] ?? 0;
            return (
              <div
                key={ab}
                className="rounded-md border border-brand-border bg-white/[0.02] p-2 text-center"
              >
                <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-muted">
                  {ABILITY_LABEL[ab]}
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums text-brand-text">
                  {score}
                </p>
                <p className="text-[10px] tabular-nums text-brand-accent">
                  {fmtMod(mod)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Saving throws */}
      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
          Testes de resistência
        </h3>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {derived?.savingThrows.map((st) => (
            <div
              key={st.ability}
              className={`rounded-md border px-2 py-1.5 text-center ${
                st.proficient
                  ? "border-brand-accent/40 bg-brand-accent/10"
                  : "border-brand-border bg-white/[0.02]"
              }`}
            >
              <p className="text-[9px] uppercase tracking-wider text-brand-muted">
                {ABILITY_LABEL[st.ability]}
              </p>
              <p className="text-sm font-bold tabular-nums text-brand-text">
                {fmtMod(st.modifier)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Perícias proficientes */}
      {wizard.skillProficiencies.length > 0 && (
        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
            Perícias com proficiência
          </h3>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {derived?.skills
              .filter((s) => s.proficient)
              .map((s) => (
                <div
                  key={s.skill}
                  className="flex items-center justify-between rounded-md border border-brand-border bg-white/[0.02] px-2 py-1 text-xs"
                >
                  <span className="truncate text-brand-text">
                    {SKILL_LABELS[s.skill] ?? s.skill}
                  </span>
                  <span className="tabular-nums text-brand-accent">
                    {fmtMod(s.modifier)}
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Ataques (se há armas) */}
      {derived?.attacks && derived.attacks.length > 0 && (
        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
            Ataques
          </h3>
          <div className="grid gap-1.5">
            {derived.attacks.map((a) => (
              <div
                key={a.source}
                className="flex items-center gap-2 rounded-md border border-brand-border bg-white/[0.02] px-3 py-2 text-xs"
              >
                <span className="flex-1 font-medium text-brand-text">
                  {a.name}
                </span>
                <span className="tabular-nums text-brand-accent">
                  {fmtMod(a.bonus)} ataque
                </span>
                <span className="tabular-nums text-brand-muted">
                  {a.notation} {a.damageType}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Magia (se conjurador) */}
      {derived?.spellcastingAbility && (
        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
            Conjuração
          </h3>
          <div className="grid grid-cols-3 gap-2 rounded-md border border-brand-border bg-white/[0.02] p-3 text-xs">
            <div>
              <p className="text-[9px] uppercase text-brand-muted">Atrib.</p>
              <p className="text-sm font-bold text-brand-text">
                {derived.spellcastingAbility.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-brand-muted">CD</p>
              <p className="text-sm font-bold text-brand-text">
                {derived.spellSaveDc ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-brand-muted">Bônus de ataque</p>
              <p className="text-sm font-bold text-brand-text">
                {fmtMod(derived.spellAttackBonus ?? 0)}
              </p>
            </div>
            <div className="col-span-3">
              <p className="text-[9px] uppercase text-brand-muted">Slots</p>
              <p className="text-sm font-bold text-brand-text">
                {Object.entries(derived.spellSlots)
                  .map(([lv, count]) => `${count}× nv${lv}`)
                  .join(" · ") || "Nenhum no nível 1"}
              </p>
            </div>
            {wizard.cantrips.length + wizard.firstLevelSpells.length > 0 && (
              <div className="col-span-3">
                <p className="text-[9px] uppercase text-brand-muted">
                  Magias selecionadas
                </p>
                <p className="text-xs text-brand-text">
                  {wizard.cantrips.length} truques ·{" "}
                  {wizard.firstLevelSpells.length} de 1º nível
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {!activeCampaignId && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-300">
          <Crown className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Sem campanha ativa — o personagem será criado, mas não vai aparecer
            na lista filtrada de uma campanha. Selecione uma campanha antes
            pra fazer ele entrar direto.
          </span>
        </div>
      )}

      <div className="flex justify-end border-t border-brand-border pt-4">
        <button
          onClick={handleCreate}
          disabled={!wizard.name.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-accent/80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Save className="h-4 w-4" />
          {isEditing ? "Salvar alterações" : "Criar personagem"}
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
        {label}
      </p>
      <p className="mt-0.5 text-base font-bold tabular-nums text-brand-text">
        {value}
      </p>
      {hint && (
        <p className="text-[9px] text-brand-muted/70" title={hint}>
          {hint}
        </p>
      )}
    </div>
  );
}
