"use client";

import {
  ChevronDown,
  ChevronRight,
  Users,
  UserPlus,
} from "lucide-react";
import { MOCK_PLAYERS } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import { HPBar } from "../shared/hp-bar";
import { GameTooltip } from "@/components/ui/game-tooltip";
import { StatusDot } from "../shared/status-dot";

export function PlayerList() {
  const collapsed = useGameplayStore((s) => s.collapsedSections["players"]);
  const toggleSection = useGameplayStore((s) => s.toggleSection);
  const openModal = useGameplayStore((s) => s.openModal);

  const onlineCount = MOCK_PLAYERS.filter((p) => p.status === "online").length;

  return (
    <div className="border-b border-brand-border">
      {/* Header */}
      <div className="flex items-center transition-colors hover:bg-white/[0.02]">
        <button
          onClick={() => toggleSection("players")}
          className="flex flex-1 items-center gap-2 px-3 py-2 text-left"
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
            {onlineCount}/{MOCK_PLAYERS.length} online
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
          {MOCK_PLAYERS.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-[10px] text-brand-muted">
                Nenhum jogador ainda. Convide com o botão acima.
              </p>
            </div>
          ) : MOCK_PLAYERS.map((player) => (
            <div
              key={player.id}
              className="group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.03]"
            >
              {/* Avatar */}
              <div className="relative">
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                  style={{
                    backgroundColor: player.color + "20",
                    color: player.color,
                  }}
                >
                  {player.avatarInitials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5">
                  <StatusDot status={player.status} size={6} />
                </div>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1">
                  <span className="truncate text-[11px] font-medium text-brand-text">
                    {player.name}
                  </span>
                  <span className="truncate text-[10px] text-brand-muted">
                    {player.character}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-brand-muted">
                    {player.class} Nv.{player.level}
                  </span>
                </div>
                <HPBar
                  hp={player.hp}
                  maxHp={player.maxHp}
                  height={3}
                  className="mt-0.5"
                />
              </div>

              {/* HP */}
              <span className="text-[10px] tabular-nums text-brand-muted">
                {player.hp}/{player.maxHp}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
