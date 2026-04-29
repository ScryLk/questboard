"use client";

// ── Hook: entidades do Mundo via backend ──
//
// Análogo a `useBackendNotes`. View opcional sobre apps/api sem
// substituir o `useWorldStore` local.

import { useCallback, useEffect, useState } from "react";
import {
  createWorldEntity as apiCreate,
  deleteWorldEntity as apiDelete,
  dispoFromDto,
  dispoToDto,
  kindFromDto,
  kindToDto,
  linkCharacterToEntity as apiLink,
  listWorldEntities,
  type WorldEntityDto,
  updateWorldEntity as apiUpdate,
} from "./world-api";
import { isApiError } from "./api-client";

export interface BackendWorldEntity {
  id: string;
  campaignId: string;
  kind: string; // "npc" | "location" | "faction" | "lore"
  name: string;
  subtitle?: string;
  description: string;
  location?: string;
  disposition?: string;
  notes?: string;
  characterId?: string;
  createdAt: string;
  updatedAt: string;
}

function dtoTo(dto: WorldEntityDto): BackendWorldEntity {
  return {
    id: dto.id,
    campaignId: dto.campaignId,
    kind: kindFromDto(dto.kind),
    name: dto.name,
    subtitle: dto.subtitle ?? undefined,
    description: dto.description,
    location: dto.location ?? undefined,
    disposition: dispoFromDto(dto.disposition),
    notes: dto.notes ?? undefined,
    characterId: dto.characterId ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function useBackendWorld(campaignId: string | null) {
  const [entities, setEntities] = useState<BackendWorldEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!campaignId) {
      setEntities([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await listWorldEntities(campaignId);
      setEntities(list.map(dtoTo));
    } catch (err) {
      setError(formatErr(err));
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: {
      kind: string;
      name: string;
      description: string;
      subtitle?: string;
      location?: string;
      disposition?: string;
      notes?: string;
      characterId?: string;
    }) => {
      if (!campaignId) throw new Error("Campanha sem id.");
      const dto = await apiCreate(campaignId, {
        kind: kindToDto(input.kind),
        name: input.name,
        description: input.description,
        subtitle: input.subtitle,
        location: input.location,
        disposition: dispoToDto(input.disposition),
        notes: input.notes,
        characterId: input.characterId,
      });
      setEntities((prev) => [dtoTo(dto), ...prev]);
      return dto.id;
    },
    [campaignId],
  );

  const update = useCallback(
    async (
      id: string,
      input: Partial<{
        name: string;
        description: string;
        subtitle: string;
        location: string;
        disposition: string;
        notes: string;
        characterId: string;
      }>,
    ) => {
      const dto = await apiUpdate(id, {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
        ...(input.location !== undefined ? { location: input.location } : {}),
        ...(input.disposition !== undefined
          ? { disposition: dispoToDto(input.disposition) }
          : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.characterId !== undefined
          ? { characterId: input.characterId }
          : {}),
      });
      setEntities((prev) =>
        prev.map((e) => (e.id === id ? dtoTo(dto) : e)),
      );
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await apiDelete(id);
    setEntities((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const linkCharacter = useCallback(
    async (id: string, characterId: string | null) => {
      const dto = await apiLink(id, characterId);
      setEntities((prev) =>
        prev.map((e) => (e.id === id ? dtoTo(dto) : e)),
      );
    },
    [],
  );

  return {
    entities,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
    linkCharacter,
  };
}

function formatErr(err: unknown): string {
  if (isApiError(err)) return err.message;
  if (err instanceof Error) return err.message;
  return "Erro inesperado.";
}
