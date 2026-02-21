import { describe, it, expect } from "vitest";
import { roll, rollParsed } from "./roller.js";
import { parseFormula } from "./parser.js";

describe("roll", () => {
  it("returns a result for a simple formula", () => {
    const result = roll("1d6");
    expect(result.formula).toBe("1d6");
    expect(result.terms).toHaveLength(1);
    expect(result.terms[0]!.rolls).toHaveLength(1);
    expect(result.terms[0]!.rolls[0]).toBeGreaterThanOrEqual(1);
    expect(result.terms[0]!.rolls[0]).toBeLessThanOrEqual(6);
    expect(result.total).toBe(result.terms[0]!.subtotal + result.flatBonus);
  });

  it("rolls multiple dice", () => {
    const result = roll("3d8");
    expect(result.terms[0]!.rolls).toHaveLength(3);
    for (const r of result.terms[0]!.rolls) {
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(8);
    }
  });

  it("adds flat bonus to total", () => {
    const result = roll("1d6+5");
    expect(result.flatBonus).toBe(5);
    expect(result.total).toBe(result.terms[0]!.subtotal + 5);
  });

  it("applies keep highest modifier", () => {
    const result = roll("4d6kh3");
    expect(result.terms[0]!.rolls).toHaveLength(4);
    expect(result.terms[0]!.kept).toHaveLength(3);
    // Kept values should be the highest 3
    const sorted = [...result.terms[0]!.rolls].sort((a, b) => a - b);
    expect(result.terms[0]!.kept.sort((a, b) => a - b)).toEqual(
      sorted.slice(1)
    );
  });

  it("applies drop lowest modifier", () => {
    const result = roll("4d6dl1");
    expect(result.terms[0]!.rolls).toHaveLength(4);
    expect(result.terms[0]!.kept).toHaveLength(3);
  });

  it("handles multiple terms correctly", () => {
    const result = roll("2d6+1d4+3");
    expect(result.terms).toHaveLength(2);
    expect(result.flatBonus).toBe(3);
    const expectedTotal =
      result.terms[0]!.subtotal + result.terms[1]!.subtotal + 3;
    expect(result.total).toBe(expectedTotal);
  });

  it("produces values within valid range for d20", () => {
    for (let i = 0; i < 50; i++) {
      const result = roll("1d20");
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.total).toBeLessThanOrEqual(20);
    }
  });
});

describe("rollParsed", () => {
  it("works with a pre-parsed formula", () => {
    const parsed = parseFormula("2d6+3");
    const result = rollParsed("2d6+3", parsed);
    expect(result.formula).toBe("2d6+3");
    expect(result.terms).toHaveLength(1);
    expect(result.flatBonus).toBe(3);
  });
});
