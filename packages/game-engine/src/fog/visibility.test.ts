import { describe, it, expect } from "vitest";
import { calculateVisibility } from "./visibility.js";
import { createFogState, addFogArea } from "./fog-manager.js";
import type { FogAreaData } from "./fog-manager.js";

describe("calculateVisibility", () => {
  it("marks all cells as visible when no fog exists", () => {
    const fogState = createFogState();
    const results = calculateVisibility(5, 5, 2, fogState, 10, 10);

    const visibleCells = results.filter((r) => r.visible);
    const invisibleCells = results.filter((r) => !r.visible);

    // All cells within radius should be visible
    for (const cell of visibleCells) {
      const dist = Math.sqrt((cell.x - 5) ** 2 + (cell.y - 5) ** 2);
      expect(dist).toBeLessThanOrEqual(2);
    }

    // Invisible cells are only those outside the radius
    for (const cell of invisibleCells) {
      const dist = Math.sqrt((cell.x - 5) ** 2 + (cell.y - 5) ** 2);
      expect(dist).toBeGreaterThan(2);
    }
  });

  it("marks fogged cells as invisible", () => {
    const fogArea: FogAreaData = {
      id: "fog1",
      type: "rectangle",
      points: [
        [6, 6],
        [10, 10],
      ],
      revealed: false,
    };
    const fogState = addFogArea(createFogState(), fogArea);
    const results = calculateVisibility(5, 5, 3, fogState, 10, 10);

    // Cell (7, 7) is inside fog and within radius
    const foggedCell = results.find((r) => r.x === 7 && r.y === 7);
    expect(foggedCell?.visible).toBe(false);

    // Cell (4, 4) is not inside fog and within radius
    const clearCell = results.find((r) => r.x === 4 && r.y === 4);
    expect(clearCell?.visible).toBe(true);
  });

  it("clamps to grid boundaries", () => {
    const fogState = createFogState();
    const results = calculateVisibility(0, 0, 3, fogState, 10, 10);

    for (const cell of results) {
      expect(cell.x).toBeGreaterThanOrEqual(0);
      expect(cell.y).toBeGreaterThanOrEqual(0);
      expect(cell.x).toBeLessThanOrEqual(9);
      expect(cell.y).toBeLessThanOrEqual(9);
    }
  });

  it("returns empty for vision radius 0", () => {
    const fogState = createFogState();
    const results = calculateVisibility(5, 5, 0, fogState, 10, 10);
    // Only the cell at (5,5) should be in range
    const visible = results.filter((r) => r.visible);
    expect(visible).toHaveLength(1);
    expect(visible[0]).toEqual({ x: 5, y: 5, visible: true });
  });
});
