// ── Character System Types ──────────────────────────────────

export type CharacterCategory = "npc" | "creature";

export type CharacterRole =
  | "ally"
  | "villain"
  | "neutral"
  | "merchant"
  | "quest"
  | "boss";

export type CreatureType =
  | "humanoide"
  | "besta"
  | "morto-vivo"
  | "aberracao"
  | "constructo"
  | "dragao"
  | "elementar"
  | "fada"
  | "fiend"
  | "gigante"
  | "monstruosidade"
  | "planta"
  | "slime";

export type CharacterDisposition =
  | "hostile"
  | "neutral"
  | "friendly"
  | "undead";

export interface CharacterStats {
  hp: number;
  maxHp: number;
  ac: number;
  speed: number;
  cr?: string;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  initiative?: number;
  passivePerception?: number;
  savingThrows?: string[];
  skills?: string[];
  damageImmunities?: string[];
  conditionImmunities?: string[];
  senses?: string;
  languages?: string[];
}

export interface CharacterAction {
  id: string;
  name: string;
  description: string;
  attackBonus?: number;
  damage?: string;
  damageType?: string;
  reach?: number;
  isLegendary?: boolean;
  isReaction?: boolean;
}

export interface CampaignCharacter {
  id: string;
  name: string;
  title?: string;
  description: string;
  category: CharacterCategory;
  role?: CharacterRole;
  creatureType?: CreatureType;

  // Sprite — token de mapa
  spriteUrl: string | null;
  spriteGeneratedByAI: boolean;
  spritePrompt?: string;
  disposition: CharacterDisposition;

  // Portrait — para chat e ficha
  portraitUrl?: string;
  portraitColor: string;

  // Stats
  stats: CharacterStats;
  actions: CharacterAction[];
  traits?: string;

  // Vinculo narrativo
  linkedNarrativeNodeIds: string[];

  // Dialogo (para NPCs)
  dialogueEnabled: boolean;
  dialogueGreeting?: string;
  dialogueNotes?: string;

  // Escopo
  createdByCampaignId?: string;
  createdByUserId: string;
  isPublic: boolean;
  favorite: boolean;

  createdAt: string;
  updatedAt: string;
}

// ── Config Constants ──────────────────────────────────────────

export const CHAR_CATEGORY_CONFIG: Record<
  CharacterCategory,
  { label: string; color: string; emoji: string }
> = {
  npc: { label: "NPC", color: "#74B9FF", emoji: "👤" },
  creature: { label: "Criatura", color: "#FF4444", emoji: "🐉" },
};

export const ROLE_CONFIG: Record<
  CharacterRole,
  { label: string; color: string }
> = {
  ally: { label: "Aliado", color: "#00B894" },
  villain: { label: "Vilao", color: "#FF4444" },
  neutral: { label: "Neutro", color: "#FDCB6E" },
  merchant: { label: "Comerciante", color: "#74B9FF" },
  quest: { label: "Missao", color: "#A29BFE" },
  boss: { label: "Chefe", color: "#E17055" },
};

export const DISPOSITION_CONFIG: Record<
  CharacterDisposition,
  { label: string; color: string }
> = {
  hostile: { label: "Hostil", color: "#FF4444" },
  neutral: { label: "Neutro", color: "#FDCB6E" },
  friendly: { label: "Amigavel", color: "#00B894" },
  undead: { label: "Morto-vivo", color: "#A0522D" },
};

export const CREATURE_TYPE_CONFIG: Record<CreatureType, { label: string }> = {
  humanoide: { label: "Humanoide" },
  besta: { label: "Besta" },
  "morto-vivo": { label: "Morto-vivo" },
  aberracao: { label: "Aberracao" },
  constructo: { label: "Constructo" },
  dragao: { label: "Dragao" },
  elementar: { label: "Elementar" },
  fada: { label: "Fada" },
  fiend: { label: "Fiend" },
  gigante: { label: "Gigante" },
  monstruosidade: { label: "Monstruosidade" },
  planta: { label: "Planta" },
  slime: { label: "Slime" },
};

export const ALL_CHAR_CATEGORIES: CharacterCategory[] = ["npc", "creature"];
export const ALL_ROLES: CharacterRole[] = [
  "ally",
  "villain",
  "neutral",
  "merchant",
  "quest",
  "boss",
];
export const ALL_DISPOSITIONS: CharacterDisposition[] = [
  "hostile",
  "neutral",
  "friendly",
  "undead",
];
export const ALL_CREATURE_TYPES: CreatureType[] = [
  "humanoide",
  "besta",
  "morto-vivo",
  "aberracao",
  "constructo",
  "dragao",
  "elementar",
  "fada",
  "fiend",
  "gigante",
  "monstruosidade",
  "planta",
  "slime",
];
