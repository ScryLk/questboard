"use client";

import Link from "next/link";
import {
  Brain,
  Clover,
  Droplet,
  Footprints,
  Heart,
  Pencil,
  Swords,
} from "lucide-react";
import type { CampaignCharacter } from "@/types/character";
import type { CosmicHorrorSheetContext } from "@/hooks/use-cosmic-horror-derived";

interface Props {
  character: CampaignCharacter;
  ctx: CosmicHorrorSheetContext;
}

export function CosmicHorrorSheetHeader({ character, ctx }: Props) {
  const { data, derived, occupation } = ctx;
  const hp = data.hpCurrent;
  const hpMax = derived.hpMax;
  const hpPct = hpMax > 0 ? (hp / hpMax) * 100 : 0;
  const lowHp = hpPct < 50;
  const criticalHp = hpPct < 25;

  return (
    <header className="rounded-xl border border-brand-border bg-white/[0.02] p-5">
      <div className="flex items-start gap-4">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg text-2xl font-bold"
          style={{
            backgroundColor: character.portraitColor + "30",
            color: character.portraitColor,
            border: `2px solid ${character.portraitColor}`,
          }}
        >
          {character.name.slice(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h1 className="font-cinzel text-2xl font-bold text-white">
              {character.name}
            </h1>
            <Link
              href={`/characters/new/cosmic-horror?edit=${character.id}`}
              className="flex shrink-0 items-center gap-1 rounded-md border border-brand-border px-2.5 py-1 text-[11px] text-brand-muted transition-colors hover:border-purple-500/40 hover:text-brand-text"
              title="Reabre o wizard cosmic-horror com tudo pré-preenchido"
            >
              <Pencil className="h-3 w-3" />
              Editar
            </Link>
          </div>
          <p className="text-sm text-brand-muted">
            {occupation?.name ?? "Investigador"} · {data.age} anos
            {data.residence && ` · ${data.residence}`}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Stat
              icon={Heart}
              label="HP"
              value={`${hp}/${hpMax}`}
              color={
                criticalHp ? "#f87171" : lowHp ? "#fbbf24" : "#34d399"
              }
            />
            <Stat
              icon={Droplet}
              label="MP"
              value={`${data.mpCurrent}/${derived.mpMax}`}
              color="#60a5fa"
            />
            <Stat
              icon={Brain}
              label="SAN"
              value={`${data.sanityCurrent}/${data.sanityMax}`}
              color="#c084fc"
            />
            <Stat
              icon={Clover}
              label="Sorte"
              value={String(data.luck)}
              color="#34d399"
            />
            <Stat
              icon={Footprints}
              label="MOV"
              value={`${derived.moveRate}m`}
              color="#a78bfa"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 text-[11px] text-brand-muted">
        <span className="flex items-center gap-1">
          <Swords className="h-3 w-3" />
          Bônus de dano <strong className="text-brand-text">{derived.damageBonus}</strong>
        </span>
        <span>·</span>
        <span>
          Build <strong className="text-brand-text">{derived.build}</strong>
        </span>
        <span>·</span>
        <span>
          Esquivar{" "}
          <strong className="text-brand-text">
            {Math.max(derived.dodgeBase, ctx.skillEntries.find((s) => s.slug === "dodge")?.value ?? 0)}%
          </strong>
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${hpPct}%`,
            backgroundColor: criticalHp
              ? "#f87171"
              : lowHp
                ? "#fbbf24"
                : "#34d399",
          }}
        />
      </div>
    </header>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Heart;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-brand-border bg-white/[0.02] px-3 py-2">
      <Icon className="h-4 w-4 shrink-0" style={{ color }} />
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wider text-brand-muted">
          {label}
        </p>
        <p className="text-sm font-bold tabular-nums text-brand-text">
          {value}
        </p>
      </div>
    </div>
  );
}
