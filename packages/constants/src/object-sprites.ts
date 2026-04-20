// ═══ CATÁLOGO DE SPRITES DE OBJETOS ═══
// Mapa de tipos de objeto do mapa para caminhos de PNG pixel-art.
// Fonte: pack de sprites do web-next em /public/items/*.png.
// Tipos sem sprite mapeado caem no fallback Lucide (vide ObjectSpriteIcon.tsx).

/**
 * Caminho base dos sprites. Sempre relativo ao host Next (public/).
 * Os PNGs ficam em apps/web-next/public/items/*.png.
 */
export const OBJECT_SPRITE_BASE = "/items" as const;

/**
 * Mapa de MapObjectType → arquivo de sprite (sem prefixo).
 * Tipos não listados aqui não têm sprite e renderizam com ícone Lucide.
 */
export const OBJECT_SPRITE_MAP: Record<string, string> = {
  chest: "chest_closed.png",
  crate: "box.png",
  pillar: "column.png",
  statue: "gargoyle_top_1.png",
  torch_stand: "torch_1.png",
  banner: "wall_flag_red.png",
};

/**
 * Resolve o URL completo do sprite para um tipo, ou null se não houver sprite.
 */
export function getObjectSpriteUrl(type: string): string | null {
  const file = OBJECT_SPRITE_MAP[type];
  return file ? `${OBJECT_SPRITE_BASE}/${file}` : null;
}
