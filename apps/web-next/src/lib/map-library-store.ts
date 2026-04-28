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
  /** Importa o mapa do JSON. `campaignId` define o dono — geralmente
   *  a campanha ativa do dashboard. Mapas sem campanha (null) ficam
   *  invisíveis em /maps até serem re-associados. */
  importMap: (json: string, campaignId: string | null) => string | null;
  migrateFromLegacy: () => void;
  setMapCollection: (mapId: string, collectionId: string | null) => void;
  reorderMapsInCollection: (collectionId: string, mapIds: string[]) => void;
  clearCollectionFromMaps: (collectionId: string) => void;
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

      importMap: (json, campaignId) => {
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

        // JSON importado pode não trazer campaignId — usa a campanha ativa
        // como dona. Se o JSON já trouxer o campo, respeita.
        const id = get().addMap({
          ...result,
          campaignId: result.campaignId ?? campaignId,
        });
        return id;
      },

      setMapCollection: (mapId, collectionId) => {
        set((s) => {
          const existing = s.maps[mapId];
          if (!existing) return s;
          let nextOrder = 0;
          if (collectionId !== null) {
            const maxOrder = Object.values(s.maps)
              .filter((m) => m.collectionId === collectionId)
              .reduce((max, m) => Math.max(max, m.order ?? 0), 0);
            nextOrder = maxOrder + 1;
          }
          return {
            maps: {
              ...s.maps,
              [mapId]: {
                ...existing,
                collectionId,
                order: nextOrder,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      reorderMapsInCollection: (collectionId, mapIds) => {
        set((s) => {
          const next: Record<string, QuestBoardMap> = { ...s.maps };
          const now = Date.now();
          for (let i = 0; i < mapIds.length; i++) {
            const id = mapIds[i];
            const map = s.maps[id];
            if (!map || map.collectionId !== collectionId) continue;
            next[id] = { ...map, order: i + 1, updatedAt: now };
          }
          return { maps: next };
        });
      },

      clearCollectionFromMaps: (collectionId) => {
        set((s) => {
          const next: Record<string, QuestBoardMap> = { ...s.maps };
          const now = Date.now();
          for (const [id, map] of Object.entries(s.maps)) {
            if (map.collectionId === collectionId) {
              next[id] = { ...map, collectionId: null, order: 0, updatedAt: now };
            }
          }
          return { maps: next };
        });
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
      version: 3,
      partialize: (state) => ({
        maps: state.maps,
        _migrated: state._migrated,
      }),
      migrate: (persisted, fromVersion) => {
        const state = persisted as
          | { maps?: Record<string, Partial<QuestBoardMap>>; _migrated?: boolean }
          | undefined;
        if (!state || !state.maps) return persisted;
        let maps = state.maps;
        if (fromVersion < 2) {
          const upgraded: Record<string, Partial<QuestBoardMap>> = {};
          for (const [id, map] of Object.entries(maps)) {
            upgraded[id] = {
              ...map,
              collectionId: map.collectionId ?? null,
              order: map.order ?? 0,
            };
          }
          maps = upgraded;
        }
        if (fromVersion < 3) {
          // Mapas pré-fatia ficam órfãos (campaignId=null). Não tentamos
          // adivinhar a campanha — usuário re-associa pela UI quando precisar.
          const withCampaign: Record<string, QuestBoardMap> = {};
          for (const [id, map] of Object.entries(maps)) {
            withCampaign[id] = {
              ...(map as QuestBoardMap),
              campaignId: (map as QuestBoardMap).campaignId ?? null,
            };
          }
          return { ...state, maps: withCampaign };
        }
        return { ...state, maps };
      },
    },
  ),
);
