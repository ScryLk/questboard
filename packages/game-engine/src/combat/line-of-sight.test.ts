import { describe, it, expect } from "vitest";
import { hasLineOfSight, bresenhamLine } from "./line-of-sight.js";

describe("bresenhamLine", () => {
  it("generates a horizontal line", () => {
    const points = bresenhamLine(0, 0, 4, 0);
    expect(points).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
    ]);
  });

  it("generates a vertical line", () => {
    const points = bresenhamLine(0, 0, 0, 3);
    expect(points).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
    ]);
  });

  it("generates a diagonal line", () => {
    const points = bresenhamLine(0, 0, 3, 3);
    expect(points).toHaveLength(4);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[points.length - 1]).toEqual({ x: 3, y: 3 });
  });

  it("handles single point (start == end)", () => {
    const points = bresenhamLine(2, 2, 2, 2);
    expect(points).toEqual([{ x: 2, y: 2 }]);
  });

  it("generates line in negative direction", () => {
    const points = bresenhamLine(3, 0, 0, 0);
    expect(points).toHaveLength(4);
    expect(points[0]).toEqual({ x: 3, y: 0 });
    expect(points[points.length - 1]).toEqual({ x: 0, y: 0 });
  });
});

describe("hasLineOfSight", () => {
  it("returns true when no walls exist", () => {
    const noWalls = () => false;
    expect(hasLineOfSight(0, 0, 5, 5, noWalls)).toBe(true);
  });

  it("returns false when a wall blocks the path", () => {
    const isWall = (x: number, y: number) => x === 2 && y === 0;
    expect(hasLineOfSight(0, 0, 4, 0, isWall)).toBe(false);
  });

  it("returns true when wall is at the start (start is not checked)", () => {
    const isWall = (x: number, y: number) => x === 0 && y === 0;
    expect(hasLineOfSight(0, 0, 3, 0, isWall)).toBe(true);
  });

  it("returns false when wall is at the end", () => {
    const isWall = (x: number, y: number) => x === 3 && y === 0;
    expect(hasLineOfSight(0, 0, 3, 0, isWall)).toBe(false);
  });

  it("returns true for adjacent cells with no wall between", () => {
    const noWalls = () => false;
    expect(hasLineOfSight(0, 0, 1, 0, noWalls)).toBe(true);
  });

  it("returns true for same cell (no wall check needed)", () => {
    const allWalls = () => true;
    // Same cell: bresenhamLine returns [start], and we skip index 0
    expect(hasLineOfSight(2, 2, 2, 2, allWalls)).toBe(true);
  });

  it("handles diagonal wall blocking", () => {
    const isWall = (x: number, y: number) => x === 2 && y === 2;
    expect(hasLineOfSight(0, 0, 4, 4, isWall)).toBe(false);
  });
});
