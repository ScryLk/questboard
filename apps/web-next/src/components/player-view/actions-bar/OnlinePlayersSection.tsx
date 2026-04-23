"use client";

import { Crown } from "lucide-react";
import { MOCK_PLAYERS } from "@/lib/gameplay-mock-data";
import { usePlayerViewStore } from "@/lib/player-view-store";

/**
 * Lista de quem está na sessão. Sem backend de presence real ainda —
 * status vem do mock. Atualiza quando dados reais chegarem (socket).
 */
export function OnlinePlayersSection() {
  const myPlayerId = usePlayerViewStore((s) => s.playerId);
  const gmName = usePlayerViewStore((s) => s.gmName);

  return (
    <div className="flex flex-col gap-1 px-1 py-1">
      <div className="flex items-center gap-2 px-2 py-1">
        <Crown className="h-3 w-3 text-brand-accent" />
        <span className="text-[11px] font-medium text-brand-text">
          {gmName || "Mestre"}
        </span>
        <span className="rounded bg-brand-accent/15 px-1 text-[8px] font-bold uppercase text-brand-accent">
          Mestre
        </span>
        <span className="ml-auto h-2 w-2 rounded-full bg-brand-success" />
      </div>
      {MOCK_PLAYERS.map((p) => {
        const isMe = p.id === myPlayerId;
        const isOnline = p.status === "online";
        return (
          <div
            key={p.id}
            className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white/[0.03]"
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
              style={{ backgroundColor: p.color + "30", color: p.color }}
            >
              {p.avatarInitials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-brand-text">
                {p.name}
                {isMe && (
                  <span className="ml-1 text-[9px] text-brand-muted">(você)</span>
                )}
              </p>
              <p className="truncate text-[9px] text-brand-muted">
                {p.character} · {p.class}
              </p>
            </div>
            <span
              className={`h-2 w-2 rounded-full ${
                isOnline ? "bg-brand-success" : "bg-brand-muted/40"
              }`}
              title={isOnline ? "Online" : "Offline"}
            />
          </div>
        );
      })}
      <p className="mt-1 px-2 text-[9px] text-brand-muted/60">
        Status em tempo real quando o backend estiver conectado.
      </p>
    </div>
  );
}
