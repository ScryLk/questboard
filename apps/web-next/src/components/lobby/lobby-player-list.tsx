"use client";

import { Users } from "lucide-react";
import { useLobbyStore } from "@/lib/lobby-store";
import { LobbyPlayerCard } from "./lobby-player-card";

export function LobbyPlayerList() {
  const players = useLobbyStore((s) => s.players);
  const maxPlayers = useLobbyStore((s) => s.sessionInfo?.maxPlayers ?? 6);

  const activePlayers = players.filter((p) => p.status !== "disconnected");

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-1 pb-1">
        <Users className="h-3.5 w-3.5 text-brand-muted" />
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
          Jogadores ({activePlayers.length}/{maxPlayers})
        </span>
      </div>

      <div className="space-y-0.5">
        {players.map((player) => (
          <LobbyPlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
}
