// Helpers específicos do fluxo de ataque/dano (ver
// "Questboard attack damage prompt.md"). Construídos em cima do parser
// e roller existentes — não duplicam lógica de RNG.
//
// Pure functions. Servidor usa via crypto-backed `roll()`; testes
// chamam diretamente via fake injection (rollAttackD20Pure /
// rollAttackDamagePure expostas pra deterministic testing).

import { parseFormula, formulaToString, type ParsedFormula } from "./parser";
import { roll, rollParsed, type RollResult } from "./roller";

// ── d20 com vantagem/desvantagem ──

export type AdvantageMode = "NORMAL" | "ADVANTAGE" | "DISADVANTAGE";

export interface AttackD20Result {
  /** Todos os d20 rolados (1 em normal, 2 em advantage/disadvantage). */
  rolls: number[];
  /** Valor escolhido após aplicar a regra. */
  final: number;
  mode: AdvantageMode;
}

/** Rola d20 honrando vantagem/desvantagem. NORMAL=1d20, ADVANTAGE=2d20kh1,
 *  DISADVANTAGE=2d20kl1. Usa `roll()` com crypto — chame `rollAttackD20Pure`
 *  em testes pra controlar a sequência. */
export function rollAttackD20(mode: AdvantageMode): AttackD20Result {
  const result =
    mode === "NORMAL"
      ? roll("1d20")
      : mode === "ADVANTAGE"
        ? roll("2d20kh1")
        : roll("2d20kl1");

  const term = result.terms[0];
  if (!term) {
    // Defesa: parser/roller devolve sempre 1 termo, mas TS não sabe.
    throw new Error("rollAttackD20: rolagem sem termo de dado");
  }

  return {
    rolls: term.rolls,
    final: term.kept[0] ?? term.rolls[0]!,
    mode,
  };
}

// ── Dano com crítico ──

export interface AttackDamageResult {
  /** Valor de cada dado individual (ordem dos termos preservada). */
  rolls: number[];
  /** Soma de todos os flat bonuses dos termos. */
  flatBonus: number;
  /** Soma final = sum(rolls) + flatBonus. */
  total: number;
  /** Notação efetivamente rolada (em crit, com dados dobrados). */
  notation: string;
  isCrit: boolean;
}

/** Aplica regra de crítico do D&D 5e: dobra os dados, NÃO o flat bonus.
 *  `2d6+3` em crit → `4d6+3`. `2d6+1d4+3` → `4d6+2d4+3`. */
export function rollAttackDamage(
  notation: string,
  isCrit: boolean,
): AttackDamageResult {
  const parsed = parseFormula(notation);

  if (!isCrit) {
    const result = roll(notation);
    return collectAttackDamage(result, false);
  }

  const doubled: ParsedFormula = {
    terms: parsed.terms.map((t) => ({
      ...t,
      count: t.count * 2,
    })),
    flatBonus: parsed.flatBonus,
  };
  const doubledNotation = formulaToString(doubled);
  const result = rollParsed(doubledNotation, doubled);
  return collectAttackDamage(result, true);
}

function collectAttackDamage(
  result: RollResult,
  isCrit: boolean,
): AttackDamageResult {
  const rolls: number[] = [];
  for (const term of result.terms) {
    rolls.push(...term.kept);
  }
  return {
    rolls,
    flatBonus: result.flatBonus,
    total: result.total,
    notation: result.formula,
    isCrit,
  };
}

// ── Helpers utilitários ──

/** Extrai os "sides" do PRIMEIRO termo de uma notação (pra animação 3D
 *  saber qual face do dado renderizar). 2d6+1d4 → 6. */
export function extractPrimaryDieSides(notation: string): number {
  const parsed = parseFormula(notation);
  return parsed.terms[0]?.sides ?? 6;
}

/** Detecta se notação é válida sem rolar. Encapsula try/catch. */
export function isValidAttackNotation(notation: string): boolean {
  try {
    const parsed = parseFormula(notation);
    return parsed.terms.length > 0;
  } catch {
    return false;
  }
}
