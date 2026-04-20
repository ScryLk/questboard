"use client";

import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { MOCK_SESSION } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import { GameplayToolbar } from "./toolbar/gameplay-toolbar";
import { AoeShapePicker } from "./toolbar/aoe-shape-picker";
import { DrawToolPicker } from "./toolbar/draw-tool-picker";
import { FogToolPicker } from "./toolbar/fog-tool-picker";
import { TerrainToolPicker } from "./toolbar/terrain-tool-picker";
import { WallToolPicker } from "./toolbar/wall-tool-picker";
import { ObjectToolPicker } from "./toolbar/object-tool-picker";
import { GridAlignmentPanel } from "./toolbar/grid-alignment-panel";
import { VisionPanel } from "./toolbar/vision-panel";
import { LeftPanel } from "./left-panel/left-panel";
import { RightPanel } from "./right-panel/right-panel";
import { MapCanvas } from "./map-canvas/map-canvas";
import { GameplayMapPicker } from "./gameplay-map-picker";
import { ResizableDivider } from "./shared/resizable-divider";
import { GameplayModals } from "./modals/gameplay-modals";
import { ActionBar } from "./action-bar/action-bar";
import { GameTooltip } from "@/components/ui/game-tooltip";
import { OAAlertVignette } from "./effects/oa-alert-vignette";
import { PhaseModal } from "./PhaseModal";
import { SceneCardIndicator } from "./toolbar/scene-card-indicator";
import { AIGenerationPanel } from "./ai-generation-panel";
import { SFXProvider } from "./audio/sfx-provider";


export function GameplayLayout() {
  const leftPanelOpen = useGameplayStore((s) => s.leftPanelOpen);
  const rightPanelOpen = useGameplayStore((s) => s.rightPanelOpen);
  const leftPanelWidth = useGameplayStore((s) => s.leftPanelWidth);
  const rightPanelWidth = useGameplayStore((s) => s.rightPanelWidth);
  const toggleLeftPanel = useGameplayStore((s) => s.toggleLeftPanel);
  const toggleRightPanel = useGameplayStore((s) => s.toggleRightPanel);
  const setLeftPanelWidth = useGameplayStore((s) => s.setLeftPanelWidth);
  const setRightPanelWidth = useGameplayStore((s) => s.setRightPanelWidth);
  const pendingReaction = useGameplayStore((s) => s.pendingReaction);

  return (
    <SFXProvider>
    <div
      className="bg-[#0A0A0F]"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <div style={{ flexShrink: 0 }}>
        <GameplayToolbar session={MOCK_SESSION} />
      </div>

      {/* Scene card active indicator */}
      <SceneCardIndicator />

      {/* Floating pickers — at root level so overflow:hidden doesn't clip them */}
      <AoeShapePicker />
      <DrawToolPicker />
      <FogToolPicker />
      <TerrainToolPicker />
      <WallToolPicker />
      <ObjectToolPicker />
      <GridAlignmentPanel />
      <VisionPanel />

      {/* Main content: 3-panel layout */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Left panel */}
        {leftPanelOpen && (
          <aside
            className="border-r border-brand-border bg-[#111116]"
            style={{
              width: leftPanelWidth,
              minWidth: 200,
              maxWidth: 300,
              flexShrink: 0,
              overflowX: "hidden",
              overflowY: "auto",
            }}
          >
            <LeftPanel />
          </aside>
        )}

        {/* Left collapse toggle */}
        <GameTooltip label={leftPanelOpen ? "Recolher" : "Expandir"} side="right">
          <button
            onClick={toggleLeftPanel}
            className="flex items-center justify-center border-r border-brand-border bg-[#0D0D12] text-brand-muted transition-colors hover:bg-white/[0.03] hover:text-brand-text"
            style={{ width: 20, flexShrink: 0 }}
          >
            {leftPanelOpen ? (
              <PanelLeftClose className="h-3.5 w-3.5" />
            ) : (
              <PanelLeftOpen className="h-3.5 w-3.5" />
            )}
          </button>
        </GameTooltip>

        {/* Left resizable divider */}
        {leftPanelOpen && (
          <ResizableDivider side="left" onResize={setLeftPanelWidth} minWidth={200} maxWidth={300} />
        )}

        {/* Central canvas */}
        <div className="relative flex flex-1" style={{ minWidth: 0 }}>
          <MapCanvas />
          <div className="pointer-events-none absolute left-3 top-3 z-40">
            <GameplayMapPicker />
          </div>
        </div>

        {/* Right resizable divider */}
        {rightPanelOpen && (
          <ResizableDivider side="right" onResize={setRightPanelWidth} minWidth={260} maxWidth={400} />
        )}

        {/* Right collapse toggle */}
        <GameTooltip label={rightPanelOpen ? "Recolher" : "Expandir"} side="left">
          <button
            onClick={toggleRightPanel}
            className="flex items-center justify-center border-l border-brand-border bg-[#0D0D12] text-brand-muted transition-colors hover:bg-white/[0.03] hover:text-brand-text"
            style={{ width: 20, flexShrink: 0 }}
          >
            {rightPanelOpen ? (
              <PanelRightClose className="h-3.5 w-3.5" />
            ) : (
              <PanelRightOpen className="h-3.5 w-3.5" />
            )}
          </button>
        </GameTooltip>

        {/* Right panel */}
        {rightPanelOpen && (
          <aside
            className="border-l border-brand-border"
            style={{
              width: rightPanelWidth,
              minWidth: 260,
              maxWidth: 400,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <RightPanel />
          </aside>
        )}
      </div>

      {/* Action Bar — combat turn controls */}
      <ActionBar />

      {/* Modals */}
      <GameplayModals />

      {/* Phase side panel */}
      <PhaseModal />

      {/* AI Generation Panel */}
      <AIGenerationPanel />

      {/* OA dramatic vignette */}
      <OAAlertVignette active={pendingReaction !== null} />
    </div>
    </SFXProvider>
  );
}
