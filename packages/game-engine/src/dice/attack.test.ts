// Tests para os helpers de ataque/dano. Usa Math.random determinístico
// via mock do `crypto.getRandomValues` — o roller existente usa crypto,
// então mockamos no escopo de teste.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  rollAttackD20,
  rollAttackDamage,
  extractPrimaryDieSides,
  isValidAttackNotation,
} from "./attack";

// ── Setup: sequência determinística substituindo crypto ──
//
// O roller usa `crypto.getRandomValues(Uint32Array)` e mapeia via
// modulo. Pra forçar valores específicos: passamos uint32 = (valor-1).
// Ex: pra rolar 15 num d20, queremos byte tal que (byte % 20) + 1 = 15
// → byte % 20 = 14 → byte = 14.

let seq: number[] = [];
let seqIdx = 0;

beforeEach(() => {
  seq = [];
  seqIdx = 0;
  vi.spyOn(globalThis.crypto, "getRandomValues").mockImplementation(
    <T extends ArrayBufferView | null>(buf: T): T => {
      if (!buf) return buf;
      const u32 = buf as unknown as Uint32Array;
      for (let i = 0; i < u32.length; i++) {
        const next = seq[seqIdx++ % seq.length];
        u32[i] = next ?? 0;
      }
      return buf;
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** Helper: setar bytes que produzem os valores desejados num dado de N lados.
 *  `sides` fica documental — a aritmética `value - 1` funciona pra qualquer face. */
function feedDie(values: number[], _sides: number) {
  seq = values.map((v) => v - 1);
  seqIdx = 0;
}

describe("rollAttackD20", () => {
  it("NORMAL rola 1 dado e retorna ele", () => {
    feedDie([15], 20);
    const r = rollAttackD20("NORMAL");
    expect(r.rolls).toEqual([15]);
    expect(r.final).toBe(15);
    expect(r.mode).toBe("NORMAL");
  });

  it("ADVANTAGE rola 2 dados e retorna o maior", () => {
    feedDie([7, 18], 20);
    const r = rollAttackD20("ADVANTAGE");
    expect(r.rolls).toEqual([7, 18]);
    expect(r.final).toBe(18);
  });

  it("DISADVANTAGE rola 2 dados e retorna o menor", () => {
    feedDie([7, 18], 20);
    const r = rollAttackD20("DISADVANTAGE");
    expect(r.rolls).toEqual([7, 18]);
    expect(r.final).toBe(7);
  });

  it("ADVANTAGE com empate: ambos iguais, final = mesmo valor", () => {
    feedDie([12, 12], 20);
    const r = rollAttackD20("ADVANTAGE");
    expect(r.final).toBe(12);
  });

  it("DISADVANTAGE com 20+1: retorna 1 (fumble)", () => {
    feedDie([20, 1], 20);
    const r = rollAttackD20("DISADVANTAGE");
    expect(r.final).toBe(1);
  });
});

describe("rollAttackDamage", () => {
  it("notação simples sem crit: rola e soma normal", () => {
    feedDie([4, 5], 6); // 2d6 = 4+5 = 9
    const r = rollAttackDamage("2d6+3", false);
    expect(r.rolls).toEqual([4, 5]);
    expect(r.flatBonus).toBe(3);
    expect(r.total).toBe(12);
    expect(r.isCrit).toBe(false);
    expect(r.notation).toBe("2d6+3");
  });

  it("crit dobra apenas dados, não modificador", () => {
    feedDie([6, 6, 6, 6], 6); // 4d6 = 24, +3 = 27
    const r = rollAttackDamage("2d6+3", true);
    expect(r.rolls).toHaveLength(4);
    expect(r.flatBonus).toBe(3);
    expect(r.total).toBe(27);
    expect(r.isCrit).toBe(true);
    expect(r.notation).toBe("4d6+3");
  });

  it("notação composta crit: dobra cada termo de dado", () => {
    feedDie([6, 6, 6, 6, 4, 4], 6);
    const r = rollAttackDamage("2d6+1d4+5", true);
    // 4d6 + 2d4 + 5
    expect(r.rolls).toHaveLength(6);
    expect(r.flatBonus).toBe(5);
    expect(r.notation).toContain("4d6");
    expect(r.notation).toContain("2d4");
    expect(r.notation).toContain("+5");
  });

  it("dano sem flat bonus: total = soma dos dados", () => {
    feedDie([3, 4], 6);
    const r = rollAttackDamage("2d6", false);
    expect(r.flatBonus).toBe(0);
    expect(r.total).toBe(7);
  });
});

describe("extractPrimaryDieSides", () => {
  it.each([
    ["2d6+3", 6],
    ["1d20", 20],
    ["3d8+1d4+2", 8],
    ["1d100", 100],
  ])("%s → %i", (input, expected) => {
    expect(extractPrimaryDieSides(input)).toBe(expected);
  });
});

describe("isValidAttackNotation", () => {
  it.each(["1d8+3", "2d6", "1d20kh1", "3d8+1d4+2"])(
    "aceita %s",
    (input) => {
      expect(isValidAttackNotation(input)).toBe(true);
    },
  );

  // O parser existente tolera padrões como "1d6++3" (engole o "+" extra
  // — vira 1d6+3). Validação estrita acontece na camada do validator
  // Zod via COMPLEX_NOTATION_REGEX. Aqui só testamos o que o engine
  // efetivamente rejeita.
  it.each(["", "abc", "+3"])("rejeita %s (sem dado)", (input) => {
    expect(isValidAttackNotation(input)).toBe(false);
  });
});
