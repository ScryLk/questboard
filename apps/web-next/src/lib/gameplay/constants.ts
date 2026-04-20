// Re-export das constantes canônicas de `@questboard/constants`.
// Mantido por compat com imports antigos (`@/lib/gameplay/constants`).
// Nunca redefinir CELL_SIZE localmente — regra de ouro #1 do CLAUDE.md.

export {
  CELL_SIZE,
  CELL_SIZE_FT,
  DEFAULT_GRID_COLS,
  DEFAULT_GRID_ROWS,
  MIN_ZOOM,
  MAX_ZOOM,
  DEFAULT_ZOOM,
} from "@questboard/constants";
