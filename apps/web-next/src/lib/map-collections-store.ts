"use client";

// Map collections store — respaldado pelo backend (apps/api/src/modules/
// map-library). Mesmo padrão de map-library-store. As coleções são
// escopadas por campanha; o cache é um Record<id, MapCollection>.

import { useEffect, useRef } from "react";
import { create } from "zustand";
import type { MapCollection } from "./map-types";
import * as mapLibraryApi from "./map-library-api";

interface MapCollectionsState {
  collections: Record<string, MapCollection>;
  /** Campanha → ts ms do último fetch. */
  hydratedAt: Record<string, number>;
  /** Map<collectionId, campaignId> — backend devolve campaignId no DTO,
   *  mas a `MapCollection` da UI não carrega esse campo. Mantemos aqui
   *  pra updates conseguirem manter o escopo. */
  campaignById: Record<string, string>;

  hydrateCollections: (
    campaignId: string,
    cols: Array<MapCollection & { campaignId: string }>,
  ) => void;

  /** `campaignId` é obrigatório (necessário pro POST do backend). */
  createCollection: (
    campaignId: string,
    input: { name: string; description?: string },
  ) => Promise<{ id: string } | { error: string }>;
  updateCollection: (
    id: string,
    updates: { name?: string; description?: string | null; coverMapId?: string | null },
  ) => Promise<{ ok: true } | { error: string }>;
  deleteCollection: (id: string) => void;
  getByName: (campaignId: string, name: string) => MapCollection | undefined;
}

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

export const useMapCollectionsStore = create<MapCollectionsState>()(
  (set, get) => ({
    collections: {},
    hydratedAt: {},
    campaignById: {},

    hydrateCollections: (campaignId, fresh) => {
      set((s) => {
        // Remove coleções desta campanha do cache antes de inserir as novas.
        const nextCollections: Record<string, MapCollection> = {};
        const nextCampaigns: Record<string, string> = {};
        for (const [id, col] of Object.entries(s.collections)) {
          if (s.campaignById[id] === campaignId) continue;
          nextCollections[id] = col;
          if (s.campaignById[id]) {
            nextCampaigns[id] = s.campaignById[id];
          }
        }
        for (const dto of fresh) {
          const { campaignId: cid, ...col } = dto;
          nextCollections[col.id] = col;
          nextCampaigns[col.id] = cid;
        }
        return {
          collections: nextCollections,
          campaignById: nextCampaigns,
          hydratedAt: { ...s.hydratedAt, [campaignId]: Date.now() },
        };
      });
    },

    createCollection: async (campaignId, { name, description }) => {
      const trimmed = name.trim();
      if (!trimmed) return { error: "Nome é obrigatório." };
      if (trimmed.length > 60) return { error: "Máximo de 60 caracteres." };

      const existing = get().getByName(campaignId, trimmed);
      if (existing) {
        return { error: "Já existe uma coleção com esse nome." };
      }

      try {
        const col = await mapLibraryApi.createCollection(campaignId, {
          name: trimmed,
          description: description?.trim(),
        });
        set((s) => ({
          collections: { ...s.collections, [col.id]: col },
          campaignById: { ...s.campaignById, [col.id]: campaignId },
        }));
        return { id: col.id };
      } catch (err) {
        console.error("[map-collections-store] createCollection failed", err);
        return {
          error:
            (err as { message?: string }).message ?? "Falha ao criar coleção.",
        };
      }
    },

    updateCollection: async (id, updates) => {
      const before = get().collections[id];
      if (!before) return { error: "Coleção não encontrada." };

      if (updates.name !== undefined) {
        const trimmed = updates.name.trim();
        if (!trimmed) return { error: "Nome é obrigatório." };
        if (trimmed.length > 60) return { error: "Máximo de 60 caracteres." };
        const campaignId = get().campaignById[id];
        if (campaignId) {
          const duplicate = Object.entries(get().collections).find(
            ([otherId, c]) =>
              otherId !== id &&
              get().campaignById[otherId] === campaignId &&
              normalize(c.name) === normalize(trimmed),
          );
          if (duplicate) return { error: "Já existe uma coleção com esse nome." };
        }
      }

      // Otimismo local
      set((s) => ({
        collections: {
          ...s.collections,
          [id]: {
            ...before,
            ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
            ...(updates.description !== undefined
              ? { description: updates.description?.trim() || null }
              : {}),
            ...(updates.coverMapId !== undefined
              ? { coverMapId: updates.coverMapId }
              : {}),
            updatedAt: Date.now(),
          },
        },
      }));

      try {
        const canonical = await mapLibraryApi.updateCollection(id, updates);
        set((s) => ({
          collections: { ...s.collections, [id]: canonical },
        }));
        return { ok: true };
      } catch (err) {
        console.error("[map-collections-store] updateCollection failed", err);
        set((s) => ({ collections: { ...s.collections, [id]: before } }));
        return {
          error:
            (err as { message?: string }).message ?? "Falha ao atualizar.",
        };
      }
    },

    deleteCollection: (id) => {
      const before = get().collections[id];
      const campaign = get().campaignById[id];
      if (!before) return;
      set((s) => {
        const { [id]: _drop, ...rest } = s.collections;
        const { [id]: _drop2, ...restCampaigns } = s.campaignById;
        return { collections: rest, campaignById: restCampaigns };
      });
      void mapLibraryApi.deleteCollection(id).catch((err) => {
        console.error("[map-collections-store] deleteCollection failed", err);
        set((s) => ({
          collections: { ...s.collections, [id]: before },
          campaignById: campaign
            ? { ...s.campaignById, [id]: campaign }
            : s.campaignById,
        }));
      });
    },

    getByName: (campaignId, name) => {
      const norm = normalize(name);
      const ids = Object.entries(get().campaignById)
        .filter(([, c]) => c === campaignId)
        .map(([id]) => id);
      for (const id of ids) {
        const col = get().collections[id];
        if (col && normalize(col.name) === norm) return col;
      }
      return undefined;
    },
  }),
);

/** Hidrata coleções da campanha quando o componente monta. */
export function useHydrateMapCollections(campaignId: string | null): void {
  const hydrate = useMapCollectionsStore((s) => s.hydrateCollections);
  const lastRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!campaignId) return;
    let cancelled = false;
    const last = lastRef.current[campaignId] ?? 0;
    if (Date.now() - last < 5_000) return;
    lastRef.current[campaignId] = Date.now();

    void mapLibraryApi
      .listCollectionsForCampaign(campaignId)
      .then((cols) => {
        if (cancelled) return;
        // O backend devolve campaignId no DTO; passamos junto pra o
        // store associar.
        const withCampaign = cols.map((c) => ({ ...c, campaignId }));
        hydrate(campaignId, withCampaign);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[map-collections-store] hydrate failed", err);
      });

    return () => {
      cancelled = true;
    };
  }, [campaignId, hydrate]);
}
