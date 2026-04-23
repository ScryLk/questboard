import type { GameplayState } from "@/lib/gameplay-store";

/**
 * Chaves do `gameplayStore` que representam **world-state compartilhado**
 * entre GM e Player (devem sincronizar via BroadcastChannel).
 *
 * O resto (activeTool, painéis abertos, seleção local, menu contextual,
 * camera etc.) é UI-local de cada aba e não deve sincronizar.
 *
 * Quando adicionar campo novo ao store que represente estado do mundo
 * (coisa que o player deveria ver), incluir aqui.
 */
export const WORLD_STATE_KEYS = [
  // Tokens
  "tokens",
  // Mapa ativo e config
  "mapConfig",
  "activeMapId",
  "mapObjects",
  "wallEdges",
  // Fog
  "fogCells",
  "fogSettings",
  // Combate
  "combat",
  // Chat e comunicação
  "messages",
  // Anotações visíveis
  "markers",
  "notes",
  "aoeInstances",
  // Iluminação / visão
  "lightSources",
  // Cena ativa (card cinemático — estado do GM pro Player)
  "activeSceneCard",
] as const satisfies readonly (keyof GameplayState)[];

export type WorldStateKey = (typeof WORLD_STATE_KEYS)[number];

/** Pega o subset "world-state" de um state do gameplayStore. */
export function pickWorldState(
  state: GameplayState,
): Pick<GameplayState, WorldStateKey> {
  const out = {} as Pick<GameplayState, WorldStateKey>;
  for (const key of WORLD_STATE_KEYS) {
    // Type-safe o suficiente: sabemos que todas as keys existem em GameplayState.
    (out as Record<string, unknown>)[key] = (
      state as unknown as Record<string, unknown>
    )[key];
  }
  return out;
}

/** Shallow equality entre dois objetos world-state. */
export function shallowEqualWorldState(
  a: Partial<Record<WorldStateKey, unknown>>,
  b: Partial<Record<WorldStateKey, unknown>>,
): boolean {
  for (const key of WORLD_STATE_KEYS) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}
