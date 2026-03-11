"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  CheckCircle,
  Circle,
  Compass,
  Flag,
  MessageSquare,
  Moon,
  SkipForward,
  Sparkles,
  Star,
  Swords,
} from "lucide-react";
import { useStoryStore } from "@/stores/storyStore";
import type { EventStatus, EventType, StoryEvent, StoryArc } from "@/types/story";
import { EVENT_TYPE_LABELS, EVENT_STATUS_LABELS } from "@/types/story";

const EVENT_TYPE_ICONS: Record<EventType, typeof Swords> = {
  encounter: Swords,
  revelation: Sparkles,
  milestone: Flag,
  exploration: Compass,
  social: MessageSquare,
  rest: Moon,
  custom: Star,
};

type SortField = "order" | "title" | "type" | "status" | "session";
type SortDir = "asc" | "desc";

export function ListView() {
  const arcs = useStoryStore((s) => s.arcs);
  const selectEvent = useStoryStore((s) => s.selectEvent);
  const selectedEventId = useStoryStore((s) => s.selectedEventId);

  const [filterArc, setFilterArc] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("order");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const allEvents = useMemo(() => {
    let idx = 0;
    return arcs
      .sort((a, b) => a.order - b.order)
      .flatMap((a) =>
        a.events
          .sort((e1, e2) => e1.order - e2.order)
          .map((e) => ({
            ...e,
            arcTitle: a.title,
            arcColor: a.color,
            arcStatus: a.status,
            globalOrder: idx++,
          })),
      );
  }, [arcs]);

  const filtered = useMemo(() => {
    let result = allEvents;
    if (filterArc !== "all") result = result.filter((e) => e.arcId === filterArc);
    if (filterStatus !== "all") result = result.filter((e) => e.status === filterStatus);
    if (filterType !== "all") result = result.filter((e) => e.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q),
      );
    }
    return result.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortField) {
        case "title":
          return a.title.localeCompare(b.title) * dir;
        case "type":
          return a.type.localeCompare(b.type) * dir;
        case "status":
          return a.status.localeCompare(b.status) * dir;
        case "session":
          return ((a.sessionNumber ?? 999) - (b.sessionNumber ?? 999)) * dir;
        default:
          return (a.globalOrder - b.globalOrder) * dir;
      }
    });
  }, [allEvents, filterArc, filterStatus, filterType, search, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={filterArc}
          onChange={(e) => setFilterArc(e.target.value)}
          className="h-8 rounded-lg border border-brand-border bg-brand-primary px-3 text-xs text-brand-text outline-none focus:border-brand-accent/40"
        >
          <option value="all">Todos os arcos</option>
          {arcs.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-8 rounded-lg border border-brand-border bg-brand-primary px-3 text-xs text-brand-text outline-none focus:border-brand-accent/40"
        >
          <option value="all">Todos os status</option>
          {Object.entries(EVENT_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-8 rounded-lg border border-brand-border bg-brand-primary px-3 text-xs text-brand-text outline-none focus:border-brand-accent/40"
        >
          <option value="all">Todos os tipos</option>
          {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="ml-auto h-8 w-52 rounded-lg border border-brand-border bg-brand-primary px-3 text-xs text-brand-text outline-none placeholder:text-brand-muted/50 focus:border-brand-accent/40"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-brand-border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-brand-border bg-white/[0.02]">
              <th className="w-10 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                <button onClick={() => toggleSort("order")} className="flex items-center gap-1">
                  # <ArrowUpDown className="h-2.5 w-2.5" />
                </button>
              </th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                <button onClick={() => toggleSort("title")} className="flex items-center gap-1">
                  Título <ArrowUpDown className="h-2.5 w-2.5" />
                </button>
              </th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                Arco
              </th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                <button onClick={() => toggleSort("status")} className="flex items-center gap-1">
                  Status <ArrowUpDown className="h-2.5 w-2.5" />
                </button>
              </th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                <button onClick={() => toggleSort("type")} className="flex items-center gap-1">
                  Tipo <ArrowUpDown className="h-2.5 w-2.5" />
                </button>
              </th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                <button onClick={() => toggleSort("session")} className="flex items-center gap-1">
                  Sessão <ArrowUpDown className="h-2.5 w-2.5" />
                </button>
              </th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                Tarefas
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((event, i) => {
              const TypeIcon = EVENT_TYPE_ICONS[event.type];
              const doneCount = event.tasks.filter((t) => t.isDone).length;
              return (
                <tr
                  key={event.id}
                  onClick={() => selectEvent(event.id)}
                  className={`cursor-pointer border-b border-brand-border/40 transition-colors hover:bg-white/[0.03] ${
                    selectedEventId === event.id ? "bg-brand-accent/[0.05]" : ""
                  }`}
                >
                  <td className="px-3 py-2 text-xs tabular-nums text-brand-muted">
                    {i + 1}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-xs font-medium text-brand-text">
                      {event.title}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                      style={{
                        color: event.arcColor,
                        backgroundColor: event.arcColor + "15",
                      }}
                    >
                      {event.arcTitle}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                        event.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : event.status === "in_progress"
                            ? "bg-brand-accent/10 text-brand-accent"
                            : event.status === "skipped"
                              ? "bg-gray-500/10 text-gray-400"
                              : "bg-white/5 text-brand-muted"
                      }`}
                    >
                      {EVENT_STATUS_LABELS[event.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1 text-[11px] text-brand-muted">
                      <TypeIcon className="h-3 w-3" />
                      {EVENT_TYPE_LABELS[event.type]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs tabular-nums text-brand-muted">
                    {event.sessionNumber ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    {event.tasks.length > 0 ? (
                      <span
                        className={`text-xs tabular-nums ${
                          doneCount === event.tasks.length
                            ? "text-emerald-500"
                            : "text-brand-muted"
                        }`}
                      >
                        {doneCount}/{event.tasks.length}
                      </span>
                    ) : (
                      <span className="text-xs text-brand-muted/30">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-xs text-brand-muted">
            Nenhum evento encontrado.
          </p>
        )}
      </div>
    </div>
  );
}
