"use client";

// Animação 2D dos dados — cards "cristalinos" com borda neon na cor do
// contexto (d20 ataque = cyan, dano = cor do tipo). Visual prompt §5
// (fallback 2D) trazido pra primária. Mais leve, sem assets externos.
//
// Cada dado vira um card. Durante ~1.5s o número cicla rapidamente
// (random); depois trava no valor pré-determinado vindo do servidor
// (em mock, do engine local). Stagger entre cards reforça a leitura.
//
// Crit/fumble ganham overlays adicionais conforme prompt visual §2.2.

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AttackDiceConfig,
  AttackTargetResult,
  AttackDamageType,
} from "@questboard/types";
import { DAMAGE_TYPE_LABELS } from "@questboard/constants";
import {
  ATTACK_DICE_COLOR,
  CRIT_DICE_COLOR,
  DAMAGE_TYPE_COLOR,
} from "@/lib/dice-colors";

interface Props {
  config: AttackDiceConfig | null;
  onComplete: () => void;
  /** Pula animação — mostra resultado direto e dispara `onComplete`
   *  imediatamente. Honra a setting `dice.animateResult` do usuário. */
  instant?: boolean;
}

export interface DieEntry {
  id: string;
  /** Valor final (predefinido). */
  value: number;
  /** Faces do dado (20, 6, 8…). */
  sides: number;
  /** Cor do tema (borda + glow). */
  color: string;
  /** Label abaixo do card. */
  label: string;
  /** Tipo "attack" (d20 cyan) ou "damage" (cor do tipo). */
  kind: "attack" | "damage";
}

const SPIN_DURATION_MS = 1500;
const SPIN_TICK_MS = 60;
const STAGGER_PER_DIE_MS = 120;
const SETTLE_DURATION_MS = 250;

export function DiceCanvas({ config, onComplete, instant = false }: Props) {
  const dice = useMemo(() => {
    if (!config || config.skip) return [] as DieEntry[];
    return buildDice(config);
  }, [config]);

  const hasCrit =
    config && !config.skip ? config.results.some((r) => r.isCrit) : false;
  const hasFumble =
    config && !config.skip ? config.results.some((r) => r.isFumble) : false;

  const summary = useMemo(() => {
    if (!config || config.skip) return null;
    return buildSummary(config);
  }, [config]);

  // Glow ambiente — cor do dano (vai ler como contexto da rolagem).
  const ambientColor = useMemo(() => {
    if (!config || config.skip) return ATTACK_DICE_COLOR;
    return DAMAGE_TYPE_COLOR[config.damageType] ?? ATTACK_DICE_COLOR;
  }, [config]);

  // Dispara onComplete quando todos os dados pararam. Em modo instant
  // dispara no próximo tick — UI ainda monta brevemente pra mostrar o
  // resultado, mas o modal pula direto pra "done".
  useEffect(() => {
    if (!config || config.skip || dice.length === 0) return;
    if (instant) {
      const t = setTimeout(onComplete, 0);
      return () => clearTimeout(t);
    }
    const totalMs =
      STAGGER_PER_DIE_MS * Math.max(0, dice.length - 1) +
      SPIN_DURATION_MS +
      SETTLE_DURATION_MS +
      200;
    const t = setTimeout(onComplete, totalMs);
    return () => clearTimeout(t);
  }, [config, dice.length, instant, onComplete]);

  return (
    <div
      className="relative flex h-[280px] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-md border border-brand-border"
      aria-hidden
      style={{
        background: `radial-gradient(circle at center, ${ambientColor}18, #04090f 75%)`,
      }}
    >
      {/* Pílula "Rolando para…" — feedback de fase animating */}
      <div className="rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-[11px] font-medium text-brand-accent">
        Rolando para {summary?.targetCount === 1 ? "o alvo" : "todos os alvos"}
      </div>

      {/* Grid de cards (cap em 8 visualmente) */}
      <div className="flex flex-wrap items-center justify-center gap-3 px-4">
        {dice.slice(0, 8).map((d, idx) => (
          <DieCard
            key={d.id}
            die={d}
            delayMs={instant ? 0 : idx * STAGGER_PER_DIE_MS}
            instant={instant}
          />
        ))}
        {dice.length > 8 && (
          <span className="text-[10px] text-brand-muted">
            +{dice.length - 8} dados
          </span>
        )}
      </div>

      {/* Sumário matemático abaixo */}
      {summary && (
        <p className="px-4 text-center text-[11px] text-brand-muted">
          {summary.line}
        </p>
      )}

      {/* Crit overlay — pulso dourado 800ms (visual prompt §2.2) */}
      {hasCrit && (
        <div
          className="qb-dice-crit-overlay pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, ${CRIT_DICE_COLOR}40, transparent 70%)`,
          }}
        />
      )}

      {/* Fumble overlay — escurece 600ms */}
      {hasFumble && (
        <div className="qb-dice-fumble-overlay pointer-events-none absolute inset-0 bg-slate-950/50" />
      )}

      <style>{`
        @keyframes qb-crit-pulse {
          0%, 100% { opacity: 0; }
          40%      { opacity: 1; }
        }
        @keyframes qb-fumble-darken {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes qb-die-settle {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.18); }
          100% { transform: scale(1); }
        }
        .qb-dice-crit-overlay {
          animation: qb-crit-pulse 800ms ease-out 1.6s 1 both;
        }
        .qb-dice-fumble-overlay {
          animation: qb-fumble-darken 600ms ease-out 1.8s 1 both;
        }
      `}</style>
    </div>
  );
}

