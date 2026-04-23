"use client";

import { useEffect, useState } from "react";
import { DiceIcon } from "./DiceIcon";
import { useDiceAnimationStore } from "@/lib/dice-animation-store";
import { usePlayerSettings } from "@/lib/player-settings-store";

type Phase = "rolling" | "reveal" | "hold" | "exit";

/**
 * Nível 2 — overlay central. Dispara só pra crítico/falha no MVP
 * (ATTACK/SAVE central virão quando o HUD de ataque/save existir).
 *
 * Fases:
 *  - rolling 1.2s: dado gira + flicker de faces aleatórias
 *  - reveal 300ms: estabiliza mostrando o valor final
 *  - hold 1.5s: resultado visível com label
 *  - exit 300ms: fade out
 *
 * `pointer-events-none` no overlay — NUNCA bloqueia canvas. Botão
 * "Pular animação" tem pointer-events-auto pra ser clicável.
 */
export function DiceCentralReveal() {
  const current = useDiceAnimationStore((s) => s.current);
  const clear = useDiceAnimationStore((s) => s.clear);
  const mode = usePlayerSettings((s) => s.diceAnimation);
  const reduceMotion = usePlayerSettings((s) => s.reduceMotion);

  const [phase, setPhase] = useState<Phase>("rolling");
  const [flicker, setFlicker] = useState(1);

  useEffect(() => {
    if (!current) return;
    setPhase("rolling");

    // Flicker de faces aleatórias durante rolling (efeito visual).
    const flickerId = setInterval(() => {
      setFlicker(Math.floor(Math.random() * current.sides) + 1);
    }, 70);

    const timers: ReturnType<typeof setTimeout>[] = [];
    if (reduceMotion || mode === "none") {
      timers.push(setTimeout(() => setPhase("hold"), 0));
      timers.push(setTimeout(() => setPhase("exit"), 1500));
      timers.push(setTimeout(() => clear(), 1800));
    } else {
      timers.push(setTimeout(() => setPhase("reveal"), 1200));
      timers.push(setTimeout(() => setPhase("hold"), 1500));
      timers.push(setTimeout(() => setPhase("exit"), 3000));
      timers.push(setTimeout(() => clear(), 3300));
    }

    return () => {
      clearInterval(flickerId);
      timers.forEach(clearTimeout);
    };
  }, [current, reduceMotion, mode, clear]);

  if (!current) return null;

  const isCrit = current.kind === "crit";
  const accentClass = isCrit
    ? "text-[#FFD700] drop-shadow-[0_0_24px_rgba(255,215,0,0.6)]"
    : "text-brand-danger drop-shadow-[0_0_24px_rgba(220,38,38,0.6)]";
  const glowGradient = isCrit
    ? "radial-gradient(ellipse at center, rgba(255,215,0,0.18) 0%, transparent 55%)"
    : "radial-gradient(ellipse at center, rgba(220,38,38,0.18) 0%, transparent 55%)";

  const displayValue =
    phase === "rolling" ? flicker : current.result;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[150] flex items-center justify-center transition-opacity duration-300 ${
        phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden
    >
      {/* Glow de fundo */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: glowGradient }}
      />

      {/* Dado + número */}
      <div className="relative flex flex-col items-center gap-4">
        <div
          className={`relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40 md:h-48 md:w-48 ${accentClass}`}
        >
          <div
            className={`absolute inset-0 flex items-center justify-center ${
              phase === "rolling" ? "qb-dice-spin" : ""
            }`}
          >
            <DiceIcon sides={current.sides} className="h-full w-full" />
          </div>
          <span
            className={`relative text-5xl font-black tabular-nums sm:text-6xl md:text-7xl ${
              phase === "rolling" ? "opacity-80" : "qb-dice-pop"
            }`}
          >
            {displayValue}
          </span>
        </div>

        {phase !== "exit" && (
          <div className="text-center">
            <div className="text-xs text-brand-muted">{current.actorName}</div>
            <div className={`mt-0.5 text-sm font-bold uppercase tracking-wider ${accentClass}`}>
              {isCrit ? "Crítico!" : "Falha crítica"}
            </div>
            <div className="mt-0.5 text-[11px] text-brand-muted/80">
              {current.formula} · ({current.details})
            </div>
          </div>
        )}
      </div>

      {/* Skip button */}
      {phase === "rolling" && !reduceMotion && (
        <button
          type="button"
          onClick={() => clear()}
          className="pointer-events-auto absolute bottom-20 right-6 cursor-pointer rounded-md border border-brand-border bg-[#0D0D12]/80 px-3 py-1 text-[11px] text-brand-muted backdrop-blur-sm transition-colors hover:bg-white/5 hover:text-brand-text md:bottom-8"
        >
          Pular animação
        </button>
      )}

      <style jsx>{`
        @keyframes qb-dice-spin {
          0% {
            transform: rotate(0deg) scale(0.8);
          }
          40% {
            transform: rotate(720deg) scale(1.05);
          }
          100% {
            transform: rotate(1080deg) scale(1);
          }
        }
        @keyframes qb-dice-pop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          60% {
            transform: scale(1.25);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .qb-dice-spin {
          animation: qb-dice-spin 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .qb-dice-pop {
          animation: qb-dice-pop 300ms ease-out;
        }
      `}</style>
    </div>
  );
}
