"use client";

import { Heart, Shield, Zap, Footprints } from "lucide-react";
import { formatModifier } from "@questboard/utils";
import type { FullCharacter } from "@/lib/character-types";

interface TabCombateProps {
  character: FullCharacter;
}

const RESET_LABELS: Record<string, string> = {
  short: "Descanso curto",
  long: "Descanso longo",
  manual: "Manual",
};

export function TabCombate({ character }: TabCombateProps) {
  const hpPercent =
    character.hp.max > 0
      ? Math.round((character.hp.current / character.hp.max) * 100)
      : 0;

  const hpBarColor =
    hpPercent > 50
      ? "bg-brand-success"
      : hpPercent > 25
        ? "bg-brand-warning"
        : "bg-brand-danger";

  const weapons = character.inventory.filter(
    (item) => item.damage != null && item.attackBonus != null,
  );

  const classFeatures = character.features.filter((f) => f.source === "class");
  const raceFeatures = character.features.filter((f) => f.source === "race");

  return (
    <div className="space-y-6">
      {/* ── Stats Grid ───────────────────────────────── */}
      <section>
        <div className="grid grid-cols-4 gap-2">
          {/* HP */}
          <div className="rounded-lg border border-brand-border bg-brand-primary p-3">
            <div className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-brand-danger" />
              <span className="text-[10px] uppercase tracking-wider text-brand-muted">
                HP
              </span>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-brand-text">
              {character.hp.current}
              <span className="text-sm text-brand-muted">
                /{character.hp.max}
              </span>
            </p>
            {character.hp.temp > 0 && (
              <p className="mt-0.5 text-[11px] text-brand-info">
                +{character.hp.temp} temp
              </p>
            )}
            {/* HP Bar */}
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-brand-border">
              <div
                className={`h-full rounded-full transition-all ${hpBarColor}`}
                style={{ width: `${Math.min(hpPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* CA (AC) */}
          <div className="rounded-lg border border-brand-border bg-brand-primary p-3">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-brand-info" />
              <span className="text-[10px] uppercase tracking-wider text-brand-muted">
                CA
              </span>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-brand-text">
              {character.ac}
            </p>
          </div>

          {/* Iniciativa */}
          <div className="rounded-lg border border-brand-border bg-brand-primary p-3">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-brand-warning" />
              <span className="text-[10px] uppercase tracking-wider text-brand-muted">
                Iniciativa
              </span>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-brand-text">
              {formatModifier(character.initiative)}
            </p>
          </div>

          {/* Velocidade */}
          <div className="rounded-lg border border-brand-border bg-brand-primary p-3">
            <div className="flex items-center gap-1.5">
              <Footprints className="h-3.5 w-3.5 text-brand-accent" />
              <span className="text-[10px] uppercase tracking-wider text-brand-muted">
                Velocidade
              </span>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-brand-text">
              {character.speed}
              <span className="text-sm text-brand-muted">ft</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Dados de Vida ────────────────────────────── */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Dados de Vida
        </h3>
        <div className="rounded-lg border border-brand-border bg-brand-primary px-3 py-2">
          <span className="text-sm font-medium tabular-nums text-brand-text">
            {character.hitDice.current}/{character.hitDice.max} d
            {character.hitDice.die}
          </span>
        </div>
      </section>

      {/* ── Ataques ──────────────────────────────────── */}
      {weapons.length > 0 && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Ataques
          </h3>
          <div className="space-y-1">
            {weapons.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-brand-border bg-brand-primary px-3 py-2"
              >
                <span className="flex-1 text-sm font-medium text-brand-text">
                  {item.name}
                </span>
                <span className="rounded bg-brand-accent/15 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-brand-accent">
                  {formatModifier(item.attackBonus!)}
                </span>
                <span className="text-sm tabular-nums text-brand-muted">
                  {item.damage}
                </span>
                {item.properties && item.properties.length > 0 && (
                  <span className="text-[11px] text-brand-muted">
                    {item.properties.join(", ")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Habilidades de Classe ────────────────────── */}
      {classFeatures.length > 0 && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Habilidades de Classe
          </h3>
          <div className="space-y-2">
            {classFeatures.map((feature) => (
              <div
                key={feature.id}
                className="rounded-lg border border-brand-border bg-brand-primary px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-brand-text">
                    {feature.name}
                  </span>
                  {feature.uses && (
                    <span className="text-[11px] tabular-nums text-brand-muted">
                      {feature.uses.current}/{feature.uses.max}{" "}
                      <span className="text-brand-muted/60">
                        ({RESET_LABELS[feature.uses.reset] ?? feature.uses.reset})
                      </span>
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-brand-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Tracos Raciais ───────────────────────────── */}
      {raceFeatures.length > 0 && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Tracos Raciais
          </h3>
          <div className="space-y-2">
            {raceFeatures.map((feature) => (
              <div
                key={feature.id}
                className="rounded-lg border border-brand-border bg-brand-primary px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-brand-text">
                    {feature.name}
                  </span>
                  {feature.uses && (
                    <span className="text-[11px] tabular-nums text-brand-muted">
                      {feature.uses.current}/{feature.uses.max}{" "}
                      <span className="text-brand-muted/60">
                        ({RESET_LABELS[feature.uses.reset] ?? feature.uses.reset})
                      </span>
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-brand-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
