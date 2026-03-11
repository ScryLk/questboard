"use client";

import { Users, UserCheck, Radio, TrendingUp } from "lucide-react";
import { useAdminStore } from "@/stores/adminStore";
import { PLAN_LABELS, PLAN_COLORS, SESSION_STATUS_LABELS } from "@/types/admin";

function KPICard({
  icon: Icon,
  label,
  value,
  sub,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-card p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-brand-muted">{label}</p>
      </div>
      <p className="text-3xl font-bold text-brand-text">{value}</p>
      {sub && <p className="mt-1 text-xs text-brand-muted">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const kpis = useAdminStore((s) => s.kpis);
  const sessions = useAdminStore((s) => s.sessions);
  const users = useAdminStore((s) => s.users);

  const liveSessions = sessions.filter((s) => s.status === "LIVE");
  const recentUsers = [...users].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-text">Dashboard</h1>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          icon={Users}
          label="Total de Usuários"
          value={kpis.totalUsers.toLocaleString("pt-BR")}
          sub={`${kpis.newUsersThisMonth} novos este mês`}
          iconColor="bg-brand-accent/15 text-brand-accent"
        />
        <KPICard
          icon={UserCheck}
          label="Usuários Ativos"
          value={kpis.activeUsers.toLocaleString("pt-BR")}
          sub={`${((kpis.activeUsers / kpis.totalUsers) * 100).toFixed(1)}% do total`}
          iconColor="bg-brand-success/15 text-brand-success"
        />
        <KPICard
          icon={Radio}
          label="Sessões ao Vivo"
          value={kpis.activeSessions}
          sub={`${kpis.totalSessions.toLocaleString("pt-BR")} sessões total`}
          iconColor="bg-brand-danger/15 text-brand-danger"
        />
        <KPICard
          icon={TrendingUp}
          label="Receita Mensal"
          value={`R$ ${(kpis.monthlyRevenue / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          iconColor="bg-brand-warning/15 text-brand-warning"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <div className="rounded-xl border border-brand-border bg-brand-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-brand-text">Distribuição por Plano</h2>
          <div className="space-y-3">
            {Object.entries(kpis.planDistribution).map(([plan, count]) => {
              const total = Object.values(kpis.planDistribution).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={plan}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${PLAN_COLORS[plan] ?? "bg-white/5 text-brand-muted"}`}>
                      {PLAN_LABELS[plan] ?? plan}
                    </span>
                    <span className="text-brand-muted">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-brand-accent transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Sessions */}
        <div className="rounded-xl border border-brand-border bg-brand-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-brand-text">
            Sessões ao Vivo ({liveSessions.length})
          </h2>
          {liveSessions.length === 0 ? (
            <p className="text-sm text-brand-muted">Nenhuma sessão ao vivo</p>
          ) : (
            <div className="space-y-3">
              {liveSessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg bg-white/[0.03] p-3">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-brand-danger" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-text">{s.name}</p>
                    <p className="text-xs text-brand-muted">
                      {s.gmName} · {s.playerCount}/{s.maxPlayers} jogadores · {s.system}
                    </p>
                  </div>
                  <span className="text-xs text-brand-muted">
                    {SESSION_STATUS_LABELS[s.status] ?? s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="rounded-xl border border-brand-border bg-brand-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-brand-text">Últimos Cadastros</h2>
        <div className="space-y-2">
          {recentUsers.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/[0.03]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-accent/20 text-xs font-bold text-brand-accent">
                {u.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-text">{u.displayName}</p>
                <p className="text-xs text-brand-muted">{u.email}</p>
              </div>
              <span className="text-xs text-brand-muted">
                {new Date(u.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
