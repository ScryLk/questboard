import { create } from "zustand";
import type {
  AdminKPIs,
  AdminUser,
  AdminCampaign,
  AdminSession,
  AdminReport,
  AdminSystemSettings,
  UserRole,
} from "@/types/admin";

// ── Mock Data ──

const MOCK_KPIS: AdminKPIs = {
  totalUsers: 1247,
  activeUsers: 892,
  newUsersThisMonth: 64,
  totalCampaigns: 318,
  activeSessions: 12,
  totalSessions: 1856,
  monthlyRevenue: 478900,
  planDistribution: {
    FREE: 834,
    ADVENTURER: 256,
    LEGENDARY: 89,
    PLAYER_PLUS: 68,
  },
};

const MOCK_USERS: AdminUser[] = [
  {
    id: "u1",
    email: "admin@questboard.app",
    username: "admin",
    displayName: "Super Admin",
    avatarUrl: null,
    role: "SUPER_ADMIN",
    plan: "LEGENDARY",
    isActive: true,
    isBanned: false,
    bannedReason: null,
    createdAt: "2025-04-01T00:00:00Z",
    campaignCount: 3,
    sessionCount: 35,
  },
  {
    id: "u2",
    email: "lucas@questboard.app",
    username: "lucas",
    displayName: "Lucas",
    avatarUrl: null,
    role: "ADMIN",
    plan: "ADVENTURER",
    isActive: true,
    isBanned: false,
    bannedReason: null,
    createdAt: "2025-04-01T00:00:00Z",
    campaignCount: 4,
    sessionCount: 42,
  },
  {
    id: "u3",
    email: "ana@gmail.com",
    username: "ana_rpg",
    displayName: "Ana Silva",
    avatarUrl: null,
    role: "USER",
    plan: "ADVENTURER",
    isActive: true,
    isBanned: false,
    bannedReason: null,
    createdAt: "2025-06-15T00:00:00Z",
    campaignCount: 2,
    sessionCount: 28,
  },
  {
    id: "u4",
    email: "pedro@gmail.com",
    username: "pedro_mestre",
    displayName: "Pedro Santos",
    avatarUrl: null,
    role: "USER",
    plan: "LEGENDARY",
    isActive: true,
    isBanned: false,
    bannedReason: null,
    createdAt: "2025-05-20T00:00:00Z",
    campaignCount: 5,
    sessionCount: 67,
  },
  {
    id: "u5",
    email: "mariana@gmail.com",
    username: "mari",
    displayName: "Mariana Costa",
    avatarUrl: null,
    role: "USER",
    plan: "FREE",
    isActive: true,
    isBanned: false,
    bannedReason: null,
    createdAt: "2025-08-10T00:00:00Z",
    campaignCount: 1,
    sessionCount: 8,
  },
  {
    id: "u6",
    email: "carlos@gmail.com",
    username: "carlos_dark",
    displayName: "Carlos Oliveira",
    avatarUrl: null,
    role: "USER",
    plan: "PLAYER_PLUS",
    isActive: true,
    isBanned: false,
    bannedReason: null,
    createdAt: "2025-09-01T00:00:00Z",
    campaignCount: 3,
    sessionCount: 22,
  },
  {
    id: "u7",
    email: "toxic@fake.com",
    username: "toxic_player",
    displayName: "Jogador Tóxico",
    avatarUrl: null,
    role: "USER",
    plan: "FREE",
    isActive: false,
    isBanned: true,
    bannedReason: "Comportamento tóxico repetido em sessões públicas",
    createdAt: "2025-07-20T00:00:00Z",
    campaignCount: 0,
    sessionCount: 3,
  },
  {
    id: "u8",
    email: "juliana@gmail.com",
    username: "ju_bard",
    displayName: "Juliana Ferreira",
    avatarUrl: null,
    role: "USER",
    plan: "ADVENTURER",
    isActive: true,
    isBanned: false,
    bannedReason: null,
    createdAt: "2025-10-05T00:00:00Z",
    campaignCount: 2,
    sessionCount: 15,
  },
  {
    id: "u9",
    email: "rafael@gmail.com",
    username: "rafa_gm",
    displayName: "Rafael Mendes",
    avatarUrl: null,
    role: "USER",
    plan: "LEGENDARY",
    isActive: true,
    isBanned: false,
    bannedReason: null,
    createdAt: "2025-11-12T00:00:00Z",
    campaignCount: 6,
    sessionCount: 45,
  },
  {
    id: "u10",
    email: "spammer@fake.com",
    username: "spam_bot",
    displayName: "Spam Account",
    avatarUrl: null,
    role: "USER",
    plan: "FREE",
    isActive: false,
    isBanned: true,
    bannedReason: "Spam e propaganda em sessões públicas",
    createdAt: "2026-01-15T00:00:00Z",
    campaignCount: 0,
    sessionCount: 0,
  },
];

