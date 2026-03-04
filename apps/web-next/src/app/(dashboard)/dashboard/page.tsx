import { Calendar, Clock, TrendingUp, Users } from "lucide-react";

const KPI_CARDS = [
  { label: "Sessoes", value: "12", icon: Calendar, color: "text-brand-accent" },
  { label: "Horas Jogadas", value: "36h", icon: Clock, color: "text-brand-success" },
  { label: "Nivel Medio", value: "5.2", icon: TrendingUp, color: "text-brand-warning" },
  { label: "Proxima Sessao", value: "Sab 15/03 20:00", icon: Users, color: "text-brand-info" },
];

const SESSIONS = [
  {
    order: 12,
    date: "08/03/2026",
    title: "O Castelo de Amber",
    duration: "3h 45m",
    status: "Completa" as const,
  },
  {
    order: 11,
    date: "01/03/2026",
    title: "Vinhedos Malditos",
    duration: "4h 10m",
    status: "Completa" as const,
  },
  {
    order: 13,
    date: "15/03/2026",
    title: "A Torre de Ravenloft",
    duration: "--",
    status: "Agendada" as const,
  },
  {
    order: 10,
    date: "22/02/2026",
    title: "O Moinho de Ossos",
    duration: "3h 20m",
    status: "Completa" as const,
  },
  {
    order: 9,
    date: "15/02/2026",
    title: "A Vila de Vallaki",
    duration: "4h 30m",
    status: "Completa" as const,
  },
];

function statusBadge(status: "Completa" | "Agendada" | "Ao Vivo") {
  switch (status) {
    case "Completa":
      return "bg-brand-muted/15 text-brand-muted";
    case "Agendada":
      return "bg-brand-info/15 text-brand-info";
    case "Ao Vivo":
      return "bg-brand-success/15 text-brand-success";
  }
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-brand-border bg-brand-surface p-5"
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <p className="mt-3 text-2xl font-bold text-brand-text">
                {kpi.value}
              </p>
              <p className="mt-1 text-sm text-brand-muted">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Sessions Table */}
      <div className="rounded-xl border border-brand-border bg-brand-surface">
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
          <h2 className="text-lg font-semibold text-brand-text">
            Sessoes Recentes
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border text-left text-xs uppercase tracking-wider text-brand-muted">
                <th className="px-6 py-3 font-medium">#</th>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Titulo</th>
                <th className="px-6 py-3 font-medium">Duracao</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {SESSIONS.map((session) => (
                <tr
                  key={session.order}
                  className="border-b border-brand-border/50 transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4 text-sm font-medium text-brand-text">
                    {session.order}
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-muted">
                    {session.date}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-brand-text">
                    {session.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-muted">
                    {session.duration}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${statusBadge(session.status)}`}
                    >
                      {session.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
