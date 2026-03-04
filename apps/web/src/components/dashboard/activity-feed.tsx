import type { ActivityEntry } from "@questboard/types";

const TYPE_ICONS: Record<string, string> = {
  session: "🎲",
  character: "🧙",
  map: "🗺",
  encounter: "⚔",
  note: "📝",
};

function relativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes}min`;
  if (hours < 24) return `há ${hours}h`;
  if (days < 7) return `há ${days}d`;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(date));
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  return (
    <div className="flex gap-3 px-4 py-3">
      <span className="mt-0.5 text-sm">
        {TYPE_ICONS[entry.type] ?? "📌"}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">{entry.title}</p>
        <p className="truncate text-xs text-gray-400">{entry.description}</p>
      </div>
      <span className="whitespace-nowrap text-[10px] text-gray-600">
        {relativeTime(entry.timestamp)}
      </span>
    </div>
  );
}

export function ActivityFeed({
  activities,
}: {
  activities: ActivityEntry[];
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-surface-light">
      <div className="border-b border-white/5 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">
          Atividade Recente
        </h3>
      </div>
      <div className="max-h-80 divide-y divide-white/5 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-gray-500">
            Nenhuma atividade recente
          </p>
        ) : (
          activities.map((entry) => (
            <ActivityRow key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}
