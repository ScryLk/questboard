"use client";

// Lista de jogadores do GM. Consome /sessions/:id/players + listen
// socket `session:player-joined`. Sem sessionId (modo dev offline), a
// lista fica vazia e o empty state aparece.

import { useParams } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Users,
  UserPlus,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useSessionPlayers } from "@/hooks/use-session-players";
import { GameTooltip } from "@/components/ui/game-tooltip";

export function PlayerList() {
  const collapsed = useGameplayStore((s) => s.collapsedSections["players"]);
  const toggleSection = useGameplayStore((s) => s.toggleSection);
  const openModal = useGameplayStore((s) => s.openModal);

  const params = useParams<{ sessionId?: string }>();
  const sessionId = params?.sessionId ?? null;
  const { players, loading, error } = useSessionPlayers(sessionId);

  return (
    <div className="border-b border-brand-border">
      {/* Header */}
      <div className="flex items-center transition-colors hover:bg-white/[0.02]">
        <button
          onClick={() => toggleSection("players")}
          className="flex flex-1 cursor-pointer items-center gap-2 px-3 py-2 text-left"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-brand-muted" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-brand-muted" />
          )}
          <Users className="h-3.5 w-3.5 text-brand-accent" />
          <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-brand-text">
            Jogadores
          </span>
          <span className="text-[11px] text-brand-muted">
            {players.length} {players.length === 1 ? "membro" : "membros"}
          </span>
        </button>
        <GameTooltip label="Convidar Jogador" side="bottom">
          <button
            onClick={() => openModal("invitePlayers")}
            className="mr-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg text-brand-accent transition-colors hover:bg-white/10"
          >
            <UserPlus className="h-3.5 w-3.5" />
          </button>
        </GameTooltip>
      </div>

      {!collapsed && (
        <div className="px-1.5 pb-1.5">
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-4 text-[11px] text-brand-muted">
              <Loader2 className="h-3 w-3 animate-spin" />
              Carregando...
            </div>
          ) : error ? (
            <p className="px-3 py-4 text-center text-[10px] text-rose-300">
              {error}
            </p>
          ) : players.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-[10px] text-brand-muted">
                Nenhum jogador ainda. Convide com o botão acima.
              </p>
            </div>
          ) : (
            players.map((player) => {
              const initials = player.user.displayName
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              const isGm = player.role === "GM" || player.role === "CO_GM";
              return (
                <div
                  key={player.userId}
                  className="group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-[9px] font-bold text-brand-text">
                    {player.user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={player.user.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-brand-text">
                      {player.user.displayName}
                    </p>
                    <p className="text-[10px] text-brand-muted">
                      {player.role === "GM"
                        ? "Mestre"
                        : player.role === "CO_GM"
                          ? "Co-Mestre"
                          : player.role === "SPECTATOR"
                            ? "Espectador"
                            : "Jogador"}
                    </p>
                  </div>
                  {isGm && (
                    <span className="rounded bg-brand-accent/15 px-1.5 py-0.5 text-[9px] font-semibold text-brand-accent">
                      GM
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
