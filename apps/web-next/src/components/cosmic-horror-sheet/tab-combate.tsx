"use client";

import { Crosshair, Heart, Shield, Swords } from "lucide-react";
import type { CosmicHorrorSheetContext } from "@/hooks/use-cosmic-horror-derived";

interface Props {
  ctx: CosmicHorrorSheetContext;
}

export function CosmicHorrorTabCombate({ ctx }: Props) {
  const { data, derived, skillEntries } = ctx;
  const dodgeSkill = skillEntries.find((s) => s.slug === "dodge");
  const brawlSkill = skillEntries.find((s) => s.slug === "brawl");

  return (
    <div className="space-y-4">
      {/* Stats de combate */}
      <div className="grid gap-3 md:grid-cols-4">
        <CombatStat
          icon={Heart}
          label="HP"
          value={`${data.hpCurrent}/${derived.hpMax}`}
          subtitle="Ferida grave em ½ HP"
          color="#f87171"
        />
        <CombatStat
          icon={Shield}
          label="Esquivar"
          value={`${dodgeSkill?.value ?? derived.dodgeBase}%`}
          subtitle={`base DES/2 = ${derived.dodgeBase}`}
          color="#60a5fa"
        />
        <CombatStat
          icon={Swords}
          label="Lutar (Briga)"
          value={`${brawlSkill?.value ?? 25}%`}
          subtitle={`Bônus dano ${derived.damageBonus}`}
          color="#fbbf24"
        />
        <CombatStat
          icon={Crosshair}
          label="Build"
          value={String(derived.build)}
          subtitle={`Move ${derived.moveRate}m`}
          color="#a78bfa"
        />
      </div>

      {/* Armas */}
      <div className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
          Armas
        </p>
        {data.weapons.length === 0 ? (
          <p className="text-xs text-brand-muted/70">
            Sem armas cadastradas — investigador desarmado.
          </p>
        ) : (
          <div className="space-y-2">
            {data.weapons.map((w, i) => {
              const skill = skillEntries.find((s) => s.slug === w.skillSlug);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-lg border border-brand-border bg-brand-primary px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-brand-text">{w.name}</p>
                    <p className="text-[10px] text-brand-muted">
                      {skill?.name ?? w.skillSlug} ·{" "}
                      <span className="text-rose-300">{w.damage}</span>
                      {w.range && ` · ${w.range}`}
                      {typeof w.ammo === "number" && ` · ${w.ammo} cartuchos`}
                    </p>
                    {w.notes && (
                      <p className="mt-0.5 text-[10px] italic text-brand-muted/70">
                        {w.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-syne text-lg font-bold text-purple-300">
                      {skill?.value ?? "?"}%
                    </p>
                    <p className="text-[9px] text-brand-muted/70">
                      ½{skill?.halfValue ?? "?"} ⅕{skill?.extremeValue ?? "?"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[10px] text-brand-muted/70">
        Combate em horror investigativo é letal. HP baixo, esquiva ativa
        consome ação, dano crítico (sucesso extremo) dobra os dados — não os
        soma. Vitória costuma ser fugir.
      </p>
    </div>
  );
}

function CombatStat({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: typeof Heart;
  label: string;
  value: string;
  subtitle?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-brand-border bg-white/[0.02] p-3">
      <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-brand-muted">
        <Icon className="h-3 w-3" style={{ color }} />
        {label}
      </div>
      <p className="font-syne text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      {subtitle && (
        <p className="text-[10px] text-brand-muted/70">{subtitle}</p>
      )}
    </div>
  );
}
