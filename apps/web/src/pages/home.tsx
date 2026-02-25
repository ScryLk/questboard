import { Link } from "react-router-dom";
import { Button, Card, Badge, Avatar, ProgressBar } from "@questboard/ui";
import { SUPPORTED_SYSTEMS, SYSTEM_LABELS, type SupportedSystem } from "@questboard/shared";

// Mock data — will be replaced with API calls
const MOCK_SESSIONS = [
  {
    id: "1",
    name: "A Maldição de Strahd",
    system: "dnd5e" as const,
    playersCount: 4,
    maxPlayers: 5,
    status: "LIVE" as const,
    nextDate: null,
    gmName: "DM Carlos",
    gmAvatar: null,
  },
  {
    id: "2",
    name: "O Despertar dos Deuses",
    system: "tormenta20" as const,
    playersCount: 3,
    maxPlayers: 6,
    status: "IDLE" as const,
    nextDate: "2026-03-01T20:00:00",
    gmName: "Mestre Ana",
    gmAvatar: null,
  },
  {
    id: "3",
    name: "Horror em Dunwich",
    system: "coc7" as const,
    playersCount: 5,
    maxPlayers: 5,
    status: "IDLE" as const,
    nextDate: "2026-03-03T19:00:00",
    gmName: "Keeper João",
    gmAvatar: null,
  },
];

const STATUS_MAP = {
  LIVE: { label: "AO VIVO", variant: "success" as const },
  IDLE: { label: "Agendada", variant: "default" as const },
  PAUSED: { label: "Pausada", variant: "warning" as const },
  ENDED: { label: "Encerrada", variant: "error" as const },
};

function SessionCard({ session }: { session: (typeof MOCK_SESSIONS)[number] }) {
  const status = STATUS_MAP[session.status];
  return (
    <Card interactive>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-text-primary truncate">
            {session.name}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {SYSTEM_LABELS[session.system]}
          </p>
        </div>
        <Badge variant={status.variant} size="sm">
          {status.label}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Avatar size="xs" fallback={session.gmName[0]} />
        <span className="text-sm text-text-secondary">{session.gmName}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>
          {session.playersCount}/{session.maxPlayers} jogadores
        </span>
        {session.nextDate && (
          <span>
            {new Date(session.nextDate).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </Card>
  );
}

function QuickStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { label: "Sessões jogadas", value: "24", icon: "🎲" },
        { label: "Horas de jogo", value: "86h", icon: "⏱️" },
        { label: "Personagens", value: "7", icon: "🧙" },
        { label: "Conquistas", value: "12/20", icon: "🏆" },
      ].map((stat) => (
        <div
          key={stat.label}
          className="bg-surface border border-border-default rounded-lg p-4 flex items-center gap-3"
        >
          <span className="text-2xl">{stat.icon}</span>
          <div>
            <div className="text-lg font-bold text-text-primary">{stat.value}</div>
            <div className="text-xs text-text-muted">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomePage() {
  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">
          Olá, Aventureiro! 👋
        </h1>
        <p className="text-text-secondary mt-1">
          Pronto para a próxima aventura?
        </p>
      </div>

      {/* Quick stats */}
      <QuickStats />

      {/* Active sessions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-text-primary">
            Suas Sessões
          </h2>
          <Link to="/sessions/create">
            <Button variant="primary" size="sm">
              + Nova Sessão
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_SESSIONS.map((session) => (
            <Link key={session.id} to={`/sessions/${session.id}`}>
              <SessionCard session={session} />
            </Link>
          ))}
          <Card variant="dashed" interactive>
            <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-text-muted">
              <span className="text-3xl mb-2">+</span>
              <span className="text-sm">Criar nova sessão</span>
            </div>
          </Card>
        </div>
      </section>

      {/* Supported systems */}
      <section>
        <h2 className="text-lg font-display font-semibold text-text-primary mb-4">
          Sistemas Suportados
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SUPPORTED_SYSTEMS.map((system) => (
            <Card key={system}>
              <h3 className="font-semibold text-text-primary">
                {SYSTEM_LABELS[system as SupportedSystem]}
              </h3>
              <p className="mt-1 text-xs text-text-muted">
                Templates e regras prontos para usar
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
