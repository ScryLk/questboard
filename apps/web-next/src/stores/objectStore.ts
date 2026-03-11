import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CampaignObject, MapObjectInstance } from "@/types/object";
import { MOCK_OBJECTS, MOCK_MAP_OBJECT_INSTANCES } from "@/lib/object-mock-data";

function generateId(): string {
  return `obj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function generateInstanceId(): string {
  return `inst_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

const SPRITE_COLORS = [
  "#6C5CE7",
  "#FF4444",
  "#00B894",
  "#FDCB6E",
  "#74B9FF",
  "#E17055",
  "#A0522D",
  "#6B7280",
];

export function createDefaultObject(
  partial?: Partial<CampaignObject>,
): CampaignObject {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: "",
    description: "",
    category: "scenery",
    rarity: "comum",
    tags: [],
    spriteUrl: null,
    spriteGeneratedByAI: false,
    spriteEmoji: "📦",
    spriteColor:
      SPRITE_COLORS[Math.floor(Math.random() * SPRITE_COLORS.length)],
    blocking: false,
    isConsumable: false,
    interactionEnabled: false,
    interactionEffects: [],
    widthCells: 1,
    heightCells: 1,
    campaignId: "campaign-1",
    isPublic: false,
    favorite: false,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

// ── Store ─────────────────────────────────────────────────────

interface ObjectStoreState {
  objects: CampaignObject[];
  mapInstances: MapObjectInstance[];

  // CRUD
  createObject: (obj: CampaignObject) => void;
  updateObject: (id: string, updates: Partial<CampaignObject>) => void;
  deleteObject: (id: string) => void;
  duplicateObject: (id: string) => CampaignObject;
  toggleFavorite: (id: string) => void;

  // Map instances
  placeOnMap: (
    objectId: string,
    mapId: string,
    col: number,
    row: number,
  ) => MapObjectInstance;
  removeInstance: (instanceId: string) => void;
  updateInstance: (
    instanceId: string,
    updates: Partial<MapObjectInstance>,
  ) => void;
  getInstancesForMap: (mapId: string) => MapObjectInstance[];

  // Helpers
  getObjectById: (id: string) => CampaignObject | undefined;
}

export const useObjectStore = create<ObjectStoreState>()(
  persist(
    (set, get) => ({
      objects: MOCK_OBJECTS,
      mapInstances: MOCK_MAP_OBJECT_INSTANCES,

      createObject: (obj) =>
        set((s) => ({
          objects: [obj, ...s.objects],
        })),

      updateObject: (id, updates) =>
        set((s) => ({
          objects: s.objects.map((o) =>
            o.id === id
              ? { ...o, ...updates, updatedAt: new Date().toISOString() }
              : o,
          ),
        })),

      deleteObject: (id) =>
        set((s) => ({
          objects: s.objects.filter((o) => o.id !== id),
          mapInstances: s.mapInstances.filter((i) => i.objectId !== id),
        })),

      duplicateObject: (id) => {
        const original = get().objects.find((o) => o.id === id);
        if (!original) return createDefaultObject();
        const now = new Date().toISOString();
        const copy: CampaignObject = {
          ...original,
          id: generateId(),
          name: `${original.name} (cópia)`,
          favorite: false,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ objects: [copy, ...s.objects] }));
        return copy;
      },

      toggleFavorite: (id) =>
        set((s) => ({
          objects: s.objects.map((o) =>
            o.id === id ? { ...o, favorite: !o.favorite } : o,
          ),
        })),

      placeOnMap: (objectId, mapId, col, row) => {
        const instance: MapObjectInstance = {
          id: generateInstanceId(),
          objectId,
          mapId,
          col,
          row,
          rotation: 0,
          scale: 1,
          visible: true,
        };
        set((s) => ({
          mapInstances: [...s.mapInstances, instance],
        }));
        return instance;
      },

      removeInstance: (instanceId) =>
        set((s) => ({
          mapInstances: s.mapInstances.filter((i) => i.id !== instanceId),
        })),

      updateInstance: (instanceId, updates) =>
        set((s) => ({
          mapInstances: s.mapInstances.map((i) =>
            i.id === instanceId ? { ...i, ...updates } : i,
          ),
        })),

      getInstancesForMap: (mapId) => {
        return get().mapInstances.filter((i) => i.mapId === mapId);
      },

      getObjectById: (id) => {
        return get().objects.find((o) => o.id === id);
      },
    }),
    {
      name: "questboard-objects",
    },
  ),
);