// ── DieCard ──

interface DieCardProps {
  die: DieEntry;
  delayMs?: number;
  /** Pula animação — mostra direto no valor final. Usado em result panel. */
  instant?: boolean;
  /** Tamanho do card. Default 80×80; "sm" pra resultado em modal apertado. */
  size?: "md" | "sm";
}

export function DieCard({
  die,
  delayMs = 0,
  instant = false,
  size = "md",
}: DieCardProps) {
  const [display, setDisplay] = useState<number>(() =>
    instant ? die.value : Math.floor(Math.random() * die.sides) + 1,
  );
  const [phase, setPhase] = useState<"waiting" | "spinning" | "settled">(
    instant ? "settled" : "waiting",
  );

  useEffect(() => {
    if (instant) return;

    let tickInterval: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const startTimer = setTimeout(() => {
      if (cancelled) return;
      setPhase("spinning");
      tickInterval = setInterval(() => {
        if (cancelled) return;
        setDisplay(Math.floor(Math.random() * die.sides) + 1);
      }, SPIN_TICK_MS);
    }, delayMs);

    const stopTimer = setTimeout(() => {
      if (cancelled) return;
      if (tickInterval) clearInterval(tickInterval);
      setDisplay(die.value);
      setPhase("settled");
    }, delayMs + SPIN_DURATION_MS);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      clearTimeout(stopTimer);
      if (tickInterval) clearInterval(tickInterval);
    };
  }, [die.value, die.sides, delayMs, instant]);

  const settled = phase === "settled";
  const dim = size === "sm" ? "h-14 w-14" : "h-20 w-20";
  const numCls =
    size === "sm" ? "text-xl font-bold" : "text-3xl font-bold";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`relative flex ${dim} items-center justify-center rounded-2xl border-2 transition-shadow`}
        style={{
          borderColor: die.color,
          background: `radial-gradient(circle at center, ${die.color}15, #0a0f1a 75%)`,
          boxShadow: settled
            ? `0 0 18px ${die.color}80, inset 0 0 12px ${die.color}30`
            : `0 0 12px ${die.color}40, inset 0 0 8px ${die.color}20`,
          animation:
            settled && !instant
              ? `qb-die-settle ${SETTLE_DURATION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) 1`
              : undefined,
        }}
      >
        <span
          className={`select-none font-cinzel ${numCls} tabular-nums`}
          style={{
            color: "#ecfeff",
            textShadow: `0 0 10px ${die.color}, 0 0 20px ${die.color}80`,
          }}
        >
          {display}
        </span>
      </div>
      <span
        className="text-[9px] font-bold uppercase tracking-wider"
        style={{ color: die.color }}
      >
        {die.label}
      </span>
    </div>
  );
}

// ── Helpers ──

export function buildDice(
  config: Exclude<AttackDiceConfig, { skip: true }>,
): DieEntry[] {
  const damageColor = DAMAGE_TYPE_COLOR[config.damageType];
  const damageLabelBase = DAMAGE_TYPE_LABELS[config.damageType] ?? "Dano";
  const out: DieEntry[] = [];
  let counter = 0;

  for (const r of config.results) {
    for (const v of r.d20Rolls) {
      out.push({
        id: `d20-${counter++}`,
        value: v,
        sides: 20,
        color: ATTACK_DICE_COLOR,
        label: "D20 Ataque",
        kind: "attack",
      });
    }
    for (const v of r.damageRolls) {
      out.push({
        id: `dmg-${counter++}`,
        value: v,
        sides: r.damageSides,
        color: damageColor,
        label: `D${r.damageSides} ${damageLabelBase}`,
        kind: "damage",
      });
    }
  }

  return out;
}

interface SummaryInfo {
  line: string;
  targetCount: number;
}

function buildSummary(
  config: Exclude<AttackDiceConfig, { skip: true }>,
): SummaryInfo {
  const parts: string[] = [];

  // d20 — 1 valor por alvo (final após advantage).
  const d20s = config.results
    .map((r) => (r.d20Rolls.length > 0 ? r.d20Rolls[r.d20Rolls.length - 1]! : null))
    .filter((v): v is number => v !== null);
  if (d20s.length > 0) {
    if (d20s.length === 1) {
      parts.push(`d20: ${d20s[0]}`);
    } else {
      parts.push(
        `d20: ${d20s.slice(0, 4).join(", ")}${d20s.length > 4 ? "…" : ""}`,
      );
    }
  }

  // Dano — soma de todos os dados que acertaram.
  const damageRolls = config.results.flatMap((r) => r.damageRolls);
  if (damageRolls.length > 0) {
    const total = damageRolls.reduce((s, v) => s + v, 0);
    parts.push(`dano: ${damageRolls.join(" + ")} = ${total}`);
  }

  return {
    line: parts.join(" · "),
    targetCount: config.results.length,
  };
}

/** Constrói AttackDiceConfig a partir de results (helper exposto pra modal). */
export function buildDiceConfig(
  results: AttackTargetResult[],
  damageType: AttackDamageType,
  damageSides: number,
): AttackDiceConfig {
  return {
    damageType,
    results: results.map((r) => ({
      targetTokenId: r.targetTokenId,
      d20Rolls: r.d20Rolls,
      damageRolls: r.damageRolls ?? [],
      damageSides,
      isCrit: r.isCrit,
      isFumble: r.isFumble,
    })),
  };
}
