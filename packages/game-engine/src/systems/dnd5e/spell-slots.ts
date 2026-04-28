// Tabela de slots de magia D&D 5e por classe e nível (SRD 5.1).
//
// Conjuradores plenos (Mago, Clérigo, Druida, Bardo, Feiticeiro) seguem a
// tabela do PHB Cap. 10. Paladino e Ranger são meia-progressão (começam a
// conjurar no 2º). Bruxo (Pact Magic) é especial: poucos slots de nível
// alto, recarregam em descanso curto.

export type SpellLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type SpellSlotsByLevel = Partial<Record<SpellLevel, number>>;

const FULL_CASTER_TABLE: Record<number, SpellSlotsByLevel> = {
  1:  { 1: 2 },
  2:  { 1: 3 },
  3:  { 1: 4, 2: 2 },
  4:  { 1: 4, 2: 3 },
  5:  { 1: 4, 2: 3, 3: 2 },
  6:  { 1: 4, 2: 3, 3: 3 },
  7:  { 1: 4, 2: 3, 3: 3, 4: 1 },
  8:  { 1: 4, 2: 3, 3: 3, 4: 2 },
  9:  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
};

const HALF_CASTER_TABLE: Record<number, SpellSlotsByLevel> = {
  1:  {},
  2:  { 1: 2 },
  3:  { 1: 3 },
  4:  { 1: 3 },
  5:  { 1: 4, 2: 2 },
  6:  { 1: 4, 2: 2 },
  7:  { 1: 4, 2: 3 },
  8:  { 1: 4, 2: 3 },
  9:  { 1: 4, 2: 3, 3: 2 },
  10: { 1: 4, 2: 3, 3: 2 },
  11: { 1: 4, 2: 3, 3: 3 },
  12: { 1: 4, 2: 3, 3: 3 },
  13: { 1: 4, 2: 3, 3: 3, 4: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 2 },
  16: { 1: 4, 2: 3, 3: 3, 4: 2 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
};

/** Pact Magic do Bruxo: tudo no mesmo nível, sobe de quantidade e nível
 *  juntos. Recarrega em descanso CURTO. */
const WARLOCK_TABLE: Record<number, { count: number; level: SpellLevel }> = {
  1:  { count: 1, level: 1 },
  2:  { count: 2, level: 1 },
  3:  { count: 2, level: 2 },
  4:  { count: 2, level: 2 },
  5:  { count: 2, level: 3 },
  6:  { count: 2, level: 3 },
  7:  { count: 2, level: 4 },
  8:  { count: 2, level: 4 },
  9:  { count: 2, level: 5 },
  10: { count: 2, level: 5 },
  11: { count: 3, level: 5 },
  12: { count: 3, level: 5 },
  13: { count: 3, level: 5 },
  14: { count: 3, level: 5 },
  15: { count: 3, level: 5 },
  16: { count: 3, level: 5 },
  17: { count: 4, level: 5 },
  18: { count: 4, level: 5 },
  19: { count: 4, level: 5 },
  20: { count: 4, level: 5 },
};

const FULL_CASTER_CLASSES = new Set([
  "wizard",
  "sorcerer",
  "bard",
  "cleric",
  "druid",
]);

const HALF_CASTER_CLASSES = new Set(["paladin", "ranger"]);

/** Slots de magia base (sem gastar) por classe + nível. Retorna `{}` pra
 *  classes não conjuradoras (Guerreiro, Bárbaro, Monge, Ladino básico).
 *
 *  Subclasses meia-progressão (Eldritch Knight, Arcane Trickster) ainda
 *  não tratadas — entram numa fatia futura quando schema de subclasse
 *  estiver completo. */
export function getSpellSlotsByClassAndLevel(
  classSlug: string,
  level: number,
): SpellSlotsByLevel {
  if (level < 1 || level > 20) return {};

  if (FULL_CASTER_CLASSES.has(classSlug)) {
    return { ...FULL_CASTER_TABLE[level] };
  }
  if (HALF_CASTER_CLASSES.has(classSlug)) {
    return { ...HALF_CASTER_TABLE[level] };
  }
  if (classSlug === "warlock") {
    const entry = WARLOCK_TABLE[level];
    if (!entry) return {};
    return { [entry.level]: entry.count } as SpellSlotsByLevel;
  }
  return {};
}

/** Atributo de conjuração canônico por classe (SRD). */
export function getSpellcastingAbility(
  classSlug: string,
): "int" | "wis" | "cha" | null {
  switch (classSlug) {
    case "wizard":
      return "int";
    case "cleric":
    case "druid":
    case "ranger":
      return "wis";
    case "bard":
    case "sorcerer":
    case "warlock":
    case "paladin":
      return "cha";
    default:
      return null;
  }
}
