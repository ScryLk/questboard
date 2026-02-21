import { describe, it, expect } from "vitest";
import { findPath } from "./pathfinding.js";
import type { GridConfig } from "./grid.js";

const config: GridConfig = {
  type: "SQUARE",
  cellSize: 50,
  width: 10,
  height: 10,
};

describe("findPath", () => {
  it("finds a straight horizontal path", () => {
    const path = findPath({ x: 0, y: 0 }, { x: 3, y: 0 }, config);
    expect(path).not.toBeNull();
    expect(path![0]).toEqual({ x: 0, y: 0 });
    expect(path![path!.length - 1]).toEqual({ x: 3, y: 0 });
    expect(path!.length).toBe(4); // 4 cells from (0,0) to (3,0)
  });

  it("finds a straight vertical path", () => {
    const path = findPath({ x: 0, y: 0 }, { x: 0, y: 3 }, config);
    expect(path).not.toBeNull();
    expect(path![0]).toEqual({ x: 0, y: 0 });
    expect(path![path!.length - 1]).toEqual({ x: 0, y: 3 });
  });

  it("returns a path of length 1 for same start and end", () => {
    const path = findPath({ x: 3, y: 3 }, { x: 3, y: 3 }, config);
    expect(path).not.toBeNull();
    expect(path).toHaveLength(1);
    expect(path![0]).toEqual({ x: 3, y: 3 });
  });

  it("navigates around blocked cells", () => {
    const blocked = new Set(["2,0", "2,1", "2,2"]);
    const isBlocked = (x: number, y: number) => blocked.has(`${x},${y}`);

    const path = findPath({ x: 0, y: 0 }, { x: 4, y: 0 }, config, isBlocked);
    expect(path).not.toBeNull();
    // Path should avoid blocked cells
    for (const pos of path!) {
      expect(blocked.has(`${pos.x},${pos.y}`)).toBe(false);
    }
    expect(path![path!.length - 1]).toEqual({ x: 4, y: 0 });
  });

  it("returns null when path is completely blocked", () => {
    // Create a wall that completely blocks the path
    const isBlocked = (x: number, _y: number) => x === 5;
    const smallConfig: GridConfig = { ...config, width: 10, height: 1 };
    const path = findPath(
      { x: 0, y: 0 },
      { x: 9, y: 0 },
      smallConfig,
      isBlocked
    );
    expect(path).toBeNull();
  });

  it("finds the shortest path (no unnecessary detours)", () => {
    const path = findPath({ x: 0, y: 0 }, { x: 2, y: 0 }, config);
    expect(path).not.toBeNull();
    expect(path!.length).toBe(3); // (0,0) -> (1,0) -> (2,0)
  });

  it("each step is adjacent to the previous one", () => {
    const path = findPath({ x: 0, y: 0 }, { x: 5, y: 5 }, config);
    expect(path).not.toBeNull();
    for (let i = 1; i < path!.length; i++) {
      const prev = path![i - 1]!;
      const curr = path![i]!;
      const dx = Math.abs(curr.x - prev.x);
      const dy = Math.abs(curr.y - prev.y);
      // Each step should be exactly 1 cell in one direction
      expect(dx + dy).toBe(1);
    }
  });
});
