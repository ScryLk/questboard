// ── Object System Types ──────────────────────────────────────

export type ObjectCategory = "scenery" | "item";

export type ObjectRarity =
  | "comum"
  | "incomum"
  | "raro"
  | "muito_raro"
  | "lendario";

export type InteractionEffectType =
  | "reveal_fog"
  | "spawn_npc"
  | "open_door"
  | "give_item"
  | "show_handout"
  | "teleport"
  | "trigger_event"
  | "deal_damage"
  | "play_sound"
  | "custom_note";

export interface InteractionEffect {
  id: string;
  type: InteractionEffectType;
  label: string;
  data: Record<string, unknown>;
}

export interface CampaignObject {
  id: string;
  name: string;
  description: string;
  category: ObjectCategory;
  rarity: ObjectRarity;
  tags: string[];

  // Sprite
  spriteUrl: string | null;
  spriteGeneratedByAI: boolean;
  spritePrompt?: string;
  spriteEmoji: string;
  spriteColor: string;

  // Map properties
  blocking: boolean;
  lightRadius?: number;
  lightColor?: string;

  // Item properties
  weight?: number;
  value?: number;
  isConsumable: boolean;
  charges?: number;

  // Narrative
  linkedNarrativeNodeId?: string;

  // Interaction
  interactionEnabled: boolean;
  interactionLabel?: string;
  interactionEffects: InteractionEffect[];

  // Size
  widthCells: number;
  heightCells: number;

  // Scope
  campaignId: string | null;
  isPublic: boolean;
  favorite: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface MapObjectInstance {
  id: string;
  objectId: string;
  mapId: string;
  col: number;
  row: number;
  rotation: number;
  scale: number;
  visible: boolean;
  stateData?: Record<string, unknown>;
}

// ── Config Constants ──────────────────────────────────────────

export const RARITY_CONFIG: Record<
  ObjectRarity,
  { label: string; color: string }
> = {
  comum: { label: "Comum", color: "#9CA3AF" },
  incomum: { label: "Incomum", color: "#10B981" },
  raro: { label: "Raro", color: "#3B82F6" },
  muito_raro: { label: "Muito Raro", color: "#8B5CF6" },
  lendario: { label: "Lendário", color: "#F59E0B" },
};

export const CATEGORY_CONFIG: Record<
  ObjectCategory,
  { label: string; color: string }
> = {
  scenery: { label: "Cenário", color: "#6B7280" },
  item: { label: "Item", color: "#8B5CF6" },
};

export const EFFECT_TYPE_CONFIG: Record<
  InteractionEffectType,
  { label: string }
> = {
  reveal_fog: { label: "Revelar Névoa" },
  spawn_npc: { label: "Invocar NPC" },
  open_door: { label: "Abrir Porta" },
  give_item: { label: "Dar Item" },
  show_handout: { label: "Mostrar Handout" },
  teleport: { label: "Teleportar" },
  trigger_event: { label: "Disparar Evento" },
  deal_damage: { label: "Causar Dano" },
  play_sound: { label: "Tocar Som" },
  custom_note: { label: "Nota Customizada" },
};

export const ALL_RARITIES: ObjectRarity[] = [
  "comum",
  "incomum",
  "raro",
  "muito_raro",
  "lendario",
];

export const ALL_CATEGORIES: ObjectCategory[] = ["scenery", "item"];

export const ALL_EFFECT_TYPES: InteractionEffectType[] = [
  "reveal_fog",
  "spawn_npc",
  "open_door",
  "give_item",
  "show_handout",
  "teleport",
  "trigger_event",
  "deal_damage",
  "play_sound",
  "custom_note",
];
