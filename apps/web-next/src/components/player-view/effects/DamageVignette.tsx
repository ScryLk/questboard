"use client";

import { usePlayerViewStore } from "@/lib/player-view-store";

export function DamageVignette() {
  const active = usePlayerViewStore((s) => s.damageVignette);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[150]"
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 50%, rgba(255, 0, 0, 0.25) 100%)",
        animation: "vignetteFlash 300ms ease-out forwards",
      }}
    >
      <style jsx>{`
        @keyframes vignetteFlash {
          0% {
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
