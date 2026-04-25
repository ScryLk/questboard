"use client";

// Linha do combat tracker. Botões fixos −1/−5/−10/♥/− removidos
// (fatia 3A) — todas as ações ficam no menu contextual (botão direito).
// Mantém apenas o botão `+` de adicionar condição como atalho frequente.

import { useCallback, useState } from "react";
import { Dices } from "lucide-react";
import type {
  CombatParticipant,
  CombatConditionId,
  CombatCondition,
} from "@questboard/types";
import { COMBAT_CONDITIONS } from "@questboard/constants";
import { getAlignmentColor } from "@/lib/gameplay-mock-data";
import { ConditionPopover } from "./condition-popover";
import {
  CombatRowContextMenu,
  type ContextMenuAction,
} from "./context-menu/combat-row-context-menu";
import { NumberInputPopover } from "./popovers/number-input-popover";
import { AddConditionPopover } from "./popovers/add-condition-popover";
import { EditConditionPopover } from "./popovers/edit-condition-popover";
import { ConfirmRemovePopover } from "./popovers/confirm-remove-popover";

type ActivePopover =
  | { kind: "applyDamage" }
  | { kind: "applyHeal" }
  | { kind: "setHp" }
  | { kind: "setTempHp" }
  | { kind: "setInitiative" }
  | { kind: "addCondition"; conditionId: CombatConditionId }
  | { kind: "editCondition"; condition: CombatCondition }
  | { kind: "confirmRemove" }
  | null;

interface Props {
  participant: CombatParticipant;
  isCurrentTurn: boolean;
  // Intents (todos chamam funções de useCombatActions no parent).
  onSetInitiative: (tokenId: string, value: number) => void;
  onRollInitiative: (tokenId: string) => void;
  onAddCondition: (
    tokenId: string,
    conditionId: CombatConditionId,
    opts?: { customLabel?: string; durationRounds?: number },
  ) => void;
  onRemoveCondition: (tokenId: string, conditionId: CombatConditionId) => void;
  onUpdateCondition: (
    tokenId: string,
    conditionId: CombatConditionId,
    durationRounds: number | null,
  ) => void;
  onRemove: (tokenId: string) => void;
  onApplyDamage: (tokenId: string, amount: number) => void;
  onApplyHeal: (tokenId: string, amount: number) => void;
  onSetHp: (tokenId: string, value: number) => void;
  onSetTempHp: (tokenId: string, value: number) => void;
  onSkipTurn: (tokenId: string) => void;
  onToggleActed: (tokenId: string, hasActed: boolean) => void;
  onMoveUp: (tokenId: string) => void;
  onMoveDown: (tokenId: string) => void;
  onDuplicate: (tokenId: string) => void;
}

