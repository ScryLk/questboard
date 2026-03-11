"use client";

import { useMemo } from "react";
import { useStoryStore } from "@/stores/storyStore";
import { GameTooltip } from "@/components/ui/game-tooltip";

export function TimelineView() {
  const arcs = useStoryStore((s) => s.arcs);
  const selectEvent = useStoryStore((s) => s.selectEvent);
  const selectedEventId = useStoryStore((s) => s.selectedEventId);

  // Build session columns and per-arc rows
  const { sessions, arcRows } = useMemo(() => {
    const allEvents = arcs.flatMap((a) =>
      a.events.map((e) => ({ ...e, arcTitle: a.title, arcColor: a.color })),
    );

    // Find all unique session numbers
    const sessionSet = new Set<number>();
    for (const e of allEvents) {
      if (e.sessionNumber != null) sessionSet.add(e.sessionNumber);
    }
    const sessions = [...sessionSet].sort((a, b) => a - b);
    if (sessions.length === 0) return { sessions: [], arcRows: [] };

    // Build arc rows
    const sorted = [...arcs].sort((a, b) => a.order - b.order);
    const arcRows = sorted.map((arc) => {
      const events = arc.events.filter((e) => e.sessionNumber != null);
      const eventsBySession: Record<number, typeof allEvents> = {};
      for (const e of events) {
        const s = e.sessionNumber!;
        if (!eventsBySession[s]) eventsBySession[s] = [];
        eventsBySession[s].push({
          ...e,
          arcTitle: arc.title,
          arcColor: arc.color,
        });
      }
      const minSession = Math.min(...events.map((e) => e.sessionNumber!));
      const maxSession = Math.max(...events.map((e) => e.sessionNumber!));
      return {
        arc,
        eventsBySession,
        minSession,
        maxSession,
      };
    });

    return { sessions, arcRows };
  }, [arcs]);

  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-brand-muted">
          Nenhum evento com sessão vinculada. Vincule sessões aos eventos para
          visualizar a timeline.
        </p>
      </div>
    );
  }

  const colWidth = 120;

  return (
    <div className="overflow-x-auto pb-4">
      <div style={{ minWidth: (sessions.length + 1) * colWidth }}>
        {/* Session headers */}
        <div className="flex border-b border-brand-border">
          <div className="w-[180px] shrink-0 px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
              Arco
            </span>
          </div>
          {sessions.map((s) => (
            <div
              key={s}
              className="shrink-0 border-l border-brand-border/30 px-2 py-2 text-center"
              style={{ width: colWidth }}
            >
              <span className="text-[11px] font-medium text-brand-muted">
                Sessão {s}
              </span>
            </div>
          ))}
        </div>

        {/* Arc rows */}
        {arcRows.map(({ arc, eventsBySession, minSession, maxSession }) => (
          <div
            key={arc.id}
            className="flex border-b border-brand-border/30"
          >
            {/* Arc label */}
            <div className="flex w-[180px] shrink-0 items-center gap-2 px-3 py-3">
              <div
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: arc.color }}
              />
              <span className="truncate text-xs font-medium text-brand-text">
                {arc.title}
              </span>
            </div>

            {/* Session cells */}
            {sessions.map((s) => {
              const events = eventsBySession[s];
              const inRange = s >= minSession && s <= maxSession;
              return (
                <div
                  key={s}
                  className="relative shrink-0 border-l border-brand-border/20 px-1 py-2"
                  style={{ width: colWidth }}
                >
                  {/* Horizontal line through range */}
                  {inRange && (
                    <div
                      className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2"
                      style={{ backgroundColor: arc.color + "30" }}
                    />
                  )}

                  {/* Event dots */}
                  {events && (
                    <div className="relative flex flex-col items-center gap-1">
                      {events.map((e) => (
                        <GameTooltip
                          key={e.id}
                          label={e.title}
                          description={e.description}
                          side="bottom"
                        >
                          <button
                            onClick={() => selectEvent(e.id)}
                            className={`relative z-10 h-4 w-4 rounded-full border-2 transition-transform hover:scale-125 ${
                              selectedEventId === e.id
                                ? "ring-2 ring-brand-accent/50"
                                : ""
                            }`}
                            style={{
                              borderColor: arc.color,
                              backgroundColor:
                                e.status === "completed"
                                  ? arc.color
                                  : "transparent",
                            }}
                          />
                        </GameTooltip>
                      ))}
                      {/* Event labels below */}
                      {events.slice(0, 2).map((e) => (
                        <span
                          key={e.id + "-label"}
                          className="max-w-[100px] truncate text-center text-[9px] text-brand-muted"
                        >
                          {e.title}
                        </span>
                      ))}
                      {events.length > 2 && (
                        <span className="text-[9px] text-brand-muted">
                          +{events.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
