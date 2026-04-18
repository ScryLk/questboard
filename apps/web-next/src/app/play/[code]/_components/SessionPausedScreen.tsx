"use client";

import { Pause } from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";

export function SessionPausedScreen() {
  const campaignName = usePlayerViewStore((s) => s.campaignName) || "Sessão";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="relative mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E17055]/10">
          <Pause className="h-8 w-8 text-[#E17055]" />
        </div>
        <div className="absolute inset-0 animate-pulse rounded-full bg-[#E17055]/5" />
      </div>

      <h2 className="text-xl font-bold text-white">Sessão Pausada</h2>
      <p className="mt-2 text-sm text-white/40 text-center max-w-xs">
        O mestre pausou a sessão. Aguarde até que ele retome o jogo.
      </p>

      <div className="mt-6 text-center">
        <p className="text-sm text-white/60">{campaignName}</p>
      </div>
    </div>
  );
}
