"use client";

import { useState } from "react";
import { Rocket, X } from "lucide-react";
import { useLobbyStore } from "@/lib/lobby-store";

export function LobbyStartButton({ onStart }: { onStart: () => void }) {
  const players = useLobbyStore((s) => s.players);
  const [showConfirm, setShowConfirm] = useState(false);

  const nonGMPlayers = players.filter((p) => p.role !== "GM");
  const readyCount = nonGMPlayers.filter((p) => p.status === "ready").length;
  const notReadyCount = nonGMPlayers.length - readyCount;
  const canStart = readyCount >= 1;
  const allReady = nonGMPlayers.length > 0 && notReadyCount === 0;

  function handleClick() {
    if (allReady) {
      onStart();
    } else {
      setShowConfirm(true);
    }
  }

  return (
    <div className="space-y-2">
      {/* Confirm dialog */}
      {showConfirm && (
        <div className="rounded-xl border border-brand-border bg-brand-panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-brand-text">
              Iniciar sessão?
            </span>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-brand-muted hover:text-brand-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-3 space-y-1 text-xs text-brand-muted">
            <p>
              <span className="text-green-400">●</span> {readyCount} jogadores prontos
            </p>
            {notReadyCount > 0 && (
              <p>
                <span className="text-yellow-400">○</span> {notReadyCount} jogadores não prontos
              </p>
            )}
            <p className="mt-2 text-[10px]">
              Jogadores ausentes podem entrar depois (com aprovação).
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 rounded-lg border border-brand-border px-3 py-2 text-xs text-brand-muted transition-colors hover:bg-white/[0.04]"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                onStart();
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent/80"
            >
              <Rocket className="h-3.5 w-3.5" />
              Iniciar!
            </button>
          </div>
        </div>
      )}

      {/* Main button */}
      {!showConfirm && (
        <button
          onClick={handleClick}
          disabled={!canStart}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-brand-accent/80 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Rocket className="h-4.5 w-4.5" />
          INICIAR SESSÃO
        </button>
      )}
    </div>
  );
}
