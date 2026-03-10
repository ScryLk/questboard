"use client";

import { useState } from "react";
import { Radio, Calendar, CheckCircle } from "lucide-react";
import { useAdminStore } from "@/stores/adminStore";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { SESSION_STATUS_LABELS, type AdminSession } from "@/types/admin";

type StatusFilter = "ALL" | "LIVE" | "SCHEDULED" | "ENDED";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: "LIVE", label: "Ao Vivo" },
  { value: "SCHEDULED", label: "Agendadas" },
  { value: "ENDED", label: "Encerradas" },
];

function statusVariant(status: string): "danger" | "warning" | "muted" | "success" {
  switch (status) {
    case "LIVE": return "danger";
    case "SCHEDULED": return "warning";
    case "ENDED": return "muted";
    default: return "muted";
  }
}

export default function AdminSessionsPage() {
  const sessions = useAdminStore((s) => s.sessions);
  const [filter, setFilter] = useState<StatusFilter>("ALL");

  const filtered = filter === "ALL" ? sessions : sessions.filter((s) => s.status === filter);
  const liveCount = sessions.filter((s) => s.status === "LIVE").length;
  const scheduledCount = sessions.filter((s) => s.status === "SCHEDULED").length;
  const endedCount = sessions.filter((s) => s.status === "ENDED").length;

  const columns = [
    {
      key: "name",
      label: "Sessão",
      render: (s: AdminSession) => (
        <div>
          <p className="font-medium text-brand-text">{s.name}</p>
          <p className="text-xs text-brand-muted">{s.campaignName ?? "One-Shot"}</p>
        </div>
      ),
    },
    {
      key: "gm",
      label: "Mestre",
      render: (s: AdminSession) => <span className="text-brand-text">{s.gmName}</span>,
    },
    {
      key: "system",
      label: "Sistema",
      render: (s: AdminSession) => <span className="text-brand-muted">{s.system}</span>,
    },
    {
      key: "players",
      label: "Jogadores",
      render: (s: AdminSession) => (
        <span className="text-brand-muted">
          {s.playerCount}/{s.maxPlayers}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (s: AdminSession) => (
        <StatusBadge
          label={SESSION_STATUS_LABELS[s.status] ?? s.status}
          variant={statusVariant(s.status)}
        />
      ),
    },
    {
      key: "date",
      label: "Data",
      render: (s: AdminSession) => (
        <span className="text-brand-muted">
          {s.startedAt
            ? new Date(s.startedAt).toLocaleDateString("pt-BR")
            : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-text">Sessões</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-xl border border-brand-border bg-brand-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-danger/15 text-brand-danger">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-text">{liveCount}</p>
            <p className="text-xs text-brand-muted">Ao Vivo</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-brand-border bg-brand-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-warning/15 text-brand-warning">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-text">{scheduledCount}</p>
            <p className="text-xs text-brand-muted">Agendadas</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-brand-border bg-brand-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-brand-muted">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-text">{endedCount}</p>
            <p className="text-xs text-brand-muted">Encerradas</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-lg bg-brand-card p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-brand-accent/15 text-brand-accent"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={filtered}
        keyField="id"
        emptyMessage="Nenhuma sessão encontrada"
      />
    </div>
  );
}