export function CombatRow({
  participant: p,
  isCurrentTurn,
  onSetInitiative,
  onRollInitiative,
  onAddCondition,
  onRemoveCondition,
  onUpdateCondition,
  onRemove,
  onApplyDamage,
  onApplyHeal,
  onSetHp,
  onSetTempHp,
  onSkipTurn,
  onToggleActed,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}: Props) {
  const [editingInit, setEditingInit] = useState(false);
  const [initDraft, setInitDraft] = useState(String(p.initiative));
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [activePopover, setActivePopover] = useState<ActivePopover>(null);

  const borderColor = getAlignmentColor(p.alignment);
  const hpPct =
    p.hpMax > 0
      ? Math.max(0, Math.min(100, (p.hpCurrent / p.hpMax) * 100))
      : 0;
  const hpColor = hpPct > 60 ? "#00B894" : hpPct > 30 ? "#FDCB6E" : "#FF6B6B";

  const commitInitiative = () => {
    const n = parseInt(initDraft, 10);
    if (Number.isFinite(n) && n !== p.initiative) {
      onSetInitiative(p.tokenId, n);
    }
    setEditingInit(false);
  };

  const toggleCondition = (id: CombatConditionId) => {
    const has = p.conditions.some((c) => c.conditionId === id);
    if (has) onRemoveCondition(p.tokenId, id);
    else setActivePopover({ kind: "addCondition", conditionId: id });
  };

  // Roteador do menu contextual: cada item dispatcha intent ou abre popover.
  const handleAction = useCallback(
    (action: ContextMenuAction) => {
      switch (action.kind) {
        case "applyDamage":
        case "applyHeal":
        case "setHp":
        case "setTempHp":
        case "setInitiative":
          setActivePopover({ kind: action.kind });
          break;
        case "skipTurn":
          onSkipTurn(p.tokenId);
          break;
        case "toggleActed":
          onToggleActed(p.tokenId, !p.hasActed);
          break;
        case "moveUp":
          onMoveUp(p.tokenId);
          break;
        case "moveDown":
          onMoveDown(p.tokenId);
          break;
        case "rollInitiative":
          onRollInitiative(p.tokenId);
          break;
        case "addCondition":
          setActivePopover({
            kind: "addCondition",
            conditionId: action.conditionId,
          });
          break;
        case "editCondition": {
          const c = p.conditions.find(
            (x) => x.conditionId === action.conditionId,
          );
          if (c) setActivePopover({ kind: "editCondition", condition: c });
          break;
        }
        case "removeCondition":
          onRemoveCondition(p.tokenId, action.conditionId);
          break;
        case "duplicate":
          onDuplicate(p.tokenId);
          break;
        case "focusCamera":
          // TODO(focus-camera): wired quando houver fn de pan/zoom-to-token.
          break;
        case "remove":
          setActivePopover({ kind: "confirmRemove" });
          break;
      }
      setMenuPos(null);
    },
    [
      p.tokenId,
      p.hasActed,
      p.conditions,
      onSkipTurn,
      onToggleActed,
      onMoveUp,
      onMoveDown,
      onRollInitiative,
      onRemoveCondition,
      onDuplicate,
    ],
  );

  return (
    <>
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuPos({ x: e.clientX, y: e.clientY });
        }}
        className={`group relative flex cursor-pointer flex-col gap-1 rounded-md px-2 py-1.5 transition-colors ${
          isCurrentTurn ? "bg-brand-accent/[0.08]" : "hover:bg-white/[0.03]"
        } ${p.isDead ? "opacity-40" : ""}`}
        style={{
          borderLeft: isCurrentTurn
            ? `3px solid ${borderColor}`
            : "3px solid transparent",
          boxShadow: isCurrentTurn ? `0 0 12px ${borderColor}20` : undefined,
        }}
      >
        {/* Linha principal: avatar, nome, init */}
        <div className="flex items-center gap-1.5">
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
            style={{ backgroundColor: borderColor + "30", color: borderColor }}
          >
            {p.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p
                className={`truncate text-[11px] font-medium ${
                  p.isDead ? "line-through text-brand-text" : "text-brand-text"
                } ${p.hasActed ? "opacity-60" : ""}`}
              >
                {p.name}
              </p>
              {p.hasActed && (
                <span
                  className="text-[9px] text-brand-success"
                  title="Já agiu este turno"
                  aria-label="Já agiu"
                >
                  ✓
                </span>
              )}
            </div>
            {p.armorClass !== null && (
              <span className="text-[9px] text-brand-muted">
                CA {p.armorClass}
              </span>
            )}
          </div>

          {editingInit ? (
            <input
              type="number"
              value={initDraft}
              autoFocus
              onChange={(e) => setInitDraft(e.target.value)}
              onBlur={commitInitiative}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitInitiative();
                if (e.key === "Escape") {
                  setInitDraft(String(p.initiative));
                  setEditingInit(false);
                }
              }}
              className="w-10 rounded bg-brand-surface-light px-1 py-0.5 text-right text-[10px] tabular-nums text-brand-text outline-none ring-1 ring-brand-accent"
            />
          ) : (
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => onRollInitiative(p.tokenId)}
                className="flex h-5 w-5 items-center justify-center rounded text-brand-muted transition-colors hover:bg-brand-accent/10 hover:text-brand-accent"
                title={`Rolar iniciativa (1d20${p.initiativeModifier >= 0 ? "+" : ""}${p.initiativeModifier})`}
                aria-label="Rolar iniciativa"
              >
                <Dices className="h-3 w-3" />
              </button>
              <button
                onClick={() => {
                  setInitDraft(String(p.initiative));
                  setEditingInit(true);
                }}
                className="rounded px-1 py-0.5 text-[11px] font-bold tabular-nums text-brand-text transition-colors hover:bg-white/5"
                title="Editar iniciativa manualmente"
              >
                {p.initiative}
              </button>
            </div>
          )}
        </div>

        {/* HP bar + número */}
        <div className="flex items-center gap-1.5">
          <div
            className="flex-1 overflow-hidden rounded-full bg-white/10"
            style={{ height: 3 }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${hpPct}%`, backgroundColor: hpColor }}
            />
          </div>
          <span className="text-[9px] tabular-nums text-brand-muted">
            {p.hpCurrent}/{p.hpMax}
            {p.hpTemp > 0 && (
              <span className="ml-0.5 text-brand-info">+{p.hpTemp}</span>
            )}
          </span>
        </div>

        {/* Condições ativas + botão `+` (atalho mantido na linha) */}
        <div className="flex items-center gap-1">
          {p.conditions.slice(0, 6).map((c) => {
            const meta = COMBAT_CONDITIONS[c.conditionId];
            if (!meta) return null;
            const display = c.customLabel ?? meta.label;
            return (
              <button
                key={c.conditionId}
                onClick={() => onRemoveCondition(p.tokenId, c.conditionId)}
                className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold transition-transform hover:scale-110"
                style={{
                  backgroundColor: meta.color + "30",
                  color: meta.color,
                }}
                title={`${display} (${c.durationRounds === null ? "∞" : `${c.durationRounds}r`}) — clique para remover`}
                aria-label={display}
              >
                {meta.label[0]}
              </button>
            );
          })}
          {p.conditions.length > 6 && (
            <span className="text-[9px] text-brand-muted">
              +{p.conditions.length - 6}
            </span>
          )}
          <ConditionPopover active={p.conditions} onToggle={toggleCondition} />
          <span className="ml-auto text-[9px] text-brand-muted/60">
            Clique direito → ações
          </span>
        </div>
      </div>

      {menuPos && (
        <CombatRowContextMenu
          participant={p}
          x={menuPos.x}
          y={menuPos.y}
          onClose={() => setMenuPos(null)}
          onAction={handleAction}
        />
      )}

      {activePopover?.kind === "applyDamage" && (
        <NumberInputPopover
          title="Aplicar dano"
          subtitle={`${p.name} — HP ${p.hpCurrent}/${p.hpMax}`}
          suffix="HP"
          applyLabel="Aplicar"
          quickPresets={[-1, -5, -10, -20]}
          onApply={(v) => onApplyDamage(p.tokenId, v)}
          onClose={() => setActivePopover(null)}
        />
      )}
      {activePopover?.kind === "applyHeal" && (
        <NumberInputPopover
          title="Aplicar cura"
          subtitle={`${p.name} — HP ${p.hpCurrent}/${p.hpMax}`}
          suffix="HP"
          applyLabel="Aplicar"
          quickPresets={[1, 5, 10, 20]}
          onApply={(v) => onApplyHeal(p.tokenId, v)}
          onClose={() => setActivePopover(null)}
        />
      )}
      {activePopover?.kind === "setHp" && (
        <NumberInputPopover
          title="Ajustar HP"
          subtitle={`${p.name} — máx ${p.hpMax}`}
          suffix="HP"
          applyLabel="Aplicar"
          initialValue={p.hpCurrent}
          onApply={(v) => onSetHp(p.tokenId, v)}
          onClose={() => setActivePopover(null)}
        />
      )}
      {activePopover?.kind === "setTempHp" && (
        <NumberInputPopover
          title="HP temporário"
          subtitle={`${p.name} — atual ${p.hpTemp}`}
          suffix="HP"
          applyLabel="Aplicar"
          initialValue={p.hpTemp}
          onApply={(v) => onSetTempHp(p.tokenId, v)}
          onClose={() => setActivePopover(null)}
        />
      )}
      {activePopover?.kind === "setInitiative" && (
        <NumberInputPopover
          title="Editar iniciativa"
          subtitle={p.name}
          applyLabel="Salvar"
          initialValue={p.initiative}
          allowNegative
          onApply={(v) => onSetInitiative(p.tokenId, v)}
          onClose={() => setActivePopover(null)}
        />
      )}
      {activePopover?.kind === "addCondition" && (
        <AddConditionPopover
          conditionId={activePopover.conditionId}
          onApply={(input) =>
            onAddCondition(p.tokenId, activePopover.conditionId, {
              customLabel: input.customLabel,
              durationRounds: input.durationRounds ?? undefined,
            })
          }
          onClose={() => setActivePopover(null)}
        />
      )}
      {activePopover?.kind === "editCondition" && (
        <EditConditionPopover
          conditionId={activePopover.condition.conditionId}
          customLabel={activePopover.condition.customLabel}
          currentDurationRounds={activePopover.condition.durationRounds}
          onApply={(rounds) =>
            onUpdateCondition(
              p.tokenId,
              activePopover.condition.conditionId,
              rounds,
            )
          }
          onClose={() => setActivePopover(null)}
        />
      )}
      {activePopover?.kind === "confirmRemove" && (
        <ConfirmRemovePopover
          participantName={p.name}
          onConfirm={() => onRemove(p.tokenId)}
          onClose={() => setActivePopover(null)}
        />
      )}
    </>
  );
}
