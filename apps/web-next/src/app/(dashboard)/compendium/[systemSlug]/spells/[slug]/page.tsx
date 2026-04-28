"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Sparkles, Trash2 } from "lucide-react";
import { getSpell, getSystem } from "@/lib/srd";
import { useHomebrewStore } from "@/lib/srd/homebrew-store";
import { useCampaignStore } from "@/lib/campaign-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import { SrdAttributionFooter } from "@/components/compendium/srd-attribution-footer";
import { HomebrewBadge } from "@/components/compendium/homebrew-badge";
import { HomebrewSpellModal } from "@/components/compendium/homebrew-spell-modal";

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
  const router = useRouter();
  const { systemSlug, slug } = use(params);
  const system = getSystem(systemSlug);
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const homebrewSpell = useHomebrewStore((s) =>
    activeCampaignId ? s.spellsByCampaign[activeCampaignId]?.find((x) => x.slug === slug) ?? null : null,
  );
  const deleteSpell = useHomebrewStore((s) => s.deleteSpell);
  const isGM = useGameplayStore((s) => s.currentUserIsGM);
  const [editing, setEditing] = useState(false);

  // Homebrew tem precedência se houver — assim GM vê edição mesmo se um
  // dia colidir com slug oficial. Default: SRD oficial.
  const spell = homebrewSpell ?? getSpell(systemSlug, slug);
  const isHomebrew = Boolean(homebrewSpell);

  if (!system || !spell) notFound();

  function handleDelete() {
    if (!homebrewSpell || !activeCampaignId) return;
    if (
      !confirm(
        `Excluir a magia homebrew "${homebrewSpell.name}"? Esta ação não pode ser desfeita.`,
      )
    )
      return;
    deleteSpell(activeCampaignId, homebrewSpell.slug);
    router.push(`/compendium/${systemSlug}/spells`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href={`/compendium/${systemSlug}/spells`}
        className="inline-flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Magias
      </Link>

      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-brand-accent">
            <Sparkles className="h-3.5 w-3.5" />
            {spell.level === 0 ? "Truque" : `${spell.level}º nível`} ·{" "}
            {SCHOOL_LABELS[spell.school]}
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-cinzel text-3xl font-bold text-white">
              {spell.name}
            </h1>
            {isHomebrew && <HomebrewBadge />}
          </div>
          <p className="mt-1 text-xs italic text-brand-muted">{spell.nameEn}</p>
        </div>
        {isHomebrew && isGM && (
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 rounded-md border border-brand-border px-2.5 py-1.5 text-xs text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
            >
              <Pencil className="h-3 w-3" />
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 rounded-md border border-red-500/30 px-2.5 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/10"
            >
              <Trash2 className="h-3 w-3" />
              Excluir
            </button>
          </div>
        )}
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

      {editing && isHomebrew && activeCampaignId && (
        <HomebrewSpellModal
          campaignId={activeCampaignId}
          existing={homebrewSpell}
          onClose={() => setEditing(false)}
        />
      )}
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
