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
  /**
   * "width" (default): preserva aspect-ratio escalando pela largura — sprites
   * altos projetam acima da célula no mapa.
   * "contain": força o sprite inteiro numa caixa size×size, sem overflow —
   * usar em pickers/listas onde uniformidade visual importa mais que fidelidade.
   */
  fit?: "width" | "contain";
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
  fit = "width",
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

  // Base style — inline width/height override Tailwind's preflight
  // `img { height: auto; max-width: 100%; }` (which otherwise forces
  // natural aspect and breaks fixed-size tiles). "contain" fits the
  // sprite inside a size×size box; "width" lets tall sprites overflow
  // vertically (intentional for map tokens like pillars/towers).
  const imgStyle: React.CSSProperties = {
    width: size,
    height: fit === "contain" ? size : "auto",
    maxWidth: "none",
    imageRendering: "pixelated",
    objectFit: "contain",
    display: "block",
  };

  if (meta.kind === "file") {
    return (
      <img
        src={`${OBJECT_SPRITE_BASE}/${meta.file}`}
        alt={title ?? ""}
        title={title}
        className={className}
        style={imgStyle}
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
        title={title}
        className={className}
        style={imgStyle}
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
        fit={fit}
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
      fit={fit}
      title={title}
      className={className}
    />
  );
}
