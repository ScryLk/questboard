// ── Cosmetic System ──

export type CosmeticCategory = "frame" | "banner" | "title" | "background" | "dice_skin";
export type CosmeticRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface CosmeticItem {
  id: string;
  category: CosmeticCategory;
  name: string;
  description: string;
  rarity: CosmeticRarity;
  /** CSS class for rendering (frame glow, banner gradient, etc.) */
  cssClass: string;
  /** Extra CSS for inline styles (gradients, colors) */
  cssStyle?: React.CSSProperties;
  /** Whether the user has unlocked this item */
  unlocked: boolean;
  /** How to unlock — shown when locked */
  unlockHint?: string;
}

export interface EquippedCosmetics {
  frameId: string | null;
  bannerId: string | null;
  titleId: string | null;
  backgroundId: string | null;
  diceSkinId: string | null;
}

// ── Achievements ──

export type AchievementCategory = "combat" | "social" | "exploration" | "gm" | "meta";
export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string; // lucide icon name
  progress: number; // 0-100
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string; // ISO date
}

// ── Player Stats ──

export interface AdventurerStats {
  sessionsPlayed: number;
  hoursPlayed: number;
  campaignsJoined: number;
  charactersCreated: number;
  questsCompleted: number;
  criticalHits: number;
}

export interface GMStats {
  sessionsRun: number;
  hoursRun: number;
  campaignsCreated: number;
  playersHosted: number;
  encountersDesigned: number;
  averageRating: number; // 1-5
  totalReviews: number;
}

// ── Characters & Campaigns ──

export type CharacterStatus = "active" | "retired" | "deceased";

export interface ProfileCharacter {
  id: string;
  name: string;
  class: string;
  level: number;
  race: string;
  campaignName: string;
  status: CharacterStatus;
  avatarUrl?: string;
}

export type CampaignStatus = "active" | "completed" | "paused" | "abandoned";

export interface ProfileCampaign {
  id: string;
  name: string;
  system: string; // e.g., "D&D 5e", "Pathfinder 2e"
  coverGradient: string; // CSS gradient fallback
  playerCount: number;
  sessionCount: number;
  status: CampaignStatus;
  progress: number; // 0-100
  role: "gm" | "player";
}

// ── Reviews ──

export interface PlayerReview {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number; // 1-5
  comment: string;
  campaignName: string;
  date: string; // ISO date
}

// ── GM Style Tags ──

export type GMStyleTag =
  | "narrativo"
  | "tático"
  | "sandbox"
  | "roleplay-heavy"
  | "regras-leves"
  | "homebrew"
  | "teatro-da-mente"
  | "mapas-detalhados"
  | "horror"
  | "humor";

// ── Profile ──

export interface PublicProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  memberSince: string; // ISO date
  xp: number;

  adventurerStats: AdventurerStats;
  gmStats: GMStats;

  characters: ProfileCharacter[];
  campaigns: ProfileCampaign[];
  achievements: Achievement[];
  reviews: PlayerReview[];

  equipped: EquippedCosmetics;
  gmStyleTags: GMStyleTag[];
}

// ── Label Maps (pt-BR) ──

export const COSMETIC_CATEGORY_LABELS: Record<CosmeticCategory, string> = {
  frame: "Moldura",
  banner: "Banner",
  title: "Título",
  background: "Fundo",
  dice_skin: "Dado",
};

export const COSMETIC_RARITY_LABELS: Record<CosmeticRarity, string> = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário",
};

export const COSMETIC_RARITY_COLORS: Record<CosmeticRarity, string> = {
  common: "#9090A0",
  uncommon: "#10B981",
  rare: "#3B82F6",
  epic: "#A855F7",
  legendary: "#F59E0B",
};

export const ACHIEVEMENT_TIER_LABELS: Record<AchievementTier, string> = {
  bronze: "Bronze",
  silver: "Prata",
  gold: "Ouro",
  platinum: "Platina",
};

export const ACHIEVEMENT_TIER_COLORS: Record<AchievementTier, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#E5E4E2",
};

export const CHARACTER_STATUS_LABELS: Record<CharacterStatus, string> = {
  active: "Ativo",
  retired: "Aposentado",
  deceased: "Falecido",
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  active: "Em Andamento",
  completed: "Concluída",
  paused: "Pausada",
  abandoned: "Abandonada",
};

export const GM_STYLE_TAG_LABELS: Record<GMStyleTag, string> = {
  narrativo: "Narrativo",
  tático: "Tático",
  sandbox: "Sandbox",
  "roleplay-heavy": "Roleplay Heavy",
  "regras-leves": "Regras Leves",
  homebrew: "Homebrew",
  "teatro-da-mente": "Teatro da Mente",
  "mapas-detalhados": "Mapas Detalhados",
  horror: "Horror",
  humor: "Humor",
};
