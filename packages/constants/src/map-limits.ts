// Limites e presets pra criação/edição de mapas.
// Fonte única — UI e validação consomem daqui. Quando backend existir,
// estender pra service também (mesmos valores via este package).

export const MAP_LIMITS = {
  /** Abaixo disso nem combate simples cabe */
  MIN_CELLS: 10,
  /** Acima disso = aviso "pode ficar pesado em mobile" (não bloqueia) */
  SOFT_MAX_CELLS: 60,
  /** Acima disso = bloqueado (performance/memória) */
  HARD_MAX_CELLS: 100,
  /** Largura:altura ou altura:largura máximo (evita mapas 10×100 inúteis) */
  MAX_ASPECT_RATIO: 3,
  DEFAULT_WIDTH: 25,
  DEFAULT_HEIGHT: 20,
} as const;

export const MAP_PRESETS = [
  {
    id: "small_room",
    label: "Sala pequena",
    width: 15,
    height: 15,
    description: "Combate fechado, taverna, quarto",
  },
  {
    id: "chamber",
    label: "Câmara",
    width: 25,
    height: 20,
    description: "Dungeon room, calabouço",
  },
  {
    id: "hall",
    label: "Salão",
    width: 40,
    height: 30,
    description: "Batalha maior, salão do trono",
  },
  {
    id: "region",
    label: "Região",
    width: 60,
    height: 40,
    description: "Mapa tático ao ar livre",
  },
] as const;

export type MapPresetId = (typeof MAP_PRESETS)[number]["id"];

export function isWithinMapLimits(width: number, height: number): boolean {
  return (
    Number.isInteger(width) &&
    Number.isInteger(height) &&
    width >= MAP_LIMITS.MIN_CELLS &&
    width <= MAP_LIMITS.HARD_MAX_CELLS &&
    height >= MAP_LIMITS.MIN_CELLS &&
    height <= MAP_LIMITS.HARD_MAX_CELLS
  );
}

export function getAspectRatio(width: number, height: number): number {
  if (width <= 0 || height <= 0) return Infinity;
  return Math.max(width / height, height / width);
}

export function isAspectRatioValid(width: number, height: number): boolean {
  return getAspectRatio(width, height) <= MAP_LIMITS.MAX_ASPECT_RATIO;
}

export function isSoftLarge(width: number, height: number): boolean {
  return (
    width > MAP_LIMITS.SOFT_MAX_CELLS || height > MAP_LIMITS.SOFT_MAX_CELLS
  );
}

/** Erro estruturado de dimensões, consumido pela UI pra mostrar toast/msg. */
export type MapDimensionsError =
  | { code: "out_of_bounds"; message: string }
  | { code: "aspect_ratio"; message: string };

export function validateMapDimensions(
  width: number,
  height: number,
): MapDimensionsError | null {
  if (!isWithinMapLimits(width, height)) {
    return {
      code: "out_of_bounds",
      message: `Dimensões fora dos limites (mín ${MAP_LIMITS.MIN_CELLS}, máx ${MAP_LIMITS.HARD_MAX_CELLS}).`,
    };
  }
  if (!isAspectRatioValid(width, height)) {
    return {
      code: "aspect_ratio",
      message: `A proporção do mapa não pode ser maior que ${MAP_LIMITS.MAX_ASPECT_RATIO}:1.`,
    };
  }
  return null;
}
