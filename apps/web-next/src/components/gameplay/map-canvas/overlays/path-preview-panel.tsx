"use client";

import {
  Check,
  X,
  Undo2,
  Trash2,
  Swords,
  Shield,
  Eye,
  Mountain,
  Flame,
  DoorClosed,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { PathCellEvent, PathEventType } from "@/lib/gameplay-store";
import { getMaxMovementFt } from "@/lib/movement-cost";
import { executePath } from "@/lib/path-execution";

const EVENT_ICONS: Record<PathEventType, typeof Swords> = {
  opportunity_attack: Swords,
  enters_enemy_reach: Shield,
  enters_enemy_vision: Eye,
  difficult_terrain: Mountain,
  hazardous_terrain: Flame,
  door_closed: DoorClosed,
  door_locked: Lock,
  over_speed_limit: AlertTriangle,
};

const SEVERITY_BG: Record<string, string> = {
  danger: "bg-red-500/10 border-red-500/20",
  warning: "bg-orange-500/10 border-orange-500/20",
  info: "bg-yellow-500/10 border-yellow-500/20",
};

export function PathPreviewPanel() {
  const pathPlanningActive = useGameplayStore((s) => s.pathPlanningActive);
  const pathPlanningTokenId = useGameplayStore((s) => s.pathPlanningTokenId);
  const plannedPath = useGameplayStore((s) => s.plannedPath);
  const tokens = useGameplayStore((s) => s.tokens);
  const movementUsedFt = useGameplayStore((s) => s.movementUsedFt);
  const turnActions = useGameplayStore((s) => s.turnActions);
  const exitPathPlanning = useGameplayStore((s) => s.exitPathPlanning);
  const undoPathStep = useGameplayStore((s) => s.undoPathStep);
  const clearPath = useGameplayStore((s) => s.clearPath);

  const token = tokens.find((t) => t.id === pathPlanningTokenId);

  if (!pathPlanningActive || !token) return null;

  const maxFt = getMaxMovementFt(token.speed, turnActions.isDashing, movementUsedFt);
  const totalFt = plannedPath.length > 0 ? plannedPath[plannedPath.length - 1].totalFt : 0;
  const isOverSpeed = totalFt > maxFt;
  const pct = maxFt > 0 ? Math.min(100, (totalFt / maxFt) * 100) : 0;

  // Collect all events
  const allEvents: Array<PathCellEvent & { cellIndex: number }> = [];
  plannedPath.forEach((cell, i) => {
    cell.events.forEach((evt) => {
      allEvents.push({ ...evt, cellIndex: i + 1 });
    });
  });

  const dangerCount = allEvents.filter((e) => e.severity === "danger").length;
  const warningCount = allEvents.filter((e) => e.severity === "warning").length;

  async function handleConfirm() {
    if (plannedPath.length === 0) return;
    if (isOverSpeed) return; // Safety: don't execute if over movement limit
    await executePath(token!.id, plannedPath);
  }

  return (
    <div
      className="pointer-events-auto absolute bottom-4 left-1/2 z-30 w-80 -translate-x-1/2 rounded-xl border border-brand-border bg-[#111116]/95 shadow-2xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-border px-3 py-2">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
          Trajeto Planejado
        </span>
        <button
          onClick={exitPathPlanning}
          className="rounded p-0.5 text-brand-muted hover:text-brand-text"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-2.5 px-3 py-2.5">
        {/* Distance */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-brand-muted">
              Distância: <span className={`font-semibold ${isOverSpeed ? "text-red-400" : "text-brand-text"}`}>
                {totalFt}/{maxFt}ft
              </span>
              {" "}({plannedPath.length} {plannedPath.length === 1 ? "célula" : "células"})
            </span>
            {turnActions.isDashing && (
              <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-medium text-blue-400">
                Dash
              </span>
            )}
            {turnActions.isDisengaging && (
              <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[9px] font-medium text-cyan-400">
                Disengage
              </span>
            )}
          </div>
          {/* Progress bar */}
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={`h-full rounded-full transition-all ${isOverSpeed ? "bg-red-500" : "bg-brand-accent"}`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        </div>

        {/* Events */}
        {allEvents.length > 0 && (
          <div className="space-y-1">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-muted">
              Eventos ({dangerCount > 0 ? `${dangerCount} perigo` : ""}{dangerCount > 0 && warningCount > 0 ? ", " : ""}{warningCount > 0 ? `${warningCount} aviso` : ""}{dangerCount === 0 && warningCount === 0 ? `${allEvents.length} info` : ""})
            </span>
            <div className="max-h-32 space-y-1 overflow-y-auto">
              {allEvents.map((evt, i) => {
                const Icon = EVENT_ICONS[evt.type] ?? AlertTriangle;
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-1.5 rounded border px-2 py-1 ${SEVERITY_BG[evt.severity] ?? SEVERITY_BG.info}`}
                  >
                    <Icon
                      className="mt-0.5 h-3 w-3 flex-shrink-0"
                      style={{ color: evt.iconColor }}
                    />
                    <div className="min-w-0 text-[10px]">
                      <span className="font-medium text-brand-text">
                        Célula {evt.cellIndex}:
                      </span>{" "}
                      <span className="text-brand-muted">{evt.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {plannedPath.length === 0 && (
          <p className="py-2 text-center text-[10px] italic text-brand-muted">
            Clique nas células do mapa para traçar o caminho.
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={handleConfirm}
            disabled={plannedPath.length === 0}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-brand-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent/80 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Check className="h-3 w-3" />
            Confirmar
          </button>
          <button
            onClick={exitPathPlanning}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-brand-border px-3 py-2 text-xs text-brand-muted transition-colors hover:bg-white/[0.04]"
          >
            <X className="h-3 w-3" />
            Cancelar
          </button>
        </div>

        {/* Undo / Clear */}
        <div className="flex gap-1.5">
          <button
            onClick={undoPathStep}
            disabled={plannedPath.length === 0}
            className="flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 text-[10px] text-brand-muted transition-colors hover:bg-white/[0.04] disabled:opacity-30"
          >
            <Undo2 className="h-2.5 w-2.5" />
            Desfazer (Ctrl+Z)
          </button>
          <button
            onClick={clearPath}
            disabled={plannedPath.length === 0}
            className="flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 text-[10px] text-brand-muted transition-colors hover:bg-white/[0.04] disabled:opacity-30"
          >
            <Trash2 className="h-2.5 w-2.5" />
            Limpar
          </button>
        </div>
      </div>
    </div>
  );
}
