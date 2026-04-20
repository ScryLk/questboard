// ═══ CONSTANTES IMUTÁVEIS DO GRID ═══
// Estes valores são fixos e NUNCA mudam durante o jogo.
// Zoom é feito via scale do WorldContainer, NÃO mudando CELL_SIZE.
// Regra de ouro #1 do CLAUDE.md.

export const CELL_SIZE = 64 as const; // pixels por célula (no espaço do world)
export const CELL_SIZE_FT = 5 as const; // pés por célula (D&D 5e)

export const DEFAULT_GRID_COLS = 25 as const;
export const DEFAULT_GRID_ROWS = 25 as const;

export const MIN_ZOOM = 0.3 as const;
export const MAX_ZOOM = 3.0 as const;
export const DEFAULT_ZOOM = 1.0 as const;
