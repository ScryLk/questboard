"use client";

// AttackFlowModal — fluxo completo de "Atacar X alvo(s)":
// 1. Configurar (Digital ou Manual)
// 2. Animar (DiceCanvas — fatia 3, ainda não montado aqui)
// 3. Revisar resultado + Aplicar HP
//
// Aberto pelo radial menu (gameplay-layout) via useAttackStore.openModal.

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Dices,
  PenLine,
  Sword,
  Target,
  X,
  Check,
  Skull,
} from "lucide-react";
import {
  COMPLEX_NOTATION_REGEX,
  ATTACK_BONUS_RANGE,
  CRIT_RANGE,
  DAMAGE_TYPE_LABELS,
  DEFAULT_AC,
} from "@questboard/constants";
import { extractPrimaryDieSides } from "@questboard/game-engine";
import type {
  AttackAdvantage,
  AttackDamageType,
  AttackMode,
  AttackTargetResult,
} from "@questboard/types";
import { useAttackStore } from "@/lib/attack-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useSettingsStore } from "@/lib/settings-store";
import { useAttackActions } from "@/hooks/use-attack-actions";
import { DiceCanvas, buildDiceConfig, DieCard, buildDice } from "./dice-canvas";

const ADVANTAGE_LABELS: Record<AttackAdvantage, string> = {
  NORMAL: "Normal",
  ADVANTAGE: "Vantagem",
  DISADVANTAGE: "Desvantagem",
};

const DAMAGE_TYPE_OPTIONS: AttackDamageType[] = [
  "true",
  "slashing",
  "piercing",
  "bludgeoning",
  "fire",
  "cold",
  "lightning",
  "thunder",
  "acid",
  "poison",
  "psychic",
  "necrotic",
  "radiant",
  "force",
];

export function AttackFlowModal() {
  const phase = useAttackStore((s) => s.phase);
  const pending = useAttackStore((s) => s.pending);
  const result = useAttackStore((s) => s.result);
  const close = useAttackStore((s) => s.close);
  const markAnimationDone = useAttackStore((s) => s.markAnimationDone);

  if (phase === "idle" || !pending) return null;
  return (
    <AttackFlowModalInner
      phase={phase}
      pending={pending}
      result={result}
      onClose={close}
      onAnimationDone={markAnimationDone}
    />
  );
}

interface InnerProps {
  phase: ReturnType<typeof useAttackStore.getState>["phase"];
  pending: NonNullable<ReturnType<typeof useAttackStore.getState>["pending"]>;
  result: ReturnType<typeof useAttackStore.getState>["result"];
  onClose: () => void;
  onAnimationDone: () => void;
}

