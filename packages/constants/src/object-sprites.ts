// ═══ CATÁLOGO DE SPRITES DE OBJETOS ═══
// Mapa de tipos de objeto do mapa para metadata de PNG pixel-art.
// Fonte: pack de sprites em apps/web-next/public/items/*.png.
// Tipos sem sprite mapeado caem no fallback Lucide (vide ObjectSpriteIcon.tsx).

/**
 * Caminho base dos sprites. Sempre relativo ao host Next (public/).
 */
export const OBJECT_SPRITE_BASE = "/items" as const;

export interface SpriteMeta {
  /** Nomes dos arquivos PNG. 1 item = estático. N itens = animado (cicla frames). */
  frames: string[];
  /** Duração de cada frame em ms. Só relevante quando frames.length > 1. */
  frameDurationMs?: number;
  /**
   * Tratamento especial de movimento sobreposto à animação de frames.
   * - "fire": flicker de alpha (soma de senos 3Hz+7Hz) + scaleY "respira" (5Hz ±2%).
   * Tipos sem `motion` rodam apenas o ciclo de frames (se houver).
   */
  motion?: "fire";
}

/**
 * Mapa de MapObjectType → SpriteMeta.
 * Tipos não listados aqui não têm sprite e renderizam com ícone Lucide.
 */
export const OBJECT_SPRITE_MAP: Record<string, SpriteMeta> = {
  chest: { frames: ["chest_closed.png"] },
  crate: { frames: ["box.png"] },
  pillar: { frames: ["column.png"] },
  statue: { frames: ["gargoyle_top_1.png"] },
  banner: { frames: ["wall_flag_red.png"] },
  torch_stand: {
    frames: [
      "torch_1.png",
      "torch_2.png",
      "torch_3.png",
      "torch_4.png",
      "torch_5.png",
      "torch_6.png",
      "torch_7.png",
      "torch_8.png",
    ],
    frameDurationMs: 100,
    motion: "fire",
  },
};

/**
 * Retorna a metadata completa do sprite, ou null se o tipo não tem sprite.
 */
export function getObjectSpriteMeta(type: string): SpriteMeta | null {
  return OBJECT_SPRITE_MAP[type] ?? null;
}

/**
 * Retorna o URL do PRIMEIRO frame do sprite (compat com consumidores que só
 * precisam de imagem estática — ex: cover em card). Null se não tem sprite.
 */
export function getObjectSpriteUrl(type: string): string | null {
  const meta = OBJECT_SPRITE_MAP[type];
  if (!meta) return null;
  return `${OBJECT_SPRITE_BASE}/${meta.frames[0]}`;
}

/**
 * Retorna URLs completos de todos os frames do sprite.
 */
export function getObjectSpriteFrameUrls(type: string): string[] {
  const meta = OBJECT_SPRITE_MAP[type];
  if (!meta) return [];
  return meta.frames.map((f) => `${OBJECT_SPRITE_BASE}/${f}`);
}
