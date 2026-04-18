"use client";

import { useState } from "react";
import { Bot, Brain, Loader2, Play, Sparkles } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useNpcBehaviorStore } from "@/lib/npc-behavior-store";
import {
  BEHAVIOR_META,
  DURATION_OPTIONS,
} from "@/lib/npc-behavior-types";
import type {
  BehaviorType,
  ParticipantRole,
  AiBehaviorParams,
} from "@/lib/npc-behavior-types";
import { broadcastSend } from "@/lib/broadcast-sync";
import { ModalShell } from "./modal-shell";

interface BehaviorCreatorModalProps {
  onClose: () => void;
}

export function BehaviorCreatorModal({ onClose }: BehaviorCreatorModalProps) {
  const tokens = useGameplayStore((s) => s.tokens);
  const selectedTokenIds = useGameplayStore((s) => s.selectedTokenIds);
  const activeMapId = "default";

  const selectedTokens = tokens.filter(
    (t) => selectedTokenIds.includes(t.id) && t.onMap,
  );

  const [behaviorType, setBehaviorType] = useState<BehaviorType>("CROWD");
  const [speed, setSpeed] = useState(BEHAVIOR_META.CROWD.defaultSpeed);
  const [chaos, setChaos] = useState(BEHAVIOR_META.CROWD.defaultChaos);
  const [separationRadius, setSeparationRadius] = useState(1.5);
  const [durationMs, setDurationMs] = useState(0);
  const [targetX, setTargetX] = useState(0);
  const [targetY, setTargetY] = useState(0);
  const [hasTarget, setHasTarget] = useState(false);

  const [aiSituation, setAiSituation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiBehaviorParams | null>(null);

  const [tab, setTab] = useState<"manual" | "ai">("manual");

  function handleTypeChange(type: BehaviorType) {
    setBehaviorType(type);
    setSpeed(BEHAVIOR_META[type].defaultSpeed);
    setChaos(BEHAVIOR_META[type].defaultChaos);
    setHasTarget(["FLEE", "RIOT", "FOLLOW", "GUARD", "PATROL", "SEARCH"].includes(type));
  }

  async function handleAiGenerate() {
    if (!aiSituation.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/ai/npc-behavior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: aiSituation,
          npcCount: selectedTokens.length,
          npcNames: selectedTokens.map((t) => t.name),
        }),
      });
      const data: AiBehaviorParams = await res.json();
      setAiResult(data);
      setBehaviorType(data.behaviorType);
      setSpeed(data.config.speed);
      setChaos(data.config.chaosCoefficient);
      setSeparationRadius(data.config.separationRadius);
      if (data.config.target) {
        setHasTarget(true);
        setTargetX(data.config.target.x);
        setTargetY(data.config.target.y);
      }
    } catch {
      console.error("[behavior-creator] AI generation failed");
    } finally {
      setAiLoading(false);
    }
  }

  function applyAiResult() {
    if (!aiResult) return;
    handleStart(aiResult);
  }

  function handleStart(overrideAi?: AiBehaviorParams) {
    if (selectedTokens.length === 0) return;

    const participants = selectedTokens.map((t, i) => {
      let role: ParticipantRole = "MEMBER";
      if (overrideAi?.participantRoles) {
        const match = overrideAi.participantRoles.find((r) => r.index === i);
        if (match) role = match.role;
      } else if (i === 0 && ["RIOT", "FOLLOW"].includes(behaviorType)) {
        role = "LEADER";
      }
      return { tokenId: t.id, role, startX: t.x, startY: t.y };
    });

    const config = {
      speed,
      chaosCoefficient: chaos,
      separationRadius,
      target: hasTarget ? { x: targetX, y: targetY } : undefined,
      phases: overrideAi?.phases,
    };

    const store = useNpcBehaviorStore.getState();
    const behaviorId = store.createBehavior({
      sessionId: "local",
      mapId: activeMapId ?? "default",
      type: behaviorType,
      config,
      participants,
      durationMs: durationMs || undefined,
      aiParams: overrideAi,
    });

    const walls = new Set<string>();
    store.startBehavior(behaviorId, walls);

    broadcastSend("npc:behavior-started", {
      behaviorId,
      type: behaviorType,
      participants,
      config,
    });

    onClose();
  }

  const needsTarget = ["FLEE", "RIOT", "FOLLOW", "GUARD", "PATROL", "SEARCH"].includes(behaviorType);

  return (
    <ModalShell title="Comportamento de Grupo" maxWidth={520} onClose={onClose}>
      {selectedTokens.length === 0 ? (
        <div className="py-8 text-center">
          <Bot className="mx-auto mb-2 h-8 w-8 text-brand-muted" />
          <p className="text-xs text-brand-muted">
            Selecione tokens no mapa antes de criar um comportamento.
          </p>
        </div>
      ) : (
        <>
          {/* Selected tokens chips */}
          <div className="mb-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
              Tokens selecionados ({selectedTokens.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedTokens.map((t) => (
                <span
                  key={t.id}
                  className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-brand-text"
                >
                  {t.name}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex rounded-lg border border-brand-border overflow-hidden">
            <button
              onClick={() => setTab("manual")}
              className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                tab === "manual"
                  ? "bg-white/5 text-brand-text"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              <Bot className="mr-1 inline h-3 w-3" />
              Manual
            </button>
            <button
              onClick={() => setTab("ai")}
              className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                tab === "ai"
                  ? "bg-[#7c5cfc]/10 text-[#7c5cfc]"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              <Brain className="mr-1 inline h-3 w-3" />
              Gerar com IA
            </button>
          </div>

          {tab === "ai" && (
            <div className="mb-4 space-y-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                  Descreva a situação
                </label>
                <textarea
                  value={aiSituation}
                  onChange={(e) => setAiSituation(e.target.value)}
                  placeholder="Ex: Uma explosão derruba a porta da taverna. Os civis entram em pânico enquanto os guardas tentam manter a ordem..."
                  className="w-full rounded-lg border border-brand-border bg-white/[0.03] px-3 py-2 text-xs text-brand-text placeholder:text-[#444] focus:border-[#7c5cfc] focus:outline-none"
                  rows={3}
                />
              </div>
              <button
                onClick={handleAiGenerate}
                disabled={aiLoading || !aiSituation.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#7c5cfc] py-2 text-xs font-semibold text-white transition-colors hover:bg-[#6b4ce0] disabled:opacity-40"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Gerar Parâmetros
                  </>
                )}
              </button>

              {aiResult && (
                <div className="rounded-lg border border-[#7c5cfc]/30 bg-[#7c5cfc]/5 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {BEHAVIOR_META[aiResult.behaviorType]?.emoji}
                    </span>
                    <span className="text-xs font-semibold text-brand-text">
                      {BEHAVIOR_META[aiResult.behaviorType]?.label}
                    </span>
                  </div>
                  {aiResult.narratorMessage && (
                    <p className="text-[11px] italic text-[#A29BFE]">
                      &ldquo;{aiResult.narratorMessage}&rdquo;
                    </p>
                  )}
                  {aiResult.reasoning && (
                    <p className="text-[10px] text-brand-muted">
                      {aiResult.reasoning}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 text-[10px] text-brand-muted">
                    <span>Vel: {aiResult.config.speed}</span>
                    <span>Caos: {aiResult.config.chaosCoefficient}</span>
                    <span>Sep: {aiResult.config.separationRadius}</span>
                  </div>
                  {aiResult.participantRoles && aiResult.participantRoles.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {aiResult.participantRoles.map((pr) => (
                        <span
                          key={pr.index}
                          className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-brand-text"
                        >
                          {selectedTokens[pr.index]?.name ?? `#${pr.index}`}: {pr.role}
                        </span>
                      ))}
                    </div>
                  )}
                  {aiResult.phases && aiResult.phases.length > 0 && (
                    <div className="text-[10px] text-brand-muted">
                      Fases: {aiResult.phases.map((p) => `${BEHAVIOR_META[p.type]?.label ?? p.type} (${(p.durationMs / 1000).toFixed(0)}s)`).join(" → ")}
                    </div>
                  )}
                  <button
                    onClick={applyAiResult}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#00B894] py-1.5 text-xs font-semibold text-white hover:bg-[#00A884]"
                  >
                    <Play className="h-3 w-3" />
                    Aplicar e Iniciar
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === "manual" && (
            <div className="space-y-3">
              {/* Behavior type grid */}
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                  Tipo de comportamento
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(Object.keys(BEHAVIOR_META) as BehaviorType[]).map((type) => {
                    const meta = BEHAVIOR_META[type];
                    const active = behaviorType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => handleTypeChange(type)}
                        className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left text-[11px] transition-colors ${
                          active
                            ? "border-[#7c5cfc] bg-[#7c5cfc]/10 text-[#7c5cfc]"
                            : "border-brand-border text-brand-muted hover:bg-white/[0.03]"
                        }`}
                      >
                        <span>{meta.emoji}</span>
                        <span>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Speed */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                  Velocidade: {speed.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={5}
                  step={0.1}
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-[#7c5cfc]"
                />
              </div>

              {/* Chaos */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                  Caos: {chaos.toFixed(2)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={chaos}
                  onChange={(e) => setChaos(parseFloat(e.target.value))}
                  className="w-full accent-[#7c5cfc]"
                />
              </div>

              {/* Separation */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                  Raio de separação: {separationRadius.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0.3}
                  max={5}
                  step={0.1}
                  value={separationRadius}
                  onChange={(e) => setSeparationRadius(parseFloat(e.target.value))}
                  className="w-full accent-[#7c5cfc]"
                />
              </div>

              {/* Target */}
              {needsTarget && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                      Alvo X
                    </label>
                    <input
                      type="number"
                      value={targetX}
                      onChange={(e) => setTargetX(parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg border border-brand-border bg-white/[0.03] px-2 py-1 text-xs text-brand-text focus:border-[#7c5cfc] focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                      Alvo Y
                    </label>
                    <input
                      type="number"
                      value={targetY}
                      onChange={(e) => setTargetY(parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg border border-brand-border bg-white/[0.03] px-2 py-1 text-xs text-brand-text focus:border-[#7c5cfc] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Duration */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                  Duração
                </label>
                <select
                  value={durationMs}
                  onChange={(e) => setDurationMs(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-brand-border bg-white/[0.03] px-2 py-1.5 text-xs text-brand-text focus:border-[#7c5cfc] focus:outline-none"
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start button */}
              <button
                onClick={() => handleStart()}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#00B894] py-2 text-xs font-semibold text-white hover:bg-[#00A884]"
              >
                <Play className="h-3.5 w-3.5" />
                Iniciar Comportamento
              </button>
            </div>
          )}
        </>
      )}
    </ModalShell>
  );
}
