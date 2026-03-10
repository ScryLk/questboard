"use client";

import { Castle, Users, Gamepad2 } from "lucide-react";
import { useAdminStore } from "@/stores/adminStore";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import type { AdminCampaign } from "@/types/admin";

export default function AdminCampaignsPage() {
  const campaigns = useAdminStore((s) => s.campaigns);
  const kpis = useAdminStore((s) => s.kpis);

  const publicCount = campaigns.filter((c) => c.isPublic).length;

  const columns = [
    {
      key: "name",
      label: "Campanha",
      render: (c: AdminCampaign) => (
        <div>
          <p className="font-medium text-brand-text">{c.name}</p>
          <p className="text-xs text-brand-muted">{c.system}</p>
        </div>
      ),
    },
    {
      key: "owner",
      label: "Dono",
      render: (c: AdminCampaign) => (
        <div>
          <p className="text-brand-text">{c.ownerName}</p>
          <p className="text-xs text-brand-muted">{c.ownerEmail}</p>
        </div>
      ),
    },
    {
      key: "members",
      label: "Membros",
      render: (c: AdminCampaign) => (
        <span className="text-brand-muted">{c.memberCount}</span>
      ),
    },
    {
      key: "sessions",
      label: "Sessões",
      render: (c: AdminCampaign) => (
        <span className="text-brand-muted">{c.sessionCount}</span>
      ),
    },
    {
      key: "visibility",
      label: "Visibilidade",
      render: (c: AdminCampaign) =>
        c.isPublic ? (
          <StatusBadge label="Pública" variant="success" />
        ) : (
          <StatusBadge label="Privada" variant="muted" />
        ),
    },
    {
      key: "created",
      label: "Criada em",
      render: (c: AdminCampaign) => (
        <span className="text-brand-muted">
          {new Date(c.createdAt).toLocaleDateString("pt-BR")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-text">Campanhas</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-xl border border-brand-border bg-brand-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-accent/15 text-brand-accent">
            <Castle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-text">{kpis.totalCampaigns}</p>
            <p className="text-xs text-brand-muted">Total de Campanhas</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-brand-border bg-brand-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-success/15 text-brand-success">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-text">{publicCount}</p>
            <p className="text-xs text-brand-muted">Campanhas Públicas</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-brand-border bg-brand-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-info/15 text-brand-info">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-text">
              {campaigns.reduce((acc, c) => acc + c.sessionCount, 0)}
            </p>
            <p className="text-xs text-brand-muted">Total de Sessões</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={campaigns}
        keyField="id"
        emptyMessage="Nenhuma campanha encontrada"
      />
    </div>
  );
}
