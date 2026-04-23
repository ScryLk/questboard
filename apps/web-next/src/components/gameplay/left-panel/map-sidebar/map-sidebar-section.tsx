"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Map, Settings } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useMapSidebarStore } from "@/lib/map-sidebar-store";
import { GameTooltip } from "@/components/ui/game-tooltip";
import { ActiveSceneCard } from "./active-scene-card";
import { SceneList } from "./scene-list";
import { LayerPanel } from "./layer-panel";
import { LightingControls } from "./lighting-controls";
import { FogQuickActions } from "./fog-quick-actions";
import { GridControls } from "./grid-controls";
import { AnnotationsPanel } from "./annotations-panel";
import { QuickActions } from "./quick-actions";
import { MinimapControls } from "./minimap-controls";
import { MapSidebarSettings } from "./map-sidebar-settings";

export function MapSidebarSection() {
  const collapsed = useGameplayStore((s) => s.collapsedSections["map"]);
  const toggleSection = useGameplayStore((s) => s.toggleSection);
  const visibleSections = useMapSidebarStore((s) => s.visibleSections);
  const scenes = useMapSidebarStore((s) => s.scenes);
  const activeSceneId = useMapSidebarStore((s) => s.activeSceneId);

  const [showSettings, setShowSettings] = useState(false);

  const activeScene = scenes.find((s) => s.id === activeSceneId);

  return (
    <div className="border-b border-brand-border">
      {/* Header */}
      <div className="relative flex items-center transition-colors hover:bg-white/[0.02]">
        <button
          onClick={() => toggleSection("map")}
          className="flex flex-1 items-center gap-2 px-3 py-2 text-left"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-brand-muted" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-brand-muted" />
          )}
          <Map className="h-3.5 w-3.5 text-brand-accent" />
          <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-brand-text">
            Mapa
          </span>
          {activeScene && (
            <span className="max-w-[80px] truncate rounded-full bg-brand-accent/15 px-1.5 py-0.5 text-[8px] text-brand-accent">
              {activeScene.name}
            </span>
          )}
        </button>
        <GameTooltip label="Configurações" side="bottom">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="mr-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg text-brand-muted transition-colors hover:bg-white/10 hover:text-brand-text"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </GameTooltip>

        {showSettings && (
          <MapSidebarSettings onClose={() => setShowSettings(false)} />
        )}
      </div>

      {!collapsed && (
        <div className="max-h-[500px] overflow-y-auto px-2 pb-2">
          <div className="space-y-3">
            {/* Active Scene */}
            {visibleSections.activeScene && (
              <SubSection title="CENA ATIVA">
                <ActiveSceneCard />
              </SubSection>
            )}

            {/* Scene List */}
            {visibleSections.sceneList && (
              <SubSection title="CENAS RÁPIDAS">
                <SceneList />
              </SubSection>
            )}

            {/* Layers */}
            {visibleSections.layers && (
              <SubSection title="LAYERS">
                <LayerPanel />
              </SubSection>
            )}

            {/* Lighting */}
            {visibleSections.lighting && (
              <SubSection title="ILUMINAÇÃO">
                <LightingControls />
              </SubSection>
            )}

            {/* Fog */}
            {visibleSections.fog && (
              <SubSection title="FOG RÁPIDO">
                <FogQuickActions />
              </SubSection>
            )}

            {/* Grid */}
            {visibleSections.grid && (
              <SubSection title="GRID">
                <GridControls />
              </SubSection>
            )}

            {/* Annotations */}
            {visibleSections.annotations && (
              <SubSection title="ANOTAÇÕES">
                <AnnotationsPanel />
              </SubSection>
            )}

            {/* Quick Actions */}
            {visibleSections.quickActions && (
              <SubSection title="AÇÕES RÁPIDAS">
                <QuickActions />
              </SubSection>
            )}

            {/* Minimap */}
            {visibleSections.minimap && (
              <SubSection title="MINI-MAPA">
                <MinimapControls />
              </SubSection>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 border-b border-brand-border/50 pb-0.5">
        <span className="text-[8px] font-semibold uppercase tracking-wider text-brand-muted">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}
