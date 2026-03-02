import { LayoutDashboard, Users, Map, Swords, Dice5, Clock } from "lucide-react";

const KPI_CARDS = [
  { label: "Sessões Ativas", value: "3", icon: LayoutDashboard, color: "text-brand-accent" },
  { label: "Jogadores Online", value: "12", icon: Users, color: "text-green-400" },
  { label: "Mapas Criados", value: "8", icon: Map, color: "text-blue-400" },
  { label: "Encontros", value: "24", icon: Swords, color: "text-red-400" },
];

const RECENT_ACTIVITY = [
  { id: "1", type: "session" as const, title: "Sessão #12 iniciada", description: "Campanha: A Maldição de Strahd", time: "2h atrás" },
  { id: "2", type: "character" as const, title: "Novo personagem criado", description: "Elara, Elfa Maga nível 5", time: "5h atrás" },
  { id: "3", type: "map" as const, title: "Mapa editado", description: "Taverna do Dragão Sonolento", time: "1d atrás" },
  { id: "4", type: "encounter" as const, title: "Encontro completado", description: "Emboscada na Floresta Sombria", time: "2d atrás" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">
          Visão geral das suas campanhas e sessões.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-white/10 bg-brand-surface p-5"
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <p className="mt-3 font-heading text-3xl font-bold text-white">
                {kpi.value}
              </p>
              <p className="mt-1 text-sm text-gray-400">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-xl border border-white/10 bg-brand-surface p-5">
          <h2 className="mb-4 font-heading text-lg font-semibold text-white">
            Atividade Recente
          </h2>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg p-3 hover:bg-white/5"
              >
                <div className="mt-0.5 rounded-lg bg-white/5 p-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rounded-xl border border-white/10 bg-brand-surface p-5">
          <h2 className="mb-4 font-heading text-lg font-semibold text-white">
            Estatísticas de Dados
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { die: "d20", rolls: 342, icon: Dice5 },
              { die: "d6", rolls: 256, icon: Dice5 },
              { die: "d8", rolls: 128, icon: Dice5 },
            ].map((stat) => (
              <div key={stat.die} className="rounded-lg bg-white/5 p-4 text-center">
                <stat.icon className="mx-auto h-8 w-8 text-brand-accent" />
                <p className="mt-2 font-heading text-xl font-bold text-white">
                  {stat.rolls}
                </p>
                <p className="text-xs text-gray-500">{stat.die} rolados</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Nat 20s</span>
              <span className="font-bold text-green-400">18</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-400">Nat 1s</span>
              <span className="font-bold text-red-400">12</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-400">Total de Rolagens</span>
              <span className="font-bold text-white">726</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
