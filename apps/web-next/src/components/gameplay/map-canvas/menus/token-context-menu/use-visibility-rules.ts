"use client";

import type { GameToken } from "@/lib/gameplay-mock-data";

/**
 * Matriz de visibilidade de ações do menu contextual por (tipo do token,
 * role do usuário). Veio da seção 4 do prompt do menu contextual.
 *
 * Regra de ouro: ação não-permitida NÃO aparece (evita poluição), exceto
 * feature-toggles (Elevar) que sempre mostram o estado atual.
 */
export interface TokenMenuVisibility {
  /* INFO */
  canSeeSheet: boolean;
  canSeeFocusCamera: boolean;
  canSeeGMNotes: boolean;
  /** GM sussurrar direto pro dono deste token (texto + imagem). */
  canSendWhisper: boolean;

  /* COMBAT */
  canAttack: boolean;
  canRollInitiative: boolean;
  canAdjustHp: boolean;
  canApplyDamage: boolean;
  canApplyHeal: boolean;
  canEditConditions: boolean;
  /** GM define este token como turno atual (inicia combate se inativo). */
  canSetCurrentTurn: boolean;
  /** GM encerra o combate (visível só quando combat.active). */
  canEndCombat: boolean;

  /* NARRATIVE (PR #4 — todas false enquanto não há backend) */
  canTalkToNpc: boolean;
  canStartBehavior: boolean;
  canSeeCurrentEvent: boolean;

  /* APPEARANCE */
  canChangeAlignment: boolean;
  canChangeVisibility: boolean;
  canChangeSize: boolean;
  canToggleElevation: boolean;
  canChangeOwner: boolean;

  /* MANIPULATION */
  canDuplicate: boolean;
  canChangeZOrder: boolean;
  canUndoMovement: boolean;

  /* DESTRUCTIVE */
  canRemoveFromMap: boolean;
}

export interface VisibilityContext {
  token: GameToken;
  currentUserIsGM: boolean;
  currentUserId: string | null;
  combatActive: boolean;
}

export function computeTokenMenuVisibility(
  ctx: VisibilityContext,
): TokenMenuVisibility {
  const { token, currentUserIsGM, currentUserId, combatActive } = ctx;

  const isNpc = !token.playerId;
  const isMyPc = !isNpc && !!currentUserId && token.playerId === currentUserId;
  // isOtherPc = !isNpc && !isMyPc — não usado diretamente hoje, mas a
  // matriz abaixo assume que "PC que não é meu" cai nas mesmas regras
  // genéricas de PC. Quando precisar de regras finas (ex: menu mínimo
  // pra PLAYER vendo token de outro jogador), adicionar aqui.
  const isGm = currentUserIsGM;

  return {
    /* INFO — ficha e focar câmera são universais */
    canSeeSheet: true,
    canSeeFocusCamera: true,
    canSeeGMNotes: isGm && !isMyPc, // só GM, e não no próprio token
    // Sussurro pro dono: só quando o GM olha pro token de um jogador
    // (tem playerId). Não faz sentido sussurrar pra NPC ou pra si mesmo.
    canSendWhisper: isGm && !isNpc && !isMyPc,

    /* COMBAT */
    canAttack: !isMyPc, // não atacar a si mesmo
    canRollInitiative: true,
    canAdjustHp: isGm || isMyPc, // GM em qualquer; PLAYER só no próprio
    canApplyDamage: isGm, // dano sempre via GM
    canApplyHeal: isGm || isMyPc,
    canEditConditions: isGm || isMyPc,
    // GM pode definir turno de qualquer token no mapa (testa fluxo
    // na visão do jogador). Requer `onMap` porque turno precisa do
    // token posicionado.
    canSetCurrentTurn: isGm && token.onMap,
    canEndCombat: isGm && combatActive,

    /* NARRATIVE — backend ainda não existe; mantém false.
     * Quando houver backend, revisitar: canTalkToNpc só se isNpc &&
     * npc.dialogEnabled && (isGm || dentro do raio de conversa). */
    canTalkToNpc: false,
    canStartBehavior: false,
    canSeeCurrentEvent: false,

    /* APPEARANCE — ações "de GM" só liberam pra GM. Elevar é exceção:
     * PLAYER pode elevar o próprio token. */
    canChangeAlignment: isGm && isNpc,
    canChangeVisibility: isGm && !isMyPc,
    canChangeSize: isGm && !isMyPc,
    canToggleElevation: isGm || isMyPc,
    // Só GM atribui dono. Entrega/remove vínculo token ↔ jogador.
    canChangeOwner: isGm,

    /* MANIPULATION */
    canDuplicate: isGm && !isMyPc,
    canChangeZOrder: isGm, // TODO PR #2 (ainda não há zIndexOverride no tipo)
    canUndoMovement: isGm || isMyPc, // dono do token

    /* DESTRUCTIVE */
    canRemoveFromMap: isGm && !isMyPc,
  };
}
