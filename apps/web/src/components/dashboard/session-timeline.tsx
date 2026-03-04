const TYPE_COLORS: Record<string, string> = {
  session_start: "bg-green-500",
  session_end: "bg-gray-500",
  scene: "bg-blue-500",
  roll: "bg-purple-500",
  combat: "bg-red-500",
  combat_end: "bg-orange-500",
  discovery: "bg-yellow-500",
  milestone: "bg-brand-accent",
};

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

interface TimelineEntry {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
}

export function SessionTimeline({
  events,
}: {
  events: TimelineEntry[];
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-surface-light">
      <div className="border-b border-white/5 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Timeline</h3>
      </div>
      <div className="max-h-96 overflow-y-auto p-4">
        <div className="relative space-y-0">
          {events.map((event, i) => {
            const dotColor = TYPE_COLORS[event.type] ?? "bg-gray-500";
            const isLast = i === events.length - 1;
            return (
              <div key={event.id} className="relative flex gap-3 pb-4">
                {/* Vertical line */}
                {!isLast && (
                  <div className="absolute left-[7px] top-4 h-full w-px bg-white/10" />
                )}
                {/* Dot */}
                <div
                  className={`relative z-10 mt-1.5 h-[15px] w-[15px] flex-shrink-0 rounded-full border-2 border-[#0F0F1A] ${dotColor}`}
                />
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white">
                      {event.title}
                    </p>
                    <span className="whitespace-nowrap text-[10px] text-gray-600">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
