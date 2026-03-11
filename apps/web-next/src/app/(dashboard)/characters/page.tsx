"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Star } from "lucide-react";
import {
  useCharacterStore,
  createDefaultCharacter,
} from "@/stores/characterStore";
import { useGameplayStore } from "@/lib/gameplay-store";
import { CharacterCard } from "@/components/characters/character-card";
import { CharacterEditorModal } from "@/components/gameplay/modals/character-editor/character-editor-modal";
import type { CharacterCategory } from "@/types/character";
import { CHAR_CATEGORY_CONFIG } from "@/types/character";

type CategoryFilter = CharacterCategory | "all";

export default function CharactersPage() {
  const characters = useCharacterStore((s) => s.characters);
  const deleteCharacter = useCharacterStore((s) => s.deleteCharacter);
  const duplicateCharacter = useCharacterStore((s) => s.duplicateCharacter);
  const toggleFavorite = useCharacterStore((s) => s.toggleFavorite);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const setCharacterEditorTarget = useGameplayStore(
    (s) => s.setCharacterEditorTarget,
  );

  function openEditor(id: string | null) {
    setCharacterEditorTarget(id);
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setCharacterEditorTarget(null);
  }

  const filteredCharacters = useMemo(() => {
    let list = characters;

    if (categoryFilter !== "all") {
      list = list.filter((c) => c.category === categoryFilter);
    }

    if (favoritesOnly) {
      list = list.filter((c) => c.favorite);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.title?.toLowerCase().includes(q) ?? false),
      );
    }

    return [...list].sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, [characters, categoryFilter, search, favoritesOnly]);

  const npcCount = characters.filter((c) => c.category === "npc").length;
  const creatureCount = characters.filter(
    (c) => c.category === "creature",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">
            Personagens da Campanha
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {characters.length} personagens · {npcCount} NPCs · {creatureCount}{" "}
            criaturas
          </p>
        </div>
        <button
          onClick={() => openEditor(null)}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-accent/80"
        >
          <Plus className="h-4 w-4" />
          Novo Personagem
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-brand-border p-0.5">
          {(
            [
              { key: "all", label: "Todos" },
              { key: "npc", label: CHAR_CATEGORY_CONFIG.npc.label },
              { key: "creature", label: CHAR_CATEGORY_CONFIG.creature.label },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                categoryFilter === key
                  ? "bg-brand-accent/15 text-brand-accent"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar personagens..."
            className="h-9 w-full max-w-xs rounded-lg border border-brand-border bg-brand-primary pl-9 pr-3 text-sm text-brand-text placeholder:text-brand-muted/60 focus:border-brand-accent focus:outline-none"
          />
        </div>

        <button
          onClick={() => setFavoritesOnly((v) => !v)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            favoritesOnly
              ? "border-[#FDCB6E]/30 bg-[#FDCB6E]/10 text-[#FDCB6E]"
              : "border-brand-border text-brand-muted hover:text-brand-text"
          }`}
        >
          <Star
            className={`h-3 w-3 ${favoritesOnly ? "fill-[#FDCB6E]" : ""}`}
          />
          Favoritos
        </button>
      </div>

      {/* Grid */}
      {filteredCharacters.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {filteredCharacters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              onEdit={(id) => openEditor(id)}
              onDuplicate={duplicateCharacter}
              onDelete={deleteCharacter}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-brand-border">
          <p className="text-sm text-brand-muted">
            {search.trim()
              ? "Nenhum personagem encontrado"
              : "Nenhum personagem criado ainda"}
          </p>
        </div>
      )}

      {/* Editor Modal */}
      {editorOpen && <CharacterEditorModal onClose={closeEditor} />}
    </div>
  );
}
