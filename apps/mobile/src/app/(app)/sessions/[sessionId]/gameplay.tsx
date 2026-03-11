import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { YStack } from "tamagui";
import { useGameplayStore } from "../../../../lib/gameplay-store";
import { MapCanvas } from "../../../../components/gameplay/map-canvas";
import { GridOverlay } from "../../../../components/gameplay/grid-overlay";
import { TokenLayer } from "../../../../components/gameplay/token-layer";
import { FogOverlay } from "../../../../components/gameplay/fog-overlay";
import { MovementRangeOverlay } from "../../../../components/gameplay/movement-range-overlay";
import { TopBar } from "../../../../components/gameplay/top-bar";
import { MobileInitiativeBar } from "../../../../components/gameplay/mobile-initiative-bar";
import { MobileActionBar } from "../../../../components/gameplay/mobile-action-bar";
import { MobileReactionPopup } from "../../../../components/gameplay/mobile-reaction-popup";
import { ChatPanel } from "../../../../components/gameplay/chat-panel";
import { DicePanel } from "../../../../components/gameplay/dice-panel";
import { SheetPanel } from "../../../../components/gameplay/sheet-panel";
import { GMToolsPanel } from "../../../../components/gameplay/gm-tools-panel";
import {
  TokenManagerModal,
  CombatManagerModal,
  SceneCardModal,
  SoundtrackModal,
} from "../../../../components/gameplay/gm-tools";
import { DiceResultOverlay } from "../../../../components/gameplay/dice-result-overlay";
import { SceneCardOverlay } from "../../../../components/gameplay/scene-card-overlay";
import { TokenContextMenu } from "../../../../components/gameplay/token-context-menu";
import { PlayerSheetModal } from "../../../../components/gameplay/player-sheet-modal";
import { NPCCardModal } from "../../../../components/gameplay/npc-card-modal";
import { GameplaySettingsModal } from "../../../../components/gameplay/gameplay-settings-modal";
import { ActionSheet } from "../../../../components/gameplay/actions/action-sheet";
import { BonusActionSheet } from "../../../../components/gameplay/actions/bonus-action-sheet";
import { SpellPickerSheet } from "../../../../components/gameplay/actions/spell-picker-sheet";
import { MobileTurnBanner } from "../../../../components/gameplay/combat-visuals/mobile-turn-banner";
import { MobileFloatingDamage } from "../../../../components/gameplay/combat-visuals/mobile-floating-damage";
import { MobileCombatTransition } from "../../../../components/gameplay/combat-visuals/mobile-combat-transition";
import { PathOverlay, PathPlanningHUD } from "../../../../components/gameplay/path-planning/mobile-path-planner";
import { PhaseModal } from "../../../../components/gameplay/phase-modal";
import { QuickActionBar } from "../../../../components/gameplay/quick-action-bar";
import { PlayerTopBar } from "../../../../components/gameplay/player/player-top-bar";
import { PlayerInitiativeTracker } from "../../../../components/gameplay/player/player-initiative-tracker";
import { QuickActionsPanel } from "../../../../components/gameplay/player/quick-actions-panel";
import { MorePanel } from "../../../../components/gameplay/player/more-panel";
import { TurnAlertOverlay } from "../../../../components/gameplay/player/turn-alert-overlay";
import { AbilityDetailSheet } from "../../../../components/gameplay/abilities/ability-detail-sheet";

