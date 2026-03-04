"use client";

import { useEffect } from "react";
import type { PingEffect } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";

interface PingOverlayProps {
  pings: PingEffect[];
  scaledCell: number;
}

export function PingOverlay({ pings, scaledCell }: PingOverlayProps) {
  const removePing = useGameplayStore((s) => s.removePing);

  useEffect(() => {
    if (pings.length === 0) return;
    const timers = pings.map((p) =>
      setTimeout(() => removePing(p.id), 1500),
    );
    return () => timers.forEach(clearTimeout);
  }, [pings, removePing]);

  return (
    <>
      {pings.map((ping) => {
        const cx = ping.x * scaledCell + scaledCell / 2;
        const cy = ping.y * scaledCell + scaledCell / 2;
        return (
          <div
            key={ping.id}
            className="pointer-events-none absolute"
            style={{ left: cx - 30, top: cy - 30, width: 60, height: 60 }}
          >
            <div className="h-full w-full animate-ping rounded-full border-2 border-brand-accent bg-brand-accent/20" />
          </div>
        );
      })}
    </>
  );
}
