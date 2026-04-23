"use client";

import { useCallback } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SearchResultItem } from "@questboard/types";
import { GlobalSearch } from "@/components/search/global-search";
import { useActiveCampaignId } from "@/lib/active-campaign";
import { GameTooltip } from "@/components/ui/game-tooltip";

/**
 * Eventos custom emitidos pela busca global no contexto do gameplay. Outros
 * componentes do canvas/painel escutam e fazem foco/centramento sem precisar
 * conhecer a busca diretamente.
 */
export const GAMEPLAY_SEARCH_EVENTS = {
  focusMap: "questboard:gameplay:focus-map",
  focusCharacter: "questboard:gameplay:focus-character",
  openNote: "questboard:gameplay:open-note",
} as const;

export function GameplayGlobalSearch() {
  const { campaignId } = useActiveCampaignId();
  const router = useRouter();

  const handleSelect = useCallback(
    (item: SearchResultItem): boolean => {
      if (typeof window === "undefined") return false;

      switch (item.type) {
        case "map": {
          window.dispatchEvent(
            new CustomEvent(GAMEPLAY_SEARCH_EVENTS.focusMap, {
              detail: { mapId: item.id },
            }),
          );
          return true;
        }
        case "character": {
          window.dispatchEvent(
            new CustomEvent(GAMEPLAY_SEARCH_EVENTS.focusCharacter, {
              detail: { characterId: item.id },
            }),
          );
          return true;
        }
        case "note": {
          window.dispatchEvent(
            new CustomEvent(GAMEPLAY_SEARCH_EVENTS.openNote, {
              detail: { noteId: item.id },
            }),
          );
          return true;
        }
        case "session": {
          router.push(item.url);
          return true;
        }
        default:
          return false;
      }
    },
    [router],
  );

  return (
    <GlobalSearch
      campaignId={campaignId}
      context="gameplay"
      onSelectResult={handleSelect}
      renderTrigger={(open) => (
        <GameTooltip label="Buscar (⌘K)" side="bottom">
          <button
            type="button"
            onClick={open}
            className="flex h-8 w-8 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
            aria-label="Abrir busca global"
          >
            <Search className="h-4 w-4" />
          </button>
        </GameTooltip>
      )}
    />
  );
}
