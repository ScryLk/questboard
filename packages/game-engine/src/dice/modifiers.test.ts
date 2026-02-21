import { describe, it, expect } from "vitest";
import {
  explodeDice,
  rerollBelow,
  keepHighest,
  keepLowest,
  dropHighest,
  dropLowest,
  countSuccesses,
} from "./modifiers.js";

describe("keepHighest", () => {
  it("keeps the N highest values", () => {
    expect(keepHighest([1, 5, 3, 6, 2], 3)).toEqual([6, 5, 3]);
  });

  it("keeps all when count >= rolls length", () => {
    expect(keepHighest([3, 1], 5).sort((a, b) => a - b)).toEqual([1, 3]);
  });

  it("returns empty for count 0", () => {
    expect(keepHighest([1, 2, 3], 0)).toEqual([]);
  });
});

describe("keepLowest", () => {
  it("keeps the N lowest values", () => {
    expect(keepLowest([1, 5, 3, 6, 2], 3)).toEqual([1, 2, 3]);
  });

  it("keeps all when count >= rolls length", () => {
    expect(keepLowest([3, 1], 5).sort((a, b) => a - b)).toEqual([1, 3]);
  });
});

describe("dropHighest", () => {
  it("drops the N highest values", () => {
    const result = dropHighest([1, 5, 3, 6, 2], 2);
    expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });

  it("returns empty when dropping all", () => {
    expect(dropHighest([1, 2, 3], 3)).toEqual([]);
  });
});

describe("dropLowest", () => {
  it("drops the N lowest values", () => {
    const result = dropLowest([1, 5, 3, 6, 2], 2);
    expect(result.sort((a, b) => a - b)).toEqual([3, 5, 6]);
  });
});

describe("countSuccesses", () => {
  it("counts rolls meeting or exceeding target", () => {
    expect(countSuccesses([1, 4, 5, 6, 3], 5)).toBe(2);
  });

  it("returns 0 when no successes", () => {
    expect(countSuccesses([1, 2, 3], 6)).toBe(0);
  });

  it("counts all when all succeed", () => {
    expect(countSuccesses([5, 6, 7], 5)).toBe(3);
  });

  it("counts exact matches", () => {
    expect(countSuccesses([5], 5)).toBe(1);
  });
});

describe("explodeDice", () => {
  it("adds extra rolls when max value is rolled", () => {
    // With sides=6 and rolls=[6, 3], the 6 explodes
    const result = explodeDice([6, 3], 6);
    expect(result.length).toBeGreaterThanOrEqual(3); // at least one extra roll
    expect(result[0]).toBe(6);
    expect(result[1]).toBe(3);
  });

  it("does not explode when no max values", () => {
    const result = explodeDice([1, 3, 5], 6);
    expect(result).toEqual([1, 3, 5]);
  });

  it("respects max explosions limit", () => {
    // Even if every explosion rolls max, we cap at maxExplosions
    const result = explodeDice([6], 6, 3);
    expect(result.length).toBeLessThanOrEqual(5); // 1 original + 3 max explosions + possible extra
  });
});

describe("rerollBelow", () => {
  it("rerolls dice below the minimum", () => {
    const result = rerollBelow([1, 4, 2, 6], 6, 3);
    // Values 1 and 2 should be rerolled
    expect(result[1]).toBe(4);
    expect(result[3]).toBe(6);
    // Rerolled values should be 1-6
    expect(result[0]).toBeGreaterThanOrEqual(1);
    expect(result[0]).toBeLessThanOrEqual(6);
    expect(result[2]).toBeGreaterThanOrEqual(1);
    expect(result[2]).toBeLessThanOrEqual(6);
  });

  it("does not reroll dice at or above minimum", () => {
    const result = rerollBelow([3, 4, 5], 6, 3);
    expect(result).toEqual([3, 4, 5]);
  });
});
