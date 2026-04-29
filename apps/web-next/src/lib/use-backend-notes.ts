"use client";

// ── Hook: notas vindas do backend (apps/api) ──
//
// View opcional sobre o backend, sem tocar no `useNotesStore` local
// (que continua funcional em dev offline). Página de notas pode
// chamar `useBackendNotes(campaignId)` quando o usuário tem token
// Clerk válido — a UI fica idêntica, só a fonte de dados muda.
//
// Não usa SWR/React Query pra não introduzir dep nova; refresh manual.

import { useCallback, useEffect, useState } from "react";
import {
  categoryFromDto,
  categoryToDto,
  createNote as apiCreate,
  deleteNote as apiDelete,
  isGmOnlyToVisibility,
  listNotes,
  type NoteDto,
  updateNote as apiUpdate,
  visibilityToIsGmOnly,
} from "./notes-api";
import { isApiError } from "./api-client";

export interface BackendNote {
  id: string;
  campaignId: string;
  title: string;
  category: string;
  content: string;
  isGmOnly: boolean;
  createdAt: string;
  updatedAt: string;
}

function dtoToBackendNote(dto: NoteDto): BackendNote {
  return {
    id: dto.id,
    campaignId: dto.campaignId,
    title: dto.title,
    category: categoryFromDto(dto.category),
    content: dto.content,
    isGmOnly: visibilityToIsGmOnly(dto.visibility),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function useBackendNotes(campaignId: string | null) {
  const [notes, setNotes] = useState<BackendNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!campaignId) {
      setNotes([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await listNotes(campaignId);
      setNotes(list.map(dtoToBackendNote));
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
      title: string;
      content: string;
      category: string;
      isGmOnly: boolean;
    }) => {
      if (!campaignId) throw new Error("Campanha sem id.");
      const dto = await apiCreate(campaignId, {
        title: input.title,
        content: input.content,
        category: categoryToDto(input.category),
        visibility: isGmOnlyToVisibility(input.isGmOnly),
      });
      setNotes((prev) => [dtoToBackendNote(dto), ...prev]);
      return dto.id;
    },
    [campaignId],
  );

  const update = useCallback(
    async (
      id: string,
      input: Partial<{
        title: string;
        content: string;
        category: string;
        isGmOnly: boolean;
      }>,
    ) => {
      const dto = await apiUpdate(id, {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
        ...(input.category !== undefined
          ? { category: categoryToDto(input.category) }
          : {}),
        ...(input.isGmOnly !== undefined
          ? { visibility: isGmOnlyToVisibility(input.isGmOnly) }
          : {}),
      });
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? dtoToBackendNote(dto) : n)),
      );
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await apiDelete(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notes, loading, error, refresh, create, update, remove };
}

function formatErr(err: unknown): string {
  if (isApiError(err)) return err.message;
  if (err instanceof Error) return err.message;
  return "Erro inesperado.";
}
