"use client";

import { useState } from "react";
import { X, Ban, ShieldCheck, UserCog } from "lucide-react";
import { useAdminStore } from "@/stores/adminStore";
import { StatusBadge } from "./status-badge";
import {
  USER_ROLE_LABELS,
  USER_ROLE_COLORS,
  PLAN_LABELS,
  PLAN_COLORS,
  type UserRole,
} from "@/types/admin";

export function UserDetailDrawer() {
  const open = useAdminStore((s) => s.userDetailOpen);
  const userId = useAdminStore((s) => s.selectedUserId);
  const users = useAdminStore((s) => s.users);
  const close = useAdminStore((s) => s.closeUserDetail);
  const banUser = useAdminStore((s) => s.banUser);
  const unbanUser = useAdminStore((s) => s.unbanUser);
  const changeRole = useAdminStore((s) => s.changeUserRole);

  const [banReason, setBanReason] = useState("");
  const [showBanInput, setShowBanInput] = useState(false);

  const user = users.find((u) => u.id === userId);

  if (!open || !user) return null;

  const handleBan = () => {
    if (!banReason.trim()) return;
    banUser(user.id, banReason.trim());
    setBanReason("");
    setShowBanInput(false);
  };

  const handleUnban = () => {
    unbanUser(user.id);
  };

  const handleRoleChange = (role: UserRole) => {
    changeRole(user.id, role);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={close} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col border-l border-brand-border bg-brand-primary shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
          <h2 className="text-lg font-bold text-brand-text">Detalhes do Usuário</h2>
          <button
            onClick={close}
            className="rounded-lg p-1.5 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Avatar + Name */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent/20 text-lg font-bold text-brand-accent">
              {user.displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-brand-text">{user.displayName}</p>
              <p className="text-sm text-brand-muted">@{user.username ?? "—"}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-brand-card p-3">
              <p className="text-[10px] font-semibold uppercase text-brand-muted">Email</p>
              <p className="mt-1 truncate text-sm text-brand-text">{user.email}</p>
            </div>
            <div className="rounded-xl bg-brand-card p-3">
              <p className="text-[10px] font-semibold uppercase text-brand-muted">Membro desde</p>
              <p className="mt-1 text-sm text-brand-text">
                {new Date(user.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-6 flex items-center gap-2">
            <StatusBadge
              label={USER_ROLE_LABELS[user.role]}
              variant={user.role === "SUPER_ADMIN" ? "danger" : user.role === "ADMIN" ? "info" : "muted"}
            />
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${PLAN_COLORS[user.plan] ?? "bg-white/5 text-brand-muted"}`}>
              {PLAN_LABELS[user.plan] ?? user.plan}
            </span>
            {user.isBanned && <StatusBadge label="Banido" variant="danger" />}
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-brand-card p-3 text-center">
              <p className="text-2xl font-bold text-brand-text">{user.campaignCount}</p>
              <p className="text-xs text-brand-muted">Campanhas</p>
            </div>
            <div className="rounded-xl bg-brand-card p-3 text-center">
              <p className="text-2xl font-bold text-brand-text">{user.sessionCount}</p>
              <p className="text-xs text-brand-muted">Sessões</p>
            </div>
          </div>

          {/* Ban reason */}
          {user.isBanned && user.bannedReason && (
            <div className="mb-6 rounded-xl border border-brand-danger/30 bg-brand-danger/5 p-4">
              <p className="text-xs font-semibold uppercase text-brand-danger">Motivo do Ban</p>
              <p className="mt-1 text-sm text-brand-text">{user.bannedReason}</p>
            </div>
          )}

          {/* Divider */}
          <div className="my-6 h-px bg-brand-border" />

          {/* Actions */}
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Ações
          </p>

          {/* Role change */}
          <div className="mb-4">
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-brand-text">
              <UserCog className="h-4 w-4" />
              Alterar Role
            </label>
            <select
              value={user.role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="w-full rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
            >
              <option value="USER">Usuário</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          {/* Ban / Unban */}
          {user.isBanned ? (
            <button
              onClick={handleUnban}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-success/15 px-4 py-2.5 text-sm font-medium text-brand-success transition-colors hover:bg-brand-success/25"
            >
              <ShieldCheck className="h-4 w-4" />
              Desbanir Usuário
            </button>
          ) : showBanInput ? (
            <div className="space-y-2">
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Motivo do banimento..."
                className="w-full rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted outline-none focus:border-brand-danger"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleBan}
                  disabled={!banReason.trim()}
                  className="flex-1 rounded-lg bg-brand-danger/15 px-4 py-2 text-sm font-medium text-brand-danger transition-colors hover:bg-brand-danger/25 disabled:opacity-50"
                >
                  Confirmar Ban
                </button>
                <button
                  onClick={() => {
                    setShowBanInput(false);
                    setBanReason("");
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-brand-muted transition-colors hover:bg-white/5"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowBanInput(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-danger/15 px-4 py-2.5 text-sm font-medium text-brand-danger transition-colors hover:bg-brand-danger/25"
            >
              <Ban className="h-4 w-4" />
              Banir Usuário
            </button>
          )}
        </div>
      </div>
    </>
  );
}
