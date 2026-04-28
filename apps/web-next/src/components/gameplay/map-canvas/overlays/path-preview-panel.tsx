"use client";

import { useEffect, useRef, useState } from "react";
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
  Wind,
  Crown,
  GripHorizontal,
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
  const setDashing = useGameplayStore((s) => s.setDashing);
  const currentUserIsGM = useGameplayStore((s) => s.currentUserIsGM);
  const exitPathPlanning = useGameplayStore((s) => s.exitPathPlanning);
  const undoPathStep = useGameplayStore((s) => s.undoPathStep);
  const clearPath = useGameplayStore((s) => s.clearPath);

  // Offset relativo da posição default (bottom-center). Usuário arrasta
  // o header pra realocar quando o painel cobre o caminho que quer
  // desenhar. Reset ao sair do path planning.
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  useEffect(() => {
    if (!pathPlanningActive) setOffset({ x: 0, y: 0 });
  }, [pathPlanningActive]);

  function onDragStart(e: React.MouseEvent) {
    e.preventDefault();
    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
    function onMove(ev: MouseEvent) {
      const s = dragStateRef.current;
      if (!s) return;
      setOffset({
        x: s.startOffsetX + (ev.clientX - s.startX),
        y: s.startOffsetY + (ev.clientY - s.startY),
      });
    }
    function onUp() {
      dragStateRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const token = tokens.find((t) => t.id === pathPlanningTokenId);

  if (!pathPlanningActive || !token) return null;

  const maxFt = getMaxMovementFt(token.speed, turnActions.isDashing, movementUsedFt);
  const totalFt = plannedPath.length > 0 ? plannedPath[plannedPath.length - 1].totalFt : 0;
  const isOverSpeed = totalFt > maxFt;
  // GM bypassa o limite de movimento (CLAUDE.md §3 + §10): pode confirmar
  // mesmo trajetos longos sem precisar marcar Dash.
  const blockedByLimit = isOverSpeed && !currentUserIsGM;
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
    if (blockedByLimit) return; // Safety: jogador não pode passar do speed
    await executePath(token!.id, plannedPath);
  }

  return (
    <div
      className="pointer-events-auto absolute bottom-4 left-1/2 z-30 w-80 rounded-xl border border-brand-border bg-[#111116]/95 shadow-2xl backdrop-blur-sm"
      style={{
        transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)`,
      }}
    >
      {/* Header — drag handle (segura e arrasta pra reposicionar) */}
      <div
        onMouseDown={onDragStart}
        className="flex cursor-grab items-center justify-between gap-2 border-b border-brand-border px-3 py-2 select-none active:cursor-grabbing"
        title="Arraste para reposicionar"
      >
        <div className="flex items-center gap-1.5">
          <GripHorizontal className="h-3 w-3 text-brand-muted/60" />
          <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
            Trajeto Planejado
          </span>
        </div>
        <button
          onClick={exitPathPlanning}
          onMouseDown={(e) => e.stopPropagation()}
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
              Distância: <span className={`font-semibold ${isOverSpeed ? (currentUserIsGM ? "text-amber-400" : "text-red-400") : "text-brand-text"}`}>
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
              className={`h-full rounded-full transition-all ${
                isOverSpeed
                  ? currentUserIsGM
                    ? "bg-amber-400"
                    : "bg-red-500"
                  : "bg-brand-accent"
              }`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          {isOverSpeed && currentUserIsGM && (
            <p className="mt-1 flex items-center gap-1 text-[10px] text-amber-400/90">
              <Crown className="h-2.5 w-2.5" />
              GM bypass — trajeto excede o limite de {maxFt}ft, mas será aplicado.
            </p>
          )}
        </div>

        {/* Modificadores de movimento — atalho rápido pra dobrar speed
         *  sem precisar abrir a action bar. */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDashing(!turnActions.isDashing)}
            className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium transition-colors ${
              turnActions.isDashing
                ? "border-blue-500/40 bg-blue-500/15 text-blue-300"
                : "border-brand-border bg-white/[0.02] text-brand-muted hover:border-brand-accent/30 hover:text-brand-text"
            }`}
            title={
              turnActions.isDashing
                ? `Dash ativo — ${token.speed * 2}ft no turno`
                : `Ativar Dash — dobra para ${token.speed * 2}ft`
            }
          >
            <Wind className="h-2.5 w-2.5" />
            Dash {turnActions.isDashing ? "✓" : `×2`}
          </button>
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
            disabled={plannedPath.length === 0 || blockedByLimit}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-brand-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent/80 disabled:opacity-30 disabled:cursor-not-allowed"
            title={
              blockedByLimit
                ? `Trajeto excede o limite de ${maxFt}ft. Ative Dash para dobrar.`
                : undefined
            }
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
