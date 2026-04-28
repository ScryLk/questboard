"use client";

import { useState } from "react";
import { Heart, Minus, Plus, Skull, Sword, X } from "lucide-react";
import type { CampaignCharacter } from "@/types/character";
import type { Dnd5eSheetContext } from "@/hooks/use-dnd5e-derived";
import { useCharacterStore } from "@/stores/characterStore";

interface Props {
  character: CampaignCharacter;
  ctx: Dnd5eSheetContext | null;
}

function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export function TabCombate({ character, ctx }: Props) {
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const [delta, setDelta] = useState("");

  function applyHpDelta(value: number) {
    const next = Math.max(
      0,
      Math.min(character.stats.maxHp, character.stats.hp + value),
    );
    updateCharacter(character.id, {
      stats: { ...character.stats, hp: next },
    });
  }

  function setHp(value: number) {
    const next = Math.max(0, Math.min(character.stats.maxHp, value));
    updateCharacter(character.id, {
      stats: { ...character.stats, hp: next },
    });
  }

  return (
    <div className="space-y-5">
      {/* HP control */}
      <section>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
          Pontos de Vida
        </h2>
        <div className="rounded-lg border border-brand-border bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold tabular-nums text-brand-text">
              {character.stats.hp}
              <span className="ml-1 text-sm font-normal text-brand-muted">
                / {character.stats.maxHp}
              </span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => applyHpDelta(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-red-500/30 text-red-400 transition-colors hover:bg-red-500/10"
                title="-1 HP"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input
                type="number"
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
                placeholder="Δ"
                className="h-8 w-14 rounded-md border border-brand-border bg-brand-primary px-2 text-center text-xs tabular-nums text-brand-text outline-none focus:border-brand-accent"
              />
              <button
                onClick={() => {
                  const n = parseInt(delta, 10);
                  if (!Number.isFinite(n)) return;
                  applyHpDelta(-n);
                  setDelta("");
                }}
                className="rounded-md border border-red-500/30 px-2 py-1.5 text-[10px] font-semibold text-red-400 hover:bg-red-500/10"
              >
                Dano
              </button>
              <button
                onClick={() => {
                  const n = parseInt(delta, 10);
                  if (!Number.isFinite(n)) return;
                  applyHpDelta(n);
                  setDelta("");
                }}
                className="rounded-md border border-emerald-500/30 px-2 py-1.5 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/10"
              >
                Cura
              </button>
              <button
                onClick={() => applyHpDelta(1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-500/30 text-emerald-400 transition-colors hover:bg-emerald-500/10"
                title="+1 HP"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setHp(character.stats.maxHp)}
                className="ml-2 flex items-center gap-1 rounded-md border border-brand-border px-2.5 py-1.5 text-[10px] text-brand-muted hover:border-brand-accent/40 hover:text-brand-text"
              >
                <Heart className="h-3 w-3" />
                Cheio
              </button>
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(character.stats.hp / character.stats.maxHp) * 100}%`,
                backgroundColor:
                  character.stats.hp / character.stats.maxHp < 0.25
                    ? "#f87171"
                    : character.stats.hp / character.stats.maxHp < 0.5
                      ? "#fbbf24"
                      : "#34d399",
              }}
            />
          </div>

          {ctx && ctx.data.hpTemp > 0 && (
            <p className="mt-2 text-[11px] text-blue-300">
              + {ctx.data.hpTemp} HP temporário
            </p>
          )}
        </div>
      </section>

      {/* CA breakdown */}
      {ctx && (
        <section>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
            Classe de Armadura
          </h2>
          <div className="rounded-lg border border-brand-border bg-white/[0.02] p-4">
            <p className="text-3xl font-bold tabular-nums text-brand-text">
              {ctx.derived.armorClass.total}
            </p>
            <ul className="mt-2 space-y-0.5 text-xs">
              {ctx.derived.armorClass.breakdown.map((b, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between text-brand-muted"
                >
                  <span>{b.source}</span>
                  <span className="tabular-nums">+{b.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Death saves */}
      {ctx && character.stats.hp === 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-red-400">
            <Skull className="h-3.5 w-3.5" />
            Testes de Morte
          </h2>
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
            <DeathSaves
              successes={ctx.data.deathSavesSuccesses}
              failures={ctx.data.deathSavesFailures}
            />
          </div>
        </section>
      )}

      {/* Ataques */}
      {ctx && ctx.derived.attacks.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
            <Sword className="h-3.5 w-3.5" />
            Ataques
          </h2>
          <div className="grid gap-2">
            {ctx.derived.attacks.map((a) => (
              <div
                key={a.source}
                className="flex items-center gap-3 rounded-md border border-brand-border bg-white/[0.02] px-3 py-2"
              >
                <Sword className="h-4 w-4 shrink-0 text-brand-accent" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-brand-text">
                    {a.name}
                  </p>
                  <p className="text-[10px] text-brand-muted">
                    {a.ability.toUpperCase()}
                    {a.usedFinesse && " (finesse)"} · alcance{" "}
                    {a.rangeNormal}ft
                    {a.rangeLong && ` / ${a.rangeLong}ft`}
                  </p>
                </div>
                <div className="flex gap-2 text-xs tabular-nums">
                  <div className="text-right">
                    <p className="text-[9px] uppercase text-brand-muted">
                      Ataque
                    </p>
                    <p className="font-bold text-brand-accent">
                      {fmtMod(a.bonus)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase text-brand-muted">
                      Dano
                    </p>
                    <p className="font-bold text-brand-text">
                      {a.notation} {a.damageType}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {ctx && ctx.derived.attacks.length === 0 && (
        <p className="text-[11px] italic text-brand-muted">
          Sem armas equipadas. Vá para Inventário pra equipar.
        </p>
      )}
    </div>
  );
}

function DeathSaves({
  successes,
  failures,
}: {
  successes: number;
  failures: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div>
        <p className="mb-2 text-emerald-400">Sucessos</p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={`s${i}`}
              className={`h-3 w-3 rounded-full border ${
                i < successes
                  ? "border-emerald-400 bg-emerald-400"
                  : "border-emerald-400/40"
              }`}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-red-400">Falhas</p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={`f${i}`}
              className={`flex h-3 w-3 items-center justify-center rounded-full border ${
                i < failures
                  ? "border-red-400 bg-red-400"
                  : "border-red-400/40"
              }`}
            >
              {i < failures && <X className="h-2 w-2 text-white" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