function AttackFlowModalInner({
  phase,
  pending,
  result,
  onClose,
  onAnimationDone,
}: InnerProps) {
  const tokens = useGameplayStore((s) => s.tokens);
  const animateDice = useSettingsStore((s) => s.dice.animateResult);
  const { executeAttack, applyResults } = useAttackActions();

  const attacker = useMemo(
    () => tokens.find((t) => t.id === pending.attackerTokenId) ?? null,
    [tokens, pending.attackerTokenId],
  );
  const targets = useMemo(
    () =>
      pending.targetTokenIds
        .map((id) => tokens.find((t) => t.id === id))
        .filter((t): t is NonNullable<typeof t> => Boolean(t)),
    [tokens, pending.targetTokenIds],
  );

  // Form state
  const [mode, setMode] = useState<AttackMode>("DIGITAL");
  const [attackName, setAttackName] = useState("Ataque livre");
  const [attackBonus, setAttackBonus] = useState(0);
  const [damageNotation, setDamageNotation] = useState("1d8+3");
  const [damageType, setDamageType] = useState<AttackDamageType>("slashing");
  const [advantage, setAdvantage] = useState<AttackAdvantage>("NORMAL");
  const [critRangeMin, setCritRangeMin] = useState<number>(20);
  const [error, setError] = useState<string | null>(null);

  // Manual mode — uma entrada por alvo
  const [manualEntries, setManualEntries] = useState<
    Record<string, { d20: string; hit: boolean; damage: string }>
  >({});

  // Reseta form ao abrir novo ataque
  useEffect(() => {
    setMode("DIGITAL");
    setAttackName("Ataque livre");
    setAttackBonus(0);
    setDamageNotation("1d8+3");
    setDamageType("slashing");
    setAdvantage("NORMAL");
    setCritRangeMin(20);
    setError(null);
    setManualEntries(
      Object.fromEntries(
        pending.targetTokenIds.map((id) => [
          id,
          { d20: "", hit: false, damage: "" },
        ]),
      ),
    );
  }, [pending.attackerTokenId, pending.targetTokenIds]);

  // Esc fecha
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Em modo MANUAL não há animação 3D — pula direto pra "done".
  // Em DIGITAL, o DiceCanvas chama onAnimationDone quando termina.
  useEffect(() => {
    if (phase !== "animating") return;
    if (result?.mode === "MANUAL") {
      const t = setTimeout(onAnimationDone, 200);
      return () => clearTimeout(t);
    }
    return;
  }, [phase, result?.mode, onAnimationDone]);

  const diceConfig = useMemo(() => {
    if (!result || result.mode === "MANUAL") return null;
    const sides = extractPrimaryDieSides(result.damageNotation);
    return buildDiceConfig(result.results, result.damageType, sides);
  }, [result]);

  if (typeof document === "undefined") return null;
  if (!attacker) {
    return null;
  }

  function validateAndExecute() {
    setError(null);

    if (!COMPLEX_NOTATION_REGEX.test(damageNotation.trim())) {
      setError(
        "Notação inválida. Use formato 1d8+3 ou 2d6+1d4+2 (faces 4/6/8/10/12/20/100).",
      );
      return;
    }

    if (
      attackBonus < ATTACK_BONUS_RANGE.min ||
      attackBonus > ATTACK_BONUS_RANGE.max
    ) {
      setError(
        `Bônus deve estar entre ${ATTACK_BONUS_RANGE.min} e ${ATTACK_BONUS_RANGE.max}.`,
      );
      return;
    }

    if (mode === "MANUAL") {
      // Validação por alvo
      for (const targetId of pending.targetTokenIds) {
        const entry = manualEntries[targetId];
        if (!entry) {
          setError("Preencha o resultado de cada alvo.");
          return;
        }
        if (entry.hit && (!entry.damage || isNaN(Number(entry.damage)))) {
          setError("Dano obrigatório quando o ataque acerta.");
          return;
        }
      }
    }

    const input = {
      attackerTokenId: pending.attackerTokenId,
      targetTokenIds: pending.targetTokenIds,
      attackName: attackName.trim() || "Ataque livre",
      attackBonus,
      damageNotation: damageNotation.trim(),
      damageType,
      advantage,
      critRangeMin,
      mode,
      manualResults:
        mode === "MANUAL"
          ? pending.targetTokenIds.map((id) => {
              const e = manualEntries[id]!;
              return {
                targetTokenId: id,
                d20Final: e.d20 ? Number(e.d20) : undefined,
                hit: e.hit,
                damageTotal:
                  e.hit && e.damage ? Number(e.damage) : undefined,
              };
            })
          : undefined,
    };

    executeAttack(input);
  }

  function handleApply() {
    if (!result) return;
    applyResults(result);
    onClose();
  }

  return createPortal(
      <div
        role="dialog"
        aria-label={`Atacar ${targets.length} alvo${targets.length > 1 ? "s" : ""}`}
        className="fixed inset-0 z-[110] flex items-center justify-center bg-[#04090f]/55 px-4 py-6 backdrop-blur-[1px]"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && phase !== "animating") onClose();
        }}
      >
      <div className="flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-lg border border-brand-border bg-brand-surface shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-brand-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Sword className="h-4 w-4 shrink-0 text-brand-accent" />
            <div className="min-w-0">
              <p className="truncate font-cinzel text-sm font-semibold text-brand-text">
                {phase === "configuring"
                  ? `Atacar ${targets.length} alvo${targets.length > 1 ? "s" : ""}`
                  : phase === "animating"
                    ? "Rolando…"
                    : "Resultado"}
              </p>
              <p className="truncate text-[10px] text-brand-muted">
                {attacker.name} → {targets.map((t) => t.name).join(", ")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={phase === "animating"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text disabled:opacity-30"
            aria-label="Fechar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {phase === "configuring" && (
            <ConfiguringPanel
              mode={mode}
              setMode={setMode}
              attackName={attackName}
              setAttackName={setAttackName}
              attackBonus={attackBonus}
              setAttackBonus={setAttackBonus}
              damageNotation={damageNotation}
              setDamageNotation={setDamageNotation}
              damageType={damageType}
              setDamageType={setDamageType}
              advantage={advantage}
              setAdvantage={setAdvantage}
              critRangeMin={critRangeMin}
              setCritRangeMin={setCritRangeMin}
              targets={targets}
              manualEntries={manualEntries}
              setManualEntries={setManualEntries}
              error={error}
            />
          )}
          {phase === "animating" && (
            <div className="space-y-2">
              {diceConfig ? (
                <DiceCanvas
                  config={diceConfig}
                  onComplete={onAnimationDone}
                  instant={!animateDice}
                />
              ) : (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
                  <Dices className="h-10 w-10 animate-spin text-brand-accent" />
                </div>
              )}
              <p className="text-center text-[11px] text-brand-muted">
                Rolando dados…
              </p>
            </div>
          )}
          {(phase === "done" || phase === "applied") && result && (
            <ResultPanel result={result} targets={targets} />
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-2 border-t border-brand-border px-4 py-3">
          {phase === "configuring" && (
            <>
              <button
                onClick={onClose}
                className="rounded-md border border-brand-border px-3 py-1.5 text-xs font-medium text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
              >
                Cancelar
              </button>
              <button
                onClick={validateAndExecute}
                className="flex items-center gap-1.5 rounded-md bg-brand-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-hover"
              >
                {mode === "DIGITAL" ? (
                  <>
                    <Dices className="h-3.5 w-3.5" />
                    Rolar Ataque
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Aplicar Manual
                  </>
                )}
              </button>
            </>
          )}
          {phase === "done" && result && (
            <>
              <button
                onClick={onClose}
                className="rounded-md border border-brand-border px-3 py-1.5 text-xs font-medium text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
              >
                Fechar (sem aplicar)
              </button>
              <button
                onClick={handleApply}
                className="rounded-md bg-brand-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-hover"
              >
                Aplicar dano
              </button>
            </>
          )}
          {phase === "applied" && (
            <button
              onClick={onClose}
              className="rounded-md bg-brand-accent px-3 py-1.5 text-xs font-semibold text-white"
            >
              Concluído
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── Sub-components ──

interface ConfiguringPanelProps {
  mode: AttackMode;
  setMode: (m: AttackMode) => void;
  attackName: string;
  setAttackName: (s: string) => void;
  attackBonus: number;
  setAttackBonus: (n: number) => void;
  damageNotation: string;
  setDamageNotation: (s: string) => void;
  damageType: AttackDamageType;
  setDamageType: (t: AttackDamageType) => void;
  advantage: AttackAdvantage;
  setAdvantage: (a: AttackAdvantage) => void;
  critRangeMin: number;
  setCritRangeMin: (n: number) => void;
  targets: { id: string; name: string; ac: number }[];
  manualEntries: Record<string, { d20: string; hit: boolean; damage: string }>;
  setManualEntries: React.Dispatch<
    React.SetStateAction<
      Record<string, { d20: string; hit: boolean; damage: string }>
    >
  >;
  error: string | null;
}

function ConfiguringPanel({
  mode,
  setMode,
  attackName,
  setAttackName,
  attackBonus,
  setAttackBonus,
  damageNotation,
  setDamageNotation,
  damageType,
  setDamageType,
  advantage,
  setAdvantage,
  critRangeMin,
  setCritRangeMin,
  targets,
  manualEntries,
  setManualEntries,
  error,
}: ConfiguringPanelProps) {
  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-1">
        <button
          onClick={() => setMode("DIGITAL")}
          className={`flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
            mode === "DIGITAL"
              ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
              : "border-brand-border text-brand-muted hover:text-brand-text"
          }`}
        >
          <Dices className="h-3.5 w-3.5" />
          Digital
        </button>
        <button
          onClick={() => setMode("MANUAL")}
          className={`flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
            mode === "MANUAL"
              ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
              : "border-brand-border text-brand-muted hover:text-brand-text"
          }`}
        >
          <PenLine className="h-3.5 w-3.5" />
          Manual
        </button>
      </div>

      {/* Nome */}
      <Field label="Nome do ataque">
        <input
          type="text"
          value={attackName}
          onChange={(e) => setAttackName(e.target.value)}
          maxLength={60}
          placeholder="Espada Longa, Bola de Fogo…"
          className="w-full rounded-md border border-brand-border bg-brand-surface-light px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
        />
      </Field>

      {/* Dano */}
      <div className="grid grid-cols-2 gap-2">
        <Field label="Notação do dano">
          <input
            type="text"
            value={damageNotation}
            onChange={(e) => setDamageNotation(e.target.value)}
            placeholder="1d8+3"
            className="w-full rounded-md border border-brand-border bg-brand-surface-light px-3 py-2 font-mono text-sm text-brand-text outline-none focus:border-brand-accent"
          />
        </Field>
        <Field label="Tipo">
          <select
            value={damageType}
            onChange={(e) => setDamageType(e.target.value as AttackDamageType)}
            className="w-full rounded-md border border-brand-border bg-brand-surface-light px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
          >
            {DAMAGE_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {DAMAGE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Modificadores (só Digital) */}
      {mode === "DIGITAL" && (
        <div className="grid grid-cols-3 gap-2">
          <Field label="Bônus">
            <input
              type="number"
              value={attackBonus}
              onChange={(e) =>
                setAttackBonus(parseInt(e.target.value || "0", 10))
              }
              className="w-full rounded-md border border-brand-border bg-brand-surface-light px-3 py-2 text-center text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
          <Field label="Vantagem">
            <select
              value={advantage}
              onChange={(e) => setAdvantage(e.target.value as AttackAdvantage)}
              className="w-full rounded-md border border-brand-border bg-brand-surface-light px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
            >
              {(Object.keys(ADVANTAGE_LABELS) as AttackAdvantage[]).map((a) => (
                <option key={a} value={a}>
                  {ADVANTAGE_LABELS[a]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Crit em">
            <select
              value={critRangeMin}
              onChange={(e) => setCritRangeMin(Number(e.target.value))}
              className="w-full rounded-md border border-brand-border bg-brand-surface-light px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
            >
              {[20, 19, 18].map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {/* Lista de alvos */}
      <Field
        label={
          mode === "DIGITAL"
            ? `Alvos (${targets.length})`
            : "Resultado por alvo"
        }
      >
        <div className="space-y-2">
          {targets.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-1.5 rounded-md border border-brand-border bg-brand-surface-light px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-brand-text">
                  <Target className="mr-1 inline h-3 w-3" />
                  {t.name}
                </span>
                <span className="text-[10px] text-brand-muted">
                  CA {t.ac ?? DEFAULT_AC}
                </span>
              </div>
              {mode === "MANUAL" && (
                <ManualTargetEntry
                  targetId={t.id}
                  entry={
                    manualEntries[t.id] ?? { d20: "", hit: false, damage: "" }
                  }
                  onChange={(next) =>
                    setManualEntries((prev) => ({ ...prev, [t.id]: next }))
                  }
                />
              )}
            </div>
          ))}
        </div>
      </Field>

      {error && (
        <div className="rounded-md border border-brand-danger/40 bg-brand-danger/10 px-3 py-2 text-xs text-brand-danger">
          {error}
        </div>
      )}

      {mode === "MANUAL" && (
        <p className="text-[10px] text-brand-muted">
          ⚠️ Resultados manuais ficam marcados no histórico.
        </p>
      )}
    </div>
  );
}

function ManualTargetEntry({
  entry,
  onChange,
}: {
  targetId: string;
  entry: { d20: string; hit: boolean; damage: string };
  onChange: (next: { d20: string; hit: boolean; damage: string }) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1">
      <input
        type="number"
        min={1}
        max={20}
        value={entry.d20}
        onChange={(e) => onChange({ ...entry, d20: e.target.value })}
        placeholder="d20"
        className="rounded border border-brand-border bg-brand-surface px-2 py-1 text-center text-xs text-brand-text outline-none focus:border-brand-accent"
      />
      <button
        onClick={() => onChange({ ...entry, hit: !entry.hit })}
        className={`rounded border px-2 py-1 text-[10px] font-medium transition-colors ${
          entry.hit
            ? "border-brand-success bg-brand-success/15 text-brand-success"
            : "border-brand-border text-brand-muted"
        }`}
      >
        {entry.hit ? "Acertou" : "Errou"}
      </button>
      <input
        type="number"
        min={0}
        value={entry.damage}
        disabled={!entry.hit}
        onChange={(e) => onChange({ ...entry, damage: e.target.value })}
        placeholder="dano"
        className="rounded border border-brand-border bg-brand-surface px-2 py-1 text-center text-xs text-brand-text outline-none focus:border-brand-accent disabled:opacity-40"
      />
    </div>
  );
}

function ResultPanel({
  result,
  targets,
}: {
  result: NonNullable<ReturnType<typeof useAttackStore.getState>["result"]>;
  targets: { id: string; name: string }[];
}) {
  // Cards estáticos com os mesmos valores rolados — só em modo DIGITAL
  // (manual não passa pelos dados visuais).
  const dice = useMemo(() => {
    if (result.mode === "MANUAL") return [];
    const cfg = buildDiceConfig(
      result.results,
      result.damageType,
      extractPrimaryDieSides(result.damageNotation),
    );
    if (cfg.skip) return [];
    return buildDice(cfg);
  }, [result]);

  return (
    <div className="space-y-3">
      {/* Cards travados nos valores finais (sem re-animar) */}
      {dice.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-md border border-brand-border bg-brand-surface-light/40 px-3 py-3">
          {dice.slice(0, 8).map((d) => (
            <DieCard key={d.id} die={d} instant size="sm" />
          ))}
          {dice.length > 8 && (
            <span className="text-[10px] text-brand-muted">
              +{dice.length - 8} dados
            </span>
          )}
        </div>
      )}

      <p className="text-[10px] uppercase tracking-wider text-brand-muted">
        {result.attackName} · {result.results.length} resultado
        {result.results.length > 1 ? "s" : ""}
      </p>
      {result.results.map((r) => {
        const target = targets.find((t) => t.id === r.targetTokenId);
        return (
          <ResultRow
            key={r.id}
            result={r}
            targetName={target?.name ?? r.targetTokenId}
          />
        );
      })}
      {result.mode === "MANUAL" && (
        <span className="inline-flex items-center gap-1 rounded-full border border-brand-warning/40 bg-brand-warning/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-warning">
          Manual
        </span>
      )}
    </div>
  );
}

function ResultRow({
  result: r,
  targetName,
}: {
  result: AttackTargetResult;
  targetName: string;
}) {
  const tone = r.isFumble
    ? "danger"
    : r.isCrit
      ? "gold"
      : r.hit
        ? "success"
        : "muted";
  const Icon = r.isFumble ? Skull : r.hit ? Check : X;
  const status = r.isFumble
    ? "FUMBLE"
    : r.isCrit
      ? "CRÍTICO"
      : r.hit
        ? "ACERTO"
        : "ERRO";

  const cls =
    tone === "gold"
      ? "border-brand-gold/40 bg-brand-gold/10 text-brand-gold"
      : tone === "success"
        ? "border-brand-success/40 bg-brand-success/10 text-brand-success"
        : tone === "danger"
          ? "border-brand-danger/40 bg-brand-danger/10 text-brand-danger"
          : "border-brand-border bg-brand-surface-light text-brand-muted";

  return (
    <div className={`rounded-md border px-3 py-2 ${cls}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-semibold text-brand-text">
          {targetName}
        </span>
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
          <Icon className="h-3 w-3" />
          {status}
        </span>
      </div>
      {r.d20Final > 0 && (
        <p className="mt-1 text-[11px] text-brand-muted">
          🎲 {r.totalAttack} ({r.d20Final}
          {r.d20Rolls.length > 1 && (
            <span className="ml-0.5 text-brand-muted/70">
              [{r.d20Rolls.join(",")}]
            </span>
          )}
          {r.totalAttack !== r.d20Final && (
            <span> + {r.totalAttack - r.d20Final}</span>
          )}
          ) vs CA {r.targetAc}
        </p>
      )}
      {r.hit && r.damageTotal !== null && (
        <p className="mt-0.5 text-[11px] font-semibold text-brand-text">
          🩸 {r.damageTotal} dano
          {r.damageRolls && r.damageRolls.length > 0 && (
            <span className="ml-1 text-[10px] font-normal text-brand-muted">
              ({r.damageRolls.join("+")}
              {r.damageBonus ? `+${r.damageBonus}` : ""})
            </span>
          )}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
