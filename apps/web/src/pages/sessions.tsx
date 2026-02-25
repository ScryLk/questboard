import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Badge, Avatar, TextInput } from "@questboard/ui";
import { SYSTEM_LABELS, type SupportedSystem, SessionStatus } from "@questboard/shared";

const MOCK_SESSIONS = [
  {
    id: "1",
    name: "A Maldição de Strahd",
    system: "dnd5e" as SupportedSystem,
    playersCount: 4,
    maxPlayers: 5,
    status: SessionStatus.LIVE,
    gmName: "DM Carlos",
    nextDate: null,
    description: "Campanha de horror em Barovia",
  },
  {
    id: "2",
    name: "O Despertar dos Deuses",
    system: "tormenta20" as SupportedSystem,
    playersCount: 3,
    maxPlayers: 6,
    status: SessionStatus.IDLE,
    gmName: "Mestre Ana",
    nextDate: "2026-03-01T20:00:00",
    description: "Aventura épica no mundo de Arton",
  },
  {
    id: "3",
    name: "Horror em Dunwich",
    system: "coc7" as SupportedSystem,
    playersCount: 5,
    maxPlayers: 5,
    status: SessionStatus.IDLE,
    gmName: "Keeper João",
    nextDate: "2026-03-03T19:00:00",
    description: "Investigação de horrores cósmicos",
  },
  {
    id: "4",
    name: "Arena do Caos",
    system: "generic" as SupportedSystem,
    playersCount: 2,
    maxPlayers: 8,
    status: SessionStatus.ENDED,
    gmName: "GM Pedro",
    nextDate: null,
    description: "One-shot de combate",
  },
];

const STATUS_BADGE = {
  [SessionStatus.LIVE]: { label: "AO VIVO", variant: "success" as const },
  [SessionStatus.IDLE]: { label: "Agendada", variant: "default" as const },
  [SessionStatus.PAUSED]: { label: "Pausada", variant: "warning" as const },
  [SessionStatus.ENDED]: { label: "Encerrada", variant: "error" as const },
};

type FilterStatus = "all" | SessionStatus;

export function SessionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  const filtered = MOCK_SESSIONS.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.gmName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Sessões
          </h1>
          <p className="text-text-secondary mt-1">
            {MOCK_SESSIONS.length} sessões
          </p>
        </div>
        <Link to="/sessions/create">
          <Button variant="primary" size="sm">
            + Nova Sessão
          </Button>
        </Link>
      </div>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar sessões..."
      />

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            { key: "all" as FilterStatus, label: "Todas" },
            { key: SessionStatus.LIVE, label: "Ao vivo" },
            { key: SessionStatus.IDLE, label: "Agendadas" },
            { key: SessionStatus.ENDED, label: "Encerradas" },
          ] as const
        ).map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-fast ${
              statusFilter === f.key
                ? "bg-accent text-text-inverse"
                : "bg-elevated text-text-secondary hover:bg-hover"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Session list */}
      <div className="space-y-3">
        {filtered.map((session) => {
          const status = STATUS_BADGE[session.status];
          return (
            <Link key={session.id} to={`/sessions/${session.id}`}>
              <Card interactive>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-text-primary truncate">
                        {session.name}
                      </h3>
                      <Badge variant={status.variant} size="sm">
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted mb-2">
                      {session.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <span>{SYSTEM_LABELS[session.system]}</span>
                      <span>
                        {session.playersCount}/{session.maxPlayers} jogadores
                      </span>
                      <span>GM: {session.gmName}</span>
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
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted text-lg mb-4">Nenhuma sessão encontrada</p>
          <Link to="/sessions/create">
            <Button variant="primary">Criar Sessão</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
