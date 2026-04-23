import type {
  TokenState,
  FogAreaState,
  CombatParticipant,
  ChatMessage,
  OnlinePlayer,
  CharacterSheetData,
  NPCStatBlock,
  SoundtrackTrack,
  AmbientLayer,
} from "./gameplay-store";

// ─── Empty data (previously mock) ────────────────────────

export const MOCK_MAP = {
  url: "",
  width: 1000,
  height: 750,
};

export const MOCK_GRID_SIZE = 50;

export const MOCK_TOKENS: Record<string, TokenState> = {};

export const MOCK_FOG_AREAS: FogAreaState[] = [];

export const MOCK_COMBAT_PARTICIPANTS: CombatParticipant[] = [];

export const MOCK_MESSAGES: ChatMessage[] = [];

export const MOCK_ONLINE_PLAYERS: OnlinePlayer[] = [];

export const MOCK_DICE_PRESETS: { label: string; formula: string; type: string }[] = [];

// ─── Spell & Inventory Types ─────────────────────────────

export interface MockSpell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  damage?: string;
  concentration?: boolean;
  isReaction?: boolean;
  isBonusAction?: boolean;
}

export interface MockSpellSlot {
  level: number;
  total: number;
  used: number;
}

export interface MockInventoryItem {
  id: string;
  name: string;
  category: "weapon" | "armor" | "gear" | "consumable" | "treasure";
  quantity: number;
  weight: number;
  equipped: boolean;
  description?: string;
  damage?: string;
  attackBonus?: number;
  armorClass?: number;
}

export interface MockCoins {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface MockCharacterSheetExtended {
  name: string;
  playerName?: string;
  class: string;
  race: string;
  level: number;
  hp: { current: number; max: number };
  ac: number;
  initiative: number;
  speed: number;
  abilities: Record<string, { score: number; modifier: number; saveProficiency: boolean }>;
  skills: { name: string; modifier: number; proficient: boolean }[];
  proficiencies: { armor: string[]; weapons: string[]; languages: string[] };
  features: { name: string; description: string; uses: { current: number; max: number } | null }[];
  spells?: MockSpell[];
  spellSlots?: MockSpellSlot[];
  spellcastingAbility?: string;
  spellSaveDC?: number;
  spellAttackBonus?: number;
  inventory?: MockInventoryItem[];
  coins?: MockCoins;
  carryCapacity?: number;
  hitDice?: { current: number; max: number; die: string };
  proficiencyBonus?: number;
  concentrationSpell?: string | null;
}

export const MOCK_SPELLS: MockSpell[] = [];

export const MOCK_SPELL_SLOTS: MockSpellSlot[] = [];

export const MOCK_INVENTORY: MockInventoryItem[] = [];

export const MOCK_COINS: MockCoins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

export const MOCK_CHARACTER_SHEET: MockCharacterSheetExtended = {
  name: "",
  class: "",
  race: "",
  level: 1,
  hp: { current: 0, max: 0 },
  ac: 10,
  initiative: 0,
  speed: 30,
  proficiencyBonus: 2,
  abilities: {},
  skills: [],
  proficiencies: { armor: [], weapons: [], languages: [] },
  features: [],
  spells: [],
  spellSlots: [],
  inventory: [],
  coins: MOCK_COINS,
  carryCapacity: 0,
  hitDice: { current: 0, max: 0, die: "d8" },
  concentrationSpell: null,
};

export const MOCK_CHARACTER_SHEETS: Record<string, CharacterSheetData> = {};

export const MOCK_NPC_STAT_BLOCKS: Record<string, NPCStatBlock> = {};

export const MOCK_GM_NOTES: Record<string, string> = {};

export const MOCK_SOUNDTRACK_TRACKS: SoundtrackTrack[] = [];

export const MOCK_AMBIENT_LAYERS: AmbientLayer[] = [];
