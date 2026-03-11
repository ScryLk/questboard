import type { CreatureSize } from "./creature-data";

// ── Token Types ─────────────────────────────────────

export type SavedTokenType =
  | "hostile"
  | "ally"
  | "neutral"
  | "object"
  | "trap"
  | "mount";

export interface SavedToken {
  id: string;

  // Identidade
  name: string;
  displayName?: string; // nome alternativo para jogadores
  type: SavedTokenType;

  // Fonte
  source: "compendium" | "custom";
  compendiumId?: string;

  // Classificação
  creatureType: string; // humanoide, morto-vivo, etc
  creatureSubtype?: string;
  size: CreatureSize;
  alignment: string;
  cr: string;
  xp: number;
  tags: string[];
  gmNotes: string;

  // Stats
  hp: number;
  hpFormula: string;
  ac: number;
  acDesc: string;
  speed: string;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  savingThrows: Array<{ ability: string; bonus: number }>;
  skills: Array<{ name: string; bonus: number }>;
  damageVulnerabilities?: string;
  damageResistances?: string;
  damageImmunities?: string;
  conditionImmunities?: string;
  senses: string;
  languages: string;

  // Ações
  abilities: Array<{ name: string; desc: string }>;
  actions: Array<{ name: string; desc: string }>;
  bonusActions: Array<{ name: string; desc: string }>;
  reactions: Array<{ name: string; desc: string }>;
  legendaryActions?: Array<{ name: string; desc: string }>;

  // Conjuração (simplificado)
  spellcasting?: {
    ability: string;
    dc: number;
    attackBonus: number;
    notes: string;
  };

  // Visual
  icon: string;
  color: string;
  gridSize: number;
  showHPBar: boolean;
  showName: boolean;
  nameDisplay: "full" | "short" | "initials";

  // Opções
  rollHPOnAdd: boolean;

  // Meta
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Encounter Groups ────────────────────────────────

export type EncounterFormation =
  | "free"
  | "cluster"
  | "line"
  | "surround"
  | "ambush";

export type HPMode = "fixed" | "rolled" | "varied";

export interface EncounterGroupMember {
  tokenId?: string;
  compendiumId?: string;
  name: string;
  count: number;
  cr: string;
  xp: number;
}

export interface EncounterGroup {
  id: string;
  name: string;
  description: string;
  tags: string[];
  members: EncounterGroupMember[];
  formation: EncounterFormation;
  hpMode: HPMode;
  autoRollInitiative: boolean;
  addToCombat: boolean;
  defaultVisibility: "visible" | "hidden";
  totalXP: number;
  adjustedXP: number;
  estimatedDifficulty: string;
  favorite: boolean;
  createdAt: string;
}

// ── Filters ─────────────────────────────────────────

export interface TokenFilter {
  search?: string;
  type?: SavedTokenType;
  cr?: string;
  creatureType?: string;
  favorite?: boolean;
  onMap?: boolean;
}

// ── Constants ───────────────────────────────────────

export const SAVED_TOKEN_TYPE_CONFIG: Record<
  SavedTokenType,
  { label: string; color: string }
> = {
  hostile: { label: "Hostil", color: "#FF4444" },
  ally: { label: "Aliado", color: "#00B894" },
  neutral: { label: "Neutro", color: "#FDCB6E" },
  object: { label: "Objeto", color: "#74B9FF" },
  trap: { label: "Armadilha", color: "#E17055" },
  mount: { label: "Montaria", color: "#A29BFE" },
};

export const FORMATION_LABELS: Record<EncounterFormation, string> = {
  free: "Livre",
  cluster: "Agrupado",
  line: "Linha",
  surround: "Cercando",
  ambush: "Emboscada",
};

export const HP_MODE_LABELS: Record<HPMode, string> = {
  fixed: "HP Fixo",
  rolled: "HP Rolado",
  varied: "HP Variado (±20%)",
};
