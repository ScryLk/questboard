// ── Campaign & Dashboard Types ──

import type { DashboardKPI, ActivityEntry, DiceStats } from "./analytics";

export type CampaignStatus = "active" | "paused" | "completed" | "archived";

export type SessionStatusExtended =
  | "DRAFT"
  | "SCHEDULED"
  | "LOBBY"
  | "IDLE"
  | "LIVE"
  | "PAUSED"
  | "COMPLETED";

export interface Campaign {
  id: string;
  name: string;
  description: string;
  system: string;
  code: string; // QB-XXXX
  status: CampaignStatus;
  imageUrl: string | null;
  ownerId: string;
  maxPlayers: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignSession {
  id: string;
  campaignId: string;
  name: string;
  status: SessionStatusExtended;
  sessionCode: string; // XXXXXX
  scheduledAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
  durationMinutes: number | null;
  playerCount: number;
  order: number; // #N within campaign
  mapName: string | null;
  createdAt: Date;
}

export interface CampaignPlayer {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: "GM" | "CO_GM" | "PLAYER";
  characterName: string | null;
  characterId: string | null;
  sessionsAttended: number;
  joinedAt: Date;
  isOnline?: boolean;
  confirmed?: boolean;
}

export interface PrepChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  category: "mapa" | "encontro" | "npc" | "item" | "nota" | "geral";
}

export interface PlannedEncounter {
  id: string;
  name: string;
  type: "combat" | "social" | "exploration";
  difficulty: string;
  prepared: boolean;
}

export interface CampaignDashboardData {
  campaign: Campaign;
  kpis: DashboardKPI[];
  sessions: CampaignSession[];
  players: CampaignPlayer[];
  recentActivity: ActivityEntry[];
  nextSession: CampaignSession | null;
}

export interface SessionDashboardData {
  session: CampaignSession;
  players: CampaignPlayer[];
  metrics: {
    totalRolls: number;
    totalMessages: number;
    combats: number;
    playTimeMinutes: number;
  };
  diceStats: DiceStats;
  timeline: {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: Date;
  }[];
}

export interface ScheduledSessionData {
  session: CampaignSession;
  checklist: PrepChecklistItem[];
  confirmedPlayers: CampaignPlayer[];
  pendingPlayers: CampaignPlayer[];
  encounters: PlannedEncounter[];
  gmNotes: string;
}
