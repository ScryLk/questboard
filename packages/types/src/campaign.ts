// ── Campaign & Dashboard Types ──

import type { DashboardKPI, ActivityEntry, DiceStats } from "./analytics";

export type CampaignStatus = "active" | "paused" | "completed" | "archived";

// ── Enums novos (frontend-only por ora; schema migra na próxima fatia
// de backend de campaigns). UPPERCASE pra alinhar com o futuro Prisma
// enum. As string-unions ficam aqui em types/ pra evitar dep circular
// com constants/.

export type CampaignVisibility = "PRIVATE" | "CODE" | "PUBLIC";

export type CampaignFrequency =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "IRREGULAR"
  | "ONESHOT";

export type CampaignLength = "ONESHOT" | "SHORT_ARC" | "LONG" | "INDEFINITE";

export type AgeRating = "ALL_AGES" | "T14" | "T16" | "T18";

export type SafetyTool = "OPEN_DOOR" | "X_CARD" | "LINES_AND_VEILS";

// ── Shape estendido ──

/** Shape rica de uma campanha conforme spec da fatia. Campos extras
 *  vivem só no frontend até a fatia de backend persistir. Compatível
 *  superset da interface `Campaign` (legacy) abaixo. */
export interface CampaignDetailed {
  id: string;
  ownerId: string;
  name: string;
  /** Slug pra URL pública (`/c/<slug>`). Gerado quando visibility=PUBLIC. */
  slug: string | null;
  /** ID do sistema (lowercase, ex: "dnd5e"). */
  system: string;
  visibility: CampaignVisibility;
  /** Code de 8 chars do alfabeto sem ambíguos (CODE/PUBLIC). */
  joinCode: string | null;

  // Recomendados
  coverImageUrl: string | null;
  synopsis: string | null;
  tags: string[];

  // Avançados
  language: string;
  frequency: CampaignFrequency | null;
  expectedLength: CampaignLength | null;
  ageRating: AgeRating;
  contentWarnings: string[];
  safetyTools: SafetyTool[];

  // Diferenciais
  isSoloStory: boolean;
  externalChat: { discord?: string; whatsapp?: string } | null;
  /** Pitch público (só relevante quando visibility=PUBLIC). */
  publicPitch: string | null;

  // Ciclo de vida
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;

  // Agregações que o frontend mostra (mock por ora — backend fornecerá depois)
  memberCount: number;
  sessionCount: number;
}

/** Form shape do wizard de criação. Sem id/timestamps/contadores. */
export interface CampaignDraft {
  name: string;
  system: string;
  visibility: CampaignVisibility;
  coverImageUrl?: string;
  synopsis?: string;
  tags: string[];
  language: string;
  frequency?: CampaignFrequency;
  expectedLength?: CampaignLength;
  ageRating: AgeRating;
  contentWarnings: string[];
  safetyTools: SafetyTool[];
  isSoloStory: boolean;
  externalChat?: { discord?: string; whatsapp?: string };
  publicPitch?: string;
}

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
