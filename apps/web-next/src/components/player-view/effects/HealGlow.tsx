"use client";

import { usePlayerViewStore } from "@/lib/player-view-store";

export function HealGlow() {
  const active = usePlayerViewStore((s) => s.healGlow);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[150]"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(0, 184, 148, 0.1) 0%, transparent 60%)",
        animation: "healGlowPulse 400ms ease-out forwards",
      }}
    >
      <style jsx>{`
        @keyframes healGlowPulse {
          0% {
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
