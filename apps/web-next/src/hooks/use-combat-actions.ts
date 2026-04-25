"use client";

// Emissores de intent do combat tracker.
//
// Em modo mock as ações aplicam localmente na combat store. Em modo
// real, emitem via socket e aguardam broadcast do servidor.
//
// Mock é ativado por `NEXT_PUBLIC_COMBAT_MOCK=true` OU automaticamente
// quando não há socket conectado (dev sem backend de combat). Quando o
// backend existir e o socket subir, este último cai e os intents viram
// emit reais.
//
// TODO(backend-combat): socket listeners que chamam os _* da store ficam
// registrados em um hook separado (use-combat-socket-sync) — backend
// da próxima fatia vai emitir `combat:*` e os _* reagem.

import { useCallback } from "react";
import { getSocket } from "@questboard/socket";
import type {
  CombatConditionId,
  CombatParticipant,
  CombatState,
  CombatAlignment,
} from "@questboard/types";
import { useCombatStore } from "@/lib/combat-store";
import { useGameplayStore } from "@/lib/gameplay-store";

export function isCombatMockMode(): boolean {
  if (process.env.NEXT_PUBLIC_COMBAT_MOCK === "true") return true;
  const socket = getSocket();
  return !socket || !socket.connected;
}

/** Constrói um CombatState a partir dos tokens da gameplay store. Usado
 *  pelo `start()` em mock mode — vira o "backend" provisório. */
function buildLocalCombat(
  participantTokenIds: string[],
  sessionId: string,
): CombatState {
  const tokens = useGameplayStore.getState().tokens;
  const ids = new Set(participantTokenIds);
  const participants: CombatParticipant[] = tokens
    .filter((t) => ids.has(t.id))
    .map((t) => ({
      tokenId: t.id,
      name: t.name,
      avatarUrl: null,
      initiative: t.initiative ?? 0,
      initiativeModifier: 0,
      hpCurrent: t.hp,
      hpMax: t.maxHp,
      hpTemp: 0,
      armorClass: t.ac,
      alignment: t.alignment as CombatAlignment,
      conditions: t.conditions.map((cid) => ({
        conditionId: cid as CombatConditionId,
        appliedAt: Date.now(),
        durationRounds: null,
        appliedByUserId: "mock-user-id",
      })),
      isDead: t.hp <= 0,
      hasActed: false,
    }))
    .sort((a, b) => b.initiative - a.initiative);

  return {
    sessionId,
    isActive: true,
    round: 1,
    currentIndex: 0,
    participants,
    config: { showEnemyHp: false, turnTimerSec: 0 },
    startedAt: Date.now(),
    turnStartedAt: Date.now(),
  };
}

/** Gera uma condition mock com timestamps corretos. */
function buildMockCondition(
  conditionId: CombatConditionId,
  customLabel?: string,
  durationRounds?: number,
) {
  return {
    conditionId,
    customLabel,
    appliedAt: Date.now(),
    durationRounds: durationRounds ?? null,
    // TODO(backend-combat): usar userId real do auth store.
    appliedByUserId: "mock-user-id",
  };
}

