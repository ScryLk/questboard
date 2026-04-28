"use client";

import { useState } from "react";
import {
  ArrowUp,
  BedDouble,
  Coffee,
  Heart,
  Minus,
  Plus,
  Skull,
  Sword,
  X,
} from "lucide-react";
import type { CampaignCharacter } from "@/types/character";
import type { Dnd5eSheetContext } from "@/hooks/use-dnd5e-derived";
import { useCharacterStore } from "@/stores/characterStore";
import {
  levelUp,
  longRest,
  setHpTemp,
  shortRest,
  toggleDeathSave,
} from "@/lib/character-actions";
import { useAttackStore } from "@/lib/attack-store";
import { useGameplayStore } from "@/lib/gameplay-store";

interface Props {
  character: CampaignCharacter;
  ctx: Dnd5eSheetContext | null;
}

function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export function TabCombate({ character, ctx }: Props) {
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const tokens = useGameplayStore((s) => s.tokens);
  const openAttackModal = useAttackStore((s) => s.openModal);
  const [delta, setDelta] = useState("");
  const [hpTempInput, setHpTempInput] = useState("");

  function applyHpDelta(value: number) {
    // Dano subtrai HP temporário primeiro, depois HP normal.
    const tempHp = ctx?.data.hpTemp ?? 0;
    if (value < 0 && tempHp > 0) {
      const damage = -value;
      const tempAbsorbed = Math.min(tempHp, damage);
      const remaining = damage - tempAbsorbed;
      setHpTemp(character.id, tempHp - tempAbsorbed);
      if (remaining > 0) {
        const next = Math.max(0, character.stats.hp - remaining);
        updateCharacter(character.id, {
          stats: { ...character.stats, hp: next },
        });
      }
      return;
    }
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

  function handleAttackClick(weaponName: string) {
    // Pra disparar o attack-flow modal, precisamos de um token deste
    // personagem na cena atual e pelo menos um alvo selecionado.
    const myToken = tokens.find((t) =>
      t.name.toLowerCase().includes(character.name.toLowerCase()),
    );
    if (!myToken) {
      useGameplayStore
        .getState()
        .addToast(
          "Spawne o personagem na cena pra rolar ataques pelo modal.",
        );
      return;
    }
    const selected = useGameplayStore.getState().selectedTokenIds;
    const targets = selected.filter((id) => id !== myToken.id);
    if (targets.length === 0) {
      useGameplayStore
        .getState()
        .addToast(`Selecione um alvo no mapa antes de rolar ${weaponName}.`);
      return;
    }
    openAttackModal({
      attackerTokenId: myToken.id,
      targetTokenIds: targets,
    });
  }

  return (
    <div className="space-y-5">
      {/* Quick actions: rest + level up */}
      {ctx && (
        <section className="flex flex-wrap gap-2">
          <button
            onClick={() => longRest(character.id)}
            className="flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20"
            title="Restaura HP, slots e zera death saves"
          >
            <BedDouble className="h-3.5 w-3.5" />
            Long Rest
          </button>
          <button
            onClick={() => shortRest(character.id)}
            className="flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 transition-colors hover:bg-blue-500/20"
            title={
              ctx.data.classSlug === "warlock"
                ? "Pact Magic: recupera todos os slots"
                : "Estabiliza (zera death saves)"
            }
          >
            <Coffee className="h-3.5 w-3.5" />
            Short Rest
          </button>
          {ctx.data.level < 20 && (
            <button
              onClick={() => levelUp(character.id)}
              className="flex items-center gap-1.5 rounded-md border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-300 transition-colors hover:bg-purple-500/20"
              title={`Sobe pro nível ${ctx.data.level + 1} (HP fixo: HD/2 + 1 + Con)`}
            >
              <ArrowUp className="h-3.5 w-3.5" />
              Subir nível ({ctx.data.level} → {ctx.data.level + 1})
            </button>
          )}
        </section>
      )}

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

          {ctx && (
            <div className="mt-3 flex items-center gap-2 border-t border-brand-border pt-3 text-xs">
              <Heart className="h-3 w-3 text-blue-300" />
              <span className="text-brand-muted">HP temporário:</span>
              <span className="font-bold tabular-nums text-blue-300">
                +{ctx.data.hpTemp}
              </span>
              <input
                type="number"
                value={hpTempInput}
                onChange={(e) => setHpTempInput(e.target.value)}
                placeholder="set"
                className="ml-auto h-7 w-16 rounded border border-brand-border bg-brand-primary px-2 text-center text-xs tabular-nums text-brand-text outline-none focus:border-brand-accent"
              />
              <button
                onClick={() => {
                  const n = parseInt(hpTempInput, 10);
                  if (!Number.isFinite(n)) return;
                  setHpTemp(character.id, n);
                  setHpTempInput("");
                }}
                className="rounded border border-blue-500/30 px-2 py-1 text-[10px] font-semibold text-blue-300 hover:bg-blue-500/10"
              >
                Aplicar
              </button>
            </div>
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
              characterId={character.id}
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
              <button
                key={a.source}
                onClick={() => handleAttackClick(a.name)}
                className="group flex items-center gap-3 rounded-md border border-brand-border bg-white/[0.02] px-3 py-2 text-left transition-colors hover:border-brand-accent/40 hover:bg-brand-accent/5"
                title="Selecionar alvo no mapa antes — abre o modal de ataque"
              >
                <Sword className="h-4 w-4 shrink-0 text-brand-accent" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-brand-text">
                    {a.name}
                  </p>
                  <p className="text-[10px] text-brand-muted">
                    {a.ability.toUpperCase()}
                    {a.usedFinesse && " (finesse)"} · alcance {a.rangeNormal}ft
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
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-brand-muted/80">
            Clique no ataque pra rolar — selecione o alvo no mapa primeiro.
          </p>
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
  characterId,
  successes,
  failures,
}: {
  characterId: string;
  successes: number;
  failures: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div>
        <p className="mb-2 text-emerald-400">Sucessos</p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <button
              key={`s${i}`}
              onClick={() => toggleDeathSave(characterId, "success", i)}
              className={`h-4 w-4 rounded-full border transition-colors ${
                i < successes
                  ? "border-emerald-400 bg-emerald-400"
                  : "border-emerald-400/40 hover:bg-emerald-400/20"
              }`}
              title="Marcar/desmarcar sucesso"
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-red-400">Falhas</p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <button
              key={`f${i}`}
              onClick={() => toggleDeathSave(characterId, "failure", i)}
              className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                i < failures
                  ? "border-red-400 bg-red-400"
                  : "border-red-400/40 hover:bg-red-400/20"
              }`}
              title="Marcar/desmarcar falha"
            >
              {i < failures && <X className="h-2.5 w-2.5 text-white" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
