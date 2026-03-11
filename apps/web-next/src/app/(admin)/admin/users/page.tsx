"use client";

import { Search } from "lucide-react";
import { useAdminStore, useFilteredUsers } from "@/stores/adminStore";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { UserDetailDrawer } from "@/components/admin/user-detail-drawer";
import {
  USER_ROLE_LABELS,
  PLAN_LABELS,
  type AdminUser,
  type UserRole,
} from "@/types/admin";

const ROLE_OPTIONS: { value: UserRole | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todas as Roles" },
  { value: "USER", label: "Usuário" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

const PLAN_OPTIONS = [
  { value: "ALL", label: "Todos os Planos" },
  { value: "FREE", label: "Gratuito" },
  { value: "ADVENTURER", label: "Aventureiro" },
  { value: "LEGENDARY", label: "Lendário" },
  { value: "PLAYER_PLUS", label: "Player+" },
];

const STATUS_OPTIONS: { value: "ALL" | "ACTIVE" | "BANNED"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "ACTIVE", label: "Ativos" },
  { value: "BANNED", label: "Banidos" },
];

export default function AdminUsersPage() {
  const search = useAdminStore((s) => s.userSearch);
  const roleFilter = useAdminStore((s) => s.userRoleFilter);
  const planFilter = useAdminStore((s) => s.userPlanFilter);
  const statusFilter = useAdminStore((s) => s.userStatusFilter);
  const setSearch = useAdminStore((s) => s.setUserSearch);
  const setRole = useAdminStore((s) => s.setUserRoleFilter);
  const setPlan = useAdminStore((s) => s.setUserPlanFilter);
  const setStatus = useAdminStore((s) => s.setUserStatusFilter);
  const selectUser = useAdminStore((s) => s.selectUser);
  const filtered = useFilteredUsers();

  const columns = [
    {
      key: "user",
      label: "Usuário",
      render: (u: AdminUser) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-accent/20 text-xs font-bold text-brand-accent">
            {u.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-brand-text">{u.displayName}</p>
            <p className="text-xs text-brand-muted">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (u: AdminUser) => (
        <StatusBadge
          label={USER_ROLE_LABELS[u.role]}
          variant={u.role === "SUPER_ADMIN" ? "danger" : u.role === "ADMIN" ? "info" : "muted"}
        />
      ),
    },
    {
      key: "plan",
      label: "Plano",
      render: (u: AdminUser) => (
        <span className="text-brand-text">{PLAN_LABELS[u.plan] ?? u.plan}</span>
      ),
    },
    {
      key: "stats",
      label: "Campanhas / Sessões",
      render: (u: AdminUser) => (
        <span className="text-brand-muted">
          {u.campaignCount} / {u.sessionCount}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (u: AdminUser) =>
        u.isBanned ? (
          <StatusBadge label="Banido" variant="danger" />
        ) : (
          <StatusBadge label="Ativo" variant="success" />
        ),
    },
    {
      key: "created",
      label: "Cadastro",
      render: (u: AdminUser) => (
        <span className="text-brand-muted">
          {new Date(u.createdAt).toLocaleDateString("pt-BR")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-text">Usuários</h1>
        <p className="text-sm text-brand-muted">{filtered.length} resultado(s)</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email ou username..."
            className="w-full rounded-lg border border-brand-border bg-brand-card py-2.5 pl-10 pr-4 text-sm text-brand-text placeholder:text-brand-muted outline-none focus:border-brand-accent"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRole(e.target.value as UserRole | "ALL")}
          className="rounded-lg border border-brand-border bg-brand-card px-3 py-2.5 text-sm text-brand-text outline-none focus:border-brand-accent"
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={planFilter}
          onChange={(e) => setPlan(e.target.value)}
          className="rounded-lg border border-brand-border bg-brand-card px-3 py-2.5 text-sm text-brand-text outline-none focus:border-brand-accent"
        >
          {PLAN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value as "ALL" | "ACTIVE" | "BANNED")}
          className="rounded-lg border border-brand-border bg-brand-card px-3 py-2.5 text-sm text-brand-text outline-none focus:border-brand-accent"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={filtered}
        keyField="id"
        onRowClick={(u) => selectUser(u.id)}
        emptyMessage="Nenhum usuário encontrado"
      />

      <UserDetailDrawer />
    </div>
  );
}
