"use client";

import { useState } from "react";
import {
  Plus,
  GitBranch,
  Calendar,
  Columns3,
  List,
  Network,
} from "lucide-react";
import { useStoryStore, type StoryView } from "@/stores/storyStore";
import { calcCampaignProgress } from "@/types/story";
import { RoadmapView } from "@/components/story/roadmap-view";
import { KanbanView } from "@/components/story/kanban-view";
import { ListView } from "@/components/story/list-view";
import { TimelineView } from "@/components/story/timeline-view";
import { EventDetailDrawer } from "@/components/story/event-detail-drawer";
import { NewArcModal } from "@/components/story/new-arc-modal";
import { NewEventModal } from "@/components/story/new-event-modal";
import { NarrativeCanvas } from "@/components/narrative/narrative-canvas";

const VIEW_TABS: { key: StoryView; label: string; icon: typeof GitBranch }[] = [
  { key: "roadmap", label: "Roadmap", icon: GitBranch },
  { key: "timeline", label: "Timeline", icon: Calendar },
  { key: "kanban", label: "Kanban", icon: Columns3 },
  { key: "list", label: "Lista", icon: List },
  { key: "branching", label: "Ramificações", icon: Network },
];

export default function StoryPage() {
  const arcs = useStoryStore((s) => s.arcs);
  const view = useStoryStore((s) => s.view);
  const setView = useStoryStore((s) => s.setView);

  const [showNewArc, setShowNewArc] = useState(false);
  const [newEventArcId, setNewEventArcId] = useState<string | null>(null);

  const sortedArcs = [...arcs].sort((a, b) => a.order - b.order);
  const progress = calcCampaignProgress(arcs);
  const totalEvents = arcs.reduce((sum, a) => sum + a.events.length, 0);

  function handleAddEvent(arcId: string) {
    setNewEventArcId(arcId);
  }

  const isBranching = view === "branching";

  return (
    <div className={isBranching ? "flex h-[calc(100vh-80px)] flex-col" : "space-y-6"}>
      {/* Header — hidden in branching mode */}
      {!isBranching && (
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">
              História da Campanha
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              A Maldição de Strahd · {arcs.length} arcos · {progress}% completo
            </p>
          </div>
          <button
            onClick={() => setShowNewArc(true)}
            className="cursor-pointer flex items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-accent/80"
          >
            <Plus className="h-4 w-4" />
            Novo Arco
          </button>
        </div>
      )}

      {/* Campaign progress bar — hidden in branching mode */}
      {!isBranching && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] text-brand-muted">
              {totalEvents} eventos no total
            </span>
            <span className="text-[11px] font-medium tabular-nums text-brand-text">
              {progress}%
            </span>
          </div>
          {/* Segmented progress bar */}
          <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
            {sortedArcs.map((arc) => (
              <div
                key={arc.id}
                className="h-full rounded-sm transition-all"
                style={{
                  flex: arc.events.length || 1,
                  backgroundColor:
                    arc.status === "completed"
                      ? "#10B981"
                      : arc.status === "in_progress"
                        ? arc.color
                        : "#2A2A3A",
                }}
              />
            ))}
          </div>

          {/* Arc labels */}
          <div className="mt-2 flex gap-3">
            {sortedArcs.map((arc) => (
              <button
                key={arc.id}
                className="cursor-pointer flex items-center gap-1.5 text-[11px] text-brand-muted transition-colors hover:text-brand-text"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: arc.color }}
                />
                <span className="truncate">{arc.title}</span>
                <span>
                  {arc.status === "completed"
                    ? "✓"
                    : arc.status === "in_progress"
                      ? "◐"
                      : "○"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View switcher */}
      <div className={`flex gap-2 ${isBranching ? "px-1 py-2" : ""}`}>
        {VIEW_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`cursor-pointer flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              view === key
                ? "bg-brand-accent/15 text-brand-accent"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* View content */}
      {isBranching ? (
        <div className="flex-1">
          <NarrativeCanvas />
        </div>
      ) : (
        <div className="min-h-[400px]">
          {view === "roadmap" && <RoadmapView onAddEvent={handleAddEvent} />}
          {view === "kanban" && <KanbanView />}
          {view === "list" && <ListView />}
          {view === "timeline" && <TimelineView />}
        </div>
      )}

      {/* Drawer */}
      {!isBranching && <EventDetailDrawer />}

      {/* Modals */}
      {showNewArc && <NewArcModal onClose={() => setShowNewArc(false)} />}
      {newEventArcId && (
        <NewEventModal
          arcId={newEventArcId}
          onClose={() => setNewEventArcId(null)}
        />
      )}
    </div>
  );
}
