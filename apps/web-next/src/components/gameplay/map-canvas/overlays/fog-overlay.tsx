"use client";

import { useEffect, useRef } from "react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { FOG_COLOR_THEMES } from "@/lib/gameplay-mock-data";
import type { FogColor } from "@/lib/gameplay-mock-data";
import {
  generateNoiseTexture,
  getCellEdgeInfo,
  getVisibleCells,
  spawnParticles,
  updateParticles,
  parseCellKey,
} from "@/lib/fog-utils";
import type { FogParticle } from "@/lib/fog-utils";
import { CELL_SIZE } from "@/lib/gameplay/constants";

interface FogOverlayProps {
  canvasW: number;
  canvasH: number;
  scaledCell: number;
  scrollLeft: number;
  scrollTop: number;
  viewportW: number;
  viewportH: number;
}

export function FogOverlay({
  canvasW,
  canvasH,
  scaledCell,
  scrollLeft,
  scrollTop,
  viewportW,
  viewportH,
}: FogOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mutable refs — all read inside rAF, never cause React re-renders
  const noiseTextureRef = useRef<ImageBitmap | null>(null);
  const noiseColorRef = useRef<FogColor>("gray");
  const particlesRef = useRef<FogParticle[]>([]);
  const lastFrameRef = useRef(0);
  const driftRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const fpsHistoryRef = useRef<number[]>([]);
  const fallbackStyleRef = useRef<"fog" | "shadows" | "solid">("fog");

  // Viewport values stored as refs — loop reads latest without restarting
  const viewportRef = useRef({ scrollLeft, scrollTop, viewportW, viewportH, scaledCell });
  viewportRef.current = { scrollLeft, scrollTop, viewportW, viewportH, scaledCell };

  // Generate noise texture on mount
  useEffect(() => {
    const state = useGameplayStore.getState();
    const color = state.fogSettings.color;
    noiseColorRef.current = color;

    const imageData = generateNoiseTexture(color);
    createImageBitmap(imageData).then((bitmap) => {
      noiseTextureRef.current = bitmap;
    });
  }, []);

  // Main animation loop — runs ONCE, never restarts on scroll/viewport changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId = 0;

    function render(timestamp: number) {
      if (!ctx || !canvas) return;
      const dt = lastFrameRef.current
        ? Math.min((timestamp - lastFrameRef.current) / 1000, 0.1)
        : 0.016;
      lastFrameRef.current = timestamp;
      timeRef.current += dt;

      // FPS monitoring for auto-fallback
      if (dt > 0) {
        const fps = 1 / dt;
        const hist = fpsHistoryRef.current;
        hist.push(fps);
        if (hist.length > 60) hist.shift();
        if (hist.length === 60) {
          const avg = hist.reduce((a, b) => a + b, 0) / 60;
          if (avg < 20) fallbackStyleRef.current = "solid";
          else if (avg < 30) fallbackStyleRef.current = "shadows";
          else fallbackStyleRef.current = "fog";
        }
      }

      // Read store without triggering React re-renders
      const state = useGameplayStore.getState();
      const { fogCells, fogSettings, recentlyRevealedCells, recentlyCoveredCells } = state;

      // Manual fog only
      const effectiveFog = fogCells;

      if (effectiveFog.size === 0 && particlesRef.current.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animId = requestAnimationFrame(render);
        return;
      }

      // Regenerate noise texture if color changed
      if (fogSettings.color !== noiseColorRef.current) {
        noiseColorRef.current = fogSettings.color;
        const imageData = generateNoiseTexture(fogSettings.color);
        createImageBitmap(imageData).then((bitmap) => {
          noiseTextureRef.current = bitmap;
        });
      }

      const theme = FOG_COLOR_THEMES[fogSettings.color];
      const { r, g, b } = theme;
      const density = fogSettings.density;

      // Determine effective style (may be downgraded by FPS monitor)
      const styleOrder: ("fog" | "shadows" | "solid")[] = ["fog", "shadows", "solid"];
      const requestedIdx = styleOrder.indexOf(fogSettings.style as "fog" | "shadows" | "solid");
      const fallbackIdx = styleOrder.indexOf(fallbackStyleRef.current);
      const effectiveStyle = styleOrder[Math.max(requestedIdx, fallbackIdx)];

      // Read viewport from ref (always latest, no effect restart)
      const vp = viewportRef.current;
      const sc = vp.scaledCell;

      // Viewport culling
      const visibleKeys = getVisibleCells(
        effectiveFog, vp.scrollLeft, vp.scrollTop, vp.viewportW, vp.viewportH, sc,
      );

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Breathing pulse — subtle alpha oscillation
      const breathe = 1.0 + 0.04 * Math.sin(timeRef.current * 0.8);

      // ── Pass 1: Base fog fill ────────────────────────────
      for (const key of visibleKeys) {
        const { x, y } = parseCellKey(key);
        const px = x * sc;
        const py = y * sc;

        if (effectiveStyle === "solid") {
          ctx.fillStyle = `rgba(${r},${g},${b},${density})`;
          ctx.fillRect(px, py, sc, sc);
          continue;
        }

        const edge = getCellEdgeInfo(x, y, effectiveFog);

        // Center cells: full density base
        if (edge.isCenter) {
          const a = Math.min(1, density * 0.92 * breathe);
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.fillRect(px, py, sc, sc);
        } else {
          // Border cells: slightly lower base
          const a = Math.min(1, density * 0.78 * breathe);
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.fillRect(px, py, sc, sc);

          // Soft edge gradients — fade into neighboring empty cells
          if (fogSettings.softEdges) {
            const pad = sc * 0.6;
            if (edge.exposedTop) {
              const grad = ctx.createLinearGradient(px, py + sc * 0.3, px, py - pad);
              grad.addColorStop(0, `rgba(${r},${g},${b},${a * 0.5})`);
              grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
              ctx.fillStyle = grad;
              ctx.fillRect(px - pad * 0.3, py - pad, sc + pad * 0.6, sc + pad);
            }
            if (edge.exposedBottom) {
              const grad = ctx.createLinearGradient(px, py + sc * 0.7, px, py + sc + pad);
              grad.addColorStop(0, `rgba(${r},${g},${b},${a * 0.5})`);
              grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
              ctx.fillStyle = grad;
              ctx.fillRect(px - pad * 0.3, py, sc + pad * 0.6, sc + pad);
            }
            if (edge.exposedLeft) {
              const grad = ctx.createLinearGradient(px + sc * 0.3, py, px - pad, py);
              grad.addColorStop(0, `rgba(${r},${g},${b},${a * 0.5})`);
              grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
              ctx.fillStyle = grad;
              ctx.fillRect(px - pad, py - pad * 0.3, sc + pad, sc + pad * 0.6);
            }
            if (edge.exposedRight) {
              const grad = ctx.createLinearGradient(px + sc * 0.7, py, px + sc + pad, py);
              grad.addColorStop(0, `rgba(${r},${g},${b},${a * 0.5})`);
              grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
              ctx.fillStyle = grad;
              ctx.fillRect(px, py - pad * 0.3, sc + pad, sc + pad * 0.6);
            }
          }
        }
      }

      // ── Pass 2: Animated smoke noise (fog style only) ────
      if (effectiveStyle === "fog" && noiseTextureRef.current) {
        const noiseBitmap = noiseTextureRef.current;
        const spd = fogSettings.speed;

        // Drift the noise pattern
        driftRef.current.x += dt * 12 * spd;
        driftRef.current.y += dt * 7 * spd;
        const dx = driftRef.current.x % 256;
        const dy = driftRef.current.y % 256;

        // Layer 1: main smoke
        ctx.save();
        ctx.globalCompositeOperation = "source-atop";
        ctx.globalAlpha = 0.6;

        for (let tx = -256 + (dx % 256); tx < canvas.width + 256; tx += 256) {
          for (let ty = -256 + (dy % 256); ty < canvas.height + 256; ty += 256) {
            ctx.drawImage(noiseBitmap, tx, ty);
          }
        }

        // Layer 2: offset smoke
        ctx.globalAlpha = 0.35;
        const dx2 = (-driftRef.current.x * 0.6 + 128) % 256;
        const dy2 = (-driftRef.current.y * 0.4 + 64) % 256;

        for (let tx = -256 + (dx2 % 256); tx < canvas.width + 256; tx += 256) {
          for (let ty = -256 + (dy2 % 256); ty < canvas.height + 256; ty += 256) {
            ctx.drawImage(noiseBitmap, tx, ty);
          }
        }

        ctx.restore();
      }

      // ── Pass 3: "Shadows" mode ──
      if (effectiveStyle === "shadows") {
        ctx.save();
        ctx.globalCompositeOperation = "source-atop";
        ctx.globalAlpha = 0.3;
        for (const key of visibleKeys) {
          const { x, y } = parseCellKey(key);
          const edge = getCellEdgeInfo(x, y, effectiveFog);
          if (!edge.isCenter) {
            const cx2 = x * sc + sc / 2;
            const cy2 = y * sc + sc / 2;
            const grad = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, sc * 0.8);
            grad.addColorStop(0, `rgba(${theme.sr},${theme.sg},${theme.sb},0.4)`);
            grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.fillStyle = grad;
            ctx.fillRect(x * sc, y * sc, sc, sc);
          }
        }
        ctx.restore();
      }

      // ── Spawn particles for recently revealed/covered cells ──
      if (fogSettings.revealAnimation) {
        for (const key of recentlyRevealedCells) {
          const { x, y } = parseCellKey(key);
          particlesRef.current = spawnParticles(x, y, sc, particlesRef.current, "reveal");
        }
        for (const key of recentlyCoveredCells) {
          const { x, y } = parseCellKey(key);
          particlesRef.current = spawnParticles(x, y, sc, particlesRef.current, "cover");
        }
        if (recentlyRevealedCells.size > 0) {
          state.clearRecentlyRevealed(Array.from(recentlyRevealedCells));
        }
        if (recentlyCoveredCells.size > 0) {
          state.clearRecentlyCovered(Array.from(recentlyCoveredCells));
        }
      }

      // ── Render particles ──────────────────────────────
      if (particlesRef.current.length > 0) {
        particlesRef.current = updateParticles(particlesRef.current, dt);
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        for (const p of particlesRef.current) {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = `rgb(${theme.sr},${theme.sg},${theme.sb})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
    // Only restart loop if canvas dimensions change (they shouldn't with fixed CELL_SIZE)
    // Viewport scroll/size changes are read from viewportRef inside the loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasW, canvasH]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      width={canvasW}
      height={canvasH}
      style={{ width: canvasW, height: canvasH }}
    />
  );
}
