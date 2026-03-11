"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Library,
  Plus,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { GameTooltip } from "@/components/ui/game-tooltip";
import { useTokenLibraryStore } from "@/lib/token-library-store";
import { TokenSubTabs, type TokenSubTab } from "./token-sub-tabs";
import { MyTokensTab } from "./my-tokens-tab";
import { CompendiumTab } from "./compendium-tab";
import { GroupsTab } from "./groups-tab";

export function TokenLibrarySection() {
  const collapsed = useGameplayStore((s) => s.collapsedSections["tokens"]);
  const toggleSection = useGameplayStore((s) => s.toggleSection);
  const openModal = useGameplayStore((s) => s.openModal);
  const setTokenEditorTarget = useGameplayStore(
    (s) => s.setTokenEditorTarget,
  );
  const savedTokens = useTokenLibraryStore((s) => s.savedTokens);

  const [subTab, setSubTab] = useState<TokenSubTab>("mine");

  function handleCreate() {
    setTokenEditorTarget(null);
    openModal("tokenEditor");
  }

  return (
    <div className="border-b border-brand-border">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => toggleSection("tokens")}
          className="flex flex-1 items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-white/[0.02]"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-brand-muted" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-brand-muted" />
          )}
          <Library className="h-3.5 w-3.5 text-brand-accent" />
          <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-brand-text">
            Tokens
          </span>
          {savedTokens.length > 0 && (
            <span className="rounded-full bg-brand-accent/15 px-1.5 py-0.5 text-[9px] tabular-nums text-brand-accent">
              {savedTokens.length}
            </span>
          )}
        </button>
        <GameTooltip label="Criar Token" side="bottom">
          <button
            onClick={handleCreate}
            className="mr-2 flex h-5 w-5 items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </GameTooltip>
      </div>

      {!collapsed && (
        <div className="pb-2">
          {/* Sub-tabs */}
          <TokenSubTabs active={subTab} onChange={setSubTab} />

          {/* Tab content */}
          {subTab === "mine" && <MyTokensTab />}
          {subTab === "compendium" && <CompendiumTab />}
          {subTab === "groups" && <GroupsTab />}
        </div>
      )}
    </div>
  );
}
