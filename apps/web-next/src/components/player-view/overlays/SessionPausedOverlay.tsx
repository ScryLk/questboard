"use client";

import { Pause } from "lucide-react";

export function SessionPausedOverlay() {
  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-warning/10">
          <Pause className="h-8 w-8 text-brand-warning" />
        </div>
        <h2 className="text-xl font-bold text-brand-text">Sessão pausada</h2>
        <p className="text-sm text-brand-muted">
          Aguardando o mestre retomar a sessão…
        </p>

        {/* Pulsing dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-brand-warning/40"
              style={{
                animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
