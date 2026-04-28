"use client";

import Link from "next/link";
import { ExternalLink, Sparkles } from "lucide-react";
import type { Dnd5eSheetContext } from "@/hooks/use-dnd5e-derived";
import { listSpells } from "@/lib/srd";

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

function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

interface Props {
  ctx: Dnd5eSheetContext;
}

export function TabMagias({ ctx }: Props) {
  const allSpells = listSpells("dnd5e");

  const cantrips = ctx.data.spells.cantrips
    .map((slug) => allSpells.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const firstLevel = ctx.data.spells.firstLevel
    .map((slug) => allSpells.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div className="space-y-5">
      {/* Atributo + CD + Bônus de ataque */}
      <section>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
          Conjuração
        </h2>
        <div className="grid grid-cols-3 gap-3 rounded-lg border border-brand-border bg-white/[0.02] p-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-brand-muted">
              Atributo
            </p>
            <p className="mt-1 text-lg font-bold text-brand-text">
              {ctx.spellcastingAbility?.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-brand-muted">
              CD da magia
            </p>
            <p className="mt-1 text-lg font-bold text-brand-accent">
              {ctx.derived.spellSaveDc}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-brand-muted">
              Bônus de ataque
            </p>
            <p className="mt-1 text-lg font-bold text-brand-accent">
              {fmtMod(ctx.derived.spellAttackBonus ?? 0)}
            </p>
          </div>
        </div>
      </section>

      {/* Slots */}
      <section>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
          Slots de Magia
        </h2>
        {Object.keys(ctx.derived.spellSlots).length === 0 ? (
          <p className="text-[11px] italic text-brand-muted">
            Sem slots no nível atual.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-5">
            {Object.entries(ctx.derived.spellSlots).map(([level, total]) => {
              const used = ctx.data.spellSlotsExpended[level] ?? 0;
              const remaining = (total ?? 0) - used;
              return (
                <div
                  key={level}
                  className="rounded-md border border-brand-border bg-white/[0.02] p-3 text-center"
                >
                  <p className="text-[10px] uppercase tracking-wider text-brand-muted">
                    Nível {level}
                  </p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-brand-text">
                    {remaining}
                    <span className="ml-1 text-xs font-normal text-brand-muted">
                      / {total}
                    </span>
                  </p>
                  <div className="mt-2 flex justify-center gap-0.5">
                    {Array.from({ length: total ?? 0 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i < remaining
                            ? "bg-brand-accent"
                            : "bg-white/[0.06]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Truques */}
      {cantrips.length > 0 && (
        <section>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
            Truques ({cantrips.length})
          </h2>
          <div className="grid gap-2 md:grid-cols-2">
            {cantrips.map((sp) => (
              <SpellCard key={sp.slug} spell={sp} />
            ))}
          </div>
        </section>
      )}

      {/* Magias 1º nível */}
      {firstLevel.length > 0 && (
        <section>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
            Magias de 1º nível ({firstLevel.length})
          </h2>
          <div className="grid gap-2 md:grid-cols-2">
            {firstLevel.map((sp) => (
              <SpellCard key={sp.slug} spell={sp} />
            ))}
          </div>
        </section>
      )}

      {cantrips.length === 0 && firstLevel.length === 0 && (
        <p className="text-[11px] italic text-brand-muted">
          Sem magias selecionadas. Volte ao wizard ou edite o personagem.
        </p>
      )}
    </div>
  );
}

function SpellCard({
  spell,
}: {
  spell: ReturnType<typeof listSpells>[number];
}) {
  return (
    <Link
      href={`/compendium/dnd5e/spells/${spell.slug}`}
      className="group flex items-start gap-2 rounded-md border border-brand-border bg-white/[0.02] p-3 transition-colors hover:border-brand-accent/40"
    >
      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-400" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="truncate text-sm font-medium text-brand-text">
            {spell.name}
          </p>
          {spell.concentration && (
            <span className="rounded bg-amber-500/15 px-1 py-0.5 text-[9px] font-semibold uppercase text-amber-300">
              C
            </span>
          )}
        </div>
        <p className="text-[10px] text-brand-muted">
          {SCHOOL_LABELS[spell.school]} · {spell.castingTime} ·{" "}
          {spell.range}
        </p>
        {spell.damageDice && (
          <p className="text-[10px] text-amber-300">
            {spell.damageDice} {spell.damageType}
          </p>
        )}
      </div>
      <ExternalLink className="h-3 w-3 shrink-0 text-brand-muted opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}
