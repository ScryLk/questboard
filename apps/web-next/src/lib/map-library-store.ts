"use client";

// Map library store — respaldado pelo backend (apps/api/src/modules/
// map-library). Cache local em memória pra UI síncrona; verdade vive
// no Postgres (MapTemplate por campanha).
//
// Padrão idêntico a campaigns/notes/world: hydrate por campanha
// ativa + mutations otimistas com revert em falha.

import { useEffect, useRef } from "react";
import { create } from "zustand";
import type { QuestBoardMap } from "./map-types";
import { parseMapJSON } from "./map-export";
import { generateMapThumbnail } from "./map-thumbnail";
import * as mapLibraryApi from "./map-library-api";

interface MapLibraryState {
  maps: Record<string, QuestBoardMap>;
  /** Campanhas já hidratadas → timestamp ms. Evita refetch curto. */
  hydratedAt: Record<string, number>;

  hydrateMaps: (campaignId: string, maps: QuestBoardMap[]) => void;

  /** Cria mapa via backend. `campaignId` é obrigatório porque o
   *  servidor precisa pra vincular. Retorna o id real (não temp). */
  addMap: (
    campaignId: string,
    data: Omit<QuestBoardMap, "id" | "createdAt" | "updatedAt">,
  ) => Promise<string>;
  updateMap: (id: string, updates: Partial<QuestBoardMap>) => void;
  deleteMap: (id: string) => void;
  duplicateMap: (id: string) => Promise<string | null>;
  importMap: (
    json: string,
    campaignId: string | null,
  ) => Promise<string | null>;
  setMapCollection: (mapId: string, collectionId: string | null) => void;
  reorderMapsInCollection: (collectionId: string, mapIds: string[]) => void;
  clearCollectionFromMaps: (collectionId: string) => void;
}

