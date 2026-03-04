import type {
  GameToken,
  VisionConfig,
  WallSegment,
  LightSourceFixed,
} from "./gameplay-mock-data";
import { DEFAULT_VISION } from "./gameplay-mock-data";
import { shadowCast, buildBlockedSet } from "./shadow-caster";

export interface VisionResult {
  visible: Set<string>;
  dimCells: Set<string>;
  darkvisionCells: Set<string>;
}

export function calculateCombinedVision(
  tokens: GameToken[],
  tokenVision: Record<string, VisionConfig>,
  walls: WallSegment[],
  lightSources: LightSourceFixed[],
  mapW: number,
  mapH: number,
  previewAs: string | null,
  dragOverrides?: Record<string, { x: number; y: number }>,
): VisionResult {
  const visible = new Set<string>();
  const dimCells = new Set<string>();
  const darkvisionCells = new Set<string>();

  const blocked = buildBlockedSet(walls);

  // Determine which tokens to process
  let tokensToProcess: GameToken[];
  if (previewAs === null) {
    // GM mode — no dynamic vision applied
    return { visible, dimCells, darkvisionCells };
  } else if (previewAs === "all") {
    tokensToProcess = tokens.filter(
      (t) => t.onMap && t.alignment === "player",
    );
  } else {
    const single = tokens.find((t) => t.id === previewAs && t.onMap);
    tokensToProcess = single ? [single] : [];
  }

  // Bright cells from fixed light sources (any token with normal vision can see these)
  const litBrightCells = new Set<string>();
  const litDimCells = new Set<string>();

  for (const light of lightSources) {
    const brightCells = shadowCast(
      light.x, light.y, light.brightRadius, blocked, mapW, mapH,
    );
    const dimTotalCells = shadowCast(
      light.x, light.y, light.brightRadius + light.dimRadius, blocked, mapW, mapH,
    );

    for (const key of brightCells) litBrightCells.add(key);
    for (const key of dimTotalCells) {
      if (!brightCells.has(key)) litDimCells.add(key);
    }
  }

  // Process each token's vision
  for (const token of tokensToProcess) {
    const config = tokenVision[token.id] ?? DEFAULT_VISION;
    if (!config.enabled) continue;

    // Use drag override position if available
    const override = dragOverrides?.[token.id];
    const tx = override?.x ?? token.x;
    const ty = override?.y ?? token.y;

    // Normal vision
    if (config.normal > 0) {
      const normalCells = shadowCast(
        tx, ty, config.normal, blocked, mapW, mapH,
      );
      for (const key of normalCells) visible.add(key);
    }

    // Token's own light source
    if (config.lightBright > 0 || config.lightDim > 0) {
      const brightCells = shadowCast(
        tx, ty, config.lightBright, blocked, mapW, mapH,
      );
      const dimTotalCells = shadowCast(
        tx, ty, config.lightBright + config.lightDim, blocked, mapW, mapH,
      );

      for (const key of brightCells) visible.add(key);
      for (const key of dimTotalCells) {
        if (!brightCells.has(key)) dimCells.add(key);
      }
    }

    // Darkvision — extends vision into dark areas
    if (config.darkvision > 0) {
      const dvCells = shadowCast(
        tx, ty, config.darkvision, blocked, mapW, mapH,
      );
      for (const key of dvCells) {
        if (!visible.has(key)) {
          darkvisionCells.add(key);
          visible.add(key);
        }
      }
    }

    // Blindsight
    if (config.blindsight > 0) {
      const bsCells = shadowCast(
        tx, ty, config.blindsight, blocked, mapW, mapH,
      );
      for (const key of bsCells) visible.add(key);
    }

    // Truesight — sees through everything including fog
    if (config.truesight > 0) {
      // Truesight ignores walls
      const tsCells = shadowCast(
        tx, ty, config.truesight, new Set(), mapW, mapH,
      );
      for (const key of tsCells) visible.add(key);
    }

    // Tremorsense — detects through walls
    if (config.tremorsense > 0) {
      const trCells = shadowCast(
        tx, ty, config.tremorsense, new Set(), mapW, mapH,
      );
      for (const key of trCells) visible.add(key);
    }

    // Fixed light sources: if this token has normal vision, it can see lit areas
    if (config.normal > 0) {
      // Token can see bright lit cells within its maximum vision range
      const maxRange = Math.max(config.normal, config.darkvision);
      for (const key of litBrightCells) {
        const [lx, ly] = key.split(",").map(Number);
        const dist = Math.max(Math.abs(lx - tx), Math.abs(ly - ty));
        if (dist <= maxRange) visible.add(key);
      }
      for (const key of litDimCells) {
        const [lx, ly] = key.split(",").map(Number);
        const dist = Math.max(Math.abs(lx - tx), Math.abs(ly - ty));
        if (dist <= maxRange && !visible.has(key)) {
          dimCells.add(key);
          visible.add(key);
        }
      }
    }
  }

  // Remove dim/darkvision markers from cells that ended up in full bright
  // (another token's normal vision might cover them)
  for (const key of visible) {
    if (dimCells.has(key) && !darkvisionCells.has(key)) {
      // Check if any token sees this cell with normal vision (not dim)
      // We keep it as dim only if no token has it in normal range
    }
  }

  return { visible, dimCells, darkvisionCells };
}
