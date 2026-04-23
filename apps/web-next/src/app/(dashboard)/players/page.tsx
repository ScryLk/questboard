import {
  AlertTriangle,
  Calendar,
  Crown,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { getAvatarGradient, getInitials } from "@/lib/player-avatar";
import {
  formatRelativeDatePtBR,
  formatAbsoluteDatePtBR,
} from "@/lib/relative-date";

// ═════════════════════════════════════════════════════════════════
// MOCK — enquanto o web-next não consome a API.
// Shape inspirado nos endpoints `/campaigns/:id/members` e `/stats`
// que o backend já expõe. Quando a integração real chegar, substituir
// por fetch + React Query sem trocar a UI.
// ═════════════════════════════════════════════════════════════════

type Role = "GM" | "CO_GM" | "PLAYER" | "SPECTATOR";
type Status = "IN_SESSION" | "OFFLINE";
type AttentionReason =
  | "CONSECUTIVE_ABSENCES"
  | "INACTIVE"
  | "NO_CHARACTER"
  | "CHARACTER_DOWN";

interface Character {
  name: string;
  race: string;
  className: string;
  level: number;
  hpCurrent: number;
  hpMax: number;
  ac: number;
}

interface Member {
  id: string;
  name: string;
  role: Role;
  joinedAt: string;
  character: Character | null;
  presence: {
    attendedCount: number;
    totalSessions: number;
    percentage: number;
    lastSessionAt: string | null;
  };
  status: Status;
  attention: { reason: AttentionReason; detail: string } | null;
}

const MEMBERS: Member[] = [
  {
    id: "u1",
    name: "Lucas Kepler",
    role: "GM",
    joinedAt: "2026-02-10",
    character: null,
    presence: { attendedCount: 24, totalSessions: 24, percentage: 100, lastSessionAt: "2026-04-18" },
    status: "IN_SESSION",
    attention: null,
  },
  {
    id: "u2",
    name: "Maria Santos",
    role: "CO_GM",
    joinedAt: "2026-03-14",
    character: null,
    presence: { attendedCount: 10, totalSessions: 12, percentage: 83, lastSessionAt: "2026-04-18" },
    status: "IN_SESSION",
    attention: null,
  },
  {
    id: "u3",
    name: "João Silva",
    role: "PLAYER",
    joinedAt: "2026-02-10",
    character: { name: "Elara", race: "Elfa", className: "Maga", level: 5, hpCurrent: 32, hpMax: 45, ac: 14 },
    presence: { attendedCount: 18, totalSessions: 24, percentage: 75, lastSessionAt: "2026-04-18" },
    status: "IN_SESSION",
    attention: null,
  },
  {
    id: "u4",
    name: "Pedro Costa",
    role: "PLAYER",
    joinedAt: "2026-02-15",
    character: { name: "Thorin", race: "Anão", className: "Guerreiro", level: 5, hpCurrent: 8, hpMax: 50, ac: 18 },
    presence: { attendedCount: 21, totalSessions: 24, percentage: 88, lastSessionAt: "2026-03-28" },
    status: "OFFLINE",
    attention: { reason: "CONSECUTIVE_ABSENCES", detail: "3 faltas seguidas" },
  },
  {
    id: "u5",
    name: "Ana Oliveira",
    role: "PLAYER",
    joinedAt: "2026-02-20",
    character: { name: "Lyra", race: "Halfling", className: "Ladina", level: 4, hpCurrent: 25, hpMax: 28, ac: 15 },
    presence: { attendedCount: 20, totalSessions: 24, percentage: 83, lastSessionAt: "2026-04-11" },
    status: "OFFLINE",
    attention: null,
  },
  {
    id: "u6",
    name: "Lucas Ferreira",
    role: "PLAYER",
    joinedAt: "2026-02-25",
    character: { name: "Kael", race: "Tiefling", className: "Bruxo", level: 4, hpCurrent: 0, hpMax: 32, ac: 12 },
    presence: { attendedCount: 12, totalSessions: 24, percentage: 50, lastSessionAt: "2026-03-28" },
    status: "OFFLINE",
    attention: { reason: "INACTIVE", detail: "sumiu há 24 dias" },
  },
  {
    id: "u7",
    name: "Camila Reis",
    role: "SPECTATOR",
    joinedAt: "2026-04-10",
    character: null,
    presence: { attendedCount: 2, totalSessions: 3, percentage: 67, lastSessionAt: "2026-04-18" },
    status: "OFFLINE",
    attention: null,
  },
];

// Métricas derivadas (também mockadas — em produção viriam do /stats)
const CAMPAIGN_STATS = {
  averageAttendance: { percentage: 79, trendVsPreviousMonth: 5 },
  nextSession: {
    scheduledFor: "2026-04-26T20:00:00-03:00",
    confirmed: 4,
    pending: 1,
  },
};

// ═════════════════════════════════════════════════════════════════
// HELPERS DE ESTILO
// ═════════════════════════════════════════════════════════════════

function hpColor(hp: number, max: number): string {
  if (max === 0) return "text-brand-muted";
  const ratio = hp / max;
  if (ratio <= 0.25) return "text-red-400";
  if (ratio <= 0.5) return "text-yellow-400";
  return "text-brand-text";
}

function presenceColor(pct: number): string {
  if (pct >= 80) return "text-teal-400";
  if (pct >= 50) return "text-yellow-400";
  return "text-red-400";
}

const ROLE_LABEL: Record<Role, string> = {
  GM: "Mestre Principal",
  CO_GM: "Co-Mestre",
  PLAYER: "Jogador",
  SPECTATOR: "Espectador",
};

// ═════════════════════════════════════════════════════════════════
// SUB-COMPONENTES
// ═════════════════════════════════════════════════════════════════

function Avatar({ userId, name, size = 40 }: { userId: string; name: string; size?: number }) {
  const [c1, c2] = getAvatarGradient(userId);
  const initials = getInitials(name);
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        fontSize: size * 0.38,
      }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "IN_SESSION") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/10 px-2 py-0.5 text-[11px] font-medium text-teal-400">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
        Na sessão
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-gray-500">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
      Offline
    </span>
  );
}

