"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Skull,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useCharacterStore } from "@/stores/characterStore";
import { GameTooltip } from "@/components/ui/game-tooltip";
import {
  CharacterSidebarFilters,
  type CharacterFilter,
} from "./character-sidebar-filters";
import { CharacterSidebarItem } from "./character-sidebar-item";

export function CharacterSidebarSection() {
  const collapsed = useGameplayStore(
    (s) => s.collapsedSections["characters"],
  );
  const toggleSection = useGameplayStore((s) => s.toggleSection);
  const openModal = useGameplayStore((s) => s.openModal);
  const setCharacterEditorTarget = useGameplayStore(
    (s) => s.setCharacterEditorTarget,
  );
  const tokens = useGameplayStore((s) => s.tokens);

  const characters = useCharacterStore((s) => s.characters);
  const characterTokenMap = useCharacterStore((s) => s.characterTokenMap);

  const [filter, setFilter] = useState<CharacterFilter>({});

  // Resolve which tokens are on the map for each character
  const onMapTokenIds = useMemo(() => {
    const tokenIdSet = new Set(
      tokens.filter((t) => t.onMap).map((t) => t.id),
    );
    const result: Record<string, string[]> = {};
    for (const [charId, tIds] of Object.entries(characterTokenMap)) {
      const alive = tIds.filter((id) => tokenIdSet.has(id));
      if (alive.length > 0) result[charId] = alive;
    }
    return result;
  }, [tokens, characterTokenMap]);

  // Filter characters
  const filteredCharacters = useMemo(() => {
    let result = characters;

    if (filter.search?.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.title?.toLowerCase().includes(q) ?? false) ||
          c.description.toLowerCase().includes(q),
      );
    }
    if (filter.category)
      result = result.filter((c) => c.category === filter.category);
    if (filter.disposition)
      result = result.filter((c) => c.disposition === filter.disposition);
    if (filter.favorite) result = result.filter((c) => c.favorite);
    if (filter.inScene)
      result = result.filter(
        (c) => (onMapTokenIds[c.id]?.length ?? 0) > 0,
      );

    return result.sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, [characters, filter, onMapTokenIds]);

  const onSceneCharacters = filteredCharacters.filter(
    (c) => (onMapTokenIds[c.id]?.length ?? 0) > 0,
  );
  const savedCharacters = filteredCharacters.filter(
    (c) => (onMapTokenIds[c.id]?.length ?? 0) === 0,
  );

  const totalOnScene = characters.filter(
    (c) => (onMapTokenIds[c.id]?.length ?? 0) > 0,
  ).length;

  function handleCreate() {
    setCharacterEditorTarget(null);
    openModal("characterEditor");
  }

  return (
    <div className="border-b border-brand-border">
      {/* Header */}
      <div className="flex items-center transition-colors hover:bg-white/[0.02]">
        <button
          onClick={() => toggleSection("characters")}
          className="flex flex-1 items-center gap-2 px-3 py-2 text-left"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-brand-muted" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-brand-muted" />
          )}
          <Skull className="h-3.5 w-3.5 text-brand-accent" />
          <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-brand-text">
            Personagens
          </span>
          {totalOnScene > 0 && (
            <span className="rounded-full bg-brand-accent/15 px-1.5 py-0.5 text-[9px] tabular-nums text-brand-accent">
              {totalOnScene}
            </span>
          )}
        </button>
        <GameTooltip label="Criar Personagem" side="bottom">
          <button
            onClick={handleCreate}
            className="mr-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg text-brand-muted transition-colors hover:bg-white/10 hover:text-brand-text"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </GameTooltip>
      </div>

      {!collapsed && (
        <div className="pb-2">
          {/* Filters */}
          <CharacterSidebarFilters
            filter={filter}
            onFilterChange={setFilter}
          />

          {/* Character List */}
          {filteredCharacters.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-[10px] text-brand-muted">
                {characters.length === 0
                  ? "Nenhum personagem criado ainda."
                  : "Nenhum personagem encontrado."}
              </p>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto px-1">
              {/* On Scene */}
              {onSceneCharacters.length > 0 && (
                <div>
                  <div className="px-2 pb-0.5 pt-1.5">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-accent">
                      Na Cena ({onSceneCharacters.length})
                    </span>
                  </div>
                  {onSceneCharacters.map((char) => (
                    <CharacterSidebarItem
                      key={char.id}
                      character={char}
                      isOnMap={true}
                      tokenIds={onMapTokenIds[char.id] ?? []}
                    />
                  ))}
                </div>
              )}

              {/* Saved */}
              {savedCharacters.length > 0 && (
                <div>
                  <div className="px-2 pb-0.5 pt-1.5">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-muted">
                      Salvos ({savedCharacters.length})
                    </span>
                  </div>
                  {savedCharacters.map((char) => (
                    <CharacterSidebarItem
                      key={char.id}
                      character={char}
                      isOnMap={false}
                      tokenIds={[]}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
