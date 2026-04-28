"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sword } from "lucide-react";
import { getItem, getSystem } from "@/lib/srd";
import { SrdAttributionFooter } from "@/components/compendium/srd-attribution-footer";

const CATEGORY_LABELS: Record<string, string> = {
  weapon: "Arma",
  armor: "Armadura",
  "adventuring-gear": "Equipamento",
  "magic-item": "Item mágico",
  tool: "Ferramenta",
};

const RARITY_LABELS: Record<string, string> = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  "very-rare": "Muito raro",
  legendary: "Lendário",
  artifact: "Artefato",
};

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ systemSlug: string; slug: string }>;
}) {
  const { systemSlug, slug } = use(params);
  const system = getSystem(systemSlug);
  const it = getItem(systemSlug, slug);
  if (!system || !it) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href={`/compendium/${systemSlug}/items`}
        className="inline-flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Itens
      </Link>

      <header>
        <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-brand-accent">
          <Sword className="h-3.5 w-3.5" />
          {CATEGORY_LABELS[it.category]}
          {it.subcategory && ` · ${it.subcategory}`}
        </div>
        <h1 className="font-cinzel text-3xl font-bold text-white">{it.name}</h1>
        <p className="mt-1 text-xs italic text-brand-muted">{it.nameEn}</p>
      </header>

      <section className="grid gap-3 rounded-xl border border-brand-border bg-white/[0.02] p-5 sm:grid-cols-2">
        {it.cost && (
          <Field
            label="Custo"
            value={`${it.cost.quantity} ${it.cost.unit.toUpperCase()}`}
          />
        )}
        {it.weight !== undefined && (
          <Field label="Peso" value={`${it.weight} kg`} />
        )}
        {it.damageDice && (
          <Field
            label="Dano"
            value={`${it.damageDice} ${it.damageType ?? ""}`.trim()}
          />
        )}
        {it.weaponRange && (
          <Field
            label="Alcance"
            value={
              it.weaponRange.long
                ? `${it.weaponRange.normal}/${it.weaponRange.long} m`
                : `${it.weaponRange.normal} m`
            }
          />
        )}
        {it.weaponProperties && it.weaponProperties.length > 0 && (
          <Field
            label="Propriedades"
            value={it.weaponProperties.join(", ")}
            full
          />
        )}
        {it.armorClass && (
          <Field
            label="CA"
            value={
              it.armorClass.dexBonus
                ? it.armorClass.maxDexBonus !== undefined
                  ? `${it.armorClass.base} + Des (máx. +${it.armorClass.maxDexBonus})`
                  : `${it.armorClass.base} + Des`
                : `${it.armorClass.base}`
            }
          />
        )}
        {it.strengthRequirement !== undefined && (
          <Field
            label="Requisito de Força"
            value={String(it.strengthRequirement)}
          />
        )}
        {it.stealthDisadvantage && (
          <Field
            label="Furtividade"
            value="Desvantagem"
          />
        )}
        {it.rarity && (
          <Field label="Raridade" value={RARITY_LABELS[it.rarity]} />
        )}
        {it.requiresAttunement && (
          <Field label="Sintonia" value="Requerida" />
        )}
      </section>

      {it.description && (
        <section className="rounded-xl border border-brand-border bg-white/[0.02] p-5">
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
            Descrição
          </h2>
          <p className="text-sm leading-relaxed text-brand-text/90">
            {it.description}
          </p>
        </section>
      )}

      <SrdAttributionFooter attribution={it.attribution} variant="card" />
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
