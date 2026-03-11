"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Volume2,
  VolumeX,
  User,
  LogOut,
  Map,
  Radio,
  ChevronDown,
  Swords,
} from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";
import { MOCK_SESSION, getElapsedTime } from "@/lib/gameplay-mock-data";

export function PlayerHeader() {
  const playerName = usePlayerViewStore((s) => s.playerName);
  const myToken = usePlayerViewStore((s) => s.myToken);
  const soundtrack = usePlayerViewStore((s) => s.soundtrack);
  const toggleMute = usePlayerViewStore((s) => s.toggleMute);
  const connected = usePlayerViewStore((s) => s.connected);
  const activeMapName = usePlayerViewStore((s) => s.activeMapName);
  const [showDropdown, setShowDropdown] = useState(false);

  const [elapsed, setElapsed] = useState(() => getElapsedTime(MOCK_SESSION.startedAt));
  useEffect(() => {
    const id = setInterval(() => setElapsed(getElapsedTime(MOCK_SESSION.startedAt)), 60_000);
    return () => clearInterval(id);
  }, []);

  const characterName = myToken?.name ?? playerName ?? "Jogador";

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
            Sessao #{MOCK_SESSION.number} — {MOCK_SESSION.name}
          </span>
          <span className="hidden shrink-0 text-xs text-brand-muted lg:inline">
            {MOCK_SESSION.campaign}
          </span>
        </div>

        {/* Mobile: short title */}
        <span className="truncate text-sm font-semibold text-brand-text sm:hidden">
          Sessao #{MOCK_SESSION.number}
        </span>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 rounded-md bg-brand-success/15 px-2 py-0.5">
          <Radio className="h-3 w-3 text-brand-success" />
          <span className="text-[11px] font-medium text-brand-success">
            <span className="hidden sm:inline">AO VIVO </span>
            {elapsed}
          </span>
        </div>

        {/* Current map indicator */}
        {activeMapName && (
          <div className="hidden items-center gap-1.5 rounded-md bg-brand-accent/10 px-2 py-0.5 sm:flex">
            <Map className="h-3 w-3 text-brand-accent/70" />
            <span className="max-w-[140px] truncate text-[11px] font-medium text-brand-accent/70">
              {activeMapName}
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
            className="flex h-8 w-8 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
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

        {/* Character dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-brand-text transition-colors hover:bg-white/[0.06]"
          >
            <User className="h-3.5 w-3.5 text-brand-muted" />
            <span className="hidden text-xs font-medium sm:inline">{characterName}</span>
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
                  <p className="text-[10px] text-brand-muted">{playerName}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Would navigate away in real app
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-brand-danger transition-colors hover:bg-brand-danger/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sair da Sessao
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