function pendingId(): string {
  return `map_pending_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useMapLibraryStore = create<MapLibraryState>()((set, get) => ({
  maps: {},
  hydratedAt: {},

  hydrateMaps: (campaignId, fresh) => {
    set((s) => {
      // Substitui apenas os mapas da campanha em questão; preserva
      // outras campanhas + qualquer otimista pending da mesma campanha
      // (pode estar em vôo de POST).
      const next: Record<string, QuestBoardMap> = {};
      for (const [id, m] of Object.entries(s.maps)) {
        if (m.campaignId === campaignId && !id.startsWith("map_pending_")) {
          continue;
        }
        next[id] = m;
      }
      for (const m of fresh) next[m.id] = m;
      return {
        maps: next,
        hydratedAt: { ...s.hydratedAt, [campaignId]: Date.now() },
      };
    });
  },

  addMap: async (campaignId, data) => {
    const tempId = pendingId();
    const now = Date.now();
    const optimistic: QuestBoardMap = {
      ...data,
      id: tempId,
      campaignId,
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ maps: { ...s.maps, [tempId]: optimistic } }));

    try {
      const created = await mapLibraryApi.createMap(campaignId, optimistic);
      set((s) => {
        const { [tempId]: _drop, ...rest } = s.maps;
        return { maps: { ...rest, [created.id]: created } };
      });
      return created.id;
    } catch (err) {
      console.error("[map-library-store] addMap failed", err);
      set((s) => {
        const { [tempId]: _drop, ...rest } = s.maps;
        return { maps: rest };
      });
      throw err;
    }
  },

  updateMap: (id, updates) => {
    const before = get().maps[id];
    if (!before) return;
    const optimistic: QuestBoardMap = {
      ...before,
      ...updates,
      updatedAt: Date.now(),
    };
    set((s) => ({ maps: { ...s.maps, [id]: optimistic } }));
    if (id.startsWith("map_pending_")) return;
    void mapLibraryApi
      .updateMap(id, updates)
      .then((canonical) => {
        set((s) => ({ maps: { ...s.maps, [id]: canonical } }));
      })
      .catch((err) => {
        console.error("[map-library-store] updateMap failed", err);
        set((s) => ({ maps: { ...s.maps, [id]: before } }));
      });
  },

  deleteMap: (id) => {
    const before = get().maps[id];
    if (!before) return;
    set((s) => {
      const { [id]: _drop, ...rest } = s.maps;
      return { maps: rest };
    });
    if (id.startsWith("map_pending_")) return;
    void mapLibraryApi.deleteMap(id).catch((err) => {
      console.error("[map-library-store] deleteMap failed", err);
      set((s) => ({ maps: { ...s.maps, [id]: before } }));
    });
  },

  duplicateMap: async (id) => {
    const original = get().maps[id];
    if (!original || !original.campaignId) return null;
    const { id: _drop, createdAt: _c, updatedAt: _u, ...rest } = original;
    void _drop;
    void _c;
    void _u;
    const copy = {
      ...structuredClone(rest),
      name: `${original.name} (cópia)`,
    };
    return get().addMap(original.campaignId, copy);
  },

  importMap: async (json, campaignId) => {
    const result = parseMapJSON(json);
    if ("error" in result) return null;

    try {
      result.thumbnail = generateMapThumbnail({
        width: result.width,
        height: result.height,
        terrain: result.terrain,
        walls: result.walls,
        objects: result.objects,
      });
    } catch {
      // Thumbnail pode falhar fora do browser; segue sem.
    }

    // Mapa importado pode trazer campaignId; senão usa a ativa.
    const ownerCampaign = result.campaignId ?? campaignId;
    if (!ownerCampaign) return null;

    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = result;
    void _id;
    void _c;
    void _u;
    return get().addMap(ownerCampaign, rest);
  },

  setMapCollection: (mapId, collectionId) => {
    const before = get().maps[mapId];
    if (!before) return;
    // Recalcula `order` localmente pra novos mapas no fim da coleção.
    let nextOrder = 0;
    if (collectionId !== null) {
      const maxOrder = Object.values(get().maps)
        .filter((m) => m.collectionId === collectionId)
        .reduce((max, m) => Math.max(max, m.order ?? 0), 0);
      nextOrder = maxOrder + 1;
    }
    get().updateMap(mapId, { collectionId, order: nextOrder });
  },

  reorderMapsInCollection: (collectionId, mapIds) => {
    // Otimismo local primeiro; depois envia PATCHs em paralelo. Backend
    // não tem endpoint dedicado de reorder — usa updates individuais.
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
    for (let i = 0; i < mapIds.length; i++) {
      const id = mapIds[i];
      if (id.startsWith("map_pending_")) continue;
      const map = get().maps[id];
      if (!map || map.collectionId !== collectionId) continue;
      void mapLibraryApi
        .updateMap(id, { order: i + 1 })
        .catch((err) =>
          console.error("[map-library-store] reorder failed for", id, err),
        );
    }
  },

  clearCollectionFromMaps: (collectionId) => {
    const affected = Object.values(get().maps).filter(
      (m) => m.collectionId === collectionId,
    );
    set((s) => {
      const next: Record<string, QuestBoardMap> = { ...s.maps };
      const now = Date.now();
      for (const m of affected) {
        next[m.id] = { ...m, collectionId: null, order: 0, updatedAt: now };
      }
      return { maps: next };
    });
    for (const m of affected) {
      if (m.id.startsWith("map_pending_")) continue;
      void mapLibraryApi
        .updateMap(m.id, { collectionId: null, order: 0 })
        .catch((err) =>
          console.error(
            "[map-library-store] clearCollection failed for",
            m.id,
            err,
          ),
        );
    }
  },
}));

/** Hidrata mapas da campanha quando o componente monta. Throttle 5s. */
export function useHydrateMapLibrary(campaignId: string | null): void {
  const hydrate = useMapLibraryStore((s) => s.hydrateMaps);
  const lastRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!campaignId) return;
    let cancelled = false;
    const last = lastRef.current[campaignId] ?? 0;
    if (Date.now() - last < 5_000) return;
    lastRef.current[campaignId] = Date.now();

    void mapLibraryApi
      .listMapsForCampaign(campaignId)
      .then((maps) => {
        if (cancelled) return;
        hydrate(campaignId, maps);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[map-library-store] hydrate failed", err);
      });

    return () => {
      cancelled = true;
    };
  }, [campaignId, hydrate]);
}
