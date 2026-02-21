import { describe, it, expect } from "vitest";
import {
  createFogState,
  addFogArea,
  removeFogArea,
  revealFogArea,
  hideFogArea,
  isPointFogged,
} from "./fog-manager.js";
import type { FogAreaData } from "./fog-manager.js";

const rectangleArea: FogAreaData = {
  id: "rect1",
  type: "rectangle",
  points: [
    [0, 0],
    [10, 10],
  ],
  revealed: false,
};

const circleArea: FogAreaData = {
  id: "circle1",
  type: "circle",
  points: [
    [5, 5],
    [3],
  ], // center (5,5), radius 3
  revealed: false,
};

const polygonArea: FogAreaData = {
  id: "poly1",
  type: "polygon",
  points: [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
  ],
  revealed: false,
};

describe("createFogState", () => {
  it("creates an empty fog state", () => {
    const state = createFogState();
    expect(state.areas).toEqual([]);
  });
});

describe("addFogArea", () => {
  it("adds a fog area to the state", () => {
    const state = addFogArea(createFogState(), rectangleArea);
    expect(state.areas).toHaveLength(1);
    expect(state.areas[0]!.id).toBe("rect1");
  });

  it("preserves existing areas", () => {
    let state = createFogState();
    state = addFogArea(state, rectangleArea);
    state = addFogArea(state, circleArea);
    expect(state.areas).toHaveLength(2);
  });
});

describe("removeFogArea", () => {
  it("removes a fog area by ID", () => {
    let state = createFogState();
    state = addFogArea(state, rectangleArea);
    state = addFogArea(state, circleArea);
    state = removeFogArea(state, "rect1");
    expect(state.areas).toHaveLength(1);
    expect(state.areas[0]!.id).toBe("circle1");
  });

  it("returns unchanged state if ID not found", () => {
    let state = createFogState();
    state = addFogArea(state, rectangleArea);
    const result = removeFogArea(state, "nonexistent");
    expect(result.areas).toHaveLength(1);
  });
});

describe("revealFogArea", () => {
  it("marks a fog area as revealed", () => {
    let state = createFogState();
    state = addFogArea(state, rectangleArea);
    state = revealFogArea(state, "rect1");
    expect(state.areas[0]!.revealed).toBe(true);
  });

  it("does not affect other areas", () => {
    let state = createFogState();
    state = addFogArea(state, rectangleArea);
    state = addFogArea(state, circleArea);
    state = revealFogArea(state, "rect1");
    expect(state.areas[1]!.revealed).toBe(false);
  });
});

describe("hideFogArea", () => {
  it("marks a fog area as unrevealed", () => {
    let state = createFogState();
    state = addFogArea(state, { ...rectangleArea, revealed: true });
    state = hideFogArea(state, "rect1");
    expect(state.areas[0]!.revealed).toBe(false);
  });
});

describe("isPointFogged", () => {
  it("returns true for points inside unrevealed rectangle fog", () => {
    let state = createFogState();
    state = addFogArea(state, rectangleArea);
    expect(isPointFogged(state, 5, 5)).toBe(true);
  });

  it("returns false for points outside fog area", () => {
    let state = createFogState();
    state = addFogArea(state, rectangleArea);
    expect(isPointFogged(state, 15, 15)).toBe(false);
  });

  it("returns false for revealed fog areas", () => {
    let state = createFogState();
    state = addFogArea(state, { ...rectangleArea, revealed: true });
    expect(isPointFogged(state, 5, 5)).toBe(false);
  });

  it("checks circle fog areas", () => {
    let state = createFogState();
    state = addFogArea(state, circleArea);
    // Point inside circle (5,5) radius 3 → (5,7) is distance 2 from center
    expect(isPointFogged(state, 5, 7)).toBe(true);
    // Point outside circle → (5,9) is distance 4 from center
    expect(isPointFogged(state, 5, 9)).toBe(false);
  });

  it("checks polygon fog areas", () => {
    let state = createFogState();
    state = addFogArea(state, polygonArea);
    expect(isPointFogged(state, 5, 5)).toBe(true);
    expect(isPointFogged(state, 15, 15)).toBe(false);
  });

  it("returns false for empty fog state", () => {
    const state = createFogState();
    expect(isPointFogged(state, 5, 5)).toBe(false);
  });
});
