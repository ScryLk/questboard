"use client";

import { Flag, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAdminStore } from "@/stores/adminStore";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  REPORT_STATUS_LABELS,
  REPORT_TYPE_LABELS,
  type AdminReport,
} from "@/types/admin";

function reportStatusVariant(status: string): "warning" | "info" | "success" | "muted" {
  switch (status) {
    case "pending": return "warning";
    case "reviewing": return "info";
    case "resolved": return "success";
    case "dismissed": return "muted";
    default: return "muted";
  }
}

export default function AdminReportsPage() {
  const reports = useAdminStore((s) => s.reports);
  const resolveReport = useAdminStore((s) => s.resolveReport);

  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const reviewingCount = reports.filter((r) => r.status === "reviewing").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved" || r.status === "dismissed").length;

  const columns = [
    {
      key: "type",
      label: "Tipo",
      render: (r: AdminReport) => (
        <StatusBadge
          label={REPORT_TYPE_LABELS[r.type] ?? r.type}
          variant={r.type === "bug" ? "info" : r.type === "user" ? "danger" : "warning"}
        />
      ),
    },
    {
      key: "reporter",
      label: "Reportado por",
      render: (r: AdminReport) => <span className="text-brand-text">{r.reporterName}</span>,
    },
    {
      key: "target",
      label: "Alvo",
      render: (r: AdminReport) => <span className="text-brand-text">{r.targetName}</span>,
    },
    {
      key: "reason",
      label: "Motivo",
      render: (r: AdminReport) => (
        <p className="max-w-[300px] truncate text-brand-muted">{r.reason}</p>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r: AdminReport) => (
        <StatusBadge
          label={REPORT_STATUS_LABELS[r.status] ?? r.status}
          variant={reportStatusVariant(r.status)}
        />
      ),
    },
    {
      key: "actions",
      label: "Ações",
      render: (r: AdminReport) =>
        r.status === "pending" || r.status === "reviewing" ? (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                resolveReport(r.id, "resolved");
              }}
              className="rounded-md bg-brand-success/15 px-2.5 py-1 text-xs font-medium text-brand-success transition-colors hover:bg-brand-success/25"
            >
              Resolver
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resolveReport(r.id, "dismissed");
              }}
              className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-medium text-brand-muted transition-colors hover:bg-white/10"
            >
              Dispensar
            </button>
          </div>
        ) : (
          <span className="text-xs text-brand-muted">
            {r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString("pt-BR") : "—"}
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-text">Denúncias</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-xl border border-brand-border bg-brand-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-warning/15 text-brand-warning">
            <Flag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-text">{pendingCount}</p>
            <p className="text-xs text-brand-muted">Pendentes</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-brand-border bg-brand-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-info/15 text-brand-info">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-text">{reviewingCount}</p>
            <p className="text-xs text-brand-muted">Em Análise</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-brand-border bg-brand-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-success/15 text-brand-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-text">{resolvedCount}</p>
            <p className="text-xs text-brand-muted">Resolvidas</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={reports}
        keyField="id"
        emptyMessage="Nenhuma denúncia encontrada"
      />
    </div>
  );
}
