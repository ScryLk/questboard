// ═══ CATÁLOGO DE SPRITES DE OBJETOS ═══
// Fonte: /apps/web-next/public/items/*.png
// Dois formatos suportados:
//   1) PNGs individuais (pack 0x72 original) → kind "file" / "file-anim"
//   2) Spritesheets (packs novos) → kind "sheet" / "sheet-anim"
// Tipos sem sprite mapeado caem no fallback Lucide em ObjectSpriteIcon.

/**
 * Caminho base dos sprites. Sempre relativo ao host Next (public/).
 */
export const OBJECT_SPRITE_BASE = "/items" as const;

export interface SpriteRegion {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Dimensões totais de cada spritesheet. Usado pra calcular
 * `background-size` do CSS no componente de render.
 */
export const OBJECT_SPRITE_SHEETS: Record<
  string,
  { filename: string; width: number; height: number }
> = {
  scull: { filename: "scull.png", width: 96, height: 144 },
  web: { filename: "web.png", width: 240, height: 192 },
  blades: { filename: "Rotating_blades.png", width: 48, height: 192 },
  bomb: { filename: "Bomb.png", width: 576, height: 48 },
  guillotine: { filename: "Guillotine.png", width: 576, height: 48 },
  flasks: { filename: "Flasks_monsters.png", width: 144, height: 384 },
};

/**
 * Metadata do sprite de um tipo de objeto. União discriminada pra refletir
 * os formatos suportados.
 */
export type SpriteMeta =
  | { kind: "file"; file: string }
  | {
      kind: "file-anim";
      files: string[];
      frameDurationMs: number;
      motion?: "fire";
    }
  | { kind: "sheet"; sheet: string; region: SpriteRegion }
  | {
      kind: "sheet-anim";
      sheet: string;
      regions: SpriteRegion[];
      frameDurationMs: number;
    };

/** Helper pra construir N regiões horizontais (x crescente) a partir do 0. */
function horizontalStrip(count: number, frameSize: number): SpriteRegion[] {
  return Array.from({ length: count }, (_, i) => ({
    x: i * frameSize,
    y: 0,
    w: frameSize,
    h: frameSize,
  }));
}

/** Helper pra construir N regiões verticais (y crescente) a partir do 0. */
function verticalStrip(count: number, frameSize: number): SpriteRegion[] {
  return Array.from({ length: count }, (_, i) => ({
    x: 0,
    y: i * frameSize,
    w: frameSize,
    h: frameSize,
  }));
}

/**
 * Mapa MapObjectType → SpriteMeta.
 * Tipos não listados aqui não têm sprite (fallback Lucide).
 */
export const OBJECT_SPRITE_MAP: Record<string, SpriteMeta> = {
  // ── PNGs individuais (pack 0x72) ──
  chest: { kind: "file", file: "chest_closed.png" },
  crate: { kind: "file", file: "box.png" },
  pillar: { kind: "file", file: "column.png" },
  statue: { kind: "file", file: "gargoyle_top_1.png" },
  banner: { kind: "file", file: "wall_flag_red.png" },
  torch_stand: {
    kind: "file-anim",
    files: [
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

  // ── Sheets novos — estáticos (pegam o primeiro tile) ──
  skull_pile: {
    kind: "sheet",
    sheet: "scull",
    region: { x: 0, y: 0, w: 48, h: 48 },
  },
  spider_web: {
    kind: "sheet",
    sheet: "web",
    region: { x: 0, y: 0, w: 48, h: 48 },
  },
  flask_monster: {
    kind: "sheet",
    sheet: "flasks",
    region: { x: 0, y: 0, w: 36, h: 64 },
  },

  // ── Sheets novos — animados (ciclam regiões) ──
  rotating_blades: {
    kind: "sheet-anim",
    sheet: "blades",
    regions: verticalStrip(4, 48),
    frameDurationMs: 80,
  },
  guillotine: {
    kind: "sheet-anim",
    sheet: "guillotine",
    regions: horizontalStrip(12, 48),
    frameDurationMs: 80,
  },
  bomb: {
    kind: "sheet-anim",
    sheet: "bomb",
    regions: horizontalStrip(12, 48),
    frameDurationMs: 100,
  },
};

/**
 * Retorna a metadata completa do sprite, ou null se o tipo não tem sprite.
 */
export function getObjectSpriteMeta(type: string): SpriteMeta | null {
  return OBJECT_SPRITE_MAP[type] ?? null;
}

/** True se o tipo tem sprite (qualquer formato). */
export function hasObjectSprite(type: string): boolean {
  return type in OBJECT_SPRITE_MAP;
}

/**
 * Retorna o URL da imagem (PNG ou spritesheet). Pra `file` é o arquivo do
 * tipo, pra `file-anim` é o primeiro frame, pra `sheet`/`sheet-anim` é a
 * spritesheet inteira. Útil pra pré-carregar; NÃO é o URL de um frame
 * recortado (pra isso use os componentes de render).
 */
export function getObjectSpriteUrl(type: string): string | null {
  const meta = OBJECT_SPRITE_MAP[type];
  if (!meta) return null;
  if (meta.kind === "file") return `${OBJECT_SPRITE_BASE}/${meta.file}`;
  if (meta.kind === "file-anim") return `${OBJECT_SPRITE_BASE}/${meta.files[0]}`;
  const sheet = OBJECT_SPRITE_SHEETS[meta.sheet];
  return sheet ? `${OBJECT_SPRITE_BASE}/${sheet.filename}` : null;
}

/**
 * Retorna URLs completos de todos os frames (para `file-anim`).
 * Para sheets, retorna array vazio — a renderização é feita via
 * CSS background-image no componente, não por URLs individuais.
 */
export function getObjectSpriteFrameUrls(type: string): string[] {
  const meta = OBJECT_SPRITE_MAP[type];
  if (!meta) return [];
  if (meta.kind === "file") return [`${OBJECT_SPRITE_BASE}/${meta.file}`];
  if (meta.kind === "file-anim") {
    return meta.files.map((f) => `${OBJECT_SPRITE_BASE}/${f}`);
  }
  return [];
}
