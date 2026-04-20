"use client";

import type { LucideIcon } from "lucide-react";
import {
  getObjectSpriteMeta,
  getObjectSpriteFrameUrls,
  OBJECT_SPRITE_BASE,
} from "@questboard/constants";
import type { MapObjectType } from "@/lib/gameplay-mock-data";
import { FireSpriteIcon } from "./fire-sprite-icon";

interface Props {
  type: MapObjectType;
  /** Ícone Lucide de fallback quando o tipo não tem sprite mapeado. */
  fallback: LucideIcon;
  /** Tamanho renderizado em pixels (largura e altura). Default 32. */
  size?: number;
  /** Cor aplicada ao ícone Lucide fallback. Sprites PNG ignoram. */
  color?: string;
  className?: string;
  title?: string;
}

/**
 * Renderiza o ícone de um objeto do mapa.
 * - Tipo com sprite `motion: "fire"` → FireSpriteIcon (cicla frames + flicker).
 * - Tipo com sprite estático → <img> pixelated.
 * - Tipo sem sprite → ícone Lucide de fallback.
 */
export function ObjectSpriteIcon({
  type,
  fallback: FallbackIcon,
  size = 32,
  color,
  className,
  title,
}: Props) {
  const meta = getObjectSpriteMeta(type);

  if (meta) {
    const frameUrls = getObjectSpriteFrameUrls(type);

    if (meta.motion === "fire" && meta.frames.length > 1) {
      return (
        <FireSpriteIcon
          frameUrls={frameUrls}
          frameDurationMs={meta.frameDurationMs ?? 100}
          size={size}
          title={title}
          className={className}
        />
      );
    }

    return (
      <img
        src={`${OBJECT_SPRITE_BASE}/${meta.frames[0]}`}
        alt={title ?? ""}
        width={size}
        height={size}
        title={title}
        className={className}
        style={{
          imageRendering: "pixelated",
          objectFit: "contain",
          display: "block",
        }}
        draggable={false}
      />
    );
  }

  return (
    <FallbackIcon
      size={size}
      color={color}
      className={className}
      aria-label={title}
    />
  );
}
