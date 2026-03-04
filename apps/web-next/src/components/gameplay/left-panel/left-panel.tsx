"use client";

import { InitiativeTracker } from "./initiative-tracker";
import { PlayerList } from "./player-list";
import { TokenLibrary } from "./token-library";
import { QuickNPC } from "./quick-npc";

export function LeftPanel() {
  return (
    <div className="flex h-full flex-col">
      <InitiativeTracker />
      <PlayerList />
      <TokenLibrary />
      <QuickNPC />
    </div>
  );
}
