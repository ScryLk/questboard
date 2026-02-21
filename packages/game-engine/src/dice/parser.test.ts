import { describe, it, expect } from "vitest";
import { parseFormula, formulaToString } from "./parser.js";

describe("parseFormula", () => {
  it("parses a simple die expression", () => {
    const result = parseFormula("1d20");
    expect(result.terms).toHaveLength(1);
    expect(result.terms[0]).toEqual({
      count: 1,
      sides: 20,
      modifier: null,
    });
    expect(result.flatBonus).toBe(0);
  });

  it("parses multiple dice", () => {
    const result = parseFormula("2d6");
    expect(result.terms[0]).toEqual({
      count: 2,
      sides: 6,
      modifier: null,
    });
  });

  it("parses dice with flat bonus", () => {
    const result = parseFormula("2d6+3");
    expect(result.terms).toHaveLength(1);
    expect(result.terms[0]!.count).toBe(2);
    expect(result.terms[0]!.sides).toBe(6);
    expect(result.flatBonus).toBe(3);
  });

  it("parses dice with negative flat bonus", () => {
    const result = parseFormula("1d20-2");
    expect(result.terms).toHaveLength(1);
    expect(result.flatBonus).toBe(-2);
  });

  it("parses keep highest modifier", () => {
    const result = parseFormula("4d6kh3");
    expect(result.terms[0]).toEqual({
      count: 4,
      sides: 6,
      modifier: { type: "kh", value: 3 },
    });
  });

  it("parses drop lowest modifier", () => {
    const result = parseFormula("4d6dl1");
    expect(result.terms[0]).toEqual({
      count: 4,
      sides: 6,
      modifier: { type: "dl", value: 1 },
    });
  });

  it("parses keep lowest modifier", () => {
    const result = parseFormula("2d20kl1");
    expect(result.terms[0]!.modifier).toEqual({ type: "kl", value: 1 });
  });

  it("parses drop highest modifier", () => {
    const result = parseFormula("2d20dh1");
    expect(result.terms[0]!.modifier).toEqual({ type: "dh", value: 1 });
  });

  it("parses multiple dice terms", () => {
    const result = parseFormula("2d8+1d6+5");
    expect(result.terms).toHaveLength(2);
    expect(result.terms[0]!.count).toBe(2);
    expect(result.terms[0]!.sides).toBe(8);
    expect(result.terms[1]!.count).toBe(1);
    expect(result.terms[1]!.sides).toBe(6);
    expect(result.flatBonus).toBe(5);
  });

  it("handles whitespace in formula", () => {
    const result = parseFormula("  2d6 + 3  ");
    expect(result.terms).toHaveLength(1);
    expect(result.flatBonus).toBe(3);
  });

  it("is case insensitive", () => {
    const result = parseFormula("2D6KH1");
    expect(result.terms[0]!.sides).toBe(6);
    expect(result.terms[0]!.modifier).toEqual({ type: "kh", value: 1 });
  });

  it("throws on invalid die size (too large)", () => {
    expect(() => parseFormula("1d1001")).toThrow("Invalid die size");
  });

  it("throws on too many dice", () => {
    expect(() => parseFormula("101d6")).toThrow("Too many dice");
  });

  it("throws on empty/invalid formula", () => {
    expect(() => parseFormula("abc")).toThrow("Invalid dice formula");
  });

  it("parses a flat number only", () => {
    const result = parseFormula("5");
    expect(result.terms).toHaveLength(0);
    expect(result.flatBonus).toBe(5);
  });

  it("handles negative dice terms", () => {
    const result = parseFormula("2d6-1d4");
    expect(result.terms).toHaveLength(2);
    expect(result.terms[1]!.count).toBe(-1);
    expect(result.terms[1]!.sides).toBe(4);
  });
});

describe("formulaToString", () => {
  it("converts a simple term back to string", () => {
    const parsed = parseFormula("2d6");
    expect(formulaToString(parsed)).toBe("2d6");
  });

  it("converts a term with modifier back to string", () => {
    const parsed = parseFormula("4d6dl1");
    expect(formulaToString(parsed)).toBe("4d6dl1");
  });

  it("converts a complex formula back to string", () => {
    const parsed = parseFormula("2d8+1d6+5");
    expect(formulaToString(parsed)).toBe("2d8+1d6+5");
  });

  it("converts negative flat bonus correctly", () => {
    const parsed = parseFormula("1d20-2");
    expect(formulaToString(parsed)).toBe("1d20-2");
  });

  it("handles flat bonus only", () => {
    const parsed = parseFormula("10");
    expect(formulaToString(parsed)).toBe("10");
  });
});
