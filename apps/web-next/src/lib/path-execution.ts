import type { PathCell } from "./gameplay-store";
import { useGameplayStore } from "./gameplay-store";
import { detectOpportunityAttacks } from "./reactions";
import { MOCK_MAP } from "./gameplay-mock-data";
import { playOAAlertSound } from "./oa-alert-sound";
import { useSettingsStore } from "./settings-store";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait until pendingReaction is resolved (null), polling every 100ms.
 * Times out after 30 seconds.
 */
async function waitForReactionResolved(): Promise<void> {
  const maxWait = 30_000;
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    if (useGameplayStore.getState().pendingReaction === null) return;
    await delay(100);
  }
}

/**
 * Execute a planned path step by step.
 * Moves the token cell by cell, pausing at OA triggers.
 */
export async function executePath(
  tokenId: string,
  path: PathCell[],
): Promise<{ completed: boolean; stoppedAtIndex: number }> {
  const store = useGameplayStore;

  // Exit planning mode first
  store.getState().exitPathPlanning();

  const { cellSizeFt } = MOCK_MAP;

  for (let i = 0; i < path.length; i++) {
    const cell = path[i];
    const prev = i > 0 ? path[i - 1] : null;
    const prevX = prev ? prev.x : store.getState().tokens.find((t) => t.id === tokenId)?.x ?? cell.x;
    const prevY = prev ? prev.y : store.getState().tokens.find((t) => t.id === tokenId)?.y ?? cell.y;

    // Move token (CSS transition handles visual animation at 200ms)
    store.getState().moveToken(tokenId, cell.x, cell.y);
    store.getState().addMovementFt(cell.ftCost);

    // Wait for visual animation
    await delay(180);

    // Check for OA at this step
    const state = store.getState();
    if (state.combat.active) {
      const oaEvents = cell.events.filter((e) => e.type === "opportunity_attack");

      if (oaEvents.length > 0) {
        // Detect full OA with weapon options
        const pendingOAs = detectOpportunityAttacks(
          tokenId,
          prevX,
          prevY,
          cell.x,
          cell.y,
          state.tokens,
          state.reactionUsedMap,
          state.turnActions.isDisengaging,
          cellSizeFt,
        );

        // Process ALL OAs sequentially (multiple reactors can OA the same move)
        for (const oa of pendingOAs) {
          store.getState().setPendingReaction(oa);

          // Sound + shake
          const audioSettings = useSettingsStore.getState().audio;
          if (!audioSettings.muteAll) {
            const vol = (audioSettings.effectsVolume * audioSettings.masterVolume) / 10000;
            playOAAlertSound(vol);
          }

          // Wait for OA resolution
          await waitForReactionResolved();

          // Check if token died from OA
          const tokenAfterOA = store.getState().tokens.find((t) => t.id === tokenId);
          if (!tokenAfterOA || tokenAfterOA.hp <= 0) {
            return { completed: false, stoppedAtIndex: i };
          }
        }
      }
    }
  }

  // Log movement
  const token = store.getState().tokens.find((t) => t.id === tokenId);
  if (token && path.length > 0) {
    const totalFt = path[path.length - 1].totalFt;
    store.getState().addMessage({
      id: `msg_path_${Date.now()}`,
      channel: "geral",
      type: "system",
      sender: "Sistema",
      senderInitials: "SI",
      isGM: false,
      content: `🏃 ${token.name} se moveu ${totalFt}ft`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    });
  }

  return { completed: true, stoppedAtIndex: path.length - 1 };
}
