"use client";

import { useEffect, useState } from "react";
import { DiceIcon } from "./DiceIcon";
import { usePlayerSettings } from "@/lib/player-settings-store";

interface Props {
  sides: number;
  formula: string;
  result: number;
  details: string;
  isNat20?: boolean;
  isNat1?: boolean;
  /** Se false, pula direto pro resultado (pra histórico/render tardio). */
  animate?: boolean;
}

/**
 * Nível 1 — animação discreta inline no chat. Dado chacoalha 400ms,
 * resultado revela com fade-in. Respeita `prefers-reduced-motion` e
 * `playerSettings.diceAnimation === 'none'`.
 */
export function DiceInlineResult({
  sides,
  formula,
  result,
  details,
  isNat20,
  isNat1,
  animate = true,
}: Props) {
  const mode = usePlayerSettings((s) => s.diceAnimation);
  const reduceMotion = usePlayerSettings((s) => s.reduceMotion);
  const skipAnim = !animate || mode === "none" || reduceMotion;

  const [revealed, setRevealed] = useState(skipAnim);

  useEffect(() => {
    if (skipAnim) {
      setRevealed(true);
      return;
    }
    setRevealed(false);
    const id = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(id);
  }, [skipAnim, formula, result]);

  const colorClass = isNat20
    ? "text-[#FFD700]"
    : isNat1
      ? "text-brand-danger"
      : "text-brand-text";

  return (
    <div className="qb-dice-inline mt-1.5 flex items-center gap-2.5 rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center ${colorClass} ${
          !revealed ? "qb-dice-shake" : ""
        }`}
      >
        <DiceIcon sides={sides} className="h-6 w-6" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] text-brand-muted">{formula}</span>
          <span className="truncate text-[10px] text-brand-muted/60">
            ({details})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-lg font-bold tabular-nums leading-none ${colorClass} ${
              revealed ? "qb-dice-reveal" : "opacity-0"
            }`}
          >
            {revealed ? result : "…"}
          </span>
          {revealed && isNat20 && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#FFD700]">
              Crítico!
            </span>
          )}
          {revealed && isNat1 && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-brand-danger">
              Falha crítica
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes qb-dice-shake {
          0% {
            transform: rotate(0deg) scale(1);
          }
          20% {
            transform: rotate(-15deg) scale(1.1);
          }
          40% {
            transform: rotate(15deg) scale(1.1);
          }
          60% {
            transform: rotate(-10deg) scale(1);
          }
          80% {
            transform: rotate(5deg) scale(1);
          }
          100% {
            transform: rotate(0deg) scale(1);
          }
        }
        @keyframes qb-dice-reveal {
          from {
            opacity: 0;
            transform: scale(1.25);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .qb-dice-shake {
          animation: qb-dice-shake 400ms ease-out;
        }
        .qb-dice-reveal {
          animation: qb-dice-reveal 220ms ease-out;
        }
      `}</style>
    </div>
  );
}
