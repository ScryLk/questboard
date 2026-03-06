"use client";

import {
  CheckCircle2,
  Circle,
  Loader2,
  Clock,
  Wifi,
  WifiOff,
  Crown,
} from "lucide-react";
import type { LobbyPlayer, PlayerLobbyStatus } from "@/lib/lobby-store";

function statusConfig(status: PlayerLobbyStatus) {
  switch (status) {
    case "ready":
      return { color: "text-green-400", bg: "bg-green-500", label: "Pronto", Icon: CheckCircle2 };
    case "not_ready":
      return { color: "text-yellow-400", bg: "bg-yellow-500", label: "Não pronto", Icon: Circle };
    case "choosing_character":
      return { color: "text-yellow-400", bg: "bg-yellow-500", label: "Escolhendo...", Icon: Loader2 };
    case "connecting":
      return { color: "text-blue-400", bg: "bg-blue-500", label: "Conectando", Icon: Wifi };
    case "afk":
      return { color: "text-orange-400", bg: "bg-orange-500", label: "Ausente", Icon: Clock };
    case "disconnected":
      return { color: "text-zinc-500", bg: "bg-zinc-600", label: "Desconectou", Icon: WifiOff };
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function LobbyPlayerCard({ player }: { player: LobbyPlayer }) {
  const { color, label, Icon } = statusConfig(player.status);
  const isGM = player.role === "GM";
  const initials = getInitials(player.name);

  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.03]">
      {/* Avatar */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
          isGM ? "bg-brand-accent/20" : "bg-white/[0.08]"
        }`}
      >
        <span
          className={`text-sm font-bold ${isGM ? "text-brand-accent" : "text-brand-muted"}`}
        >
          {initials}
        </span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-brand-text">
            {player.name}
          </span>
          {isGM && <Crown className="h-3 w-3 flex-shrink-0 text-brand-accent" />}
        </div>
        {player.characterName ? (
          <p className="truncate text-xs text-brand-muted">
            {player.characterName}
            {player.characterClass && ` · ${player.characterClass}`}
            {player.characterLevel && ` Nv.${player.characterLevel}`}
          </p>
        ) : (
          !isGM && (
            <p className="text-xs italic text-brand-muted">
              {player.status === "choosing_character"
                ? "Escolhendo personagem..."
                : "Sem personagem"}
            </p>
          )
        )}
      </div>

      {/* Status */}
      <div className={`flex items-center gap-1.5 ${color}`}>
        <Icon
          className={`h-3.5 w-3.5 ${player.status === "choosing_character" ? "animate-spin" : ""}`}
        />
        <span className="text-xs font-medium">{label}</span>
      </div>
    </div>
  );
}
