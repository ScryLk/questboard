export interface DiceTerm {
  count: number;
  sides: number;
  modifier: DiceModifier | null;
}

export interface DiceModifier {
  type: "kh" | "kl" | "dh" | "dl";
  value: number;
}

export interface ParsedFormula {
  terms: DiceTerm[];
  flatBonus: number;
}

/**
 * Parse a dice formula string into structured terms.
 * Supports: "2d6+3", "1d20kh1", "4d6dl1+2", "2d8+1d6+5"
 */
export function parseFormula(formula: string): ParsedFormula {
  const normalized = formula.replace(/\s/g, "").toLowerCase();
  const terms: DiceTerm[] = [];
  let flatBonus = 0;

  // Match dice terms and flat bonuses
  const regex = /([+-]?)(\d+)d(\d+)(?:(kh|kl|dh|dl)(\d+))?|([+-]?\d+)(?!d)/g;
  let match: RegExpExecArray | null;

  let isFirst = true;
  while ((match = regex.exec(normalized)) !== null) {
    if (match[2] !== undefined && match[3] !== undefined) {
      // Dice term: NdS
      const sign = match[1] === "-" ? -1 : 1;
      const count = parseInt(match[2], 10) * sign;
      const sides = parseInt(match[3], 10);

      if (sides < 1 || sides > 1000) {
        throw new Error(`Invalid die size: d${sides}`);
      }
      if (Math.abs(count) > 100) {
        throw new Error(`Too many dice: ${Math.abs(count)}`);
      }

      let modifier: DiceModifier | null = null;
      if (match[4] !== undefined && match[5] !== undefined) {
        modifier = {
          type: match[4] as DiceModifier["type"],
          value: parseInt(match[5], 10),
        };
      }

      terms.push({ count, sides, modifier });
    } else if (match[6] !== undefined) {
      // Flat bonus
      const value = parseInt(match[6], 10);
      if (!isFirst || match[6].startsWith("+") || match[6].startsWith("-")) {
        flatBonus += value;
      } else {
        flatBonus += value;
      }
    }
    isFirst = false;
  }

  if (terms.length === 0 && flatBonus === 0) {
    throw new Error(`Invalid dice formula: ${formula}`);
  }

  return { terms, flatBonus };
}

/**
 * Convert a parsed formula back to string representation.
 */
export function formulaToString(parsed: ParsedFormula): string {
  const parts: string[] = [];

  for (const term of parsed.terms) {
    const prefix = term.count < 0 ? "-" : parts.length > 0 ? "+" : "";
    let str = `${prefix}${Math.abs(term.count)}d${term.sides}`;
    if (term.modifier) {
      str += `${term.modifier.type}${term.modifier.value}`;
    }
    parts.push(str);
  }

  if (parsed.flatBonus !== 0) {
    const prefix = parsed.flatBonus > 0 && parts.length > 0 ? "+" : "";
    parts.push(`${prefix}${parsed.flatBonus}`);
  }

  return parts.join("");
}
