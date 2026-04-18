"use client";

import { Dices, MessageCircle, User } from "lucide-react";
import type { RightPanelTab } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import { ChatTab } from "./chat-tab";
import { DiceTab } from "./dice-tab";
import { CharacterSheetTab } from "./character-sheet-tab";
import { GmConversationMonitor } from "@/components/npc-conversation/GmConversationMonitor";

const TABS: { key: RightPanelTab; label: string; icon: typeof MessageCircle }[] = [
  { key: "chat", label: "Chat", icon: MessageCircle },
  { key: "dice", label: "Dados", icon: Dices },
  { key: "sheet", label: "Ficha", icon: User },
];

export function RightPanel() {
  const rightTab = useGameplayStore((s) => s.rightTab);
  const setRightTab = useGameplayStore((s) => s.setRightTab);

  return (
    <div className="flex h-full flex-col bg-[#111116]">
      {/* Tab bar */}
      <div className="flex shrink-0 border-b border-brand-border">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setRightTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              rightTab === key
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
        {rightTab === "chat" && <ChatTab />}
        {rightTab === "dice" && <DiceTab />}
        {rightTab === "sheet" && <CharacterSheetTab />}
      </div>

      {/* Active NPC conversations monitor */}
      <GmConversationMonitor />
    </div>
  );
}
