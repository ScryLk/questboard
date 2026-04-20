"use client";

import type { LucideIcon } from "lucide-react";
import { getObjectSpriteUrl } from "@questboard/constants";
import type { MapObjectType } from "@/lib/gameplay-mock-data";

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
 * - Se `type` tem sprite pixel-art mapeado em `OBJECT_SPRITE_MAP`, usa `<img>`.
 * - Caso contrário, renderiza o ícone Lucide recebido em `fallback`.
 *
 * O sprite usa `imageRendering: pixelated` pra manter o pixel-art crisp.
 * `object-fit: contain` centraliza o sprite na caixa — sprites com aspect
 * ratio diferente de 1:1 (ex: tocha 14×23, caixa 16×32) ficam centralizados
 * em vez de esticados.
 */
export function ObjectSpriteIcon({
  type,
  fallback: FallbackIcon,
  size = 32,
  color,
  className,
  title,
}: Props) {
  const spriteUrl = getObjectSpriteUrl(type);

  if (spriteUrl) {
    return (
      <img
        src={spriteUrl}
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
