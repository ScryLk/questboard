"use client";

import { useLobbyStore } from "@/lib/lobby-store";

export function LobbyReadyBar() {
  const players = useLobbyStore((s) => s.players);

  const nonGMPlayers = players.filter((p) => p.role !== "GM");
  const readyCount = nonGMPlayers.filter((p) => p.status === "ready").length;
  const total = nonGMPlayers.length;
  const percent = total > 0 ? (readyCount / total) * 100 : 0;
  const allReady = total > 0 && readyCount === total;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-brand-muted">
          {readyCount} de {total} prontos
        </span>
        <span className="text-xs font-medium text-brand-muted">
          {Math.round(percent)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            allReady ? "bg-green-500" : "bg-brand-accent"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Player dots */}
      <div className="flex items-center justify-center gap-2">
        {nonGMPlayers.map((p) => (
          <div key={p.id} className="flex items-center gap-1">
            <div
              className={`h-2 w-2 rounded-full ${
                p.status === "ready"
                  ? "bg-green-500"
                  : p.status === "disconnected"
                    ? "bg-zinc-600"
                    : "bg-yellow-500"
              }`}
            />
            <span className="text-[10px] text-brand-muted">
              {p.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
