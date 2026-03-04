import type { ScheduledSessionData } from "@questboard/types";
import { useCampaignStore } from "../../lib/campaign-store.js";

function daysUntil(date: Date): number {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

const CATEGORY_ICONS: Record<string, string> = {
  mapa: "🗺",
  encontro: "⚔",
  npc: "🧙",
  item: "💎",
  nota: "📝",
  geral: "📌",
};

const ENCOUNTER_TYPE_ICONS: Record<string, string> = {
  combat: "⚔",
  social: "💬",
  exploration: "🔍",
};

export function ScheduledSessionView({
  data,
}: {
  data: ScheduledSessionData;
}) {
  const { toggleChecklistItem } = useCampaignStore();
  const { session, checklist, confirmedPlayers, pendingPlayers, encounters, gmNotes } =
    data;

  const completedCount = checklist.filter((c) => c.completed).length;
  const progressPercent =
    checklist.length > 0
      ? Math.round((completedCount / checklist.length) * 100)
      : 0;

  const days = session.scheduledAt ? daysUntil(session.scheduledAt) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-white">
              #{session.order} {session.name}
            </h2>
            {session.scheduledAt && (
              <p className="mt-1 text-sm text-gray-400">
                {formatDateTime(session.scheduledAt)}
              </p>
            )}
          </div>
          <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
            em {days} dia{days !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          Código:{" "}
          <span className="font-mono text-white">{session.sessionCode}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Checklist + Encounters */}
        <div className="space-y-6 lg:col-span-2">
          {/* Checklist */}
          <div className="rounded-xl border border-white/5 bg-surface-light">
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">
                Preparação
              </h3>
              <span className="text-xs text-gray-400">
                {completedCount}/{checklist.length}
              </span>
            </div>
            {/* Progress bar */}
            <div className="px-4 pt-3">
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-1 text-right text-[10px] text-gray-500">
                {progressPercent}%
              </p>
            </div>
            <div className="divide-y divide-white/5">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                      item.completed
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-white/20 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className="text-sm">
                    {CATEGORY_ICONS[item.category] ?? ""}
                  </span>
                  <span
                    className={`flex-1 text-sm ${
                      item.completed
                        ? "text-gray-500 line-through"
                        : "text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Encounters */}
          <div className="rounded-xl border border-white/5 bg-surface-light">
            <div className="border-b border-white/5 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">
                Encontros Planejados
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {encounters.map((enc) => (
                <div
                  key={enc.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <span className="text-sm">
                    {ENCOUNTER_TYPE_ICONS[enc.type] ?? "⚔"}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-white">{enc.name}</p>
                    <p className="text-xs text-gray-400">{enc.difficulty}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      enc.prepared
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {enc.prepared ? "Pronto" : "Pendente"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* GM Notes */}
          {gmNotes && (
            <div className="rounded-xl border border-white/5 bg-surface-light">
              <div className="border-b border-white/5 px-4 py-3">
                <h3 className="text-sm font-semibold text-white">
                  Notas do Mestre
                </h3>
              </div>
              <div className="p-4">
                <p className="whitespace-pre-wrap text-sm text-gray-300">
                  {gmNotes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Players */}
        <div className="space-y-6">
          {/* Confirmed */}
          <div className="rounded-xl border border-white/5 bg-surface-light">
            <div className="border-b border-white/5 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">
                Jogadores Confirmados
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {confirmedPlayers.map((p) => (
                <div
                  key={p.userId}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="flex-1">
                    <p className="text-sm text-white">{p.displayName}</p>
                    {p.characterName && (
                      <p className="text-xs text-gray-400">
                        {p.characterName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending */}
          {pendingPlayers.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-surface-light">
              <div className="border-b border-white/5 px-4 py-3">
                <h3 className="text-sm font-semibold text-white">
                  Sem Resposta
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {pendingPlayers.map((p) => (
                  <div
                    key={p.userId}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <span className="h-2 w-2 rounded-full bg-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">
                        {p.displayName}
                      </p>
                      {p.characterName && (
                        <p className="text-xs text-gray-500">
                          {p.characterName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 p-3">
                <button className="w-full rounded-lg bg-white/5 py-2 text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
                  Enviar Lembrete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
