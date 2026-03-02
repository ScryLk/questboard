import { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { YStack } from "tamagui";
import { useGameplayStore } from "../../../../lib/gameplay-store";
import { loadMockGameplay } from "../../../../lib/gameplay-mock-data";
import { MapCanvas } from "../../../../components/gameplay/map-canvas";
import { GridOverlay } from "../../../../components/gameplay/grid-overlay";
import { TokenLayer } from "../../../../components/gameplay/token-layer";
import { FogOverlay } from "../../../../components/gameplay/fog-overlay";
import { TopBar } from "../../../../components/gameplay/top-bar";
import { QuickActionBar } from "../../../../components/gameplay/quick-action-bar";
import { InitiativeTracker } from "../../../../components/gameplay/initiative-tracker";
import { ChatPanel } from "../../../../components/gameplay/chat-panel";
import { DicePanel } from "../../../../components/gameplay/dice-panel";
import { SheetPanel } from "../../../../components/gameplay/sheet-panel";
import { GMToolsPanel } from "../../../../components/gameplay/gm-tools-panel";
import { DiceResultOverlay } from "../../../../components/gameplay/dice-result-overlay";
import { SceneCardOverlay } from "../../../../components/gameplay/scene-card-overlay";
import { TokenContextMenu } from "../../../../components/gameplay/token-context-menu";

export default function GameplayScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const activePanel = useGameplayStore((s) => s.activePanel);
  const isGM = useGameplayStore((s) => s.isGM);
  const combatActive = useGameplayStore((s) => s.combatActive);

  useEffect(() => {
    loadMockGameplay(useGameplayStore.setState);
  }, []);

  return (
    <YStack flex={1} backgroundColor="#0A0A0F">
      {/* Layer 0 + 1 + 2: Map, Grid, Tokens, Fog */}
      <MapCanvas>
        <GridOverlay />
        <TokenLayer />
        <FogOverlay />
      </MapCanvas>

      {/* Layer 3: HUD */}
      <TopBar />
      {combatActive && <InitiativeTracker />}
      <QuickActionBar />

      {/* Layer 4: Panels */}
      {activePanel === "chat" && <ChatPanel />}
      {activePanel === "dice" && <DicePanel />}
      {activePanel === "sheet" && <SheetPanel />}
      {activePanel === "gmtools" && isGM && <GMToolsPanel />}

      {/* Context Menu */}
      <TokenContextMenu />

      {/* Layer 5: Overlays */}
      <DiceResultOverlay />
      <SceneCardOverlay />
    </YStack>
  );
}
