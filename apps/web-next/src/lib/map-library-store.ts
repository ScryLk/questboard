import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuestBoardMap } from "./map-types";
import { migrateSavedMap } from "./map-types";
import { parseMapJSON } from "./map-export";
import { generateMapThumbnail } from "./map-thumbnail";
import type { SavedMap } from "./map-storage";

// ── Types ──

interface MapLibraryState {
  maps: Record<string, QuestBoardMap>;
  _migrated: boolean;

  addMap: (data: Omit<QuestBoardMap, "id" | "createdAt" | "updatedAt">) => string;
  updateMap: (id: string, updates: Partial<QuestBoardMap>) => void;
  deleteMap: (id: string) => void;
  duplicateMap: (id: string) => string | null;
  importMap: (json: string) => string | null;
  migrateFromLegacy: () => void;
}

function generateId(): string {
  return `map_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Store ──

export const useMapLibraryStore = create<MapLibraryState>()(
  persist(
    (set, get) => ({
      maps: {},
      _migrated: false,

      addMap: (data) => {
        const id = generateId();
        const now = Date.now();
        const map: QuestBoardMap = {
          ...data,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ maps: { ...s.maps, [id]: map } }));
        return id;
      },

      updateMap: (id, updates) => {
        set((s) => {
          const existing = s.maps[id];
          if (!existing) return s;
          return {
            maps: {
              ...s.maps,
              [id]: { ...existing, ...updates, updatedAt: Date.now() },
            },
          };
        });
      },

      deleteMap: (id) => {
        set((s) => {
          const { [id]: _, ...rest } = s.maps;
          return { maps: rest };
        });
      },

      duplicateMap: (id) => {
        const original = get().maps[id];
        if (!original) return null;
        const newId = generateId();
        const now = Date.now();
        const duplicate: QuestBoardMap = {
          ...structuredClone(original),
          id: newId,
          name: `${original.name} (cópia)`,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ maps: { ...s.maps, [newId]: duplicate } }));
        return newId;
      },

      importMap: (json) => {
        const result = parseMapJSON(json);
        if ("error" in result) return null;

        // Generate thumbnail for imported map
        try {
          result.thumbnail = generateMapThumbnail({
            width: result.width,
            height: result.height,
            terrain: result.terrain,
            walls: result.walls,
            objects: result.objects,
          });
        } catch {
          // Thumbnail generation might fail in non-browser contexts
        }

        const id = get().addMap(result);
        return id;
      },

      migrateFromLegacy: () => {
        if (get()._migrated) return;

        try {
          const raw = localStorage.getItem("questboard_saved_maps");
          if (!raw) {
            set({ _migrated: true });
            return;
          }

          const oldMaps = JSON.parse(raw) as SavedMap[];
          if (!Array.isArray(oldMaps) || oldMaps.length === 0) {
            set({ _migrated: true });
            return;
          }

          const newMaps: Record<string, QuestBoardMap> = { ...get().maps };
          for (const old of oldMaps) {
            const migrated = migrateSavedMap(old);

            // Generate thumbnail
            try {
              migrated.thumbnail = generateMapThumbnail({
                width: migrated.width,
                height: migrated.height,
                terrain: migrated.terrain,
                walls: migrated.walls,
                objects: migrated.objects,
              });
            } catch {
              // Ignore thumbnail errors during migration
            }

            newMaps[migrated.id] = migrated;
          }

          set({ maps: newMaps, _migrated: true });
        } catch {
          // Migration failed, mark as done anyway to avoid retry loops
          set({ _migrated: true });
        }
      },
    }),
    {
      name: "questboard-maps",
      version: 1,
      partialize: (state) => ({
        maps: state.maps,
        _migrated: state._migrated,
      }),
    },
  ),
);
