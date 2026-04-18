import { useCallback } from "react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { MOCK_MAP } from "@/lib/gameplay-mock-data";
import { canTokenMoveTo } from "@/lib/collision";
import type { MoveResult } from "@/lib/collision";

interface UseTokenMovementResult {
  validateMove: (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ) => MoveResult;
  attemptMove: (
    tokenId: string,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ) => boolean;
}

export function useTokenMovement(): UseTokenMovementResult {
  const wallEdges = useGameplayStore((s) => s.wallEdges);

  const validateMove = useCallback(
    (fromX: number, fromY: number, toX: number, toY: number): MoveResult => {
      return canTokenMoveTo(fromX, fromY, toX, toY, MOCK_MAP.gridCols, MOCK_MAP.gridRows, wallEdges);
    },
    [wallEdges],
  );

  const attemptMove = useCallback(
    (tokenId: string, fromX: number, fromY: number, toX: number, toY: number): boolean => {
      const result = validateMove(fromX, fromY, toX, toY);
      if (result.allowed) return true;

      switch (result.reason) {
        case "WALL":
          playWallBumpAnimation(tokenId);
          useGameplayStore.getState().addToast(result.message);
          break;
        case "DOOR_CLOSED":
          playWallBumpAnimation(tokenId);
          useGameplayStore.getState().addToast("Porta fechada — clique para abrir");
          break;
        case "DOOR_LOCKED":
          playWallBumpAnimation(tokenId);
          useGameplayStore.getState().addToast("Porta trancada");
          break;
        case "OUT_OF_BOUNDS":
          playWallBumpAnimation(tokenId);
          break;
        case "IMPASSABLE_TERRAIN":
          playWallBumpAnimation(tokenId);
          useGameplayStore.getState().addToast("Terreno intransponível");
          break;
      }
      return false;
    },
    [validateMove],
  );

  return { validateMove, attemptMove };
}

function playWallBumpAnimation(tokenId: string) {
  const el = document.querySelector(`[data-token-id="${tokenId}"]`) as HTMLElement | null;
  if (!el) return;

  el.classList.add("token-bump");
  setTimeout(() => el.classList.remove("token-bump"), 200);
}

export function playDoorOpenAnimation(doorKey: string) {
  const el = document.querySelector(`[data-wall-key="${doorKey}"]`) as HTMLElement | null;
  if (el) {
    el.classList.add("door-slam-open");
    setTimeout(() => el.classList.remove("door-slam-open"), 300);
  }
}

export function playDoorBreakAnimation(doorKey: string) {
  const el = document.querySelector(`[data-wall-key="${doorKey}"]`) as HTMLElement | null;
  if (el) {
    el.classList.add("door-break");
    setTimeout(() => {
      el.classList.remove("door-break");
      el.style.opacity = "0.2";
    }, 400);
  }
}

export function playTokenEscapeAnimation(tokenId: string, onComplete?: () => void) {
  const el = document.querySelector(`[data-token-id="${tokenId}"]`) as HTMLElement | null;
  if (!el) {
    onComplete?.();
    return;
  }

  el.style.transition = "transform 300ms ease-in, opacity 300ms ease-in";
  el.style.transform = "scale(0)";
  el.style.opacity = "0";
  setTimeout(() => {
    onComplete?.();
  }, 300);
}
