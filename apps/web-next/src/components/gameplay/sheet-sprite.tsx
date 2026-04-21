"use client";

import { useEffect, useRef, useState } from "react";
import {
  OBJECT_SPRITE_BASE,
  OBJECT_SPRITE_SHEETS,
  type SpriteRegion,
} from "@questboard/constants";

interface SheetSpriteProps {
  /** Chave do sheet em OBJECT_SPRITE_SHEETS. */
  sheet: string;
  /** Região do sprite dentro do sheet (em pixels do arquivo original). */
  region: SpriteRegion;
  /** Tamanho renderizado em pixels (largura e altura do quadro). */
  size: number;
  title?: string;
  className?: string;
}

/**
 * Renderiza um único recorte de um spritesheet usando CSS
 * `background-image` + `background-position` + `background-size` escalado.
 * `image-rendering: pixelated` preserva o pixel-art ao escalar.
 *
 * Aspect ratio é preservado: se region for 36×64 e size=32, altura vira
 * 32*(64/36) ≈ 57. O container tem width=size; height é derivado.
 */
export function SheetSprite({
  sheet,
  region,
  size,
  title,
  className,
}: SheetSpriteProps) {
  const sheetDef = OBJECT_SPRITE_SHEETS[sheet];
  if (!sheetDef) return null;

  const scale = size / region.w;
  const renderedHeight = region.h * scale;

  return (
    <div
      role="img"
      aria-label={title}
      title={title}
      className={className}
      style={{
        width: size,
        height: renderedHeight,
        backgroundImage: `url(${OBJECT_SPRITE_BASE}/${sheetDef.filename})`,
        backgroundPosition: `-${region.x * scale}px -${region.y * scale}px`,
        backgroundSize: `${sheetDef.width * scale}px ${sheetDef.height * scale}px`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        display: "block",
      }}
    />
  );
}

interface AnimatedSheetSpriteProps {
  sheet: string;
  regions: SpriteRegion[];
  frameDurationMs: number;
  size: number;
  title?: string;
  className?: string;
}

/**
 * Versão animada de SheetSprite: cicla entre regiões do mesmo sheet.
 * Usa requestAnimationFrame pra pausar automaticamente quando a aba
 * perde o foco. Fase inicial aleatória evita sincronia quando há
 * múltiplas instâncias (ex: várias guilhotinas no mapa).
 */
export function AnimatedSheetSprite({
  sheet,
  regions,
  frameDurationMs,
  size,
  title,
  className,
}: AnimatedSheetSpriteProps) {
  const [idx, setIdx] = useState(() =>
    Math.floor(Math.random() * Math.max(1, regions.length)),
  );
  const rafRef = useRef<number | null>(null);
  const lastSwapRef = useRef<number>(performance.now());

  useEffect(() => {
    const tick = (now: number) => {
      if (now - lastSwapRef.current >= frameDurationMs) {
        lastSwapRef.current = now;
        setIdx((i) => (i + 1) % regions.length);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [regions.length, frameDurationMs]);

  const region = regions[idx] ?? regions[0];
  if (!region) return null;

  return (
    <SheetSprite
      sheet={sheet}
      region={region}
      size={size}
      title={title}
      className={className}
    />
  );
}
