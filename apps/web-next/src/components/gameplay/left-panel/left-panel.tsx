"use client";

import { InitiativeTracker } from "./initiative-tracker";
import { PlayerList } from "./player-list";
import { MapSidebarSection } from "./map-sidebar/map-sidebar-section";
import { TokenLibrarySection } from "./token-library/token-library-section";
import { NPCSidebarSection } from "./npc-sidebar/npc-sidebar-section";
import { CharacterSidebarSection } from "./character-sidebar/character-sidebar-section";
import { ObjectLibrarySection } from "./object-library/object-library-section";
import { AudioPanel } from "../audio/audio-panel";

export function LeftPanel() {
  // `min-h-full` (não `h-full`) deixa o conteúdo crescer além da altura
  // do aside quando todas as seções estão expandidas — é isso que dispara
  // o `overflow-y: auto` do aside e habilita o scroll.
  return (
    <div className="flex min-h-full flex-col">
      <InitiativeTracker />
      <PlayerList />
      <MapSidebarSection />
      <TokenLibrarySection />
      <NPCSidebarSection />
      <CharacterSidebarSection />
      <ObjectLibrarySection />
      <AudioPanel />
    </div>
  );
}
