"use client";

import { useState } from "react";
import { Skull, Dices, CheckCircle, XCircle } from "lucide-react";

interface DeathSaveOverlayProps {
  characterName: string;
  onRoll: (result: number) => void;
}

export function DeathSaveOverlay({ characterName, onRoll }: DeathSaveOverlayProps) {
  const [successes, setSuccesses] = useState(0);
  const [failures, setFailures] = useState(0);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  const handleRoll = () => {
    setRolling(true);
    const result = Math.floor(Math.random() * 20) + 1;

    setTimeout(() => {
      setLastRoll(result);
      setRolling(false);

      if (result === 20) {
        // Nat 20 — stabilize with 1 HP
        setSuccesses(3);
      } else if (result === 1) {
        // Nat 1 — two failures
        setFailures((f) => Math.min(3, f + 2));
      } else if (result >= 10) {
        setSuccesses((s) => s + 1);
      } else {
        setFailures((f) => f + 1);
      }

      onRoll(result);
    }, 500);
  };

  const isStabilized = successes >= 3;
  const isDead = failures >= 3;

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center">
      {/* Backdrop — grayscale effect */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-xs rounded-2xl border border-brand-border bg-brand-surface p-6 text-center">
        <Skull className="mx-auto h-10 w-10 text-brand-danger" />

        <h2 className="mt-3 text-lg font-bold text-brand-text">
          {characterName} caiu!
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Testes contra a morte
        </p>

        {/* Saves tracker */}
        <div className="mt-4 flex justify-center gap-6">
          {/* Successes */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider text-brand-success">
              Sucessos
            </span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-3 w-3 rounded-full border ${
                    i < successes
                      ? "border-brand-success bg-brand-success"
                      : "border-brand-border"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Failures */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider text-brand-danger">
              Falhas
            </span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-3 w-3 rounded-full border ${
                    i < failures
                      ? "border-brand-danger bg-brand-danger"
                      : "border-brand-border"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Last roll */}
        {lastRoll !== null && (
          <div className="mt-4">
            <span className="text-[10px] text-brand-muted">Ultimo teste: </span>
            <span
              className={`text-xl font-bold tabular-nums ${
                lastRoll === 20
                  ? "text-[#FFD700]"
                  : lastRoll === 1
                    ? "text-brand-danger"
                    : lastRoll >= 10
                      ? "text-brand-success"
                      : "text-brand-danger"
              }`}
            >
              {lastRoll}
            </span>
          </div>
        )}

        {/* Result */}
        {isStabilized && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-md bg-brand-success/10 py-2">
            <CheckCircle className="h-4 w-4 text-brand-success" />
            <span className="text-sm font-bold text-brand-success">
              Estabilizado!
            </span>
          </div>
        )}

        {isDead && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-md bg-brand-danger/10 py-2">
            <XCircle className="h-4 w-4 text-brand-danger" />
            <span className="text-sm font-bold text-brand-danger">
              Morto...
            </span>
          </div>
        )}

        {/* Roll button */}
        {!isStabilized && !isDead && (
          <button
            onClick={handleRoll}
            disabled={rolling}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent-hover disabled:opacity-50"
          >
            <Dices className="h-4 w-4" />
            {rolling ? "Rolando..." : "Rolar Teste"}
          </button>
        )}
      </div>
    </div>
  );
}
