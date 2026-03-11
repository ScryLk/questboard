import { getCombatEngine } from "./combat-animation-engine";
import type { CombatAnimationRequest, TokenPosition } from "./combat-animation-types";
import { classifyWeapon } from "./weapon-type-classifier";
import {
  executeOpportunityAttack,
  type OAWeaponOption,
  type OAResult,
} from "../reactions";
import { useGameplayStore } from "../gameplay-store";

/**
 * Execute an attack with full animation pipeline:
 * 1. Roll attack + damage (executeOpportunityAttack)
 * 2. Classify weapon → AnimationType
 * 3. Play animation (windup → projectile → impact)
 * 4. Apply results (HP, damage float, attack line, chat message)
 *
 * Falls back to instant results if engine is unavailable.
 */
export async function executeAttackWithAnimation(params: {
  attackerTokenId: string;
  targetTokenId: string;
  weapon: OAWeaponOption;
  targetAC: number;
  context: "opportunity-attack" | "standard-attack";
}): Promise<OAResult> {
  const { attackerTokenId, targetTokenId, weapon, targetAC, context } = params;
  const state = useGameplayStore.getState();

  // 1. Roll
  const result = executeOpportunityAttack(
    attackerTokenId,
    targetTokenId,
    weapon,
    targetAC,
  );

  // 2. Classify weapon
  const animationType = classifyWeapon(weapon);

  // 3. Consume reaction + dismiss prompt before animation
  if (context === "opportunity-attack") {
    const pr = state.pendingReaction;
    if (pr) {
      state.useReactionFor(pr.reactorTokenId);
      state.setPendingReaction(null);
    }
  }

  // 4. Play animation (if engine available)
  const engine = getCombatEngine();
  if (engine) {
    // Build token position map
    const positions = new Map<string, TokenPosition>();
    const tokens = state.tokens;
    for (const t of tokens) {
      positions.set(t.id, { x: t.x, y: t.y, size: t.size });
    }

    const request: CombatAnimationRequest = {
      animationType,
      attackerTokenId,
      targetTokenId,
      isHit: result.isHit,
      isCrit: result.isCrit,
      damageTotal: result.damageTotal,
      damageType: result.damageType,
    };

    await engine.play(request, positions);
  }

  // 5. Apply results (after animation completes)
  const target = state.tokens.find((t) => t.id === targetTokenId);
  const attacker = state.tokens.find((t) => t.id === attackerTokenId);

  if (result.isHit && result.damageTotal > 0 && target) {
    state.updateTokenHp(target.id, target.hp - result.damageTotal);
    state.addDamageFloat(target.id, result.damageTotal, false, result.isCrit);
  }

  state.setAttackLine({
    attackerId: attackerTokenId,
    targetId: targetTokenId,
    roll: result.attackRoll,
    damage: result.isHit ? result.damageTotal : null,
  });

  // 6. Chat message
  const attackerName = attacker?.name ?? "???";
  const targetName = target?.name ?? "???";
  const hitLabel = result.isCrit
    ? "CRITICO!!"
    : result.isFumble
      ? "FALHA CRITICA!"
      : result.isHit
        ? "ACERTOU!"
        : "ERROU!";

  const contextLabel =
    context === "opportunity-attack" ? "Ataque de Oportunidade" : "Ataque";

  let chatContent = `${attackerName} faz ${contextLabel} contra ${targetName}!\n`;
  chatContent += `Ataque: ${result.attackRoll} (${result.attackDetails}) vs CA ${targetAC} — ${hitLabel}`;
  if (result.isHit && result.damageTotal > 0) {
    chatContent += `\nDano: ${result.damageTotal} (${result.damageDetails}) ${result.damageType}`;
  }

  state.addMessage({
    id: `msg_${Date.now()}`,
    channel: "geral",
    type: "roll",
    sender: attackerName,
    senderInitials: attackerName.slice(0, 2).toUpperCase(),
    isGM: false,
    content: chatContent,
    timestamp: new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    rollFormula: `d20+${weapon.attackBonus}`,
    rollResult: result.attackRoll,
    rollDetails: result.attackDetails,
    isNat20: result.isCrit,
    isNat1: result.isFumble,
  });

  return result;
}
