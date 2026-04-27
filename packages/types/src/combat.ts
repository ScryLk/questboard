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

// ── Attack & Damage (sistema completo do prompt 5.x) ──
//
// Co-existe com os tipos legacy acima (DamageRoll, AttackResult, etc.)
// que servem ao animation engine do combate. Estes daqui modelam o
// fluxo completo de "rolar ataque + dano + aplicar HP" e correspondem
// ao schema Prisma `Attack` + `AttackResult` (quando o backend existir).
//
// "true" é dano puro sem tipo — usado por padrão quando GM não quer
// classificar.

export type AttackDamageType =
  | "true"
  | "slashing"
  | "piercing"
  | "bludgeoning"
  | "fire"
  | "cold"
  | "lightning"
  | "thunder"
  | "acid"
  | "poison"
  | "psychic"
  | "necrotic"
  | "radiant"
  | "force";

export type AttackAdvantage = "NORMAL" | "ADVANTAGE" | "DISADVANTAGE";

/** Modo de rolagem do ataque: digital (servidor + animação) ou manual
 *  (jogador rolou fisicamente e digita o resultado). Não confundir com
 *  `DiceRollMode` em `chat.ts` (PUBLIC/GM_ONLY/SELF — escopo da rolagem). */
export type AttackMode = "DIGITAL" | "MANUAL";

/** Resultado por alvo de um ataque executado. */
export interface AttackTargetResult {
  id: string;
  attackId: string;
  targetTokenId: string;
  /** CA do alvo no momento do ataque (snapshot). */
  targetAc: number | null;

  /** Dados rolados no d20 antes de aplicar advantage/disadvantage. */
  d20Rolls: number[];
  /** Valor escolhido (max em ADVANTAGE, min em DISADVANTAGE). */
  d20Final: number;
  /** d20Final + attackBonus. */
  totalAttack: number;
  isCrit: boolean;
  isFumble: boolean;
  hit: boolean;

  /** null quando errou. */
  damageRolls: number[] | null;
  damageBonus: number | null;
  damageTotal: number | null;

  /** Quando o dano foi aplicado ao HP do alvo (null se ainda pendente). */
  appliedAt: Date | null;
  appliedDamage: number | null;
}

export interface AttackRecord {
  id: string;
  sessionId: string;
  attackerTokenId: string;
  /** Quem disparou (GM ou PLAYER dono do atacante). */
  attackerUserId: string;
  attackName: string;
  attackBonus: number;
  damageNotation: string;
  damageType: AttackDamageType;
  advantage: AttackAdvantage;
  /** Mínimo de d20 natural pra crítico (20 default; 19 em armas T20). */
  critRangeMin: number;
  mode: AttackMode;
  createdAt: Date;
}

export interface AttackWithResults extends AttackRecord {
  results: AttackTargetResult[];
}

/** Configuração mandada pro client renderizar a animação 3D dos dados.
 *  `skip: true` é usado em modo MANUAL — sem animação. */
export type AttackDiceConfig =
  | { skip: true }
  | {
      skip?: false;
      damageType: AttackDamageType;
      results: Array<{
        targetTokenId: string;
        d20Rolls: number[];
        damageRolls: number[];
        damageSides: number;
        isCrit: boolean;
        isFumble: boolean;
      }>;
    };
