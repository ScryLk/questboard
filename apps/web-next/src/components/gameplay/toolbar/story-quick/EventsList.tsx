"use client";

import { useNarrativeStore } from "@/stores/narrativeStore";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-emerald-500/15 text-emerald-400" },
  pending: { label: "Pendente", className: "bg-amber-500/15 text-amber-400" },
  discarded: { label: "Descartado", className: "bg-red-500/15 text-red-400" },
  hidden: { label: "Oculto", className: "bg-gray-500/15 text-gray-400" },
};

export function EventsList() {
  const nodes = useNarrativeStore((s) => s.nodes);

  const events = nodes.filter((n) => n.type === "event");

  if (events.length === 0) {
    return (
      <div className="p-3">
        <span className="text-xs text-brand-muted">Nenhum evento criado</span>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-3">
      <span className="text-xs font-medium text-brand-text">Eventos</span>
      <div className="max-h-40 space-y-1 overflow-y-auto">
        {events.map((evt) => {
          const badge = STATUS_BADGE[evt.data.status] ?? STATUS_BADGE.pending;
          return (
            <div
              key={evt.id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
            >
              <div className="min-w-0 flex-1">
                <span className="block truncate text-xs text-brand-text">
                  {evt.data.title}
                </span>
                {evt.data.sessionNumber && (
                  <span className="text-[10px] text-brand-muted">
                    Sessao #{evt.data.sessionNumber}
                  </span>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${badge.className}`}
              >
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
