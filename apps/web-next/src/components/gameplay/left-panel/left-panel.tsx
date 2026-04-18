"use client";

import { InitiativeTracker } from "./initiative-tracker";
import { PlayerList } from "./player-list";
import { MapSidebarSection } from "./map-sidebar/map-sidebar-section";
import { TokenLibrarySection } from "./token-library/token-library-section";
import { NPCSidebarSection } from "./npc-sidebar/npc-sidebar-section";
import { CharacterSidebarSection } from "./character-sidebar/character-sidebar-section";
import { ObjectLibrarySection } from "./object-library/object-library-section";
import { AudioPanel } from "../audio/audio-panel";
import { BehaviorSidebarSection } from "./behavior-sidebar/behavior-sidebar-section";

export function LeftPanel() {
  return (
    <div className="flex h-full flex-col">
      <InitiativeTracker />
      <PlayerList />
      <MapSidebarSection />
      <TokenLibrarySection />
      <NPCSidebarSection />
      <CharacterSidebarSection />
      <ObjectLibrarySection />
      <BehaviorSidebarSection />
      <AudioPanel />
    </div>
  );
}
