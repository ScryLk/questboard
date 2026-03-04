"use client";

import { Wifi, WifiOff } from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";

export function ConnectionStatus() {
  const connected = usePlayerViewStore((s) => s.connected);

  if (connected) return null;

  return (
    <div className="fixed left-1/2 top-14 z-[100] -translate-x-1/2 rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-brand-danger" />
        <span className="text-xs font-medium text-brand-danger">
          Desconectado — Tentando reconectar...
        </span>
      </div>
    </div>
  );
}
