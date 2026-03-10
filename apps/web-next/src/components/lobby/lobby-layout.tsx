"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLobbyStore } from "@/lib/lobby-store";
import { LobbyHeader } from "./lobby-header";
import { LobbyPlayerList } from "./lobby-player-list";
import { LobbyChat } from "./lobby-chat";
import { LobbyReadyBar } from "./lobby-ready-bar";
import { LobbyStartButton } from "./lobby-start-button";
import { LobbyConfig } from "./lobby-config";
import { LobbyJoinRequests } from "./lobby-join-request";
import { LobbyCountdown } from "./lobby-countdown";

export function LobbyLayout({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const setSessionInfo = useLobbyStore((s) => s.setSessionInfo);
  const setIsGM = useLobbyStore((s) => s.setIsGM);
  const setMyPlayerId = useLobbyStore((s) => s.setMyPlayerId);
  const setLobbyActive = useLobbyStore((s) => s.setLobbyActive);
  const setPlayers = useLobbyStore((s) => s.setPlayers);
  const addChatMessage = useLobbyStore((s) => s.addChatMessage);
  const startCountdown = useLobbyStore((s) => s.startCountdown);
  const sessionInfo = useLobbyStore((s) => s.sessionInfo);
  const countdownActive = useLobbyStore((s) => s.countdownActive);

  // TODO: load real session data via API/socket
  useEffect(() => {
    setLobbyActive(true);
  }, [setLobbyActive]);

  const handleStart = useCallback(() => {
    startCountdown(3);
  }, [startCountdown]);

  const handleCountdownFinish = useCallback(() => {
    router.push(`/gameplay/${sessionId}`);
  }, [router, sessionId]);

  if (!sessionInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F]">
        <div className="text-sm text-brand-muted">Carregando sala...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0F]">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-brand-border bg-[#111116] px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm font-semibold text-brand-text">
            Sala de Espera
          </span>
          <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] text-brand-muted">
            GM
          </span>
        </div>
        <span className="text-xs text-brand-muted">
          Sessão #{sessionInfo.id.replace("sess-", "")}
        </span>
      </header>

      {/* Content — 2-column layout */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 gap-6 p-6">
        {/* Left column — Session info + Players */}
        <div className="flex flex-1 flex-col gap-4">
          <LobbyHeader session={sessionInfo} />

          <div className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
            <LobbyPlayerList />
          </div>

          {/* Join requests (if any) */}
          <LobbyJoinRequests />

          {/* Ready bar + Start button */}
          <div className="mt-auto space-y-3">
            <LobbyReadyBar />
            <LobbyStartButton onStart={handleStart} />
          </div>
        </div>

        {/* Right column — Chat + Config */}
        <div className="flex w-80 flex-shrink-0 flex-col gap-4">
          <div className="flex-1 rounded-xl border border-brand-border bg-white/[0.02] p-4">
            <LobbyChat />
          </div>
          <LobbyConfig />
        </div>
      </div>

      {/* Countdown overlay */}
      {countdownActive && (
        <LobbyCountdown onFinish={handleCountdownFinish} />
      )}
    </div>
  );
}
