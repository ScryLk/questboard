"use client";

import { ArrowRight } from "lucide-react";
import { useNarrativeStore } from "@/stores/narrativeStore";

export function NextEventCard() {
  const nodes = useNarrativeStore((s) => s.nodes);

  const nextEvent = nodes.find(
    (n) => n.type === "event" && n.data.status === "pending",
  );

  if (!nextEvent) {
    return (
      <div className="p-3">
        <span className="text-[11px] text-brand-muted">
          Nenhum evento pendente
        </span>
      </div>
    );
  }

  return (
    <div className="p-3">
      <span className="mb-1.5 block text-xs font-medium text-brand-text">
        Proximo Evento
      </span>
      <div className="rounded-lg border border-brand-border bg-white/[0.02] p-2.5">
        <div className="flex items-start gap-2">
          <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-medium text-brand-text">
              {nextEvent.data.title}
            </span>
            {nextEvent.data.description && (
              <span className="mt-0.5 line-clamp-2 block text-[10px] text-brand-muted">
                {nextEvent.data.description}
              </span>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">
            Proximo
          </span>
        </div>
      </div>
    </div>
  );
}
