"use client";

import { User, MessageCircle, Dices, Swords } from "lucide-react";
import type { PlayerTab } from "@/lib/player-view-store";
import { usePlayerViewStore } from "@/lib/player-view-store";
import { PlayerSheetTab } from "./tabs/PlayerSheetTab";
import { PlayerChatTab } from "./tabs/PlayerChatTab";
import { PlayerDiceTab } from "./tabs/PlayerDiceTab";
import { PlayerCombatTab } from "./tabs/PlayerCombatTab";

const TABS: { key: PlayerTab; label: string; icon: typeof User }[] = [
  { key: "ficha", label: "Ficha", icon: User },
  { key: "chat", label: "Chat", icon: MessageCircle },
  { key: "dados", label: "Dados", icon: Dices },
  { key: "combate", label: "Combate", icon: Swords },
];

export function PlayerPanel() {
  const activeTab = usePlayerViewStore((s) => s.activeTab);
  const setActiveTab = usePlayerViewStore((s) => s.setActiveTab);

  return (
    <div className="flex h-full flex-col bg-[#111116]">
      {/* Tab bar */}
      <div className="flex shrink-0 border-b border-brand-border">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              activeTab === key
                ? "border-b-2 border-brand-accent text-brand-accent"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "ficha" && <PlayerSheetTab />}
        {activeTab === "chat" && <PlayerChatTab />}
        {activeTab === "dados" && <PlayerDiceTab />}
        {activeTab === "combate" && <PlayerCombatTab />}
      </div>
    </div>
  );
}
