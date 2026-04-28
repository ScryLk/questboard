"use client";

import { Heart, Shield, Footprints, Zap } from "lucide-react";
import type { CampaignCharacter } from "@/types/character";
import type { Dnd5eSheetContext } from "@/hooks/use-dnd5e-derived";

interface Props {
  character: CampaignCharacter;
  ctx: Dnd5eSheetContext | null;
}

function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export function SheetHeader({ character, ctx }: Props) {
  const ac = ctx?.derived.armorClass.total ?? character.stats.ac;
  const speed = ctx?.derived.speed ?? character.stats.speed;
  const initiative = ctx?.derived.initiative ?? 0;
  const hp = character.stats.hp;
  const hpMax = character.stats.maxHp;
  const hpPct = hpMax > 0 ? (hp / hpMax) * 100 : 0;
  const lowHp = hpPct < 50;
  const criticalHp = hpPct < 25;

  return (
    <header className="rounded-xl border border-brand-border bg-white/[0.02] p-5">
      <div className="flex items-start gap-4">
        {/* Retrato */}
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
          <h1 className="font-cinzel text-2xl font-bold text-white">
            {character.name}
          </h1>
          <p className="text-sm text-brand-muted">
            {ctx
              ? `${ctx.raceName} · ${ctx.className} Nv. ${ctx.data.level}`
              : (character.title ?? "Personagem")}
            {ctx?.data.alignment && ` · ${ctx.data.alignment}`}
          </p>

          {/* Stats compactos */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat
              icon={Heart}
              label="HP"
              value={`${hp}/${hpMax}`}
              color={
                criticalHp ? "#f87171" : lowHp ? "#fbbf24" : "#34d399"
              }
            />
            <Stat
              icon={Shield}
              label="CA"
              value={ac.toString()}
              color="#60a5fa"
              tooltip={ctx?.derived.armorClass.breakdown
                .map((b) => `${b.source}: ${b.value}`)
                .join(" + ")}
            />
            <Stat
              icon={Zap}
              label="Iniciativa"
              value={fmtMod(initiative)}
              color="#fbbf24"
            />
            <Stat
              icon={Footprints}
              label="Velocidade"
              value={`${speed}m`}
              color="#a78bfa"
            />
          </div>
        </div>
      </div>

      {/* Barra de HP */}
      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
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
      </div>
    </header>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
  tooltip,
}: {
  icon: typeof Heart;
  label: string;
  value: string;
  color: string;
  tooltip?: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-brand-border bg-white/[0.02] px-3 py-2"
      title={tooltip}
    >
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
