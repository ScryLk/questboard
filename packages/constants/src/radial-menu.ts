// Radial action menu — constantes compartilhadas por web-next (GM +
// Player). Se o mobile voltar, consome daqui também.

export const TOUCH_LONG_PRESS_MS = 300;

export const RADIAL_MENU = {
  radiusPx: 80,
  buttonSizePx: 44,
  centerButtonSizePx: 36,
  safePaddingPx: 16,
  maxActions: 5,
} as const;

export const RADIAL_ACTION_IDS = [
  "attack",
  "converse",
  "test",
  "move_to",
  "inspect",
] as const;

export type RadialActionId = (typeof RADIAL_ACTION_IDS)[number];

export const RADIAL_LABELS_PT: Record<RadialActionId, string> = {
  attack: "Atacar",
  converse: "Conversar",
  test: "Teste",
  move_to: "Mover até",
  inspect: "Inspecionar",
};

export const RADIAL_CLOSE_LABEL_PT = "Fechar";

/** Cores por ação (design system — tokens semânticos). */
export const RADIAL_COLORS: Record<RadialActionId, string> = {
  attack: "#f87171",
  converse: "#60a5fa",
  test: "#fbbf24",
  move_to: "#34d399",
  inspect: "#a78bfa",
};

export const RADIAL_CENTER_COLOR = "#2dd4bf";
