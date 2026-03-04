import type { SessionDashboardData } from "@questboard/types";

export function LiveSessionView({ data }: { data: SessionDashboardData }) {
  const { session, players } = data;

  return (
    <div className="space-y-6">
      {/* Live Banner */}
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-5">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-bold text-white">
              AO VIVO — #{session.order} {session.name}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {session.playerCount} jogadores conectados · Código:{" "}
              <span className="font-mono text-white">
                {session.sessionCode}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Players Online */}
      <div className="rounded-xl border border-white/5 bg-surface-light">
        <div className="border-b border-white/5 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">
            Jogadores Conectados
          </h3>
        </div>
        <div className="divide-y divide-white/5">
          {players.map((p) => (
            <div
              key={p.userId}
              className="flex items-center gap-3 px-4 py-3"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  p.isOnline ? "bg-green-500" : "bg-gray-500"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm text-white">{p.displayName}</p>
                {p.characterName && (
                  <p className="text-xs text-gray-400">
                    {p.characterName}
                  </p>
                )}
              </div>
              <span className="text-[10px] text-gray-500">
                {p.isOnline ? "Online" : "Offline"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button className="flex-1 rounded-xl bg-brand-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500">
          Abrir Mesa de Jogo
        </button>
        <button className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
          Pausar
        </button>
        <button className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
          Notas
        </button>
      </div>
    </div>
  );
}
