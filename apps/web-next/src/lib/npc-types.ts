export type NPCType = "ally" | "hostile" | "neutral" | "merchant";

export type AttitudeLevel =
  | "hostile"
  | "unfriendly"
  | "indifferent"
  | "friendly"
  | "helpful";

export type StatBlockSource = "none" | "compendium" | "custom" | "inline";

export type CombatBehavior =
  | "non_combatant"
  | "defends_self"
  | "aggressive"
  | "ally_fighter";

export interface NPCPersonality {
  personalityTrait: string;
  ideal: string;
  bond: string;
  flaw: string;
  quirk: string;
  voiceStyle: string;
  greeting: string;
}

export interface NPCAttitude {
  initialAttitude: AttitudeLevel;
  currentAttitude: AttitudeLevel;
  attitudeCanChange: boolean;
  persuasionDC: number;
  intimidationDC: number;
  deceptionDC: number;
}

export interface NPCKnowledgeItem {
  id: string;
  text: string;
  revealed: boolean;
}

export interface NPCInteraction {
  id: string;
  timestamp: string;
  summary: string;
}

export interface NPCInlineStats {
  ac: number;
  hp: number;
  maxHp: number;
  speed: number;
  size: number;
}

export interface NPCData {
  id: string;

  // Identity
  name: string;
  title: string;
  race: string;
  gender: string;
  age: string;
  appearance: string;

  // Classification
  type: NPCType;
  tags: string[];
  location: string;
  favorite: boolean;
  archived: boolean;

  // Portrait
  portrait: string;
  portraitColor: string;

  // Personality
  personality: NPCPersonality;

  // Attitude
  attitude: NPCAttitude;

  // Knowledge
  knowledge: NPCKnowledgeItem[];
  secrets: NPCKnowledgeItem[];

  // Combat
  combatBehavior: CombatBehavior;
  statBlockSource: StatBlockSource;
  compendiumCreatureId?: string;
  customCreatureId?: string;
  inlineStats?: NPCInlineStats;

  // AI
  aiEnabled: boolean;
  aiContext: string;
  aiCreativity: number;

  // Memory
  interactions: NPCInteraction[];

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface NPCFilter {
  type?: NPCType;
  inScene?: boolean;
  hasAI?: boolean;
  favorite?: boolean;
  search?: string;
}

export const NPC_TYPE_CONFIG: {
  key: NPCType;
  label: string;
  color: string;
}[] = [
  { key: "hostile", label: "Hostil", color: "#FF4444" },
  { key: "neutral", label: "Neutro", color: "#FDCB6E" },
  { key: "ally", label: "Aliado", color: "#00B894" },
  { key: "merchant", label: "Comerciante", color: "#74B9FF" },
];

export const ATTITUDE_LABELS: Record<AttitudeLevel, string> = {
  hostile: "Hostil",
  unfriendly: "Desconfiado",
  indifferent: "Neutro",
  friendly: "Amigavel",
  helpful: "Aliado",
};

export const COMBAT_BEHAVIOR_LABELS: Record<CombatBehavior, string> = {
  non_combatant: "Nao combatente",
  defends_self: "Se defende se atacado",
  aggressive: "Agressivo",
  ally_fighter: "Aliado — luta ao lado do grupo",
};
