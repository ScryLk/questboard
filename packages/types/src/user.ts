import type { FeedPost } from "./feed";

// ─── Existing ──────────────────────────────────────

export enum Plan {
  FREE = "FREE",
  ADVENTURER = "ADVENTURER",
  LEGENDARY = "LEGENDARY",
}

export interface User {
  id: string;
  externalId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  plan: Plan;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  plan: Plan;
  totalSessions: number;
  totalCharacters: number;
}

// ─── Profile Enums ──────────────────────────────────

export enum ProfileTier {
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
  DIAMOND = "DIAMOND",
}

export enum CharacterStatus {
  ACTIVE = "ACTIVE",
  DECEASED = "DECEASED",
  RETIRED = "RETIRED",
}

export enum CampaignRole {
  PLAYER = "PLAYER",
  GM = "GM",
}

export enum ProfileCampaignStatus {
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  ABANDONED = "ABANDONED",
  RECRUITING = "RECRUITING",
}

// ─── Profile Interfaces ────────────────────────────

export interface ProfileStats {
  sessions: number;
  hoursPlayed: number;
  characters: number;
  diceRolled: number;
  achievements: number;
  nat20s: number;
  nat1s: number;
}

export interface GMStats {
  campaigns: number;
  hoursNarrated: number;
  uniquePlayers: number;
  averageRating: number;
  totalReviews: number;
}

export interface ProfileCharacter {
  id: string;
  name: string;
  class: string;
  level: number;
  system: string;
  status: CharacterStatus;
  avatarUrl: string | null;
  highlight: string | null;
}

export interface ProfileAchievement {
  id: string;
  name: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export interface ProfileCampaign {
  id: string;
  name: string;
  system: string;
  role: CampaignRole;
  status: ProfileCampaignStatus;
  totalSessions: number;
  progress: number | null;
  thumbnailUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  playerCount: number | null;
  maxPlayers: number | null;
  nextSessionAt: string | null;
}

export interface GMReview {
  id: string;
  author: {
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
  rating: number;
  content: string;
  createdAt: string;
}

export interface LevelReward {
  level: number;
  icon: string;
  label: string;
  type: "skin" | "title" | "frame";
}

export interface XPSource {
  icon: string;
  label: string;
  value: number;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  location: string | null;
  joinedAt: string;
  plan: Plan;
  isGM: boolean;
  isPrivate: boolean;
  equippedTitle: { label: string; color: string } | null;

  // Level
  level: number;
  tier: ProfileTier;
  currentXP: number;
  requiredXP: number;

  // Social
  followersCount: number;
  followingCount: number;
  campaignsCount: number;
  isFollowing: boolean;

  // Stats
  stats: ProfileStats;
  gmStats: GMStats | null;

  // Featured content
  featuredCharacters: ProfileCharacter[];
  featuredAchievements: ProfileAchievement[];
  recentCampaigns: ProfileCampaign[];
  gmCampaigns: ProfileCampaign[];
  gmReviews: GMReview[];
  gmTags: string[];
  posts: FeedPost[];
}
