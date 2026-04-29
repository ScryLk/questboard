// ── Character System Types ──────────────────────────────────

import { PawPrint, UserRound, type LucideIcon } from "lucide-react";

// ── D&D 5e persisted data ──
//
// Shape salvo em `CampaignCharacter.dnd5eData` quando o personagem foi
// criado pelo wizard 5e. Espelha o shape do wizard store + o validator
// `dnd5eCharacterSchema` em `@questboard/validators`. A ficha viva
// re-deriva tudo via engine puro a partir desses campos.

export interface Dnd5eCharacterPersisted {
  level: number;
  classSlug: string;
  subclassSlug?: string;
  raceSlug: string;
  background: string;
  alignment?: string;
  /** Atributos finais (já com bônus de raça aplicado). */
  attributes: Record<"str" | "dex" | "con" | "int" | "wis" | "cha", number>;
  hpCurrent: number;
  hpTemp: number;
  hitDiceUsed: number;
  skillProficiencies: string[];
  expertiseSkills: string[];
  savingThrowProficiencies: Array<"str" | "dex" | "con" | "int" | "wis" | "cha">;
  /** Slugs de itens equipados. Para CA/ataques o engine olha os itens
   *  com category=armor/weapon. Outros itens ficam só no inventário. */
  equipment: Array<{ itemSlug: string; equipped: boolean; quantity?: number }>;
  /** Slugs das magias conhecidas (truques + magias preparadas). */
  spells: { cantrips: string[]; firstLevel: string[] };
  /** Slots gastos por nível: `{ "1": 2, "3": 1 }`. */
  spellSlotsExpended: Record<string, number>;
  deathSavesSuccesses: number;
  deathSavesFailures: number;
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
}

// ── Cosmic horror persisted data ──
//
// Shape salvo em `CampaignCharacter.cosmicHorrorData` quando o
// personagem foi criado pelo wizard cosmic-horror. Espelha
// `cosmicHorrorCharacterSchema` em `@questboard/validators`. A ficha
// viva re-deriva dodge/HP/MP/SAN max e bônus de dano via engine puro
// (`@questboard/game-engine` → `cosmicHorror`).

export type CosmicHorrorAttrKey =
  | "for"
  | "con"
  | "tam"
  | "des"
  | "apa"
  | "int"
  | "pod"
  | "edu";

export type CosmicHorrorMadnessState =
  | "SANE"
  | "TEMPORARY"
  | "INDEFINITE"
  | "PERMANENT";

export interface CosmicHorrorWeaponEntry {
  /** Nome livre — homebrew permitido. */
  name: string;
  /** Slug da skill usada (firearms-handgun, brawl, ...). */
  skillSlug: string;
  /** Notação de dano, ex: "1d10" ou "1d6+1". */
  damage: string;
  range?: string;
  ammo?: number;
  notes?: string;
}

export interface CosmicHorrorCharacterPersisted {
  occupation: string;
  age: number;
  birthplace?: string;
  residence?: string;

  attributes: Record<CosmicHorrorAttrKey, number>;

  /** Cache de derivados (engine recalcula sob demanda). */
  hpCurrent: number;
  hpMax: number;
  mpCurrent: number;
  mpMax: number;
  luck: number;

  // Sanidade
  sanityCurrent: number;
  sanityMax: number;
  sanityStartingMax: number;
  mythosKnowledge: number;
  madness: CosmicHorrorMadnessState;

  /** Map slug → valor atual (já com base ou derivação aplicada). */
  skills: Record<string, number>;

  weapons: CosmicHorrorWeaponEntry[];
  /** Lista textual livre — itens, livros, fetiches. */
  belongings: string[];
  creditRating: number;

  // Backstory (Cthulhu valoriza muito)
  personalDescription?: string;
  ideologyBeliefs?: string;
  significantPeople?: string;
  meaningfulLocations?: string;
  treasuredPossessions?: string;
  traits?: string;
  injuriesScars?: string;
  phobiasManias?: string;
}

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
  /** Tipos de dano que o alvo IGNORA (recebe 0). Strings casam com
   *  `AttackDamageType` quando válidas — entradas livres são ignoradas
   *  pelo engine de resistências. */
  damageImmunities?: string[];
  /** Tipos de dano que o alvo recebe pela METADE (truncada). */
  damageResistances?: string[];
  /** Tipos de dano que o alvo recebe DOBRADO. */
  damageVulnerabilities?: string[];
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

  // Dialogo (para NPCs)
  dialogueEnabled: boolean;
  dialogueGreeting?: string;
  dialogueNotes?: string;

  // Escopo
  createdByCampaignId?: string;
  createdByUserId: string;
  isPublic: boolean;
  favorite: boolean;

  /** Dados específicos de sistema. Quando presente, a ficha viva
   *  recalcula CA/mods/perícias/ataques via engine puro
   *  (`@questboard/game-engine` → `dnd5e.deriveDnd5eCharacter`).
   *  Quando ausente, ficha cai no view genérico baseado em `stats`. */
  dnd5eData?: Dnd5eCharacterPersisted;

  /** Dados específicos do sistema Horror Investigativo (d100). Quando
   *  presente, ficha viva renderiza tabs cosmic-horror com SAN tracker
   *  e re-deriva HP/MP/dodge/dmg-bonus via engine. */
  cosmicHorrorData?: CosmicHorrorCharacterPersisted;

  createdAt: string;
  updatedAt: string;
}

// ── Config Constants ──────────────────────────────────────────

export const CHAR_CATEGORY_CONFIG: Record<
  CharacterCategory,
  { label: string; color: string; icon: LucideIcon }
> = {
  npc: { label: "NPC", color: "#74B9FF", icon: UserRound },
  creature: { label: "Criatura", color: "#FF4444", icon: PawPrint },
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
