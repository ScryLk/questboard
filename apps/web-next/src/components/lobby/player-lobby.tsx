"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, LogIn, Swords } from "lucide-react";
import { useLobbyStore } from "@/lib/lobby-store";
import { onBroadcastMessage, broadcastSend } from "@/lib/broadcast-sync";
import type { LobbyPlayer } from "@/lib/lobby-store";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function PlayerLobby({
  sessionCode,
  playerName,
}: {
  sessionCode: string;
  playerName: string;
}) {
  const router = useRouter();
  const players = useLobbyStore((s) => s.players);
  const setPlayers = useLobbyStore((s) => s.setPlayers);
  const sessionInfo = useLobbyStore((s) => s.sessionInfo);
  const setSessionInfo = useLobbyStore((s) => s.setSessionInfo);
  const countdownActive = useLobbyStore((s) => s.countdownActive);
  const countdownSeconds = useLobbyStore((s) => s.countdownSeconds);
  const startCountdown = useLobbyStore((s) => s.startCountdown);
  const tickCountdown = useLobbyStore((s) => s.tickCountdown);

  const [isReady, setIsReady] = useState(false);

  // Listen for broadcast messages
  useEffect(() => {
    const cleanup = onBroadcastMessage("player-lobby", (msg) => {
      switch (msg.type) {
        case "lobby:session-info":
          setSessionInfo(msg.payload as typeof sessionInfo & object);
          break;
        case "lobby:player-list":
          setPlayers(msg.payload as LobbyPlayer[]);
          break;
        case "lobby:countdown-start":
          startCountdown((msg.payload as { seconds: number }).seconds);
          break;
        case "lobby:countdown-cancel":
          useLobbyStore.getState().cancelCountdown();
          break;
        case "lobby:session-start":
          router.push(`/play/${sessionCode}`);
          break;
      }
    });

    // Announce ourselves to GM
    broadcastSend("lobby:join-request", { playerName }, `player-${Date.now()}`);

    return cleanup;
  }, [sessionCode, playerName, router, setSessionInfo, setPlayers, startCountdown]);

  // Countdown tick
  useEffect(() => {
    if (!countdownActive) return;
    const timer = setInterval(tickCountdown, 1000);
    return () => clearInterval(timer);
  }, [countdownActive, tickCountdown]);

  function handleToggleReady() {
    const next = !isReady;
    setIsReady(next);
    broadcastSend(
      "lobby:ready",
      { ready: next, playerName },
      `player-${playerName}`,
    );
  }

  const nonGMPlayers = players.filter((p) => p.role !== "GM");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0F] p-4">
      {/* Countdown overlay */}
      {countdownActive && countdownSeconds > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Swords className="h-12 w-12 text-brand-accent/60" />
            <span className="text-8xl font-black tabular-nums text-brand-accent">
              {countdownSeconds}
            </span>
            <p className="text-lg font-semibold text-brand-muted">
              A sessão vai começar...
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent/15">
            <LogIn className="h-6 w-6 text-brand-accent" />
          </div>
          <h1 className="text-xl font-bold text-brand-text">
            {sessionInfo?.name ?? "Sala de Espera"}
          </h1>
          <p className="mt-1 text-sm text-brand-muted">
            {sessionInfo?.campaignName ?? sessionCode}
          </p>
        </div>

        {/* Player card — you */}
        <div className="rounded-xl border border-brand-accent/20 bg-brand-accent/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent/20">
              <span className="text-sm font-bold text-brand-accent">
                {getInitials(playerName)}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-brand-text">
                {playerName}
              </p>
              <p className="text-xs text-brand-muted">Você</p>
            </div>
            {isReady ? (
              <span className="flex items-center gap-1 text-xs font-medium text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Pronto
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-yellow-400">
                <Clock className="h-3.5 w-3.5" /> Não pronto
              </span>
            )}
          </div>
        </div>

        {/* Others in lobby */}
        {nonGMPlayers.length > 0 && (
          <div className="rounded-xl border border-brand-border bg-white/[0.02] p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Jogadores na Sala
            </p>
            <div className="space-y-1.5">
              {nonGMPlayers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 rounded px-2 py-1.5"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.08]">
                    <span className="text-[10px] font-bold text-brand-muted">
                      {getInitials(p.name)}
                    </span>
                  </div>
                  <span className="flex-1 truncate text-xs text-brand-text">
                    {p.name}
                  </span>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      p.status === "ready" ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ready button */}
        <button
          onClick={handleToggleReady}
          className={`w-full rounded-xl px-4 py-3.5 text-sm font-bold transition-all ${
            isReady
              ? "border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
              : "bg-brand-accent text-white hover:bg-brand-accent/80"
          }`}
        >
          {isReady ? "PRONTO ✓ (clique para cancelar)" : "ESTOU PRONTO"}
        </button>

        {/* Waiting message */}
        <p className="text-center text-xs text-brand-muted">
          Aguardando o GM iniciar a sessão...
        </p>
      </div>
    </div>
  );
}
