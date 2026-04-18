"use client";

import { useState } from "react";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Pause,
  Play,
  Square,
  Trash2,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useNpcBehaviorStore } from "@/lib/npc-behavior-store";
import { BEHAVIOR_META } from "@/lib/npc-behavior-types";
import type { NpcBehavior } from "@/lib/npc-behavior-types";
import { broadcastSend } from "@/lib/broadcast-sync";

export function BehaviorSidebarSection() {
  const collapsed = useGameplayStore((s) => s.collapsedSections["behaviors"]);
  const toggleSection = useGameplayStore((s) => s.toggleSection);
  const openModal = useGameplayStore((s) => s.openModal);

  const behaviors = useNpcBehaviorStore((s) => s.behaviors);
  const activeBehaviors = Object.values(behaviors).filter(
    (b) => b.status === "ACTIVE" || b.status === "PAUSED",
  );

  return (
    <div className="border-t border-brand-border">
      <button
        onClick={() => toggleSection("behaviors")}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-left hover:bg-white/[0.02]"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-brand-muted" />
        ) : (
          <ChevronDown className="h-3 w-3 text-brand-muted" />
        )}
        <Bot className="h-3.5 w-3.5 text-[#7c5cfc]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-text">
          Comportamentos
        </span>
        {activeBehaviors.length > 0 && (
          <span className="rounded-full bg-[#7c5cfc]/20 px-1.5 text-[10px] font-bold text-[#7c5cfc]">
            {activeBehaviors.length}
          </span>
        )}
      </button>

      {!collapsed && (
        <div className="px-2 pb-2">
          {activeBehaviors.length === 0 ? (
            <div className="py-3 text-center">
              <p className="text-[10px] text-brand-muted">
                Nenhum comportamento ativo.
              </p>
              <button
                onClick={() => openModal("behaviorCreator")}
                className="mt-1 text-[10px] text-[#7c5cfc] hover:underline"
              >
                Criar novo
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {activeBehaviors.map((beh) => (
                <BehaviorItem key={beh.id} behavior={beh} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BehaviorItem({ behavior }: { behavior: NpcBehavior }) {
  const pauseBehavior = useNpcBehaviorStore((s) => s.pauseBehavior);
  const resumeBehavior = useNpcBehaviorStore((s) => s.resumeBehavior);
  const stopBehavior = useNpcBehaviorStore((s) => s.stopBehavior);
  const removeBehavior = useNpcBehaviorStore((s) => s.removeBehavior);

  const meta = BEHAVIOR_META[behavior.type];
  const isPaused = behavior.status === "PAUSED";
  const elapsed = behavior.startedAt
    ? Date.now() - new Date(behavior.startedAt).getTime()
    : 0;
  const progress =
    behavior.durationMs && behavior.durationMs > 0
      ? Math.min(1, elapsed / behavior.durationMs)
      : null;

  function handlePauseResume() {
    if (isPaused) {
      resumeBehavior(behavior.id);
    } else {
      pauseBehavior(behavior.id);
      broadcastSend("npc:behavior-paused", { behaviorId: behavior.id });
    }
  }

  function handleStop() {
    stopBehavior(behavior.id);
    broadcastSend("npc:behavior-ended", { behaviorId: behavior.id });
  }

  return (
    <div className="group rounded-lg border border-brand-border/50 bg-white/[0.02] px-2 py-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{meta.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium text-brand-text">
              {meta.label}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-[9px] ${
                isPaused ? "text-amber-400" : "text-[#00B894]"
              }`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  isPaused ? "bg-amber-400" : "bg-[#00B894] animate-pulse"
                }`}
              />
              {isPaused ? "PAUSADO" : "ATIVO"}
            </span>
          </div>
          <div className="text-[9px] text-brand-muted truncate">
            {behavior.participants.map((p) => p.tokenId.slice(0, 6)).join(", ")}
            {" · "}
            {behavior.participants.length} tokens
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handlePauseResume}
            className="flex h-5 w-5 items-center justify-center rounded text-brand-muted hover:bg-white/10 hover:text-brand-text"
            title={isPaused ? "Retomar" : "Pausar"}
          >
            {isPaused ? (
              <Play className="h-2.5 w-2.5" />
            ) : (
              <Pause className="h-2.5 w-2.5" />
            )}
          </button>
          <button
            onClick={handleStop}
            className="flex h-5 w-5 items-center justify-center rounded text-brand-muted hover:bg-red-500/20 hover:text-red-400"
            title="Parar"
          >
            <Square className="h-2.5 w-2.5" />
          </button>
          <button
            onClick={() => removeBehavior(behavior.id)}
            className="flex h-5 w-5 items-center justify-center rounded text-brand-muted hover:bg-red-500/20 hover:text-red-400"
            title="Remover"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>

      {progress !== null && (
        <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#7c5cfc] transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {behavior.aiParams?.narratorMessage && (
        <p className="mt-1 text-[9px] italic text-[#A29BFE] truncate">
          {behavior.aiParams.narratorMessage}
        </p>
      )}
    </div>
  );
}
