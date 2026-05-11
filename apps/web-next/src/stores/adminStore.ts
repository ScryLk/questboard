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

// ── Initial state ──
//
// Painel admin inicia zerado. Dados vêm do backend (apps/api/src/
// modules/admin) quando autenticado como SUPER_ADMIN/ADMIN.

const MOCK_KPIS: AdminKPIs = {
  totalUsers: 0,
  activeUsers: 0,
  newUsersThisMonth: 0,
  totalCampaigns: 0,
  activeSessions: 0,
  totalSessions: 0,
  monthlyRevenue: 0,
  planDistribution: {
    FREE: 0,
    ADVENTURER: 0,
    LEGENDARY: 0,
    PLAYER_PLUS: 0,
  },
};

const MOCK_USERS: AdminUser[] = [];
const MOCK_CAMPAIGNS: AdminCampaign[] = [];
const MOCK_SESSIONS: AdminSession[] = [];
const MOCK_REPORTS: AdminReport[] = [];

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
