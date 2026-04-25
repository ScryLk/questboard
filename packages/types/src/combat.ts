// ── Combat Types ──
//
// Shapes canônicas do Combat Tracker. Honra o sistema existente:
//   - "alignment" (não "faction") com valores lowercase
//   - conditions lowercase (espelha ConditionType de gameplay-mock-data)
//
// InitiativeEntry (abaixo) é legado usado por ServerToClientEvents
// `initiative:updated`; será substituído por `combat:turn-changed` nas
// fatias seguintes.

// ── Legacy (mantido para socket event `initiative:updated`) ──

export interface InitiativeEntry {
  id: string;
  tokenId: string;
  label: string;
  initiative: number;
  isCurrentTurn: boolean;
}

// ── Canonical ──

export type CombatAlignment = "player" | "hostile" | "neutral" | "ally";

// IDs das conditions — literal union espelhando COMBAT_CONDITION_IDS
// em @questboard/constants. Duplicação aceita porque types/ é folha
// (sem dep em constants) e o Zod schema também valida a literal.
export type CombatConditionId =
  | "blinded"
  | "charmed"
  | "concentrating"
  | "deafened"
  | "frightened"
  | "grappled"
  | "incapacitated"
  | "invisible"
  | "paralyzed"
  | "petrified"
  | "poisoned"
  | "prone"
  | "restrained"
  | "stunned"
  | "unconscious"
  | "custom";

export interface CombatCondition {
  conditionId: CombatConditionId;
  /** Label customizada quando conditionId === "custom". */
  customLabel?: string;
  /** Epoch ms. */
  appliedAt: number;
  /** Rodadas restantes; null = indefinido. */
  durationRounds: number | null;
  appliedByUserId: string;
}

export interface CombatParticipant {
  tokenId: string;
  name: string;
  avatarUrl: string | null;
  initiative: number;
  initiativeModifier: number;
  hpCurrent: number;
  hpMax: number;
  hpTemp: number;
  armorClass: number | null;
  alignment: CombatAlignment;
  conditions: CombatCondition[];
  isDead: boolean;
  /** Marcador visual "já agiu" no round atual. */
  hasActed: boolean;
}

export interface CombatConfig {
  /** Se false, player vê HP inimigo como texto por faixa (Saudável, Ferido…). */
  showEnemyHp: boolean;
  /** 0 = sem limite; 60 ou 90 segundos. */
  turnTimerSec: 0 | 60 | 90;
}

export interface CombatState {
  sessionId: string;
  isActive: boolean;
  round: number;
  /** Índice em `participants` do turno atual. */
  currentIndex: number;
  participants: CombatParticipant[];
  config: CombatConfig;
  /** Epoch ms. null quando !isActive. */
  startedAt: number | null;
  /** Epoch ms do início do turno atual. Usado pelo timer de turno. */
  turnStartedAt: number | null;
}

// ── Damage / Rolls (existente, mantido) ──

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
