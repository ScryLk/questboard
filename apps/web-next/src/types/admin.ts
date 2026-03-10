export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type AdminTab = "dashboard" | "users" | "campaigns" | "sessions" | "reports" | "settings";

export interface AdminKPIs {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalCampaigns: number;
  activeSessions: number;
  totalSessions: number;
  monthlyRevenue: number;
  planDistribution: Record<string, number>;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  plan: string;
  isActive: boolean;
  isBanned: boolean;
  bannedReason: string | null;
  createdAt: string;
  campaignCount: number;
  sessionCount: number;
}

export interface AdminCampaign {
  id: string;
  name: string;
  system: string;
  ownerName: string;
  ownerEmail: string;
  memberCount: number;
  sessionCount: number;
  isPublic: boolean;
  createdAt: string;
}

export interface AdminSession {
  id: string;
  name: string;
  campaignName: string | null;
  gmName: string;
  status: string;
  playerCount: number;
  maxPlayers: number;
  system: string;
  startedAt: string | null;
  createdAt: string;
}

export interface AdminReport {
  id: string;
  type: "user" | "content" | "bug";
  reporterName: string;
  targetName: string;
  reason: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
  resolvedAt: string | null;
}

export interface AdminSystemSettings {
  maintenanceMode: boolean;
  registrationOpen: boolean;
  maxConcurrentSessions: number;
  featureFlags: {
    aiMapGeneration: boolean;
    asyncPlay: boolean;
    publicSessions: boolean;
    playerPlus: boolean;
  };
}

// ── Label Maps ──

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  USER: "Usuário",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  USER: "bg-white/5 text-brand-muted",
  ADMIN: "bg-brand-info/15 text-brand-info",
  SUPER_ADMIN: "bg-brand-danger/15 text-brand-danger",
};

export const PLAN_LABELS: Record<string, string> = {
  FREE: "Gratuito",
  ADVENTURER: "Aventureiro",
  LEGENDARY: "Lendário",
  PLAYER_PLUS: "Player+",
};

export const PLAN_COLORS: Record<string, string> = {
  FREE: "bg-white/5 text-brand-muted",
  ADVENTURER: "bg-brand-accent/15 text-brand-accent",
  LEGENDARY: "bg-brand-warning/15 text-brand-warning",
  PLAYER_PLUS: "bg-brand-success/15 text-brand-success",
};

export const REPORT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  reviewing: "Em Análise",
  resolved: "Resolvida",
  dismissed: "Dispensada",
};

export const REPORT_TYPE_LABELS: Record<string, string> = {
  user: "Usuário",
  content: "Conteúdo",
  bug: "Bug",
};

export const SESSION_STATUS_LABELS: Record<string, string> = {
  IDLE: "Inativa",
  LIVE: "Ao Vivo",
  ENDED: "Encerrada",
  SCHEDULED: "Agendada",
};
