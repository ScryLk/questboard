import { describe, expect, it } from "vitest";
import { computeFinalDamage } from "./resistances";

describe("computeFinalDamage", () => {
  it("retorna dano cru quando alvo não tem multipliers para o tipo", () => {
    const r = computeFinalDamage(10, "fire", {
      resistances: ["cold"],
      immunities: ["poison"],
      vulnerabilities: ["radiant"],
    });
    expect(r).toEqual({ final: 10, modifier: "normal" });
  });

  it("zera dano quando alvo é imune", () => {
    const r = computeFinalDamage(15, "poison", {
      resistances: [],
      immunities: ["poison"],
      vulnerabilities: [],
    });
    expect(r).toEqual({ final: 0, modifier: "immune" });
  });

  it("dobra dano em vulnerabilidade", () => {
    const r = computeFinalDamage(7, "fire", {
      resistances: [],
      immunities: [],
      vulnerabilities: ["fire"],
    });
    expect(r).toEqual({ final: 14, modifier: "vuln" });
  });

  it("metade truncada em resistência (15 → 7)", () => {
    const r = computeFinalDamage(15, "cold", {
      resistances: ["cold"],
      immunities: [],
      vulnerabilities: [],
    });
    expect(r).toEqual({ final: 7, modifier: "resist" });
  });

  it("imunidade tem prioridade sobre vulnerabilidade", () => {
    // Edge case absurdo (alvo vulnerável e imune ao mesmo tipo) — imune
    // ganha por ordem de checagem. Garante que se um GM digitar duas
    // listas conflitantes, o resultado é determinístico.
    const r = computeFinalDamage(20, "fire", {
      resistances: [],
      immunities: ["fire"],
      vulnerabilities: ["fire"],
    });
    expect(r).toEqual({ final: 0, modifier: "immune" });
  });

  it("'true' damage ignora todas as listas", () => {
    const r = computeFinalDamage(10, "true", {
      resistances: ["true" as never],
      immunities: ["true" as never],
      vulnerabilities: [],
    });
    expect(r).toEqual({ final: 10, modifier: "normal" });
  });

  it("dano zero/negativo retorna 0 sem modificador", () => {
    expect(computeFinalDamage(0, "fire", null)).toEqual({
      final: 0,
      modifier: "normal",
    });
    expect(computeFinalDamage(-5, "fire", null)).toEqual({
      final: 0,
      modifier: "normal",
    });
  });

  it("multipliers null ou undefined trata como sem modificadores", () => {
    expect(computeFinalDamage(8, "fire", null)).toEqual({
      final: 8,
      modifier: "normal",
    });
    expect(computeFinalDamage(8, "fire", undefined)).toEqual({
      final: 8,
      modifier: "normal",
    });
  });
});
