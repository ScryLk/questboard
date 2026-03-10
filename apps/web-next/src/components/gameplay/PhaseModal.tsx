"use client";

import { useState, useEffect, useRef } from "react";
import { X, ArrowRight, Clock } from "lucide-react";
import { usePhaseStore } from "@/stores/phaseStore";
import {
  PHASE_META,
  ALL_PHASE_TYPES,
} from "@/constants/phaseTransitions";
import type { PhaseType, SessionPhase } from "@/types/phase";

// ── Mini Confirm ──

function MiniConfirm({
  targetType,
  onConfirm,
  onCancel,
}: {
  targetType: PhaseType;
  onConfirm: (label: string) => void;
  onCancel: () => void;
}) {
  const meta = PHASE_META[targetType];
  const [label, setLabel] = useState(meta.label);

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-brand-text">
        <ArrowRight className="h-3.5 w-3.5 text-brand-muted" />
        Transicionar para{" "}
        <span className={meta.color}>{meta.label}</span>?
      </div>
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Nome da fase"
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-brand-text placeholder:text-gray-600 focus:border-white/25 focus:outline-none"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onConfirm(label)}
          className="flex-1 rounded-lg bg-brand-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-accent/80"
        >
          Confirmar
        </button>
        <button
          onClick={onCancel}
          className="flex-1 rounded-lg border border-brand-border px-3 py-1.5 text-xs text-brand-muted transition-colors hover:bg-white/[0.04]"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Timeline Dot ──

function TimelineDot({
  phase,
  isCurrent,
}: {
  phase: SessionPhase;
  isCurrent: boolean;
}) {
  const meta = PHASE_META[phase.type];
  const colorMap: Record<string, string> = {
    "text-emerald-400": "bg-emerald-400",
    "text-red-400": "bg-red-400",
    "text-blue-400": "bg-blue-400",
    "text-yellow-400": "bg-yellow-400",
    "text-purple-400": "bg-purple-400",
    "text-orange-400": "bg-orange-400",
    "text-indigo-400": "bg-indigo-400",
    "text-gray-400": "bg-gray-400",
  };
  const bgClass = colorMap[meta.color] ?? "bg-gray-400";

  return (
    <div className="group relative flex flex-col items-center">
      <div
        className={`rounded-full transition-all ${bgClass} ${
          isCurrent
            ? "h-3.5 w-3.5 ring-2 ring-white/20"
            : "h-2.5 w-2.5 opacity-60"
        }`}
      />
      {/* Tooltip */}
      <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/90 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
        {phase.label}
        {phase.durationMinutes != null && ` · ${phase.durationMinutes}min`}
      </div>
    </div>
  );
}

// ── History Item ──

function HistoryItem({ phase }: { phase: SessionPhase }) {
  const meta = PHASE_META[phase.type];
  const Icon = meta.icon;

  return (
    <div className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.03]">
      <div
        className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ${meta.bgColor}`}
      >
        <Icon className={`h-3 w-3 ${meta.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-brand-text">
            {phase.label}
          </span>
          {phase.durationMinutes != null && (
            <span className="text-[10px] text-brand-muted">
              {phase.durationMinutes}min
            </span>
          )}
        </div>
        {phase.notes && (
          <p className="mt-0.5 text-[10px] leading-relaxed text-brand-muted">
            {phase.notes}
          </p>
        )}
      </div>
      <span className="flex-shrink-0 text-[10px] text-brand-muted">
        {phase.startedAt.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}

// ── Main Modal ──

export function PhaseModal() {
  const isModalOpen = usePhaseStore((s) => s.isModalOpen);
  const closeModal = usePhaseStore((s) => s.closeModal);
  const current = usePhaseStore((s) => s.current);
  const history = usePhaseStore((s) => s.history);
  const transitionTo = usePhaseStore((s) => s.transitionTo);
  const updateCurrentNotes = usePhaseStore((s) => s.updateCurrentNotes);
  const getSuggestions = usePhaseStore((s) => s.getSuggestions);
  const getElapsedMinutes = usePhaseStore((s) => s.getElapsedMinutes);

  const [confirmingType, setConfirmingType] = useState<PhaseType | null>(null);
  const [elapsed, setElapsed] = useState(getElapsedMinutes());
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isModalOpen) return;
    setElapsed(getElapsedMinutes());
    const interval = setInterval(() => {
      setElapsed(getElapsedMinutes());
    }, 60_000);
    return () => clearInterval(interval);
  }, [isModalOpen, getElapsedMinutes]);

  // Reset confirm state when modal opens/closes
  useEffect(() => {
    if (!isModalOpen) setConfirmingType(null);
  }, [isModalOpen]);

  function handleConfirm(type: PhaseType, label: string) {
    transitionTo(type, label);
    setConfirmingType(null);
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      closeModal();
    }
  }

  const suggestions = getSuggestions();
  const currentMeta = PHASE_META[current.type];
  const CurrentIcon = currentMeta.icon;
  const allPhases = [...history, current];

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative z-10 flex h-full w-[420px] animate-slide-in-right flex-col border-l border-brand-border bg-[#111116]/98 backdrop-blur-sm"
        style={{
          animation: "slideInRight 200ms ease-out",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
            Contexto da Sessão
          </span>
          <button
            onClick={closeModal}
            className="rounded p-1 text-brand-muted transition-colors hover:text-brand-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {/* Current Phase */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
              Fase Atual
            </div>
            <div
              className={`rounded-xl border border-current/20 p-3 ${currentMeta.bgColor}`}
            >
              <div className="flex items-center gap-2.5">
                <CurrentIcon className={`h-5 w-5 ${currentMeta.color}`} />
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${currentMeta.color}`}>
                    {current.label}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-brand-muted">
                    <Clock className="h-3 w-3" />
                    <span className="tabular-nums">{elapsed}min</span>
                    <span className="opacity-40">·</span>
                    <span>{currentMeta.label}</span>
                  </div>
                </div>
              </div>
            </div>
            <textarea
              value={current.notes ?? ""}
              onChange={(e) => updateCurrentNotes(e.target.value)}
              placeholder="Notas desta fase... (opcional)"
              className="h-16 w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-300 placeholder:text-gray-600 focus:border-white/25 focus:outline-none"
            />
          </div>

          {/* Suggestions */}
          {confirmingType === null && (
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                Sugestões de Próxima Fase
              </div>
              <div className="space-y-1.5">
                {suggestions.map((type) => {
                  const meta = PHASE_META[type];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => setConfirmingType(type)}
                      className="flex w-full items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
                    >
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${meta.bgColor}`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-brand-text">
                          {meta.label}
                        </div>
                        <div className="text-[10px] text-brand-muted">
                          {meta.description}
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-brand-muted opacity-40" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mini Confirm */}
          {confirmingType !== null && (
            <MiniConfirm
              targetType={confirmingType}
              onConfirm={(label) => handleConfirm(confirmingType, label)}
              onCancel={() => setConfirmingType(null)}
            />
          )}

          {/* All Phases Grid */}
          {confirmingType === null && (
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                Todas as Fases
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {ALL_PHASE_TYPES.map((type) => {
                  const meta = PHASE_META[type];
                  const Icon = meta.icon;
                  const isActive = type === current.type;
                  return (
                    <button
                      key={type}
                      onClick={() => !isActive && setConfirmingType(type)}
                      disabled={isActive}
                      className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                        isActive
                          ? `border-current/30 ${meta.bgColor} cursor-default`
                          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]"
                      }`}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 ${isActive ? meta.color : "text-brand-muted"}`}
                      />
                      <span
                        className={`text-[11px] font-medium ${isActive ? meta.color : "text-brand-muted"}`}
                      >
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Separator */}
          <div className="border-t border-brand-border" />

          {/* History */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
              Histórico da Sessão
            </div>

            {/* Horizontal Timeline */}
            {allPhases.length > 1 && (
              <div className="flex items-center gap-1 overflow-x-auto py-2">
                {allPhases.map((phase, i) => (
                  <div key={phase.id} className="flex items-center">
                    {i > 0 && (
                      <div className="mx-0.5 h-px w-4 bg-white/10" />
                    )}
                    <TimelineDot
                      phase={phase}
                      isCurrent={!phase.endedAt}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Vertical List */}
            <div className="space-y-0.5">
              {[...history].reverse().map((phase) => (
                <HistoryItem key={phase.id} phase={phase} />
              ))}
            </div>

            {history.length === 0 && (
              <p className="py-2 text-center text-[10px] italic text-brand-muted">
                Nenhuma fase anterior registrada.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Slide-in animation */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
