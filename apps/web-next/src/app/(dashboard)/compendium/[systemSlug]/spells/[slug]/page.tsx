"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getSpell, getSystem } from "@/lib/srd";
import { SrdAttributionFooter } from "@/components/compendium/srd-attribution-footer";

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

export default function SpellDetailPage({
  params,
}: {
  params: Promise<{ systemSlug: string; slug: string }>;
}) {
  const { systemSlug, slug } = use(params);
  const system = getSystem(systemSlug);
  const spell = getSpell(systemSlug, slug);
  if (!system || !spell) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href={`/compendium/${systemSlug}/spells`}
        className="inline-flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Magias
      </Link>

      <header>
        <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-brand-accent">
          <Sparkles className="h-3.5 w-3.5" />
          {spell.level === 0 ? "Truque" : `${spell.level}º nível`} ·{" "}
          {SCHOOL_LABELS[spell.school]}
        </div>
        <h1 className="font-cinzel text-3xl font-bold text-white">
          {spell.name}
        </h1>
        <p className="mt-1 text-xs italic text-brand-muted">{spell.nameEn}</p>
      </header>

      <section className="grid gap-3 rounded-xl border border-brand-border bg-white/[0.02] p-5 sm:grid-cols-2">
        <Field label="Tempo de conjuração" value={spell.castingTime} />
        <Field label="Alcance" value={spell.range} />
        <Field label="Componentes" value={spell.components.join(", ")} />
        <Field label="Duração" value={spell.duration} />
        {spell.materialComponent && (
          <Field
            label="Componente material"
            value={spell.materialComponent}
            full
          />
        )}
        {spell.damageDice && (
          <Field
            label="Dano"
            value={`${spell.damageDice} ${spell.damageType ?? ""}`.trim()}
          />
        )}
        {spell.saveAttribute && (
          <Field
            label="Teste de resistência"
            value={spell.saveAttribute.toUpperCase()}
          />
        )}
        {spell.attackType && spell.attackType !== "none" && (
          <Field
            label="Tipo de ataque"
            value={
              spell.attackType === "ranged_spell"
                ? "Ataque mágico à distância"
                : "Ataque mágico corpo a corpo"
            }
          />
        )}
        <div className="sm:col-span-2 flex flex-wrap gap-1.5">
          {spell.ritual && (
            <span className="rounded bg-purple-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-purple-300">
              Ritual
            </span>
          )}
          {spell.concentration && (
            <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-300">
              Concentração
            </span>
          )}
          {spell.classes.map((c) => (
            <span
              key={c}
              className="rounded border border-brand-border bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase text-brand-muted"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-brand-border bg-white/[0.02] p-5">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
          Descrição
        </h2>
        <p className="text-sm leading-relaxed text-brand-text/90">
          {spell.description}
        </p>
        {spell.higherLevels && (
          <>
            <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Em níveis superiores
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-brand-text/80">
              {spell.higherLevels}
            </p>
          </>
        )}
      </section>

      <SrdAttributionFooter attribution={spell.attribution} variant="card" />
    </div>
  );
}

function Field({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-brand-text">{value}</p>
    </div>
  );
}
