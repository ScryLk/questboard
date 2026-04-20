"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  /** URLs completos dos frames (na ordem do ciclo). */
  frameUrls: string[];
  /** Duração de cada frame em ms. */
  frameDurationMs: number;
  /** Tamanho em pixels (largura e altura do quadro). */
  size: number;
  title?: string;
  className?: string;
}

/**
 * Sprite pixel-art animado com tratamento "fire":
 * - Cicla entre frames (`torch_1.png` → `torch_8.png`).
 * - Sobrepõe flicker de alpha via soma de senos (3Hz + 7Hz) — dessincroniza
 *   visualmente com fase aleatória por instância.
 * - Sobrepõe "respiração" vertical via scaleY (seno 5Hz, ±2%).
 *
 * Roda um único `requestAnimationFrame` por instância. Cleanup no unmount.
 *
 * Por que HTML em vez de Pixi: o resto da renderização de objetos é HTML
 * overlay (vide object-overlay.tsx). Manter consistência até uma eventual
 * migração pro Pixi layer.
 */
export function FireSpriteIcon({
  frameUrls,
  frameDurationMs,
  size,
  title,
  className,
}: Props) {
  const [frameIdx, setFrameIdx] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const phaseRef = useRef(Math.random() * Math.PI * 2);
  const rafRef = useRef<number | null>(null);
  const lastFrameSwapRef = useRef<number>(performance.now());

  useEffect(() => {
    const tick = (now: number) => {
      // Frame cycling (animação base do pack 0x72)
      if (now - lastFrameSwapRef.current >= frameDurationMs) {
        lastFrameSwapRef.current = now;
        setFrameIdx((i) => (i + 1) % frameUrls.length);
      }

      // Flicker orgânico sobreposto (só se o DOM node existe)
      if (imgRef.current) {
        const t = now / 1000 + phaseRef.current;
        // Soma de dois senos (3Hz + 7Hz) normalizada pra amplitude 0..1
        const noise = (Math.sin(t * 3) + Math.sin(t * 7) * 0.5) / 1.5;
        const alpha = 0.925 + 0.075 * noise;
        // scaleY "respira" com frequência diferente pra não sincronizar com alpha
        const scaleY = 0.99 + 0.02 * Math.sin(t * 5);
        imgRef.current.style.opacity = String(alpha);
        imgRef.current.style.transform = `scaleY(${scaleY})`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [frameUrls.length, frameDurationMs]);

  return (
    <img
      ref={imgRef}
      src={frameUrls[frameIdx]}
      alt={title ?? ""}
      title={title}
      width={size}
      height={size}
      draggable={false}
      className={className}
      style={{
        imageRendering: "pixelated",
        objectFit: "contain",
        display: "block",
        transformOrigin: "center bottom",
      }}
    />
  );
}
