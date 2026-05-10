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
  computeFinalDamage,
} from "@questboard/game-engine";
import { DEFAULT_AC } from "@questboard/constants";
import type {
  AttackDamageType,
  AttackWithResults,
  AttackTargetResult,
  DamageMultipliers,
} from "@questboard/types";
import type { AttackInput } from "@questboard/validators";
import { useAttackStore } from "@/lib/attack-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useCombatStore } from "@/lib/combat-store";
import { useCharacterStore } from "@/stores/characterStore";
import type { ChatMessage } from "@/lib/gameplay-mock-data";

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
              damageModifier: null,
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
              damageModifier: null,
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
            damageModifier: null,
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

      // Posta card resumo no chat (canal "geral"). Mesmo se ataque
      // ainda não foi aplicado — o dado já rolou e isso é log.
      const allTokens = tokens().tokens;
      const attackerToken = allTokens.find(
        (t) => t.id === input.attackerTokenId,
      );
      const targetNames = input.targetTokenIds.map(
        (id) => allTokens.find((t) => t.id === id)?.name ?? "Alvo",
      );
      const chatMessage: ChatMessage = {
        id: `msg_${attackId}`,
        channel: "geral",
        type: "attack",
        sender: attackerToken?.name ?? "Atacante",
        senderInitials: (attackerToken?.name ?? "?").slice(0, 2).toUpperCase(),
        isGM: true,
        content: "",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        attack: {
          attackName: input.attackName,
          attackerName: attackerToken?.name ?? "Atacante",
          targetNames,
          damageType: input.damageType,
          results,
        },
      };
      useGameplayStore.getState().addMessage(chatMessage);

      return attack;
    },
    [setResult, tokens],
  );

  /** Aplica o dano nos alvos. Atualiza tanto gameplay-store (token.hp)
   *  quanto combat-store (participant hpCurrent), se o token for
   *  participante do combat canônico. Aplica resistência/imunidade/
   *  vulnerabilidade do personagem vinculado ao token, se houver. */
  const applyResults = useCallback(
    (attack: AttackWithResults) => {
      const allTokens = useGameplayStore.getState().tokens;
      const combat = useCombatStore.getState().combat;
      const combatTokenIds = new Set(
        combat?.participants.map((p) => p.tokenId) ?? [],
      );
      const characterStore = useCharacterStore.getState();

      // Mutamos os results in-place pra registrar appliedDamage e modifier
      // — o AttackResultCard já no chat vai ficar desatualizado, mas o
      // ResultPanel do modal lê do attack-store e re-renderiza.
      for (const r of attack.results) {
        if (!r.hit || !r.damageTotal) continue;

        const token = allTokens.find((t) => t.id === r.targetTokenId);
        if (!token) continue;

        // Resolve resistências do alvo via character vinculado ao token.
        const charId = characterStore.getTokenCharacterId(token.id);
        const character = charId
          ? characterStore.getCharacterById(charId)
          : undefined;
        const multipliers: DamageMultipliers | null = character?.stats
          ? {
              // Cast: stats.damage*Resistances vem como string[] genérico
              // (CampaignCharacter.stats); engine só usa entradas que
              // casam com AttackDamageType e ignora silenciosamente as demais.
              resistances: (character.stats.damageResistances ?? []) as AttackDamageType[],
              immunities: (character.stats.damageImmunities ?? []) as AttackDamageType[],
              vulnerabilities: (character.stats.damageVulnerabilities ?? []) as AttackDamageType[],
            }
          : null;

        const { final: appliedDamage, modifier } = computeFinalDamage(
          r.damageTotal,
          attack.damageType as AttackDamageType,
          multipliers,
        );

        r.appliedDamage = appliedDamage;
        r.damageModifier = modifier;
        r.appliedAt = new Date();

        const nextHp = Math.max(0, token.hp - appliedDamage);
        updateTokenHp(token.id, nextHp);

        if (combatTokenIds.has(token.id)) {
          const participant = combat!.participants.find(
            (p) => p.tokenId === token.id,
          );
          if (participant) {
            const nextParticipantHp = Math.max(
              0,
              participant.hpCurrent - appliedDamage,
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
    damageModifier: null,
            appliedAt: null,
    appliedDamage: null,
  };
}

// Tipos expostos pra callsites
export type { AttackExecuteInput };
