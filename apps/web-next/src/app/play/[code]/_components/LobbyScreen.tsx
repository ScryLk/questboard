"use client";

import { Clock, Check, Loader2, Swords } from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";

export function LobbyScreen() {
  const playerName = usePlayerViewStore((s) => s.playerName);
  const campaignName = usePlayerViewStore((s) => s.campaignName) || "A Maldição de Strahd";
  const sessionNumber = usePlayerViewStore((s) => s.sessionNumber) || 13;
  const lobbyPlayers = usePlayerViewStore((s) => s.lobbyPlayers);

  // Mock extra players for demo
  const allPlayers = lobbyPlayers.length > 0
    ? lobbyPlayers
    : [
        { id: "p1", name: playerName || "Você", characterId: "c1", characterName: "Thorin", ready: true, isMe: true },
        { id: "p2", name: "Ana", characterId: "c2", characterName: "Elara", ready: true, isMe: false },
        { id: "p3", name: "Pedro", characterId: "c3", characterName: "Zara", ready: true, isMe: false },
        { id: "p4", name: null, characterId: null, characterName: null, ready: false, isMe: false },
      ];

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      {/* Waiting indicator */}
      <div className="mb-8 flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center">
          <Clock className="h-5 w-5 text-brand-accent" />
          <div className="absolute inset-0 animate-ping rounded-full bg-brand-accent/20" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Aguardando o Mestre...</h2>
          <p className="text-xs text-white/40">A sessão começará em breve</p>
        </div>
      </div>

      {/* Player list */}
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
        {allPlayers.map((player, i) => (
          <div
            key={player.id ?? `slot-${i}`}
            className={`flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0 ${
              player.isMe ? "bg-brand-accent/5" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                player.characterName
                  ? "bg-brand-accent/20 text-brand-accent"
                  : "bg-white/5 text-white/20"
              }`}
            >
              {player.characterName
                ? player.characterName.slice(0, 2).toUpperCase()
                : "?"}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              {player.characterName ? (
                <>
                  <p className="truncate text-sm font-medium text-white">
                    {player.characterName}
                    {player.isMe && (
                      <span className="ml-1.5 text-xs text-brand-accent">(você)</span>
                    )}
                  </p>
                  <p className="text-xs text-white/40">{player.name}</p>
                </>
              ) : (
                <p className="text-sm text-white/20">aguardando...</p>
              )}
            </div>

            {/* Status */}
            <div className="shrink-0">
              {player.ready ? (
                <Check className="h-4 w-4 text-brand-success" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-white/20" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Campaign info */}
      <div className="mt-6 text-center">
        <p className="text-sm text-white/60">{campaignName}</p>
        <p className="text-xs text-white/30">Sessão #{sessionNumber}</p>
      </div>

      {/* Quick start for demo */}
      <button
        type="button"
        onClick={() => {
          usePlayerViewStore.getState().setJoinStep("playing");
        }}
        className="mt-8 flex items-center gap-2 rounded-xl border border-brand-accent/30 bg-brand-accent/10 px-6 py-3 text-sm font-medium text-brand-accent transition-all active:scale-[0.98] hover:bg-brand-accent/20"
      >
        <Swords className="h-4 w-4" />
        Iniciar Demo (pular espera)
      </button>
    </div>
  );
}
