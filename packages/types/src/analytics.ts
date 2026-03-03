// ── Analytics / Dashboard Types ──

export interface SessionMetrics {
  sessionId: string;
  totalSessions: number;
  totalPlayTimeMinutes: number;
  averageSessionMinutes: number;
  totalEncounters: number;
  totalDiceRolls: number;
  totalMessages: number;
  lastPlayedAt: Date | null;
}

export interface PlayerStats {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  sessionsPlayed: number;
  totalPlayTimeMinutes: number;
  diceRolls: number;
  messagesSent: number;
  criticalHits: number;
  criticalFails: number;
  charactersCreated: number;
}

export interface CampaignOverview {
  id: string;
  name: string;
  system: string;
  playerCount: number;
  sessionCount: number;
  totalPlayTimeMinutes: number;
  lastPlayedAt: Date | null;
  status: "active" | "paused" | "completed";
}

export interface DashboardKPI {
  label: string;
  value: number;
  previousValue?: number;
  changePercent?: number;
  icon: string;
}

export interface ActivityEntry {
  id: string;
  type: "session" | "character" | "map" | "encounter" | "note";
  title: string;
  description: string;
  timestamp: Date;
  sessionId?: string;
}

export interface DiceStats {
  d4: number;
  d6: number;
  d8: number;
  d10: number;
  d12: number;
  d20: number;
  d100: number;
  totalRolls: number;
  averageResult: number;
  nat20s: number;
  nat1s: number;
}
