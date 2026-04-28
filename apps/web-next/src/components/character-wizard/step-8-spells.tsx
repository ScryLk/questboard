"use client";

// Step 8 — Magias.
//
// Só aparece pra classes conjuradoras (`spellcastingAbility != null`).
// Quantidade de truques + magias preparadas/conhecidas no nível 1 vem
// de tabelas do PHB. MVP usa números aproximados:
// - cantrips: 2-4 dependendo da classe
// - magias 1º nível: 2-6 conhecidas
//
// Lista de magias filtrada por classe (campo `classes` em SrdSpell).

import { Check, Sparkles } from "lucide-react";
import { useDnd5eWizardStore } from "@/lib/dnd5e-wizard-store";
import { listClasses, listSpells } from "@/lib/srd";

const CANTRIPS_BY_CLASS: Record<string, number> = {
  bard: 2,
  cleric: 3,
  druid: 2,
  sorcerer: 4,
  warlock: 2,
  wizard: 3,
};

const SPELLS_KNOWN_BY_CLASS: Record<string, number> = {
  bard: 4,
  cleric: 2, // prepared (proxy: WIS mod + level, default 2)
  druid: 2,
  sorcerer: 2,
  warlock: 2,
  wizard: 6, // grimório inicial
};

const SCHOOL_LABELS: Record<string, string> = {
  abjuration: "Abjuração",
  conjuration: "Conjuração",
  divination: "Adivinhação",
  enchantment: "Encantamento",
  evocation: "Evocação",
  illusion: "Ilusão",
  necromancy: "Necromancia",
  transmutation: "Transmutação",
};

export function Step8Spells() {
  const classSlug = useDnd5eWizardStore((s) => s.classSlug);
  const cantrips = useDnd5eWizardStore((s) => s.cantrips);
  const firstLevelSpells = useDnd5eWizardStore((s) => s.firstLevelSpells);
  const toggleCantrip = useDnd5eWizardStore((s) => s.toggleCantrip);
  const toggleFirst = useDnd5eWizardStore((s) => s.toggleFirstLevelSpell);

  const klass = classSlug
    ? listClasses("dnd5e").find((c) => c.slug === classSlug)
    : null;

  if (!klass) {
    return (
      <p className="text-sm text-brand-warning">
        Sem classe selecionada — volte ao passo 3.
      </p>
    );
  }

  if (!klass.spellcastingAbility) {
    return (
      <div className="space-y-3">
        <h2 className="font-cinzel text-lg font-semibold text-brand-text">
          Magias
        </h2>
        <p className="text-sm text-brand-muted">
          {klass.name} não conjura magias no nível 1. Pode pular esse passo.
        </p>
      </div>
    );
  }

  const cantripsMax = CANTRIPS_BY_CLASS[klass.slug] ?? 0;
  const firstMax = SPELLS_KNOWN_BY_CLASS[klass.slug] ?? 0;

  const spells = listSpells("dnd5e").filter((s) =>
    s.classes.includes(klass.slug),
  );
  const cantripList = spells.filter((s) => s.level === 0);
  const firstLevelList = spells.filter((s) => s.level === 1);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-brand-text">
          Magias iniciais
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Atributo de conjuração:{" "}
          <span className="font-semibold text-brand-text">
            {klass.spellcastingAbility.toUpperCase()}
          </span>
          . Truques são lançados sem custo de slot; magias de 1º nível
          consomem espaço.
        </p>
      </div>

      {/* Truques */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
            Truques (nível 0)
          </h3>
          <span
            className={`text-[11px] font-bold tabular-nums ${
              cantrips.length === cantripsMax
                ? "text-brand-accent"
                : "text-brand-muted"
            }`}
          >
            {cantrips.length} / {cantripsMax}
          </span>
        </div>
        {cantripList.length === 0 ? (
          <p className="text-[11px] italic text-brand-muted">
            Nenhum truque disponível no seed.
          </p>
        ) : (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {cantripList.map((sp) => {
              const selected = cantrips.includes(sp.slug);
              const disabled = !selected && cantrips.length === cantripsMax;
              return (
                <button
                  key={sp.slug}
                  onClick={() => toggleCantrip(sp.slug, cantripsMax)}
                  disabled={disabled}
                  className={`flex items-start gap-2 rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                    selected
                      ? "border-brand-accent bg-brand-accent/10"
                      : disabled
                        ? "cursor-not-allowed border-brand-border/40 text-brand-muted/40"
                        : "border-brand-border hover:border-brand-accent/40"
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      selected
                        ? "border-brand-accent bg-brand-accent"
                        : "border-brand-border"
                    }`}
                  >
                    {selected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-brand-text">
                      {sp.name}
                    </p>
                    <p className="truncate text-[10px] text-brand-muted">
                      {SCHOOL_LABELS[sp.school]} · {sp.castingTime}
                    </p>
                  </div>
                  {sp.damageType && (
                    <Sparkles className="h-3 w-3 shrink-0 text-amber-400/80" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Magias 1º nível */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
            Magias de 1º nível
          </h3>
          <span
            className={`text-[11px] font-bold tabular-nums ${
              firstLevelSpells.length === firstMax
                ? "text-brand-accent"
                : "text-brand-muted"
            }`}
          >
            {firstLevelSpells.length} / {firstMax}
          </span>
        </div>
        {firstLevelList.length === 0 ? (
          <p className="text-[11px] italic text-brand-muted">
            Nenhuma magia de 1º nível disponível pra essa classe no seed.
          </p>
        ) : (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {firstLevelList.map((sp) => {
              const selected = firstLevelSpells.includes(sp.slug);
              const disabled =
                !selected && firstLevelSpells.length === firstMax;
              return (
                <button
                  key={sp.slug}
                  onClick={() => toggleFirst(sp.slug, firstMax)}
                  disabled={disabled}
                  className={`flex items-start gap-2 rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                    selected
                      ? "border-brand-accent bg-brand-accent/10"
                      : disabled
                        ? "cursor-not-allowed border-brand-border/40 text-brand-muted/40"
                        : "border-brand-border hover:border-brand-accent/40"
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      selected
                        ? "border-brand-accent bg-brand-accent"
                        : "border-brand-border"
                    }`}
                  >
                    {selected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-brand-text">
                      {sp.name}
                    </p>
                    <p className="truncate text-[10px] text-brand-muted">
                      {SCHOOL_LABELS[sp.school]} · {sp.castingTime}
                    </p>
                  </div>
                  {sp.concentration && (
                    <span className="rounded bg-amber-500/15 px-1 py-0.5 text-[8px] font-semibold uppercase text-amber-300">
                      C
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// Re-export pra step de revisão consultar limites
export { CANTRIPS_BY_CLASS, SPELLS_KNOWN_BY_CLASS };
