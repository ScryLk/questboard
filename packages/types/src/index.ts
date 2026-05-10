// ── @questboard/types barrel export ──

export * from "./user";
export * from "./session";
export * from "./character";
export * from "./map";
export * from "./combat";
export * from "./chat";
export * from "./story";
export * from "./analytics";
export * from "./world";
export * from "./socket";
export * from "./api";
export * from "./audio";
export * from "./campaign";
export * from "./feed";
export * from "./narrative";
export * from "./search";
// `SavingThrowResult` colide com o exportado de `./combat` (forma
// genérica). Re-exportamos a versão dnd5e renomeada pra evitar
// ambiguidade enquanto os módulos não convergem num só shape.
export type { SavingThrowResult as Dnd5eSavingThrowResult } from "./dnd5e";
export type {
  BreakdownEntry,
  ArmorClassResult,
  AttackAttributeOrigin,
  AttackBonusResult,
  SkillModifierResult,
  SpellSlotsByLevel,
  Dnd5eAttackEntry,
  Dnd5eDerivedStats,
} from "./dnd5e";
export * from "./cosmic-horror";
