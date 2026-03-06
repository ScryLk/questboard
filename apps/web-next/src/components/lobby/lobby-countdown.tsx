"use client";

import { useEffect } from "react";
import { Swords } from "lucide-react";
import { useLobbyStore } from "@/lib/lobby-store";

export function LobbyCountdown({ onFinish }: { onFinish: () => void }) {
  const countdownActive = useLobbyStore((s) => s.countdownActive);
  const countdownSeconds = useLobbyStore((s) => s.countdownSeconds);
  const tickCountdown = useLobbyStore((s) => s.tickCountdown);

  useEffect(() => {
    if (!countdownActive) return;

    const timer = setInterval(() => {
      tickCountdown();
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownActive, tickCountdown]);

  // When countdown finishes (reaches 0 while active was true)
  useEffect(() => {
    if (countdownActive && countdownSeconds <= 0) {
      onFinish();
    }
  }, [countdownActive, countdownSeconds, onFinish]);

  if (!countdownActive || countdownSeconds <= 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Radial pulse rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-64 w-64 animate-ping rounded-full bg-brand-accent/10" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="h-48 w-48 animate-ping rounded-full bg-brand-accent/15"
          style={{ animationDelay: "0.2s" }}
        />
      </div>

      {/* Counter */}
      <div className="relative flex flex-col items-center gap-4">
        <Swords className="h-12 w-12 text-brand-accent/60" />
        <span
          key={countdownSeconds}
          className="animate-bounce text-8xl font-black tabular-nums text-brand-accent drop-shadow-[0_0_40px_rgba(var(--brand-accent-rgb,168,85,247),0.5)]"
        >
          {countdownSeconds}
        </span>
        <p className="text-lg font-semibold tracking-wide text-brand-muted">
          A sessão vai começar...
        </p>
      </div>
    </div>
  );
}
