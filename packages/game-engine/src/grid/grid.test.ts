import { describe, it, expect } from "vitest";
import {
  snapToGrid,
  gridToPixel,
  isInBounds,
  getNeighbors,
} from "./grid.js";
import type { GridConfig } from "./grid.js";

const squareConfig: GridConfig = {
  type: "SQUARE",
  cellSize: 50,
  width: 10,
  height: 10,
};

const hexConfig: GridConfig = {
  type: "HEX",
  cellSize: 50,
  width: 10,
  height: 10,
};

describe("snapToGrid (SQUARE)", () => {
  it("snaps pixel coordinates to the nearest grid cell", () => {
    const result = snapToGrid(120, 80, squareConfig);
    expect(result).toEqual({ x: 2, y: 2 });
  });

  it("snaps to origin for small coordinates", () => {
    const result = snapToGrid(10, 10, squareConfig);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it("snaps exactly at cell boundary", () => {
    const result = snapToGrid(100, 150, squareConfig);
    expect(result).toEqual({ x: 2, y: 3 });
  });

  it("handles zero coordinates", () => {
    const result = snapToGrid(0, 0, squareConfig);
    expect(result).toEqual({ x: 0, y: 0 });
  });
});

describe("snapToGrid (HEX)", () => {
  it("snaps to hex grid coordinates", () => {
    const result = snapToGrid(0, 0, hexConfig);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it("snaps to a hex cell for non-zero coordinates", () => {
    const result = snapToGrid(75, 86, hexConfig);
    expect(typeof result.x).toBe("number");
    expect(typeof result.y).toBe("number");
  });
});

describe("gridToPixel (SQUARE)", () => {
  it("converts grid position to pixel center", () => {
    const result = gridToPixel(2, 3, squareConfig);
    expect(result).toEqual({ pixelX: 125, pixelY: 175 });
  });

  it("converts origin to cell center", () => {
    const result = gridToPixel(0, 0, squareConfig);
    expect(result).toEqual({ pixelX: 25, pixelY: 25 });
  });
});

describe("gridToPixel (HEX)", () => {
  it("converts hex grid position to pixel", () => {
    const result = gridToPixel(0, 0, hexConfig);
    expect(result.pixelX).toBe(0);
    expect(result.pixelY).toBe(0);
  });

  it("returns numeric pixel values", () => {
    const result = gridToPixel(1, 1, hexConfig);
    expect(typeof result.pixelX).toBe("number");
    expect(typeof result.pixelY).toBe("number");
  });
});

describe("isInBounds", () => {
  it("returns true for valid positions", () => {
    expect(isInBounds(0, 0, squareConfig)).toBe(true);
    expect(isInBounds(5, 5, squareConfig)).toBe(true);
    expect(isInBounds(9, 9, squareConfig)).toBe(true);
  });

  it("returns false for negative coordinates", () => {
    expect(isInBounds(-1, 0, squareConfig)).toBe(false);
    expect(isInBounds(0, -1, squareConfig)).toBe(false);
  });

  it("returns false for out of range coordinates", () => {
    expect(isInBounds(10, 0, squareConfig)).toBe(false);
    expect(isInBounds(0, 10, squareConfig)).toBe(false);
  });
});

describe("getNeighbors (SQUARE)", () => {
  it("returns 4 neighbors for a center cell", () => {
    const neighbors = getNeighbors(5, 5, squareConfig);
    expect(neighbors).toHaveLength(4);
    expect(neighbors).toContainEqual({ x: 5, y: 4 });
    expect(neighbors).toContainEqual({ x: 6, y: 5 });
    expect(neighbors).toContainEqual({ x: 5, y: 6 });
    expect(neighbors).toContainEqual({ x: 4, y: 5 });
  });

  it("returns fewer neighbors for corner cells", () => {
    const neighbors = getNeighbors(0, 0, squareConfig);
    expect(neighbors).toHaveLength(2);
    expect(neighbors).toContainEqual({ x: 1, y: 0 });
    expect(neighbors).toContainEqual({ x: 0, y: 1 });
  });

  it("returns fewer neighbors for edge cells", () => {
    const neighbors = getNeighbors(0, 5, squareConfig);
    expect(neighbors).toHaveLength(3);
  });
});

describe("getNeighbors (HEX)", () => {
  it("returns 6 neighbors for a center hex cell", () => {
    const neighbors = getNeighbors(5, 5, hexConfig);
    expect(neighbors).toHaveLength(6);
  });

  it("filters out-of-bounds neighbors", () => {
    const neighbors = getNeighbors(0, 0, hexConfig);
    for (const n of neighbors) {
      expect(isInBounds(n.x, n.y, hexConfig)).toBe(true);
    }
  });
});
