"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "flash" | "pulse" | "fadeout";

interface OAAlertVignetteProps {
  active: boolean;
}

export function OAAlertVignette({ active }: OAAlertVignetteProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const prevActive = useRef(false);

  useEffect(() => {
    if (active && !prevActive.current) {
      // Transition: inactive → active
      setPhase("flash");
      const timer = setTimeout(() => setPhase("pulse"), 200);
      return () => clearTimeout(timer);
    }

    if (!active && prevActive.current) {
      // Transition: active → inactive
      setPhase("fadeout");
      const timer = setTimeout(() => setPhase("idle"), 400);
      return () => clearTimeout(timer);
    }

    prevActive.current = active;
  }, [active]);

  // Keep ref in sync outside the effect conditional
  useEffect(() => {
    prevActive.current = active;
  });

  if (phase === "idle") return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      {/* Vignette radial gradient */}
      <div
        className={
          phase === "flash"
            ? "animate-oa-flash absolute inset-0"
            : phase === "pulse"
              ? "animate-oa-pulse absolute inset-0"
              : "animate-oa-fadeout absolute inset-0"
        }
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(255,20,20,0.15) 75%, rgba(150,0,0,0.45) 100%)",
        }}
      />

      {/* Top edge glow */}
      <div
        className={
          phase === "fadeout"
            ? "animate-oa-fadeout animate-oa-border-pulse absolute inset-x-0 top-0 h-[2px]"
            : "animate-oa-border-pulse absolute inset-x-0 top-0 h-[2px]"
        }
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,60,60,0.8), transparent)",
          boxShadow: "0 0 12px 2px rgba(255,40,40,0.4)",
        }}
      />

      {/* Bottom edge glow */}
      <div
        className={
          phase === "fadeout"
            ? "animate-oa-fadeout animate-oa-border-pulse absolute inset-x-0 bottom-0 h-[2px]"
            : "animate-oa-border-pulse absolute inset-x-0 bottom-0 h-[2px]"
        }
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,60,60,0.8), transparent)",
          boxShadow: "0 0 12px 2px rgba(255,40,40,0.4)",
        }}
      />

      {/* Initial flash overlay */}
      {phase === "flash" && (
        <div
          className="animate-oa-initial-flash absolute inset-0"
          style={{ background: "rgba(255,40,40,0.12)" }}
        />
      )}
    </div>
  );
}
