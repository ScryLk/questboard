"use client";

import { memo, useEffect, useState } from "react";
import type { TokenAlignment } from "@/lib/gameplay-mock-data";
import { CREATURE_SPRITES } from "@/constants/creature-sprites";
import { getProcessedSpriteUrl } from "@/lib/gameplay/eye-color-replacer";

interface CreatureSpriteTokenProps {
  creatureId: string;
  alignment: TokenAlignment;
  size: number; // pixels (já escalado)
}

export const CreatureSpriteToken = memo(function CreatureSpriteToken({
  creatureId,
  alignment,
  size,
}: CreatureSpriteTokenProps) {
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);

  const spritePath = CREATURE_SPRITES[creatureId];

  useEffect(() => {
    if (!spritePath) return;

    let cancelled = false;
    getProcessedSpriteUrl(spritePath, alignment).then((url) => {
      if (!cancelled) setSpriteUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [spritePath, alignment]);

  if (!spritePath || !spriteUrl) return null;

  return (
    <img
      src={spriteUrl}
      alt=""
      className="pointer-events-none"
      style={{
        width: size * 0.85,
        height: size * 0.85,
        imageRendering: "auto",
        objectFit: "contain",
      }}
      draggable={false}
    />
  );
});
