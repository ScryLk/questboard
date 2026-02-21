import { describe, it, expect } from "vitest";
import { calculateDistance, distanceToFeet } from "./distance.js";

describe("calculateDistance", () => {
  describe("euclidean", () => {
    it("calculates distance between two points", () => {
      expect(calculateDistance(0, 0, 3, 4, "euclidean")).toBe(5);
    });

    it("returns 0 for same point", () => {
      expect(calculateDistance(3, 3, 3, 3, "euclidean")).toBe(0);
    });

    it("handles negative coordinates", () => {
      const dist = calculateDistance(-1, -1, 2, 3, "euclidean");
      expect(dist).toBe(5);
    });
  });

  describe("manhattan", () => {
    it("calculates manhattan distance", () => {
      expect(calculateDistance(0, 0, 3, 4, "manhattan")).toBe(7);
    });

    it("returns 0 for same point", () => {
      expect(calculateDistance(2, 2, 2, 2, "manhattan")).toBe(0);
    });
  });

  describe("chebyshev", () => {
    it("calculates chebyshev distance", () => {
      expect(calculateDistance(0, 0, 3, 4, "chebyshev")).toBe(4);
    });

    it("returns 0 for same point", () => {
      expect(calculateDistance(1, 1, 1, 1, "chebyshev")).toBe(0);
    });

    it("handles diagonal movement (same as max of dx, dy)", () => {
      expect(calculateDistance(0, 0, 3, 3, "chebyshev")).toBe(3);
    });
  });

  describe("hex", () => {
    it("calculates hex distance for adjacent cells", () => {
      expect(calculateDistance(0, 0, 1, 0, "hex")).toBe(1);
    });

    it("returns 0 for same hex", () => {
      expect(calculateDistance(2, 3, 2, 3, "hex")).toBe(0);
    });

    it("handles diagonal hex movement", () => {
      const dist = calculateDistance(0, 0, 2, 1, "hex");
      expect(dist).toBeGreaterThanOrEqual(2);
    });
  });

  it("defaults to euclidean", () => {
    expect(calculateDistance(0, 0, 3, 4)).toBe(5);
  });
});

describe("distanceToFeet", () => {
  it("converts grid distance to feet using default 5ft per cell", () => {
    expect(distanceToFeet(6)).toBe(30);
  });

  it("converts using custom feet per cell", () => {
    expect(distanceToFeet(3, 10)).toBe(30);
  });

  it("rounds to nearest integer first", () => {
    expect(distanceToFeet(2.7)).toBe(15); // round(2.7) = 3, 3 * 5 = 15
  });

  it("handles zero distance", () => {
    expect(distanceToFeet(0)).toBe(0);
  });
});
