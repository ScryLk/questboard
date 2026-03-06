"use client";

import { InitiativeTracker } from "./initiative-tracker";
import { PlayerList } from "./player-list";
import { MapSidebarSection } from "./map-sidebar/map-sidebar-section";
import { TokenLibrarySection } from "./token-library/token-library-section";
import { NPCSidebarSection } from "./npc-sidebar/npc-sidebar-section";
import { AudioPanel } from "../audio/audio-panel";

export function LeftPanel() {
  return (
    <div className="flex h-full flex-col">
      <InitiativeTracker />
      <PlayerList />
      <MapSidebarSection />
      <TokenLibrarySection />
      <NPCSidebarSection />
      <AudioPanel />
    </div>
  );
}
