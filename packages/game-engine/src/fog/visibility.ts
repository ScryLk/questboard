import type { FogState } from "./fog-manager";
import { isPointFogged } from "./fog-manager";

export interface VisibilityResult {
  x: number;
  y: number;
  visible: boolean;
}

/**
 * Calculate which cells are visible from a token position,
 * considering fog of war areas.
 */
export function calculateVisibility(
  tokenX: number,
  tokenY: number,
  visionRadius: number,
  fogState: FogState,
  gridWidth: number,
  gridHeight: number
): VisibilityResult[] {
  const results: VisibilityResult[] = [];

  const minX = Math.max(0, tokenX - visionRadius);
  const maxX = Math.min(gridWidth - 1, tokenX + visionRadius);
  const minY = Math.max(0, tokenY - visionRadius);
  const maxY = Math.min(gridHeight - 1, tokenY + visionRadius);

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const distance = Math.sqrt((x - tokenX) ** 2 + (y - tokenY) ** 2);
      if (distance > visionRadius) {
        results.push({ x, y, visible: false });
        continue;
      }

      const fogged = isPointFogged(fogState, x, y);
      results.push({ x, y, visible: !fogged });
    }
  }

  return results;
}
