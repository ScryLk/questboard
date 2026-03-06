"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useNPCStore } from "@/lib/npc-store";
import type { NPCFilter } from "@/lib/npc-types";
import { NPCSidebarFilters } from "./npc-sidebar-filters";
import { NPCSidebarItem } from "./npc-sidebar-item";

export function NPCSidebarSection() {
  const collapsed = useGameplayStore((s) => s.collapsedSections["npcs"]);
  const toggleSection = useGameplayStore((s) => s.toggleSection);
  const openModal = useGameplayStore((s) => s.openModal);
  const setNpcEditorTarget = useGameplayStore((s) => s.setNpcEditorTarget);
  const tokens = useGameplayStore((s) => s.tokens);

  const npcs = useNPCStore((s) => s.npcs);
  const npcTokenMap = useNPCStore((s) => s.npcTokenMap);

  const [filter, setFilter] = useState<NPCFilter>({});

  // Resolve which tokens are actually on the map for each NPC
  const onMapTokenIds = useMemo(() => {
    const tokenIdSet = new Set(tokens.filter((t) => t.onMap).map((t) => t.id));
    const result: Record<string, string[]> = {};
    for (const [npcId, tIds] of Object.entries(npcTokenMap)) {
      const alive = tIds.filter((id) => tokenIdSet.has(id));
      if (alive.length > 0) result[npcId] = alive;
    }
    return result;
  }, [tokens, npcTokenMap]);

  // Filter NPCs
  const filteredNPCs = useMemo(() => {
    let result = npcs.filter((n) => !n.archived);

    if (filter.search?.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.title.toLowerCase().includes(q) ||
          n.race.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (filter.type) result = result.filter((n) => n.type === filter.type);
    if (filter.favorite) result = result.filter((n) => n.favorite);
    if (filter.hasAI) result = result.filter((n) => n.aiEnabled);
    if (filter.inScene)
      result = result.filter((n) => (onMapTokenIds[n.id]?.length ?? 0) > 0);

    // Sort: favorites first, then alphabetical
    return result.sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, [npcs, filter, onMapTokenIds]);

  const onSceneNPCs = filteredNPCs.filter(
    (n) => (onMapTokenIds[n.id]?.length ?? 0) > 0,
  );
  const savedNPCs = filteredNPCs.filter(
    (n) => (onMapTokenIds[n.id]?.length ?? 0) === 0,
  );

  const totalOnScene = npcs.filter(
    (n) => !n.archived && (onMapTokenIds[n.id]?.length ?? 0) > 0,
  ).length;

  function handleCreate() {
    setNpcEditorTarget(null);
    openModal("npcEditor");
  }

  return (
    <div className="border-b border-brand-border">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => toggleSection("npcs")}
          className="flex flex-1 items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-white/[0.02]"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-brand-muted" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-brand-muted" />
          )}
          <Users className="h-3.5 w-3.5 text-brand-accent" />
          <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-brand-text">
            NPCs
          </span>
          {totalOnScene > 0 && (
            <span className="rounded-full bg-brand-accent/15 px-1.5 py-0.5 text-[9px] tabular-nums text-brand-accent">
              {totalOnScene}
            </span>
          )}
        </button>
        <button
          onClick={handleCreate}
          title="Criar NPC"
          className="mr-2 flex h-5 w-5 items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {!collapsed && (
        <div className="pb-2">
          {/* Filters */}
          <NPCSidebarFilters filter={filter} onFilterChange={setFilter} />

          {/* NPC List */}
          {filteredNPCs.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-[10px] text-brand-muted">
                {npcs.length === 0
                  ? "Nenhum NPC criado ainda."
                  : "Nenhum NPC encontrado."}
              </p>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto px-1">
              {/* On Scene */}
              {onSceneNPCs.length > 0 && (
                <div>
                  <div className="px-2 pb-0.5 pt-1.5">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-accent">
                      Na Cena ({onSceneNPCs.length})
                    </span>
                  </div>
                  {onSceneNPCs.map((npc) => (
                    <NPCSidebarItem
                      key={npc.id}
                      npc={npc}
                      isOnMap={true}
                      tokenIds={onMapTokenIds[npc.id] ?? []}
                    />
                  ))}
                </div>
              )}

              {/* Saved */}
              {savedNPCs.length > 0 && (
                <div>
                  <div className="px-2 pb-0.5 pt-1.5">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-muted">
                      Salvos ({savedNPCs.length})
                    </span>
                  </div>
                  {savedNPCs.map((npc) => (
                    <NPCSidebarItem
                      key={npc.id}
                      npc={npc}
                      isOnMap={false}
                      tokenIds={[]}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom actions */}
          <div className="mt-1.5 flex gap-1.5 px-2">
            <button
              onClick={() => openModal("creatureCompendium")}
              className="flex flex-1 items-center justify-center gap-1 rounded-md border border-brand-border py-1 text-[10px] text-brand-muted transition-colors hover:bg-white/[0.03] hover:text-brand-text"
            >
              <BookOpen className="h-3 w-3" />
              Compendio
            </button>
            <button
              onClick={() => openModal("creatureCompendium")}
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-brand-accent/10 py-1 text-[10px] text-brand-accent transition-colors hover:bg-brand-accent/20"
            >
              <Sparkles className="h-3 w-3" />
              Criar com IA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
