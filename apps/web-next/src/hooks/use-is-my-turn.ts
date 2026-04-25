"use client";

import { useCurrentTurnTokenId } from "./use-current-turn";

/** Compara o turno atual com o tokenId do jogador. */
export function useIsMyTurn(myTokenId: string | null | undefined): boolean {
  const currentTokenId = useCurrentTurnTokenId();
  if (!myTokenId || !currentTokenId) return false;
  return currentTokenId === myTokenId;
}