const MOCK_CAMPAIGNS: AdminCampaign[] = [
  { id: "c1", name: "A Maldição de Strahd", system: "D&D 5e", ownerName: "Lucas", ownerEmail: "lucas@questboard.app", memberCount: 5, sessionCount: 12, isPublic: false, createdAt: "2025-06-01T00:00:00Z" },
  { id: "c2", name: "Tumba da Aniquilação", system: "D&D 5e", ownerName: "Pedro Santos", ownerEmail: "pedro@gmail.com", memberCount: 4, sessionCount: 24, isPublic: true, createdAt: "2025-05-15T00:00:00Z" },
  { id: "c3", name: "Waterdeep: Dragon Heist", system: "D&D 5e", ownerName: "Rafael Mendes", ownerEmail: "rafael@gmail.com", memberCount: 6, sessionCount: 8, isPublic: false, createdAt: "2025-09-20T00:00:00Z" },
  { id: "c4", name: "Kingmaker", system: "Pathfinder 2e", ownerName: "Pedro Santos", ownerEmail: "pedro@gmail.com", memberCount: 5, sessionCount: 18, isPublic: true, createdAt: "2025-08-10T00:00:00Z" },
  { id: "c5", name: "A Cripta do Rei Lich", system: "D&D 5e", ownerName: "Ana Silva", ownerEmail: "ana@gmail.com", memberCount: 4, sessionCount: 6, isPublic: false, createdAt: "2025-12-01T00:00:00Z" },
  { id: "c6", name: "Sessão Zero - Iniciantes", system: "D&D 5e", ownerName: "Rafael Mendes", ownerEmail: "rafael@gmail.com", memberCount: 8, sessionCount: 3, isPublic: true, createdAt: "2026-01-10T00:00:00Z" },
];

const MOCK_SESSIONS: AdminSession[] = [
  { id: "s1", name: "O Castelo de Amber", campaignName: "A Maldição de Strahd", gmName: "Lucas", status: "LIVE", playerCount: 4, maxPlayers: 5, system: "D&D 5e", startedAt: "2026-03-08T20:00:00Z", createdAt: "2026-03-08T19:30:00Z" },
  { id: "s2", name: "Sessão 25 - O Templo", campaignName: "Tumba da Aniquilação", gmName: "Pedro Santos", status: "LIVE", playerCount: 4, maxPlayers: 4, system: "D&D 5e", startedAt: "2026-03-08T19:00:00Z", createdAt: "2026-03-08T18:30:00Z" },
  { id: "s3", name: "A Torre de Ravenloft", campaignName: "A Maldição de Strahd", gmName: "Lucas", status: "SCHEDULED", playerCount: 0, maxPlayers: 5, system: "D&D 5e", startedAt: null, createdAt: "2026-03-05T00:00:00Z" },
  { id: "s4", name: "Vinhedos Malditos", campaignName: "A Maldição de Strahd", gmName: "Lucas", status: "ENDED", playerCount: 5, maxPlayers: 5, system: "D&D 5e", startedAt: "2026-03-01T20:00:00Z", createdAt: "2026-03-01T19:30:00Z" },
  { id: "s5", name: "Kingmaker S19", campaignName: "Kingmaker", gmName: "Pedro Santos", status: "ENDED", playerCount: 5, maxPlayers: 5, system: "Pathfinder 2e", startedAt: "2026-03-07T19:00:00Z", createdAt: "2026-03-07T18:30:00Z" },
  { id: "s6", name: "One-Shot: Taverna do Dragão", campaignName: null, gmName: "Rafael Mendes", status: "LIVE", playerCount: 6, maxPlayers: 8, system: "D&D 5e", startedAt: "2026-03-08T21:00:00Z", createdAt: "2026-03-08T20:30:00Z" },
];

const MOCK_REPORTS: AdminReport[] = [
  { id: "r1", type: "user", reporterName: "Ana Silva", targetName: "Jogador Tóxico", reason: "Linguagem ofensiva e assédio durante sessão", status: "resolved", createdAt: "2026-02-20T00:00:00Z", resolvedAt: "2026-02-21T00:00:00Z" },
  { id: "r2", type: "content", reporterName: "Juliana Ferreira", targetName: "Campanha X", reason: "Conteúdo inadequado na descrição da campanha pública", status: "pending", createdAt: "2026-03-05T00:00:00Z", resolvedAt: null },
  { id: "r3", type: "user", reporterName: "Carlos Oliveira", targetName: "Spam Account", reason: "Spam e propaganda não solicitada em chat público", status: "resolved", createdAt: "2026-01-18T00:00:00Z", resolvedAt: "2026-01-19T00:00:00Z" },
  { id: "r4", type: "bug", reporterName: "Pedro Santos", targetName: "Sistema", reason: "Erro ao salvar mapa com mais de 50 tokens", status: "reviewing", createdAt: "2026-03-07T00:00:00Z", resolvedAt: null },
];

