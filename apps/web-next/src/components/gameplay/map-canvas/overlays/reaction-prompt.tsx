"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, Shield, Swords, X } from "lucide-react";
import type { PendingReaction, OAWeaponOption } from "@/lib/reactions";
import type { GameToken } from "@/lib/gameplay-mock-data";

interface ReactionPromptProps {
  pending: PendingReaction;
  reactorToken: GameToken;
  triggerToken: GameToken;
  scaledCell: number;
  onUse: (weaponId: string) => void;
  onSkip: () => void;
}

export function ReactionPrompt({
  pending,
  reactorToken,
  triggerToken,
  scaledCell,
  onUse,
  onSkip,
}: ReactionPromptProps) {
  const [selectedWeapon, setSelectedWeapon] = useState<OAWeaponOption>(
    pending.weaponOptions[0],
  );
  const [timerPct, setTimerPct] = useState(100);
  const [secondsLeft, setSecondsLeft] = useState(
    Math.ceil(pending.timeoutMs / 1000),
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolved = useRef(false);

  useEffect(() => {
    const start = pending.createdAt;
    const duration = pending.timeoutMs;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 1 - elapsed / duration);
      setTimerPct(remaining * 100);
      setSecondsLeft(Math.ceil(remaining * duration / 1000));

      if (remaining <= 0 && !resolved.current) {
        resolved.current = true;
        onSkip();
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pending.createdAt, pending.timeoutMs, onSkip]);

  function handleUse() {
    if (resolved.current) return;
    resolved.current = true;
    onUse(selectedWeapon.weaponId);
  }

  function handleSkip() {
    if (resolved.current) return;
    resolved.current = true;
    onSkip();
  }

  const isUrgent = secondsLeft <= 2;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[61] flex justify-center pt-[15vh]">
      <div className="animate-oa-popup-enter h-fit w-[380px]">
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            background: "linear-gradient(180deg, #1a0a0a 0%, #0f0808 100%)",
            border: "2px solid rgba(255,60,60,0.6)",
            boxShadow:
              "0 0 40px rgba(255,40,40,0.2), 0 0 80px rgba(255,20,20,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Timer bar */}
          <div className="h-[3px] w-full bg-red-950/50">
            <div
              className="h-full transition-[width] duration-100 ease-linear"
              style={{
                width: `${timerPct}%`,
                background:
                  timerPct > 40
                    ? "linear-gradient(90deg, #EF4444, #F97316, #EF4444)"
                    : "linear-gradient(90deg, #EF4444, #DC2626)",
              }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2 pt-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
                <Swords className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <div className="text-sm font-bold uppercase tracking-wide text-red-400">
                  Ataque de Oportunidade!
                </div>
                <div className="text-[11px] text-red-300/60">
                  {reactorToken.name} pode reagir
                </div>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-red-300/40 transition-colors hover:text-red-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Description */}
          <div className="px-4 pb-3">
            <p className="text-xs text-red-200/50">
              {pending.triggerDescription}
            </p>
          </div>

          {/* Weapon selection (if multiple) */}
          {pending.weaponOptions.length > 1 && (
            <div className="mx-4 mb-3 flex gap-1.5">
              {pending.weaponOptions.map((w) => (
                <button
                  key={w.weaponId}
                  onClick={() => setSelectedWeapon(w)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
                    selectedWeapon.weaponId === w.weaponId
                      ? "bg-red-500/20 text-red-300 ring-1 ring-red-500/40"
                      : "bg-white/[0.04] text-red-200/40 hover:bg-white/[0.08]"
                  }`}
                >
                  {w.weaponName}
                </button>
              ))}
            </div>
          )}

          {/* Selected weapon card */}
          <div
            className="mx-4 mb-4 rounded-xl px-3.5 py-2.5"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,60,60,0.15)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-red-400/60" />
                <span className="text-xs font-semibold text-red-100">
                  {selectedWeapon.weaponName}
                </span>
              </div>
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-[11px]">
              <span className="text-red-200/40">
                +{selectedWeapon.attackBonus} ataque
              </span>
              <span className="text-red-200/20">|</span>
              <span className="text-red-200/40">{selectedWeapon.damage}</span>
            </div>
          </div>

          {/* Actions + Timer */}
          <div className="flex items-center gap-3 px-4 pb-4">
            <button
              onClick={handleUse}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(180deg, #DC2626, #991B1B)",
                boxShadow: "0 2px 12px rgba(220,38,38,0.4)",
              }}
            >
              <Swords className="h-4 w-4" />
              Atacar!
            </button>
            <button
              onClick={handleSkip}
              className="flex-1 rounded-xl bg-white/[0.05] py-2.5 text-sm text-red-200/40 transition-colors hover:bg-white/[0.08]"
            >
              Deixar ir
            </button>
            <div
              className={`flex items-center gap-1.5 text-xs tabular-nums ${
                isUrgent ? "text-red-400" : "text-red-200/40"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span className="font-semibold">{secondsLeft}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
