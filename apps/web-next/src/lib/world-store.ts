"use client";

// World store — respaldado pelo backend (apps/api/src/modules/world).
// Mesma arquitetura do notes-store: cache local pra UI síncrona,
// mutations chamam REST em background com revert em caso de falha.

import { useEffect, useRef } from "react";
import { create } from "zustand";
import * as worldApi from "./world-api";
import type { WorldEntityDto } from "./world-api";

export type WorldEntityKind = "npc" | "location" | "faction" | "lore";

export type Disposition = "friendly" | "neutral" | "hostile" | "unknown";

export interface WorldEntity {
  id: string;
  campaignId: string;
  kind: WorldEntityKind;
  name: string;
  description: string;
  subtitle?: string;
  location?: string;
  disposition?: Disposition;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface WorldState {
  entities: WorldEntity[];

  hydrateEntities: (campaignId: string, dtos: WorldEntityDto[]) => void;
  createEntity: (
    e: Omit<WorldEntity, "id" | "createdAt" | "updatedAt">,
  ) => WorldEntity;
  updateEntity: (
    id: string,
    updates: Partial<
      Omit<WorldEntity, "id" | "createdAt" | "campaignId" | "kind">
    >,
  ) => void;
  deleteEntity: (id: string) => void;
}

function dtoToEntity(dto: WorldEntityDto): WorldEntity {
  return {
    id: dto.id,
    campaignId: dto.campaignId,
    kind: worldApi.kindFromDto(dto.kind) as WorldEntityKind,
    name: dto.name,
    description: dto.description,
    subtitle: dto.subtitle ?? undefined,
    location: dto.location ?? undefined,
    disposition:
      (worldApi.dispoFromDto(dto.disposition) as Disposition | undefined) ??
      undefined,
    notes: dto.notes ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function pendingId(): string {
  return `world_pending_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export const useWorldStore = create<WorldState>()((set, get) => ({
  entities: [],

  hydrateEntities: (campaignId, dtos) => {
    const fresh = dtos.map(dtoToEntity);
    set((s) => {
      const other = s.entities.filter(
        (e) =>
          e.campaignId !== campaignId || e.id.startsWith("world_pending_"),
      );
      return { entities: [...fresh, ...other] };
    });
  },

  createEntity: (entity) => {
    const now = new Date().toISOString();
    const optimistic: WorldEntity = {
      ...entity,
      id: pendingId(),
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ entities: [optimistic, ...s.entities] }));

    void worldApi
      .createWorldEntity(entity.campaignId, {
        kind: worldApi.kindToDto(entity.kind),
        name: entity.name,
        description: entity.description,
        subtitle: entity.subtitle,
        location: entity.location,
        disposition: worldApi.dispoToDto(entity.disposition),
        notes: entity.notes,
      })
      .then((dto) => {
        const real = dtoToEntity(dto);
        set((s) => ({
          entities: s.entities.map((e) => (e.id === optimistic.id ? real : e)),
        }));
      })
      .catch((err) => {
        console.error("[world-store] createEntity failed", err);
        set((s) => ({
          entities: s.entities.filter((e) => e.id !== optimistic.id),
        }));
      });

    return optimistic;
  },

  updateEntity: (id, updates) => {
    const before = get().entities.find((e) => e.id === id);
    if (!before) return;
    set((s) => ({
      entities: s.entities.map((e) =>
        e.id === id
          ? { ...e, ...updates, updatedAt: new Date().toISOString() }
          : e,
      ),
    }));
    if (id.startsWith("world_pending_")) return;
    void worldApi
      .updateWorldEntity(id, {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.description !== undefined
          ? { description: updates.description }
          : {}),
        ...(updates.subtitle !== undefined
          ? { subtitle: updates.subtitle }
          : {}),
        ...(updates.location !== undefined
          ? { location: updates.location }
          : {}),
        ...(updates.disposition !== undefined
          ? { disposition: worldApi.dispoToDto(updates.disposition) }
          : {}),
        ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
      })
      .then((dto) => {
        const real = dtoToEntity(dto);
        set((s) => ({
          entities: s.entities.map((e) => (e.id === id ? real : e)),
        }));
      })
      .catch((err) => {
        console.error("[world-store] updateEntity failed", err);
        set((s) => ({
          entities: s.entities.map((e) => (e.id === id ? before : e)),
        }));
      });
  },

  deleteEntity: (id) => {
    const before = get().entities.find((e) => e.id === id);
    if (!before) return;
    set((s) => ({ entities: s.entities.filter((e) => e.id !== id) }));
    if (id.startsWith("world_pending_")) return;
    void worldApi.deleteWorldEntity(id).catch((err) => {
      console.error("[world-store] deleteEntity failed", err);
      set((s) => ({ entities: [before, ...s.entities] }));
    });
  },
}));

/** Hidrata entidades da campanha ativa. Mesmo padrão de useHydrateNotes. */
export function useHydrateWorld(campaignId: string | null): void {
  const hydrate = useWorldStore((s) => s.hydrateEntities);
  const lastRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!campaignId) return;
    let cancelled = false;
    const last = lastRef.current[campaignId] ?? 0;
    if (Date.now() - last < 5_000) return;
    lastRef.current[campaignId] = Date.now();

    void worldApi
      .listWorldEntities(campaignId)
      .then((dtos) => {
        if (cancelled) return;
        hydrate(campaignId, dtos);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[world-store] hydrate failed", err);
      });

    return () => {
      cancelled = true;
    };
  }, [campaignId, hydrate]);
}

// ── Labels & helpers ──

export const WORLD_KIND_LABELS: Record<WorldEntityKind, string> = {
  npc: "NPCs",
  location: "Locais",
  faction: "Facções",
  lore: "Lore",
};

export const WORLD_KIND_SINGULAR: Record<WorldEntityKind, string> = {
  npc: "NPC",
  location: "Local",
  faction: "Facção",
  lore: "Entrada de Lore",
};

export const DISPOSITION_LABELS: Record<Disposition, string> = {
  friendly: "Amigável",
  neutral: "Neutro",
  hostile: "Hostil",
  unknown: "Desconhecido",
};

export const DISPOSITION_COLORS: Record<Disposition, string> = {
  friendly: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  neutral: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  hostile: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  unknown: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};
