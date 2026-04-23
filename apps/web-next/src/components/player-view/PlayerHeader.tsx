"use client";

import { useEffect, useState } from "react";
import {
  Volume2,
  VolumeX,
  User,
  LogOut,
  Map,
  Radio,
  Pause,
  Square,
  ChevronDown,
  Swords,
} from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";
import { MOCK_SESSION, MOCK_PLAYERS, getElapsedTime } from "@/lib/gameplay-mock-data";
import { LeaveSessionDialog } from "./actions-bar/LeaveSessionDialog";

export function PlayerHeader() {
  const playerId = usePlayerViewStore((s) => s.playerId);
  const playerName = usePlayerViewStore((s) => s.playerName);
  const sessionCode = usePlayerViewStore((s) => s.sessionCode);
  const myToken = usePlayerViewStore((s) => s.myToken);
  const soundtrack = usePlayerViewStore((s) => s.soundtrack);
  const toggleMute = usePlayerViewStore((s) => s.toggleMute);
  const connected = usePlayerViewStore((s) => s.connected);
  const activeMapName = usePlayerViewStore((s) => s.activeMapName);
  const sessionPaused = usePlayerViewStore((s) => s.sessionPaused);
  const sessionEnded = usePlayerViewStore((s) => s.sessionEnded);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLeave, setShowLeave] = useState(false);

  const [elapsed, setElapsed] = useState(() =>
    getElapsedTime(MOCK_SESSION.startedAt),
  );
  useEffect(() => {
    // Tempo decorrido só atualiza se a sessão está ativa — evita ticar
    // quando pausada ou encerrada.
    if (sessionPaused || sessionEnded) return;
    const id = setInterval(
      () => setElapsed(getElapsedTime(MOCK_SESSION.startedAt)),
      60_000,
    );
    return () => clearInterval(id);
  }, [sessionPaused, sessionEnded]);

  const characterName = myToken?.name ?? playerName ?? "Jogador";
  const player = MOCK_PLAYERS.find((p) => p.id === playerId);

  // Título da sessão: prefere sessionCode real do store, senão fallback.
  const sessionTitle = sessionCode
    ? `Sessão ${sessionCode}`
    : MOCK_SESSION.name
      ? `Sessão #${MOCK_SESSION.number} — ${MOCK_SESSION.name}`
      : "Sessão";

  // Badge de status — reflete sessionPaused/sessionEnded do store.
  const status: "live" | "paused" | "ended" = sessionEnded
    ? "ended"
    : sessionPaused
      ? "paused"
      : "live";
  const statusConfig = {
    live: {
      icon: Radio,
      label: "AO VIVO",
      extra: elapsed,
      classes: "bg-brand-success/15 text-brand-success",
    },
    paused: {
      icon: Pause,
      label: "PAUSADA",
      extra: null as string | null,
      classes: "bg-brand-warning/15 text-brand-warning",
    },
    ended: {
      icon: Square,
      label: "ENCERRADA",
      extra: null as string | null,
      classes: "bg-brand-muted/15 text-brand-muted",
    },
  }[status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex h-12 shrink-0 items-center border-b border-brand-border bg-[#0D0D12] px-3">
      {/* Left — Logo + Session info */}
      <div className="flex min-w-0 shrink items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Swords className="h-4 w-4 text-brand-accent" />
          <span className="hidden text-sm font-bold text-brand-accent sm:inline">
            QuestBoard
          </span>
        </div>

        <div className="hidden min-w-0 items-baseline gap-2 sm:flex">
          <span className="truncate text-sm font-semibold text-brand-text">
            {sessionTitle}
          </span>
          <span className="hidden shrink-0 text-xs text-brand-muted lg:inline">
            {MOCK_SESSION.campaign}
          </span>
        </div>

        {/* Mobile: short title */}
        <span className="truncate text-sm font-semibold text-brand-text sm:hidden">
          {sessionCode || `Sessão #${MOCK_SESSION.number}`}
        </span>

        {/* Status badge — dinâmico */}
        <div
          className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 ${statusConfig.classes}`}
        >
          <StatusIcon className="h-3 w-3" />
          <span className="text-[11px] font-medium">
            <span className="hidden sm:inline">{statusConfig.label}</span>
            {statusConfig.extra && (
              <span className="sm:ml-1">{statusConfig.extra}</span>
            )}
          </span>
        </div>

        {/* Current map indicator */}
        {activeMapName ? (
          <div className="hidden items-center gap-1.5 rounded-md bg-brand-accent/10 px-2 py-0.5 sm:flex">
            <Map className="h-3 w-3 text-brand-accent/70" />
            <span className="max-w-[140px] truncate text-[11px] font-medium text-brand-accent/70">
              {activeMapName}
            </span>
          </div>
        ) : (
          <div className="hidden items-center gap-1.5 rounded-md bg-white/[0.03] px-2 py-0.5 sm:flex">
            <Map className="h-3 w-3 text-brand-muted" />
            <span className="text-[11px] font-medium text-brand-muted">
              Sem mapa ativo
            </span>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right — Volume, Character, Leave */}
      <div className="flex items-center gap-1.5">
        {/* Volume toggle */}
        {soundtrack.playing && (
          <button
            onClick={toggleMute}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
            title={soundtrack.muted ? "Ativar som" : "Silenciar"}
          >
            {soundtrack.muted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Connection dot */}
        <div
          className={`h-2 w-2 rounded-full ${
            connected ? "bg-brand-success" : "bg-brand-danger"
          }`}
          title={connected ? "Conectado" : "Desconectado"}
        />

        {/* Character dropdown — avatar com iniciais se há player real */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-brand-text transition-colors hover:bg-white/[0.06]"
          >
            {player ? (
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  backgroundColor: player.color + "30",
                  color: player.color,
                }}
              >
                {player.avatarInitials}
              </span>
            ) : (
              <User className="h-4 w-4 text-brand-muted" />
            )}
            <span className="hidden text-xs font-medium sm:inline">
              {characterName}
            </span>
            <ChevronDown className="h-3 w-3 text-brand-muted" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-brand-border bg-brand-surface py-1 shadow-lg">
                <div className="border-b border-brand-border px-3 py-2">
                  <p className="text-xs font-semibold text-brand-text">
                    {characterName}
                  </p>
                  <p className="text-[10px] text-brand-muted">
                    {playerName || "Jogador"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    setShowLeave(true);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-xs text-brand-danger transition-colors hover:bg-brand-danger/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sair da sessão
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showLeave && <LeaveSessionDialog onClose={() => setShowLeave(false)} />}
    </div>
  );
}
