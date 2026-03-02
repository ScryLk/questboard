import { memo, useCallback } from "react";
import { SubModalSheet } from "./SubModalSheet";
import { CombatSetupView } from "./CombatSetupView";
import { CombatActiveView } from "./CombatActiveView";
import { useGameplayStore } from "../../../lib/gameplay-store";

function CombatManagerModalInner({ isOpen }: { isOpen: boolean }) {
  const closeGMToolView = useGameplayStore((s) => s.closeGMToolView);
  const combatActive = useGameplayStore((s) => s.combatActive);
  const combatRound = useGameplayStore((s) => s.combatRound);

  const handleDismiss = useCallback(() => {
    useGameplayStore.setState({ activeGMToolView: null });
  }, []);

  const handleStarted = useCallback(() => {
    // Combat started — stay on the modal (switches to active view automatically)
  }, []);

  const handleEnded = useCallback(() => {
    useGameplayStore.setState({ activeGMToolView: null });
  }, []);

  const title = combatActive
    ? `Combate · Rodada ${combatRound}`
    : "Iniciar Combate";

  return (
    <SubModalSheet
      isOpen={isOpen}
      snapPoints={["50%", "88%"]}
      title={title}
      onBack={closeGMToolView}
      onDismiss={handleDismiss}
    >
      {combatActive ? (
        <CombatActiveView onEnd={handleEnded} />
      ) : (
        <CombatSetupView onStartCombat={handleStarted} />
      )}
    </SubModalSheet>
  );
}

export const CombatManagerModal = memo(CombatManagerModalInner);
