"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Skull } from "lucide-react";
import { getMonster, getSystem } from "@/lib/srd";
import { addMonsterToSession } from "@/lib/srd/monster-to-token";
import { useGameplayStore } from "@/lib/gameplay-store";
import { SrdAttributionFooter } from "@/components/compendium/srd-attribution-footer";

const SIZE_LABELS: Record<string, string> = {
  tiny: "Minúsculo",
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
  huge: "Enorme",
  gargantuan: "Colossal",
};

function formatCr(cr: number): string {
  if (cr === 0.125) return "1/8";
  if (cr === 0.25) return "1/4";
  if (cr === 0.5) return "1/2";
  return String(cr);
}

function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export default function MonsterDetailPage({
  params,
}: {
  params: Promise<{ systemSlug: string; slug: string }>;
}) {
  const { systemSlug, slug } = use(params);
  const system = getSystem(systemSlug);
  const m = getMonster(systemSlug, slug);
  // O hook tem que ser sempre chamado antes do early-return — daí o
  // `?.` no acesso. notFound() pula a render se m for nulo.
  const isGM = useGameplayStore((s) => s.currentUserIsGM);
  if (!system || !m) notFound();

  const speedParts = [
    m.speed.walk && `${m.speed.walk}m`,
    m.speed.fly && `voar ${m.speed.fly}m`,
    m.speed.swim && `nadar ${m.speed.swim}m`,
    m.speed.climb && `escalar ${m.speed.climb}m`,
    m.speed.burrow && `escavar ${m.speed.burrow}m`,
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href={`/compendium/${systemSlug}/monsters`}
        className="inline-flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Monstros
      </Link>

      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-brand-accent">
            <Skull className="h-3.5 w-3.5" />
            {SIZE_LABELS[m.size]} {m.type}
          </div>
          <h1 className="font-cinzel text-3xl font-bold text-white">
            {m.name}
          </h1>
          <p className="mt-1 text-xs italic text-brand-muted">
            {m.nameEn} · {m.alignment}
          </p>
        </div>
        {isGM && (
          <button
            onClick={() => addMonsterToSession(m)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent/80"
            title="Adiciona um token deste monstro no centro do viewport atual."
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar à sessão
          </button>
        )}
      </header>

      <section className="grid grid-cols-3 gap-3 rounded-xl border border-brand-border bg-white/[0.02] p-5">
        <Stat label="CA" value={m.armorClass.toString()} hint={m.armorClassDescription} />
        <Stat label="HP" value={m.hitPoints.toString()} hint={`(${m.hitDice})`} />
        <Stat label="Velocidade" value={speedParts.join(", ")} />
        <Stat label="ND" value={formatCr(m.challengeRating)} hint={`${m.experiencePoints} XP`} />
        <Stat
          label="Percepção passiva"
          value={m.senses.passivePerception.toString()}
        />
        {m.senses.darkvision && (
          <Stat label="Visão no escuro" value={`${m.senses.darkvision}m`} />
        )}
      </section>

      <section className="grid grid-cols-3 gap-3 rounded-xl border border-brand-border bg-white/[0.02] p-5 sm:grid-cols-6">
        {(["str", "dex", "con", "int", "wis", "cha"] as const).map((key) => (
          <div key={key} className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
              {key}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-brand-text">
              {m.attributes[key]}
            </p>
            <p className="text-[11px] tabular-nums text-brand-accent">
              {fmtMod(abilityMod(m.attributes[key]))}
            </p>
          </div>
        ))}
      </section>

      {(m.damageResistances.length > 0 ||
        m.damageImmunities.length > 0 ||
        m.damageVulnerabilities.length > 0 ||
        m.conditionImmunities.length > 0) && (
        <section className="space-y-2 rounded-xl border border-brand-border bg-white/[0.02] p-5 text-sm">
          {m.damageResistances.length > 0 && (
            <p>
              <span className="font-semibold text-brand-text">
                Resistências:
              </span>{" "}
              <span className="text-brand-muted">
                {m.damageResistances.join(", ")}
              </span>
            </p>
          )}
          {m.damageImmunities.length > 0 && (
            <p>
              <span className="font-semibold text-brand-text">
                Imunidades a dano:
              </span>{" "}
              <span className="text-brand-muted">
                {m.damageImmunities.join(", ")}
              </span>
            </p>
          )}
          {m.damageVulnerabilities.length > 0 && (
            <p>
              <span className="font-semibold text-brand-text">
                Vulnerabilidades:
              </span>{" "}
              <span className="text-brand-muted">
                {m.damageVulnerabilities.join(", ")}
              </span>
            </p>
          )}
          {m.conditionImmunities.length > 0 && (
            <p>
              <span className="font-semibold text-brand-text">
                Imunidades a condições:
              </span>{" "}
              <span className="text-brand-muted">
                {m.conditionImmunities.join(", ")}
              </span>
            </p>
          )}
          {m.languages.length > 0 && (
            <p>
              <span className="font-semibold text-brand-text">Idiomas:</span>{" "}
              <span className="text-brand-muted">{m.languages.join(", ")}</span>
            </p>
          )}
        </section>
      )}

      {m.specialAbilities && m.specialAbilities.length > 0 && (
        <section className="rounded-xl border border-brand-border bg-white/[0.02] p-5">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
            Habilidades Especiais
          </h2>
          <div className="space-y-3">
            {m.specialAbilities.map((sa) => (
              <div key={sa.name}>
                <p className="text-sm font-semibold text-brand-text">
                  {sa.name}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-brand-text/80">
                  {sa.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {m.actions && m.actions.length > 0 && (
        <section className="rounded-xl border border-brand-border bg-white/[0.02] p-5">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
            Ações
          </h2>
          <div className="space-y-3">
            {m.actions.map((a) => (
              <div key={a.name}>
                <p className="text-sm font-semibold text-brand-text">
                  {a.name}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-brand-text/80">
                  {a.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <SrdAttributionFooter attribution={m.attribution} variant="card" />
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
      {hint && <p className="text-[10px] text-brand-muted">{hint}</p>}
    </div>
  );
}
