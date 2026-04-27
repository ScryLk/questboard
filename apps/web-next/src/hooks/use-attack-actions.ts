"use client";

// Executor do ataque. Em mock-mode (sem backend de attack), roda os
// helpers do game-engine localmente (crypto-backed). Quando o backend
// existir, vira `socket.emit('attack:execute', input)` e os resultados
// chegam via `attack:rolled`.
//
// Aplica HP via combat-store (se token é participante do combat
// canônico) e via gameplay-store (sempre — token no mapa).

import { useCallback } from "react";
import {
  rollAttackD20,
  rollAttackDamage,
  extractPrimaryDieSides,
} from "@questboard/game-engine";
import { DEFAULT_AC } from "@questboard/constants";
import type {
  AttackWithResults,
  AttackTargetResult,
} from "@questboard/types";
import type { AttackInput } from "@questboard/validators";
import { useAttackStore } from "@/lib/attack-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useCombatStore } from "@/lib/combat-store";

type AttackExecuteInput = Omit<AttackInput, "sessionId"> & {
  sessionId?: string;
};

function makeId(prefix = "atk"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function useAttackActions() {
  const setResult = useAttackStore((s) => s.setResult);
  const markApplied = useAttackStore((s) => s.markApplied);
  const updateTokenHp = useGameplayStore((s) => s.updateTokenHp);
  const tokens = useGameplayStore.getState; // late access via getState in callbacks
  const applyCombatHp = useCombatStore((s) => s._applyHpChange);

  /** Roda o ataque LOCALMENTE usando o engine (mock mode).
   *  Quando o backend existir: socket.emit + esperar broadcast. */
  const executeAttack = useCallback(
    (input: AttackExecuteInput): AttackWithResults => {
      const sessionId = input.sessionId ?? "mock-session";
      const attackId = makeId();
      const damageSides = extractPrimaryDieSides(input.damageNotation);

      const results: AttackTargetResult[] = input.targetTokenIds.map(
        (targetTokenId, idx): AttackTargetResult => {
          const targetToken = tokens()
            .tokens.find((t) => t.id === targetTokenId);
          const targetAc = targetToken?.ac ?? DEFAULT_AC;

          if (input.mode === "MANUAL") {
            const manual = input.manualResults?.[idx];
            // Validador garante presença em manual mode; defesa runtime mesmo assim.
            if (!manual) {
              return makeMissResult(attackId, targetTokenId, targetAc);
            }
            return {
              id: makeId("res"),
              attackId,
              targetTokenId,
              targetAc,
              d20Rolls: manual.d20Final !== undefined ? [manual.d20Final] : [],
              d20Final: manual.d20Final ?? 0,
              totalAttack: (manual.d20Final ?? 0) + input.attackBonus,
              isCrit: manual.d20Final === 20,
              isFumble: manual.d20Final === 1,
              hit: manual.hit,
              damageRolls: manual.hit && manual.damageTotal ? [manual.damageTotal] : null,
              damageBonus: 0,
              damageTotal: manual.hit ? manual.damageTotal ?? 0 : null,
              appliedAt: null,
              appliedDamage: null,
            };
          }

          // DIGITAL: rola via engine
          const d20 = rollAttackD20(input.advantage);
          const totalAttack = d20.final + input.attackBonus;
          const isFumble = d20.final === 1;
          const isCrit = !isFumble && d20.final >= input.critRangeMin;
          const hit = !isFumble && (isCrit || totalAttack >= targetAc);

          if (!hit) {
            return {
              id: makeId("res"),
              attackId,
              targetTokenId,
              targetAc,
              d20Rolls: d20.rolls,
              d20Final: d20.final,
              totalAttack,
              isCrit: false,
              isFumble,
              hit: false,
              damageRolls: null,
              damageBonus: null,
              damageTotal: null,
              appliedAt: null,
              appliedDamage: null,
            };
          }

          const dmg = rollAttackDamage(input.damageNotation, isCrit);
          return {
            id: makeId("res"),
            attackId,
            targetTokenId,
            targetAc,
            d20Rolls: d20.rolls,
            d20Final: d20.final,
            totalAttack,
            isCrit,
            isFumble: false,
            hit: true,
            damageRolls: dmg.rolls,
            damageBonus: dmg.flatBonus,
            damageTotal: dmg.total,
            appliedAt: null,
            appliedDamage: null,
          };
        },
      );

      const attack: AttackWithResults = {
        id: attackId,
        sessionId,
        attackerTokenId: input.attackerTokenId,
        attackerUserId: useGameplayStore.getState().currentUserId ?? "mock",
        attackName: input.attackName,
        attackBonus: input.attackBonus,
        damageNotation: input.damageNotation,
        damageType: input.damageType,
        advantage: input.advantage,
        critRangeMin: input.critRangeMin,
        mode: input.mode,
        createdAt: new Date(),
        results,
      };

      // TODO(backend-attack): emitir socket "attack:execute" com input;
      // servidor rola e devolve attack:rolled com diceConfig.
      void damageSides; // disponível pra DiceCanvas via extractPrimaryDieSides

      setResult(attack);
      return attack;
    },
    [setResult, tokens],
  );

  /** Aplica o dano nos alvos. Atualiza tanto gameplay-store (token.hp)
   *  quanto combat-store (participant hpCurrent), se o token for
   *  participante do combat canônico. */
  const applyResults = useCallback(
    (attack: AttackWithResults) => {
      const allTokens = useGameplayStore.getState().tokens;
      const combat = useCombatStore.getState().combat;
      const combatTokenIds = new Set(
        combat?.participants.map((p) => p.tokenId) ?? [],
      );

      for (const r of attack.results) {
        if (!r.hit || !r.damageTotal) continue;

        const token = allTokens.find((t) => t.id === r.targetTokenId);
        if (!token) continue;

        const nextHp = Math.max(0, token.hp - r.damageTotal);
        updateTokenHp(token.id, nextHp);

        if (combatTokenIds.has(token.id)) {
          const participant = combat!.participants.find(
            (p) => p.tokenId === token.id,
          );
          if (participant) {
            const nextParticipantHp = Math.max(
              0,
              participant.hpCurrent - r.damageTotal,
            );
            applyCombatHp(token.id, nextParticipantHp);
          }
        }
      }

      markApplied();
    },
    [updateTokenHp, applyCombatHp, markApplied],
  );

  return { executeAttack, applyResults };
}

function makeMissResult(
  attackId: string,
  targetTokenId: string,
  targetAc: number,
): AttackTargetResult {
  return {
    id: makeId("res"),
    attackId,
    targetTokenId,
    targetAc,
    d20Rolls: [],
    d20Final: 0,
    totalAttack: 0,
    isCrit: false,
    isFumble: false,
    hit: false,
    damageRolls: null,
    damageBonus: null,
    damageTotal: null,
    appliedAt: null,
    appliedDamage: null,
  };
}

// Tipos expostos pra callsites
export type { AttackExecuteInput };
