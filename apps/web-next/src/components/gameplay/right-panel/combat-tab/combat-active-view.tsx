"use client";

import { useMemo, useCallback } from "react";
import type { CombatState, CombatConditionId } from "@questboard/types";
import { useCombatActions } from "@/hooks/use-combat-actions";
import { useCombatShortcuts } from "@/hooks/use-combat-shortcuts";
import { useDuplicateParticipant } from "@/hooks/use-duplicate-participant";
import { CombatHeader } from "./combat-header";
import { CombatRow } from "./combat-row";

interface Props {
  combat: CombatState;
  mock: boolean;
}

export function CombatActiveView({ combat, mock }: Props) {
  const actions = useCombatActions(combat.sessionId);
  const duplicate = useDuplicateParticipant();

  const handleAddCondition = useCallback(
    (
      tokenId: string,
      conditionId: CombatConditionId,
      opts?: { customLabel?: string; durationRounds?: number },
    ) => {
      actions.addCondition(tokenId, conditionId, opts);
    },
    [actions],
  );

  const handleRemoveCondition = useCallback(
    (tokenId: string, conditionId: CombatConditionId) => {
      actions.removeCondition(tokenId, conditionId);
    },
    [actions],
  );

  const handlers = useMemo(
    () => ({
      onNextTurn: actions.nextTurn,
      onPreviousTurn: actions.previousTurn,
      onRollAllInitiative: actions.rollAllInitiative,
      onEndCombat: actions.end,
    }),
    [actions],
  );

  useCombatShortcuts(combat.isActive, handlers);

  return (
    <div className="flex h-full flex-col">
      <CombatHeader
        round={combat.round}
        config={combat.config}
        turnStartedAt={combat.turnStartedAt}
        mock={mock}
        onRollAll={actions.rollAllInitiative}
        onEnd={actions.end}
        onToggleShowEnemyHp={() =>
          actions.updateConfig({ showEnemyHp: !combat.config.showEnemyHp })
        }
        onCycleTurnTimer={() => {
          const cycle: Array<0 | 60 | 90> = [0, 60, 90];
          const idx = cycle.indexOf(combat.config.turnTimerSec);
          const next = cycle[(idx + 1) % cycle.length]!;
          actions.updateConfig({ turnTimerSec: next });
        }}
      />

      <div className="flex-1 overflow-y-auto px-1 py-1.5">
        {combat.participants.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-brand-muted">
            Nenhum participante. Use <kbd>I</kbd> para rolar iniciativa ou
            adicione tokens manualmente.
          </div>
        ) : (
          combat.participants.map((p, idx) => (
            <CombatRow
              key={p.tokenId}
              participant={p}
              isCurrentTurn={idx === combat.currentIndex}
              onSetInitiative={actions.setInitiative}
              onRollInitiative={actions.rollInitiative}
              onAddCondition={handleAddCondition}
              onRemoveCondition={handleRemoveCondition}
              onUpdateCondition={actions.updateCondition}
              onRemove={actions.removeParticipant}
              onApplyDamage={actions.applyDamage}
              onApplyHeal={actions.applyHeal}
              onSetHp={actions.setHp}
              onSetTempHp={actions.setTempHp}
              onSkipTurn={actions.skipTurn}
              onToggleActed={actions.markActed}
              onMoveUp={(id) => actions.moveParticipant(id, "up")}
              onMoveDown={(id) => actions.moveParticipant(id, "down")}
              onDuplicate={duplicate}
            />
          ))
        )}
      </div>

      <div className="flex shrink-0 gap-1 border-t border-brand-border p-2">
        <button
          onClick={actions.previousTurn}
          className="flex-1 rounded-md border border-brand-border px-2 py-1.5 text-[11px] font-medium text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
          title="Turno anterior (Shift+Espaço)"
        >
          ← Anterior
        </button>
        <button
          onClick={actions.nextTurn}
          className="flex-1 rounded-md bg-brand-accent px-2 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-brand-accent-hover"
          title="Próximo turno (Espaço)"
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}