const MOCK_SETTINGS: AdminSystemSettings = {
  maintenanceMode: false,
  registrationOpen: true,
  maxConcurrentSessions: 500,
  featureFlags: {
    aiMapGeneration: true,
    asyncPlay: false,
    publicSessions: true,
    playerPlus: true,
  },
};

// ── Store ──

interface AdminState {
  kpis: AdminKPIs;
  users: AdminUser[];
  campaigns: AdminCampaign[];
  sessions: AdminSession[];
  reports: AdminReport[];
  systemSettings: AdminSystemSettings;

  userSearch: string;
  userRoleFilter: UserRole | "ALL";
  userPlanFilter: string;
  userStatusFilter: "ALL" | "ACTIVE" | "BANNED";
  selectedUserId: string | null;
  userDetailOpen: boolean;

  setUserSearch: (search: string) => void;
  setUserRoleFilter: (filter: UserRole | "ALL") => void;
  setUserPlanFilter: (filter: string) => void;
  setUserStatusFilter: (filter: "ALL" | "ACTIVE" | "BANNED") => void;
  selectUser: (id: string) => void;
  closeUserDetail: () => void;

  banUser: (id: string, reason: string) => void;
  unbanUser: (id: string) => void;
  changeUserRole: (id: string, role: UserRole) => void;
  resolveReport: (id: string, action: "resolved" | "dismissed") => void;
  updateSystemSettings: (updates: Partial<AdminSystemSettings>) => void;
  updateFeatureFlags: (updates: Partial<AdminSystemSettings["featureFlags"]>) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  kpis: MOCK_KPIS,
  users: MOCK_USERS,
  campaigns: MOCK_CAMPAIGNS,
  sessions: MOCK_SESSIONS,
  reports: MOCK_REPORTS,
  systemSettings: MOCK_SETTINGS,

  userSearch: "",
  userRoleFilter: "ALL",
  userPlanFilter: "ALL",
  userStatusFilter: "ALL",
  selectedUserId: null,
  userDetailOpen: false,

  setUserSearch: (search) => set({ userSearch: search }),
  setUserRoleFilter: (filter) => set({ userRoleFilter: filter }),
  setUserPlanFilter: (filter) => set({ userPlanFilter: filter }),
  setUserStatusFilter: (filter) => set({ userStatusFilter: filter }),
  selectUser: (id) => set({ selectedUserId: id, userDetailOpen: true }),
  closeUserDetail: () => set({ userDetailOpen: false, selectedUserId: null }),

  banUser: (id, reason) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === id ? { ...u, isBanned: true, bannedReason: reason, isActive: false } : u,
      ),
    })),

  unbanUser: (id) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === id ? { ...u, isBanned: false, bannedReason: null, isActive: true } : u,
      ),
    })),

  changeUserRole: (id, role) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, role } : u)),
    })),

  resolveReport: (id, action) =>
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === id
          ? { ...r, status: action, resolvedAt: new Date().toISOString() }
          : r,
      ),
    })),

  updateSystemSettings: (updates) =>
    set((state) => ({
      systemSettings: { ...state.systemSettings, ...updates },
    })),

  updateFeatureFlags: (updates) =>
    set((state) => ({
      systemSettings: {
        ...state.systemSettings,
        featureFlags: { ...state.systemSettings.featureFlags, ...updates },
      },
    })),
}));

// ── Derived Hook ──

export function useFilteredUsers() {
  const users = useAdminStore((s) => s.users);
  const search = useAdminStore((s) => s.userSearch);
  const roleFilter = useAdminStore((s) => s.userRoleFilter);
  const planFilter = useAdminStore((s) => s.userPlanFilter);
  const statusFilter = useAdminStore((s) => s.userStatusFilter);

  let filtered = users;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q),
    );
  }
  if (roleFilter !== "ALL") filtered = filtered.filter((u) => u.role === roleFilter);
  if (planFilter !== "ALL") filtered = filtered.filter((u) => u.plan === planFilter);
  if (statusFilter === "ACTIVE") filtered = filtered.filter((u) => !u.isBanned);
  if (statusFilter === "BANNED") filtered = filtered.filter((u) => u.isBanned);

  return filtered;
}
