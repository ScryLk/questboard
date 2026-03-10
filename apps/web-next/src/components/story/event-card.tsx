"use client";

import {
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
import type { StoryEvent, EventType } from "@/types/story";

const EVENT_TYPE_ICONS: Record<EventType, typeof Swords> = {
  encounter: Swords,
  revelation: Sparkles,
  milestone: Flag,
  exploration: Compass,
  social: MessageSquare,
  rest: Moon,
  custom: Star,
};

interface EventCardProps {
  event: StoryEvent;
  isSelected: boolean;
  onClick: () => void;
  arcColor: string;
}

export function EventCard({ event, isSelected, onClick, arcColor }: EventCardProps) {
  const TypeIcon = EVENT_TYPE_ICONS[event.type];

  const statusClasses = {
    completed: "border-l-emerald-500 opacity-70",
    in_progress: "border-l-brand-accent bg-brand-accent/[0.04]",
    pending: "border-l-brand-muted/30 border-dashed",
    skipped: "border-l-gray-600 opacity-40",
  };

  const StatusIcon =
    event.status === "completed"
      ? CheckCircle
      : event.status === "skipped"
        ? SkipForward
        : Circle;

  const doneCount = event.tasks.filter((t) => t.isDone).length;
  const totalTasks = event.tasks.length;

  return (
    <button
      onClick={onClick}
      className={`group w-full rounded-lg border border-brand-border/60 border-l-[3px] bg-brand-surface/50 p-3 text-left transition-all hover:bg-white/[0.04] ${statusClasses[event.status]} ${
        isSelected
          ? "ring-1 ring-brand-accent/50 bg-brand-accent/[0.06]"
          : ""
      }`}
    >
      {/* Top row: type icon + title + session badge */}
      <div className="flex items-start gap-2">
        <StatusIcon
          className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
            event.status === "completed"
              ? "text-emerald-500"
              : event.status === "in_progress"
                ? "fill-brand-accent/30 text-brand-accent"
                : "text-brand-muted/50"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className={`text-[13px] font-medium leading-tight ${
            event.status === "completed" ? "text-brand-text/70" : "text-brand-text"
          }`}>
            {event.title}
          </p>
          {event.description && (
            <p className="mt-0.5 truncate text-[11px] text-brand-muted">
              {event.description}
            </p>
          )}
        </div>
        {event.sessionNumber != null && (
          <span className="shrink-0 rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] tabular-nums text-brand-muted">
            S{event.sessionNumber}
          </span>
        )}
      </div>

      {/* Bottom row: type badge + links + tasks */}
      <div className="mt-2 flex items-center gap-2">
        <span className="flex items-center gap-1 rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-brand-muted">
          <TypeIcon className="h-2.5 w-2.5" />
          {event.type === "encounter"
            ? "Encontro"
            : event.type === "revelation"
              ? "Revelação"
              : event.type === "milestone"
                ? "Marco"
                : event.type === "exploration"
                  ? "Exploração"
                  : event.type === "social"
                    ? "Social"
                    : event.type === "rest"
                      ? "Descanso"
                      : "Custom"}
        </span>
        {totalTasks > 0 && (
          <span className={`ml-auto text-[10px] tabular-nums ${
            doneCount === totalTasks ? "text-emerald-500" : "text-brand-muted"
          }`}>
            {doneCount}/{totalTasks}
          </span>
        )}
      </div>
    </button>
  );
}
