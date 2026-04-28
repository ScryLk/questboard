// ── Horror Investigativo (d100) — types compartilhados ──
//
// Espelham os outputs do motor em `@questboard/game-engine` →
// `cosmicHorror.*`. UI da ficha e do compêndio consome esses shapes.

export type CosmicHorrorAttributeKey =
  | "for"
  | "con"
  | "tam"
  | "des"
  | "apa"
  | "int"
  | "pod"
  | "edu";

export type CosmicHorrorAttributes = Record<
  CosmicHorrorAttributeKey,
  number
>;

/** Resultado de um teste d100. Comparação entre níveis: extreme >
 *  hard > regular > failure. Usado em testes opostos. */
export type CosmicHorrorSkillCheckResult =
  | "EXTREME_SUCCESS"
  | "HARD_SUCCESS"
  | "REGULAR_SUCCESS"
  | "FAILURE"
  | "FUMBLE";

/** Estados de loucura. Acumulam: temporária + indefinida + permanente. */
export type CosmicHorrorMadnessState =
  | "SANE"
  | "TEMPORARY"
  | "INDEFINITE"
  | "PERMANENT";

/** Stats derivados pré-calculados pra ficha viva. */
export interface CosmicHorrorDerivedStats {
  /** Hit Points = floor((CON + TAM) / 10). */
  hitPoints: number;
  /** Magic Points = floor(POD / 5). */
  magicPoints: number;
  /** Sanidade máxima (POD inicial - mythosKnowledge). */
  sanityMax: number;
  /** Bônus de dano (FOR+TAM): "-2", "-1", "+0", "+1d4", "+1d6", etc. */
  damageBonus: string;
  /** Build (modificador de Combate Corpo-a-Corpo). */
  build: number;
  /** Movimento por turno (em metros — converter ao renderizar). */
  moveRate: number;
  /** Esquivar = floor(DES / 2). */
  dodge: number;
  /** Lutar (Briga) — base da skill de combate desarmado. */
  brawl: number;
}

export interface CosmicHorrorSkillModifier {
  slug: string;
  /** Valor atual (0-99). */
  value: number;
  /** Atributo associado pra exibição. null pra skills puras (ex: Mythos). */
  derivesFrom?: { attr: "for" | "des"; divisor: 1 | 2 | 5 };
  /** Marcou pra improvement (xp gain) — flagged ao usar com sucesso. */
  improvementFlag?: boolean;
}

/** Mecânica de Sanidade. Mythos skill reduz teto de SAN máxima. */
export interface CosmicHorrorSanityState {
  current: number;
  max: number;
  /** POD inicial — referência imutável. SAN máxima nunca passa daqui. */
  startingMax: number;
  /** Conhecimento do Mythos (skill especial). Reduz SAN máxima 1:1. */
  mythosKnowledge: number;
  madness: CosmicHorrorMadnessState;
  /** Notas com episódios de loucura, traumas etc. */
  notes?: string;
}