export function useCombatActions(sessionId: string) {
  const store = useCombatStore;
  const mock = isCombatMockMode();

  const start = useCallback(
    (participantTokenIds: string[]) => {
      if (mock) {
        store
          .getState()
          ._setCombat(buildLocalCombat(participantTokenIds, sessionId));
        return;
      }
      getSocket()?.emit("combat:start", { sessionId, participantTokenIds });
    },
    [sessionId, mock, store],
  );

  const end = useCallback(() => {
    if (mock) {
      store.getState().reset();
      return;
    }
    getSocket()?.emit("combat:end", { sessionId });
  }, [sessionId, mock, store]);

  const nextTurn = useCallback(() => {
    if (mock) {
      const combat = store.getState().combat;
      if (!combat) return;
      const n = combat.participants.length;
      if (n === 0) return;
      const nextIndex = (combat.currentIndex + 1) % n;
      const nextRound = nextIndex === 0 ? combat.round + 1 : combat.round;
      store.getState()._applyTurnChange(nextRound, nextIndex, Date.now());
      return;
    }
    getSocket()?.emit("combat:next-turn", { sessionId });
  }, [sessionId, mock, store]);

  const previousTurn = useCallback(() => {
    if (mock) {
      const combat = store.getState().combat;
      if (!combat) return;
      const n = combat.participants.length;
      if (n === 0) return;
      const prevIndex = (combat.currentIndex - 1 + n) % n;
      const prevRound =
        combat.currentIndex === 0 ? Math.max(1, combat.round - 1) : combat.round;
      store.getState()._applyTurnChange(prevRound, prevIndex, Date.now());
      return;
    }
    getSocket()?.emit("combat:previous-turn", { sessionId });
  }, [sessionId, mock, store]);

  const rollAllInitiative = useCallback(() => {
    if (mock) {
      const combat = store.getState().combat;
      if (!combat) return;
      // Math.random() é aceitável apenas em modo mock dev-only.
      const rolled = combat.participants
        .map((p) => ({
          ...p,
          initiative:
            Math.floor(Math.random() * 20) + 1 + (p.initiativeModifier ?? 0),
        }))
        .sort((a, b) => b.initiative - a.initiative);
      store
        .getState()
        ._setCombat({ ...combat, participants: rolled, currentIndex: 0 });
      return;
    }
    getSocket()?.emit("combat:roll-all-initiative", { sessionId });
  }, [sessionId, mock, store]);

  const setInitiative = useCallback(
    (tokenId: string, value: number) => {
      if (mock) {
        store.getState()._applyInitiativeChange(tokenId, value);
        return;
      }
      getSocket()?.emit("combat:set-initiative", { sessionId, tokenId, value });
    },
    [sessionId, mock, store],
  );

  const rollInitiative = useCallback(
    (tokenId: string) => {
      if (mock) {
        const combat = store.getState().combat;
        if (!combat) return;
        const p = combat.participants.find((x) => x.tokenId === tokenId);
        if (!p) return;
        // Math.random() é aceitável apenas em modo mock dev-only.
        const value = Math.floor(Math.random() * 20) + 1 + p.initiativeModifier;
        store.getState()._applyInitiativeChange(tokenId, value);
        // Re-ordena por initiative DESC pra refletir a nova posição.
        const reordered = [...combat.participants]
          .map((x) => (x.tokenId === tokenId ? { ...x, initiative: value } : x))
          .sort((a, b) => b.initiative - a.initiative);
        store
          .getState()
          ._applyReorder(reordered.map((x) => x.tokenId));
        return;
      }
      getSocket()?.emit("combat:roll-initiative", { sessionId, tokenId });
    },
    [sessionId, mock, store],
  );

  const reorderInitiative = useCallback(
    (tokenIds: string[]) => {
      if (mock) {
        store.getState()._applyReorder(tokenIds);
        return;
      }
      getSocket()?.emit("combat:reorder-initiative", { sessionId, tokenIds });
    },
    [sessionId, mock, store],
  );

  const addParticipant = useCallback(
    (tokenId: string, opts?: { initiative?: number }) => {
      if (mock) {
        // Em mock, monta o participant a partir do token na gameplay store.
        // Em real mode, o servidor faz isso e emite participant-added.
        const t = useGameplayStore
          .getState()
          .tokens.find((tk) => tk.id === tokenId);
        if (!t) return;
        const participant: CombatParticipant = {
          tokenId: t.id,
          name: t.name,
          avatarUrl: null,
          initiative: opts?.initiative ?? t.initiative ?? 0,
          initiativeModifier: 0,
          hpCurrent: t.hp,
          hpMax: t.maxHp,
          hpTemp: 0,
          armorClass: t.ac,
          alignment: t.alignment as CombatAlignment,
          conditions: t.conditions.map((cid) => ({
            conditionId: cid as CombatConditionId,
            appliedAt: Date.now(),
            durationRounds: null,
            appliedByUserId: "mock-user-id",
          })),
          isDead: t.hp <= 0,
          hasActed: false,
        };
        store.getState()._addParticipant(participant);
        return;
      }
      getSocket()?.emit("combat:add-participant", {
        sessionId,
        tokenId,
        initiative: opts?.initiative,
      });
    },
    [sessionId, mock, store],
  );

  const removeParticipant = useCallback(
    (tokenId: string) => {
      if (mock) {
        store.getState()._removeParticipant(tokenId);
        return;
      }
      getSocket()?.emit("combat:remove-participant", { sessionId, tokenId });
    },
    [sessionId, mock, store],
  );

  const addCondition = useCallback(
    (
      tokenId: string,
      conditionId: CombatConditionId,
      opts?: { customLabel?: string; durationRounds?: number },
    ) => {
      if (mock) {
        store
          .getState()
          ._addCondition(
            tokenId,
            buildMockCondition(conditionId, opts?.customLabel, opts?.durationRounds),
          );
        return;
      }
      getSocket()?.emit("combat:add-condition", {
        sessionId,
        tokenId,
        conditionId,
        customLabel: opts?.customLabel,
        durationRounds: opts?.durationRounds,
      });
    },
    [sessionId, mock, store],
  );

  const removeCondition = useCallback(
    (tokenId: string, conditionId: CombatConditionId) => {
      if (mock) {
        store.getState()._removeCondition(tokenId, conditionId);
        return;
      }
      getSocket()?.emit("combat:remove-condition", {
        sessionId,
        tokenId,
        conditionId,
      });
    },
    [sessionId, mock, store],
  );

  const updateConfig = useCallback(
    (patch: { showEnemyHp?: boolean; turnTimerSec?: 0 | 60 | 90 }) => {
      if (mock) {
        const combat = store.getState().combat;
        if (!combat) return;
        store
          .getState()
          ._applyConfigChange({ ...combat.config, ...patch });
        return;
      }
      getSocket()?.emit("combat:update-config", { sessionId, ...patch });
    },
    [sessionId, mock, store],
  );

  const passTurn = useCallback(() => {
    if (mock) {
      // Player "passa" = mesmo efeito de next-turn em mock.
      const combat = store.getState().combat;
      if (!combat) return;
      const n = combat.participants.length;
      if (n === 0) return;
      const nextIndex = (combat.currentIndex + 1) % n;
      const nextRound = nextIndex === 0 ? combat.round + 1 : combat.round;
      store.getState()._applyTurnChange(nextRound, nextIndex, Date.now());
      return;
    }
    getSocket()?.emit("combat:pass-turn", { sessionId });
  }, [sessionId, mock, store]);

  // ── Fatia 3A ──

  const skipTurn = useCallback(
    (tokenId: string) => {
      if (mock) {
        // Mock: marca como hasActed e avança o turno.
        store.getState()._markActed(tokenId, true);
        const combat = store.getState().combat;
        if (!combat) return;
        const n = combat.participants.length;
        if (n === 0) return;
        const nextIndex = (combat.currentIndex + 1) % n;
        const nextRound = nextIndex === 0 ? combat.round + 1 : combat.round;
        store.getState()._applyTurnChange(nextRound, nextIndex, Date.now());
        return;
      }
      getSocket()?.emit("combat:skip-turn", { sessionId, tokenId });
    },
    [sessionId, mock, store],
  );

  const markActed = useCallback(
    (tokenId: string, hasActed: boolean) => {
      if (mock) {
        store.getState()._markActed(tokenId, hasActed);
        return;
      }
      getSocket()?.emit("combat:mark-acted", {
        sessionId,
        tokenId,
        hasActed,
      });
    },
    [sessionId, mock, store],
  );

  const updateCondition = useCallback(
    (
      tokenId: string,
      conditionId: CombatConditionId,
      durationRounds: number | null,
    ) => {
      if (mock) {
        store.getState()._updateCondition(tokenId, conditionId, durationRounds);
        return;
      }
      getSocket()?.emit("combat:condition-updated", {
        sessionId,
        tokenId,
        conditionId,
        durationRounds,
      });
    },
    [sessionId, mock, store],
  );

  const duplicateParticipant = useCallback(
    (sourceTokenId: string, autoName: string) => {
      if (mock) {
        const combat = store.getState().combat;
        if (!combat) return;
        const source = combat.participants.find(
          (p) => p.tokenId === sourceTokenId,
        );
        if (!source) return;
        const clone: CombatParticipant = {
          ...source,
          tokenId: `vt_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`,
          name: autoName,
          // Iniciativa re-rolada (servidor faria o mesmo via crypto).
          initiative:
            Math.floor(Math.random() * 20) + 1 + source.initiativeModifier,
          // Clone começa cheio, sem condições, sem hasActed.
          hpCurrent: source.hpMax,
          hpTemp: 0,
          conditions: [],
          isDead: false,
          hasActed: false,
        };
        store.getState()._addParticipant(clone);
        // TODO(action-feed): registrar action "X duplicado → autoName"
        // com revert que remove o virtualToken via _removeParticipant.
        return;
      }
      getSocket()?.emit("combat:duplicate-participant", {
        sessionId,
        sourceTokenId,
        autoName,
      });
    },
    [sessionId, mock, store],
  );

  // HP variants — wrappers do `combat:hp-change` que computam o estado
  // final localmente em mock e clampam em [0, hpMax].
  const applyDamage = useCallback(
    (tokenId: string, amount: number) => {
      const positive = Math.abs(amount);
      if (mock) {
        const combat = store.getState().combat;
        if (!combat) return;
        const p = combat.participants.find((x) => x.tokenId === tokenId);
        if (!p) return;
        const next = Math.max(0, p.hpCurrent - positive);
        store.getState()._applyHpChange(tokenId, next);
        return;
      }
      getSocket()?.emit("combat:hp-change", {
        sessionId,
        tokenId,
        delta: -positive,
      });
    },
    [sessionId, mock, store],
  );

  const applyHeal = useCallback(
    (tokenId: string, amount: number) => {
      const positive = Math.abs(amount);
      if (mock) {
        const combat = store.getState().combat;
        if (!combat) return;
        const p = combat.participants.find((x) => x.tokenId === tokenId);
        if (!p) return;
        const next = Math.min(p.hpMax, p.hpCurrent + positive);
        store.getState()._applyHpChange(tokenId, next);
        return;
      }
      getSocket()?.emit("combat:hp-change", {
        sessionId,
        tokenId,
        delta: positive,
      });
    },
    [sessionId, mock, store],
  );

  const setHp = useCallback(
    (tokenId: string, value: number) => {
      if (mock) {
        const combat = store.getState().combat;
        if (!combat) return;
        const p = combat.participants.find((x) => x.tokenId === tokenId);
        if (!p) return;
        const next = Math.max(0, Math.min(p.hpMax, value));
        store.getState()._applyHpChange(tokenId, next);
        return;
      }
      getSocket()?.emit("combat:hp-change", {
        sessionId,
        tokenId,
        absolute: Math.max(0, value),
      });
    },
    [sessionId, mock, store],
  );

  const setTempHp = useCallback(
    (tokenId: string, value: number) => {
      const clamped = Math.max(0, value);
      if (mock) {
        const combat = store.getState().combat;
        if (!combat) return;
        const p = combat.participants.find((x) => x.tokenId === tokenId);
        if (!p) return;
        // Substitui (não soma) — comportamento padrão D&D 5e.
        store.getState()._applyHpChange(tokenId, p.hpCurrent, clamped);
        return;
      }
      getSocket()?.emit("combat:hp-change", {
        sessionId,
        tokenId,
        hpTemp: clamped,
      });
    },
    [sessionId, mock, store],
  );

  // Move o participante uma posição na ordem (initiative). Em mock,
  // recalcula a ordem trocando vizinhos. Real mode emite reorder com a
  // nova ordem completa (servidor é a fonte de verdade).
  const moveParticipant = useCallback(
    (tokenId: string, direction: "up" | "down") => {
      const combat = store.getState().combat;
      if (!combat) return;
      const idx = combat.participants.findIndex((p) => p.tokenId === tokenId);
      if (idx < 0) return;
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= combat.participants.length) return;
      const ids = combat.participants.map((p) => p.tokenId);
      const tmp = ids[idx]!;
      ids[idx] = ids[target]!;
      ids[target] = tmp;
      if (mock) {
        store.getState()._applyReorder(ids);
        return;
      }
      getSocket()?.emit("combat:reorder-initiative", {
        sessionId,
        tokenIds: ids,
      });
    },
    [sessionId, mock, store],
  );

  return {
    start,
    end,
    nextTurn,
    previousTurn,
    rollAllInitiative,
    rollInitiative,
    setInitiative,
    reorderInitiative,
    addParticipant,
    removeParticipant,
    addCondition,
    removeCondition,
    updateConfig,
    passTurn,
    // Fatia 3A
    skipTurn,
    markActed,
    updateCondition,
    duplicateParticipant,
    applyDamage,
    applyHeal,
    setHp,
    setTempHp,
    moveParticipant,
  };
}
