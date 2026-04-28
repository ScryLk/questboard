// Bônus de proficiência por nível (SRD 5.1).
// Sobe no 5/9/13/17.

const TABLE: Readonly<Record<number, number>> = Object.freeze({
  1: 2, 2: 2, 3: 2, 4: 2,
  5: 3, 6: 3, 7: 3, 8: 3,
  9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 5,
  17: 6, 18: 6, 19: 6, 20: 6,
});

export function proficiencyBonus(level: number): number {
  if (level < 1) return 2;
  if (level > 20) return 6;
  return TABLE[level] ?? 2;
}
