"use client";

import { BookOpen, GitBranch, Milestone } from "lucide-react";
import { useNarrativeStore } from "@/stores/narrativeStore";

export function ProgressSection() {
  const nodes = useNarrativeStore((s) => s.nodes);
  const getProgress = useNarrativeStore((s) => s.getProgress);
  const { total, completed, percent } = getProgress();

  const events = nodes.filter((n) => n.type === "event");
  const choices = nodes.filter((n) => n.type === "choice");
  const chapters = nodes.filter((n) => n.type === "chapter");

  const activeEvents = events.filter((n) => n.data.status === "active").length;
  const activeChoices = choices.filter((n) => n.data.status === "active").length;

  return (
    <div className="space-y-3 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-brand-text">Progresso</span>
        <span className="text-xs tabular-nums text-brand-muted">
          {completed}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-brand-accent transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Breakdown */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Milestone className="h-3 w-3 text-emerald-400" />
          <span className="text-[10px] text-brand-muted">
            {chapters.length} capitulos
          </span>
        </div>
        <div className="flex items-center gap-1">
          <BookOpen className="h-3 w-3 text-blue-400" />
          <span className="text-[10px] text-brand-muted">
            {activeEvents}/{events.length} eventos
          </span>
        </div>
        <div className="flex items-center gap-1">
          <GitBranch className="h-3 w-3 text-amber-400" />
          <span className="text-[10px] text-brand-muted">
            {activeChoices}/{choices.length} escolhas
          </span>
        </div>
      </div>
    </div>
  );
}