// ═════════════════════════════════════════════════════════════════
// PÁGINA
// ═════════════════════════════════════════════════════════════════

export default function PlayersPage() {
  const masters = MEMBERS.filter((m) => m.role === "GM" || m.role === "CO_GM");
  const players = MEMBERS.filter(
    (m) => m.role === "PLAYER" || m.role === "SPECTATOR",
  );
  const needsAttention = MEMBERS.filter((m) => m.attention !== null);

  const { averageAttendance, nextSession } = CAMPAIGN_STATS;
  const trend = averageAttendance.trendVsPreviousMonth;
  const trendUp = trend >= 0;
  const trendLabel = trend === 0
    ? "sem mudança"
    : `${trendUp ? "↑" : "↓"} ${Math.abs(trend)}% vs mês passado`;

  const nextSessionDate = new Date(nextSession.scheduledFor);
  const nextSessionWeekday = nextSessionDate.toLocaleDateString("pt-BR", {
    weekday: "short",
  });
  const nextSessionTime = nextSessionDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Jogadores</h1>
          <p className="mt-1 text-sm text-gray-400">
            Gerencie os jogadores da sua campanha.
          </p>
        </div>
        <button className="flex cursor-pointer items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-accent/80">
          <UserPlus className="h-4 w-4" />
          Convidar Jogador
        </button>
      </div>

      {/* Cards de topo */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Presença média */}
        <div className="rounded-xl border border-white/10 bg-brand-surface p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            <Users className="h-3.5 w-3.5" />
            Presença média
          </div>
          <p className="mt-3 font-heading text-3xl font-bold text-white">
            {averageAttendance.percentage}%
          </p>
          <p
            className={`mt-1 flex items-center gap-1 text-[11px] ${
              trendUp ? "text-teal-400" : "text-red-400"
            }`}
          >
            {trendUp ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trendLabel}
          </p>
        </div>

        {/* Próxima sessão */}
        <div className="rounded-xl border border-white/10 bg-brand-surface p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            <Calendar className="h-3.5 w-3.5" />
            Próxima sessão
          </div>
          {nextSession ? (
            <>
              <p className="mt-3 font-heading text-xl font-bold capitalize text-white">
                {nextSessionWeekday.replace(".", "")}, {nextSessionTime}
              </p>
              <p className="mt-1 text-[11px] text-brand-muted">
                <span className="text-teal-400">{nextSession.confirmed} confirmados</span>
                {nextSession.pending > 0 && (
                  <>
                    {" · "}
                    <span className="text-yellow-400">
                      {nextSession.pending} pendente{nextSession.pending !== 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 font-heading text-xl font-bold text-brand-muted">
                — não agendada
              </p>
              <p className="mt-1 text-[11px] text-brand-muted">
                Agendamento em breve
              </p>
            </>
          )}
        </div>

        {/* Precisa atenção */}
        <div className="rounded-xl border border-white/10 bg-brand-surface p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            <AlertTriangle className="h-3.5 w-3.5" />
            Precisa atenção
          </div>
          <p className="mt-3 font-heading text-3xl font-bold text-white">
            {needsAttention.length}
          </p>
          {needsAttention.length === 0 ? (
            <p className="mt-1 text-[11px] text-brand-muted">
              Todos os jogadores estão ativos.
            </p>
          ) : (
            <ul className="mt-1 space-y-0.5 text-[11px] text-brand-muted">
              {needsAttention.slice(0, 2).map((m) => (
                <li key={m.id} className="truncate">
                  <span className="text-brand-text">{m.name.split(" ")[0]}</span>
                  {" — "}
                  {m.attention?.detail}
                </li>
              ))}
              {needsAttention.length > 2 && (
                <li className="text-brand-muted/70">
                  +{needsAttention.length - 2} outro
                  {needsAttention.length - 2 !== 1 ? "s" : ""}
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Mestres */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
          <Crown className="h-3.5 w-3.5 text-yellow-400" />
          Mestres ({masters.length})
        </h2>
        <div className="rounded-xl border border-white/10 bg-brand-surface">
          {masters.map((m, i) => (
            <div
              key={m.id}
              className={`flex items-center gap-4 px-5 py-3 ${
                i < masters.length - 1 ? "border-b border-white/5" : ""
              }`}
            >
              <Avatar userId={m.id} name={m.name} size={36} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{m.name}</p>
                <p className="text-[11px] text-brand-muted">
                  {ROLE_LABEL[m.role]}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-brand-muted">
                  desde{" "}
                  <span
                    className="text-brand-text"
                    title={formatAbsoluteDatePtBR(m.joinedAt)}
                  >
                    {formatAbsoluteDatePtBR(m.joinedAt).replace(/ de \d{4}/, "")}
                  </span>
                </p>
              </div>
              <StatusBadge status={m.status} />
            </div>
          ))}
        </div>
      </section>

      {/* Jogadores */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-accent" />
          Jogadores ({players.length})
        </h2>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-brand-surface">
          {/* Header */}
          <div className="grid grid-cols-[minmax(180px,1.2fr)_minmax(160px,1fr)_140px_100px_110px_110px] gap-4 border-b border-white/10 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            <span>Jogador</span>
            <span>Personagem</span>
            <span>Stats</span>
            <span>Presença</span>
            <span>Última sessão</span>
            <span>Status</span>
          </div>

          {/* Rows */}
          {players.map((m, i) => {
            const c = m.character;
            return (
              <div
                key={m.id}
                className={`grid grid-cols-[minmax(180px,1.2fr)_minmax(160px,1fr)_140px_100px_110px_110px] items-center gap-4 px-5 py-3.5 ${
                  i < players.length - 1 ? "border-b border-white/5" : ""
                }`}
              >
                {/* Jogador */}
                <div className="flex items-center gap-3">
                  <Avatar userId={m.id} name={m.name} size={40} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {m.name}
                    </p>
                    <p className="text-[11px] text-brand-muted">
                      {ROLE_LABEL[m.role]}
                    </p>
                  </div>
                </div>

                {/* Personagem */}
                <div className="min-w-0">
                  {c ? (
                    <>
                      <p className="truncate text-sm text-brand-text">{c.name}</p>
                      <p className="truncate text-[11px] text-brand-muted">
                        {c.race} {c.className}
                      </p>
                    </>
                  ) : (
                    <span className="text-[12px] italic text-brand-muted">
                      — sem personagem
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div>
                  {c ? (
                    <>
                      <p className="text-[11px] tabular-nums text-brand-muted">
                        Nv {c.level} · HP{" "}
                        <span className={`font-medium ${hpColor(c.hpCurrent, c.hpMax)}`}>
                          {c.hpCurrent}/{c.hpMax}
                        </span>
                      </p>
                      <p className="text-[11px] tabular-nums text-brand-muted">
                        AC {c.ac}
                      </p>
                    </>
                  ) : (
                    <span className="text-[11px] text-brand-muted">—</span>
                  )}
                </div>

                {/* Presença */}
                <div
                  title={`Presente em ${m.presence.attendedCount} das últimas ${m.presence.totalSessions} sessões`}
                >
                  <p
                    className={`text-sm font-semibold tabular-nums ${presenceColor(
                      m.presence.percentage,
                    )}`}
                  >
                    {m.presence.attendedCount}/{m.presence.totalSessions}
                  </p>
                  <p className="text-[10px] text-brand-muted">
                    {m.presence.percentage}%
                  </p>
                </div>

                {/* Última sessão */}
                <div>
                  <p
                    className="text-[11px] text-brand-text"
                    title={
                      m.presence.lastSessionAt
                        ? formatAbsoluteDatePtBR(m.presence.lastSessionAt)
                        : "nunca participou"
                    }
                  >
                    {formatRelativeDatePtBR(m.presence.lastSessionAt)}
                  </p>
                </div>

                {/* Status */}
                <StatusBadge status={m.status} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