export default function GameplayScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const activePanel = useGameplayStore((s) => s.activePanel);
  const activeGMToolView = useGameplayStore((s) => s.activeGMToolView);
  const isGM = useGameplayStore((s) => s.isGM);
  const combatActive = useGameplayStore((s) => s.combatActive);
  const settingsModalOpen = useGameplayStore((s) => s.settingsModalOpen);
  const currentTurnIndex = useGameplayStore((s) => s.currentTurnIndex);
  const combatParticipants = useGameplayStore((s) => s.combatParticipants);
  const myTokenId = useGameplayStore((s) => s.myTokenId);
  const pathPlanningActive = useGameplayStore((s) => s.pathPlanningActive);
  const gridSize = useGameplayStore((s) => s.gridSize);

  // Combat transition state
  const [combatTransition, setCombatTransition] = useState<"start" | "end" | null>(null);
  const prevCombatActive = useCallback(() => combatActive, [])(); // track previous state

  // Detect combat start/end for transition
  useEffect(() => {
    // We only trigger transitions after initial load
    if (combatActive) {
      setCombatTransition("start");
    }
  }, [combatActive]);

  const handleCombatTransitionDone = useCallback(() => {
    setCombatTransition(null);
  }, []);

  // Action sheet state
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [bonusSheetOpen, setBonusSheetOpen] = useState(false);
  const [spellSheetOpen, setSpellSheetOpen] = useState(false);

  // Turn banner state
  const [turnBanner, setTurnBanner] = useState<{ visible: boolean; text: string; isMyTurn: boolean }>({
    visible: false,
    text: "",
    isMyTurn: false,
  });

  // Floating damage state
  const [floatingDamages, setFloatingDamages] = useState<
    { id: string; x: number; y: number; amount: number; damageType: string; isHeal: boolean; isCrit: boolean }[]
  >([]);

  // Show turn banner when turn changes
  useEffect(() => {
    if (!combatActive || combatParticipants.length === 0) return;
    const current = combatParticipants[currentTurnIndex];
    if (!current) return;
    const isMyTurn = current.tokenId === myTokenId;
    setTurnBanner({
      visible: true,
      text: isMyTurn ? "SEU TURNO!" : `Turno de ${current.name}`,
      isMyTurn,
    });
  }, [currentTurnIndex, combatActive, combatParticipants, myTokenId]);

  const handleTurnBannerDone = useCallback(() => {
    setTurnBanner((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleRemoveFloatingDamage = useCallback((id: string) => {
    setFloatingDamages((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const handleSelectAction = useCallback((action: string) => {
    if (action === "cast-spell") {
      setSpellSheetOpen(true);
    }
    // Other actions will be handled when combat system is wired
  }, []);

  const handleSelectBonusAction = useCallback((_action: string) => {
    // Will be handled when combat system is wired
  }, []);

  const handleCastSpell = useCallback((_spellId: string) => {
    // Will be handled when combat system is wired
  }, []);

  // Reaction popup state (will be driven by sync events later)
  const [reactionData, setReactionData] = useState<{
    id: string;
    type: "opportunity-attack";
    description: string;
    triggerName: string;
    weaponName: string;
    attackBonus: number;
    damageDice: string;
    timeLimit: number;
  } | null>(null);

  useEffect(() => {
    // TODO: load real session data via API/socket
  }, []);

  return (
    <YStack flex={1} backgroundColor="#0A0A0F">
      {/* Layer 0: Map, Grid, Tokens, Fog */}
      <MapCanvas>
        <GridOverlay />
        <MovementRangeOverlay />
        <TokenLayer />
        <FogOverlay />
        {pathPlanningActive && <PathOverlay gridSize={gridSize} />}
      </MapCanvas>

      {/* Layer 1: HUD — Top */}
      {isGM ? (
        combatActive ? <MobileInitiativeBar /> : <TopBar />
      ) : (
        <>
          <PlayerTopBar />
          {combatActive && <PlayerInitiativeTracker />}
        </>
      )}

      {/* Layer 2: HUD — Bottom */}
      {isGM ? (
        pathPlanningActive ? (
          <PathPlanningHUD />
        ) : (
          <MobileActionBar
            onActionPress={() => setActionSheetOpen(true)}
            onBonusPress={() => setBonusSheetOpen(true)}
            onSpellPress={() => setSpellSheetOpen(true)}
          />
        )
      ) : (
        <QuickActionBar />
      )}

      {/* Layer 3: Panels (bottom sheets) */}
      <ChatPanel isOpen={activePanel === "chat"} />
      <DicePanel isOpen={activePanel === "dice"} />
      <SheetPanel isOpen={activePanel === "sheet"} />
      {isGM && <GMToolsPanel isOpen={activePanel === "gmtools"} />}
      {!isGM && <QuickActionsPanel isOpen={activePanel === "actions"} />}
      {!isGM && <MorePanel isOpen={activePanel === "more"} />}

      {/* Ability Detail Sheet (opens when user taps an ability) */}
      <AbilityDetailSheet />

      {/* GM Tool Sub-Modals */}
      {isGM && (
        <>
          <TokenManagerModal isOpen={activeGMToolView === "token-manager"} />
          <CombatManagerModal isOpen={activeGMToolView === "combat-manager"} />
          <SceneCardModal isOpen={activeGMToolView === "scene-card"} />
          <SoundtrackModal isOpen={activeGMToolView === "soundtrack"} />
        </>
      )}

      {/* Character Sheet Modals */}
      <PlayerSheetModal />
      <NPCCardModal />

      {/* Settings Modal */}
      <GameplaySettingsModal isOpen={settingsModalOpen} />

      {/* Context Menu */}
      <TokenContextMenu />

      {/* Action Sheets */}
      <ActionSheet
        isOpen={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        onSelectAction={handleSelectAction}
      />
      <BonusActionSheet
        isOpen={bonusSheetOpen}
        onClose={() => setBonusSheetOpen(false)}
        onSelectAction={handleSelectBonusAction}
      />
      <SpellPickerSheet
        isOpen={spellSheetOpen}
        onClose={() => setSpellSheetOpen(false)}
        onCast={handleCastSpell}
      />

      {/* Layer 4: Overlays */}
      <DiceResultOverlay />
      <SceneCardOverlay />

      {/* Turn Banner */}
      <MobileTurnBanner
        visible={turnBanner.visible}
        text={turnBanner.text}
        isMyTurn={turnBanner.isMyTurn}
        onDone={handleTurnBannerDone}
      />

      {/* Floating Damage Numbers */}
      {floatingDamages.map((d) => (
        <MobileFloatingDamage
          key={d.id}
          x={d.x}
          y={d.y}
          amount={d.amount}
          damageType={d.damageType}
          isHeal={d.isHeal}
          isCrit={d.isCrit}
          onDone={() => handleRemoveFloatingDamage(d.id)}
        />
      ))}

      {/* Combat Transition */}
      <MobileCombatTransition
        type={combatTransition}
        onDone={handleCombatTransitionDone}
      />

      {/* Layer 5: Reaction Popup (highest z) */}
      <MobileReactionPopup
        reaction={reactionData}
        visible={reactionData !== null}
        onUse={() => setReactionData(null)}
        onSkip={() => setReactionData(null)}
      />

      {/* Turn Alert (player only) */}
      {!isGM && <TurnAlertOverlay />}

      {/* Phase Context Panel */}
      <PhaseModal />
    </YStack>
  );
}
