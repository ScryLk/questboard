import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MapCollection } from "./map-types";

interface MapCollectionsState {
  collections: Record<string, MapCollection>;

  createCollection: (input: { name: string; description?: string }) => { id: string } | { error: string };
  updateCollection: (
    id: string,
    updates: { name?: string; description?: string | null; coverMapId?: string | null },
  ) => { ok: true } | { error: string };
  deleteCollection: (id: string) => void;
  getByName: (name: string) => MapCollection | undefined;
}

function generateId(): string {
  return `col_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export const useMapCollectionsStore = create<MapCollectionsState>()(
  persist(
    (set, get) => ({
      collections: {},

      createCollection: ({ name, description }) => {
        const trimmed = name.trim();
        if (!trimmed) return { error: "Nome é obrigatório." };
        if (trimmed.length > 60) return { error: "Máximo de 60 caracteres." };

        const existing = get().getByName(trimmed);
        if (existing) {
          return { error: "Já existe uma coleção com esse nome." };
        }

        const id = generateId();
        const now = Date.now();
        const collection: MapCollection = {
          id,
          name: trimmed,
          description: description?.trim() || null,
          coverMapId: null,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ collections: { ...s.collections, [id]: collection } }));
        return { id };
      },

      updateCollection: (id, updates) => {
        const current = get().collections[id];
        if (!current) return { error: "Coleção não encontrada." };

        if (updates.name !== undefined) {
          const trimmed = updates.name.trim();
          if (!trimmed) return { error: "Nome é obrigatório." };
          if (trimmed.length > 60) return { error: "Máximo de 60 caracteres." };

          const normalized = normalizeName(trimmed);
          const duplicate = Object.values(get().collections).find(
            (c) => c.id !== id && normalizeName(c.name) === normalized,
          );
          if (duplicate) return { error: "Já existe uma coleção com esse nome." };
        }

        set((s) => ({
          collections: {
            ...s.collections,
            [id]: {
              ...current,
              ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
              ...(updates.description !== undefined
                ? { description: updates.description?.trim() || null }
                : {}),
              ...(updates.coverMapId !== undefined ? { coverMapId: updates.coverMapId } : {}),
              updatedAt: Date.now(),
            },
          },
        }));
        return { ok: true };
      },

      deleteCollection: (id) => {
        set((s) => {
          const { [id]: _, ...rest } = s.collections;
          return { collections: rest };
        });
      },

      getByName: (name) => {
        const normalized = normalizeName(name);
        return Object.values(get().collections).find(
          (c) => normalizeName(c.name) === normalized,
        );
      },
    }),
    {
      name: "questboard-map-collections",
      version: 1,
      partialize: (state) => ({ collections: state.collections }),
    },
  ),
);
