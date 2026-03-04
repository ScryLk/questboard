"use client";

import { useEffect, useRef } from "react";
import { usePlayerViewStore } from "@/lib/player-view-store";

export function NatCelebration() {
  const natType = usePlayerViewStore((s) => s.natCelebration);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!natType || natType !== "nat20") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Confetti particles
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
      life: number;
    }[] = [];

    const colors = ["#FFD700", "#FF6B6B", "#6C5CE7", "#00B894", "#FF9F43", "#FFFFFF"];

    // Spawn confetti
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        life: 1,
      });
    }

    let animId: number;
    const startTime = Date.now();

    function render() {
      if (!ctx || !canvas) return;
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed > 2.5) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.vy += 0.08; // gravity
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.life = Math.max(0, 1 - elapsed / 2.5);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [natType]);

  if (!natType) return null;

  return (
    <>
      {/* Flash overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[160]"
        style={{
          background:
            natType === "nat20"
              ? "radial-gradient(ellipse at center, rgba(255, 215, 0, 0.2) 0%, transparent 60%)"
              : "radial-gradient(ellipse at center, rgba(255, 0, 0, 0.15) 0%, transparent 60%)",
          animation: "natFlash 400ms ease-out forwards",
        }}
      />

      {/* Confetti canvas (nat20 only) */}
      {natType === "nat20" && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none fixed inset-0 z-[161]"
        />
      )}

      {/* Nat 1 — sad flash */}
      {natType === "nat1" && (
        <div
          className="pointer-events-none fixed inset-0 z-[160]"
          style={{
            background: "rgba(255, 0, 0, 0.1)",
            animation: "natFlash 500ms ease-out forwards",
          }}
        />
      )}

      <style jsx>{`
        @keyframes natFlash {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
