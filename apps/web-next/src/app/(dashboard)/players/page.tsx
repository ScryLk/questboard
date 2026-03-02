import { Users, UserPlus, Crown, Shield } from "lucide-react";

const PLAYERS = [
  { id: "1", name: "João Silva", role: "gm", character: null, isOnline: true, sessions: 24, avatar: null },
  { id: "2", name: "Maria Santos", role: "player", character: "Elara, Elfa Maga", isOnline: true, sessions: 18, avatar: null },
  { id: "3", name: "Pedro Costa", role: "player", character: "Thorin, Anão Guerreiro", isOnline: false, sessions: 15, avatar: null },
  { id: "4", name: "Ana Oliveira", role: "player", character: "Lyra, Halfling Ladina", isOnline: true, sessions: 20, avatar: null },
  { id: "5", name: "Lucas Ferreira", role: "player", character: "Kael, Tiefling Bruxo", isOnline: false, sessions: 12, avatar: null },
];

export default function PlayersPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Jogadores</h1>
          <p className="mt-1 text-sm text-gray-400">
            Gerencie os jogadores da sua campanha.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-accent/80">
          <UserPlus className="h-4 w-4" />
          Convidar Jogador
        </button>
      </div>

      {/* Player Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-brand-surface p-5">
          <Users className="h-5 w-5 text-brand-accent" />
          <p className="mt-3 font-heading text-3xl font-bold text-white">{PLAYERS.length}</p>
          <p className="text-sm text-gray-400">Total de Jogadores</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-brand-surface p-5">
          <div className="h-2 w-2 rounded-full bg-green-400" />
          <p className="mt-3 font-heading text-3xl font-bold text-white">
            {PLAYERS.filter((p) => p.isOnline).length}
          </p>
          <p className="text-sm text-gray-400">Online Agora</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-brand-surface p-5">
          <Shield className="h-5 w-5 text-blue-400" />
          <p className="mt-3 font-heading text-3xl font-bold text-white">
            {PLAYERS.filter((p) => p.character).length}
          </p>
          <p className="text-sm text-gray-400">Com Personagem</p>
        </div>
      </div>

      {/* Player List */}
      <div className="rounded-xl border border-white/10 bg-brand-surface">
        <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 border-b border-white/10 px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
          <span>Jogador</span>
          <span>Personagem</span>
          <span>Sessões</span>
          <span>Status</span>
        </div>
        {PLAYERS.map((player) => (
          <div
            key={player.id}
            className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-4 border-b border-white/5 px-5 py-4 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 rounded-full bg-white/10">
                {player.role === "gm" && (
                  <Crown className="absolute -right-1 -top-1 h-3 w-3 text-yellow-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{player.name}</p>
                <p className="text-xs text-gray-500">
                  {player.role === "gm" ? "Game Master" : "Jogador"}
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-400">
              {player.character ?? "—"}
            </span>
            <span className="text-sm text-gray-400">{player.sessions}</span>
            <span className={`inline-flex items-center gap-1.5 text-xs ${player.isOnline ? "text-green-400" : "text-gray-500"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${player.isOnline ? "bg-green-400" : "bg-gray-600"}`} />
              {player.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
