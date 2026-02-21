export const MAX_PLAYERS = 20;
export const DEFAULT_GRID_SIZE = 50;
export const DEFAULT_MAX_PLAYERS = 5;

export const RATE_LIMITS = {
  TOKEN_MOVE: 30,
  CURSOR_MOVE: 15,
  CHAT_SEND: 5,
} as const;

export const CURSOR_THROTTLE_MS = 66; // ~15fps

export const SUPPORTED_SYSTEMS = [
  "dnd5e",
  "tormenta20",
  "coc7",
  "generic",
] as const;

export type SupportedSystem = (typeof SUPPORTED_SYSTEMS)[number];

export const SYSTEM_LABELS: Record<SupportedSystem, string> = {
  dnd5e: "D&D 5e",
  tormenta20: "Tormenta20",
  coc7: "Call of Cthulhu 7e",
  generic: "Genérico",
};
