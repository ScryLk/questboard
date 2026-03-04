"use client";

import { useGameplayStore } from "@/lib/gameplay-store";
import { CreateSceneModal } from "./create-scene-modal";
import { SoundtrackModal } from "./soundtrack-modal";
import { CreateTokenModal } from "./create-token-modal";
import { StartCombatModal } from "./start-combat-modal";
import { EndSessionModal } from "./end-session-modal";
import { ShareSessionModal } from "./share-session-modal";
import { HpAdjustModal } from "./hp-adjust-modal";
import { CharacterSheetModal } from "./character-sheet-modal";
import { CreatureCompendiumModal } from "./creature-compendium-modal";

export function GameplayModals() {
  const activeModal = useGameplayStore((s) => s.activeModal);
  const closeModal = useGameplayStore((s) => s.closeModal);

  if (!activeModal) return null;

  switch (activeModal) {
    case "createScene":
      return <CreateSceneModal onClose={closeModal} />;
    case "soundtrack":
      return <SoundtrackModal onClose={closeModal} />;
    case "createToken":
      return <CreateTokenModal onClose={closeModal} />;
    case "startCombat":
      return <StartCombatModal onClose={closeModal} />;
    case "endSession":
      return <EndSessionModal onClose={closeModal} />;
    case "shareSession":
      return <ShareSessionModal onClose={closeModal} />;
    case "hpAdjust":
      return <HpAdjustModal onClose={closeModal} />;
    case "characterSheet":
      return <CharacterSheetModal onClose={closeModal} />;
    case "creatureCompendium":
      return <CreatureCompendiumModal onClose={closeModal} />;
    default:
      return null;
  }
}
