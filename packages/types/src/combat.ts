// ── Combat Types ──

export interface InitiativeEntry {
  id: string;
  tokenId: string;
  label: string;
  initiative: number;
  isCurrentTurn: boolean;
}

export interface CombatParticipant {
  id: string;
  name: string;
  initiative: number;
  hp: { current: number; max: number };
  ac: number;
  conditions: string[];
  isNPC: boolean;
  tokenId: string | null;
  characterId: string | null;
}

export interface CombatState {
  isActive: boolean;
  round: number;
  turnIndex: number;
  participants: CombatParticipant[];
}

export interface DamageRoll {
  formula: string;
  type: DamageType;
  total: number;
  isCritical: boolean;
}

export type DamageType =
  | "slashing"
  | "piercing"
  | "bludgeoning"
  | "fire"
  | "cold"
  | "lightning"
  | "thunder"
  | "poison"
  | "acid"
  | "necrotic"
  | "radiant"
  | "force"
  | "psychic";

export interface AttackResult {
  attackRoll: number;
  modifier: number;
  total: number;
  isCritical: boolean;
  isFumble: boolean;
  hits: boolean;
  damage?: DamageRoll;
}

export interface SavingThrowResult {
  ability: string;
  roll: number;
  modifier: number;
  total: number;
  dc: number;
  success: boolean;
}

export interface HealingResult {
  targetId: string;
  amount: number;
  overheal: number;
}
