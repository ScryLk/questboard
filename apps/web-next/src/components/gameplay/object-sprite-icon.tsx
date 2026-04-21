"use client";

import type { LucideIcon } from "lucide-react";
import {
  getObjectSpriteMeta,
  getObjectSpriteFrameUrls,
  OBJECT_SPRITE_BASE,
} from "@questboard/constants";
import type { MapObjectType } from "@/lib/gameplay-mock-data";
import { FireSpriteIcon } from "./fire-sprite-icon";
import { SheetSprite, AnimatedSheetSprite } from "./sheet-sprite";

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
 * Renderiza o ícone de um objeto do mapa, escolhendo o modo certo:
 * - `file` (PNG individual estático) → <img> pixelated.
 * - `file-anim` com motion "fire" → FireSpriteIcon (ciclo + flicker).
 * - `sheet` (recorte estático de spritesheet) → SheetSprite.
 * - `sheet-anim` (ciclo de recortes) → AnimatedSheetSprite.
 * - sem sprite → ícone Lucide de fallback.
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

  if (!meta) {
    return (
      <FallbackIcon
        size={size}
        color={color}
        className={className}
        aria-label={title}
      />
    );
  }

  if (meta.kind === "file") {
    return (
      <img
        src={`${OBJECT_SPRITE_BASE}/${meta.file}`}
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

  if (meta.kind === "file-anim") {
    if (meta.motion === "fire") {
      return (
        <FireSpriteIcon
          frameUrls={getObjectSpriteFrameUrls(type)}
          frameDurationMs={meta.frameDurationMs}
          size={size}
          title={title}
          className={className}
        />
      );
    }
    // file-anim without motion: render first frame statically
    return (
      <img
        src={`${OBJECT_SPRITE_BASE}/${meta.files[0]}`}
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

  if (meta.kind === "sheet") {
    return (
      <SheetSprite
        sheet={meta.sheet}
        region={meta.region}
        size={size}
        title={title}
        className={className}
      />
    );
  }

  // sheet-anim
  return (
    <AnimatedSheetSprite
      sheet={meta.sheet}
      regions={meta.regions}
      frameDurationMs={meta.frameDurationMs}
      size={size}
      title={title}
      className={className}
    />
  );
}
