import { describe, it, expect } from "vitest";
import { getAffectedCells } from "./area-of-effect.js";
import type { AoEParams } from "./area-of-effect.js";

describe("getAffectedCells", () => {
  describe("circle", () => {
    it("generates cells in a circle", () => {
      const params: AoEParams = {
        shape: "circle",
        origin: { x: 5, y: 5 },
        size: 2,
      };
      const cells = getAffectedCells(params);
      expect(cells.length).toBeGreaterThan(0);
      // Origin should be included
      expect(cells).toContainEqual({ x: 5, y: 5 });
      // All cells should be within radius
      for (const cell of cells) {
        const dist = Math.sqrt(
          (cell.x - 5) ** 2 + (cell.y - 5) ** 2
        );
        expect(dist).toBeLessThanOrEqual(2);
      }
    });

    it("generates a single cell for radius 0", () => {
      const params: AoEParams = {
        shape: "circle",
        origin: { x: 3, y: 3 },
        size: 0,
      };
      const cells = getAffectedCells(params);
      expect(cells).toEqual([{ x: 3, y: 3 }]);
    });
  });

  describe("cylinder", () => {
    it("generates same cells as circle (2D projection)", () => {
      const circleParams: AoEParams = {
        shape: "circle",
        origin: { x: 5, y: 5 },
        size: 3,
      };
      const cylinderParams: AoEParams = {
        shape: "cylinder",
        origin: { x: 5, y: 5 },
        size: 3,
      };
      const circleCells = getAffectedCells(circleParams);
      const cylinderCells = getAffectedCells(cylinderParams);
      expect(cylinderCells).toEqual(circleCells);
    });
  });

  describe("cube", () => {
    it("generates cells in a square area", () => {
      const params: AoEParams = {
        shape: "cube",
        origin: { x: 5, y: 5 },
        size: 3,
      };
      const cells = getAffectedCells(params);
      // A 3x3 cube centered at (5,5) with half=1 should give 3x3=9 cells
      expect(cells).toHaveLength(9);
      expect(cells).toContainEqual({ x: 5, y: 5 });
      expect(cells).toContainEqual({ x: 4, y: 4 });
      expect(cells).toContainEqual({ x: 6, y: 6 });
    });

    it("generates a single cell for size 1", () => {
      const params: AoEParams = {
        shape: "cube",
        origin: { x: 0, y: 0 },
        size: 1,
      };
      const cells = getAffectedCells(params);
      expect(cells).toEqual([{ x: 0, y: 0 }]);
    });
  });

  describe("cone", () => {
    it("generates cells in a cone shape", () => {
      const params: AoEParams = {
        shape: "cone",
        origin: { x: 5, y: 5 },
        size: 5,
        direction: 0, // pointing right
      };
      const cells = getAffectedCells(params);
      expect(cells.length).toBeGreaterThan(0);
      // All cells should be to the right of origin (or roughly)
      // and within the size radius
      for (const cell of cells) {
        const dist = Math.sqrt(
          (cell.x - 5) ** 2 + (cell.y - 5) ** 2
        );
        expect(dist).toBeLessThanOrEqual(5);
      }
    });

    it("defaults direction to 0 when not specified", () => {
      const params: AoEParams = {
        shape: "cone",
        origin: { x: 0, y: 0 },
        size: 3,
      };
      const cells = getAffectedCells(params);
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  describe("line", () => {
    it("generates cells in a line", () => {
      const params: AoEParams = {
        shape: "line",
        origin: { x: 0, y: 0 },
        size: 5,
        direction: 0, // pointing right
      };
      const cells = getAffectedCells(params);
      expect(cells).toHaveLength(5);
      // First cell should be 1 step from origin
      expect(cells[0]).toEqual({ x: 1, y: 0 });
      expect(cells[4]).toEqual({ x: 5, y: 0 });
    });

    it("generates cells in a diagonal line", () => {
      const params: AoEParams = {
        shape: "line",
        origin: { x: 0, y: 0 },
        size: 3,
        direction: 45,
      };
      const cells = getAffectedCells(params);
      expect(cells).toHaveLength(3);
    });
  });
});
