"use client";

// Notes store — respaldado pelo backend (apps/api/src/modules/notes).
// Cache local serve só pra UI síncrona; verdade vive no Postgres.
//
// Hidratação: por campanha. Quando `activeCampaignId` muda, a página
// dispara `useHydrateNotes(campaignId)` (definido aqui) pra preencher o
// cache. Mutações chamam REST em background; otimismo + revert em
// caso de falha.

import { useEffect, useRef } from "react";
import { create } from "zustand";
import * as notesApi from "./notes-api";
import type { NoteDto } from "./notes-api";

export type NoteCategory = "plot" | "item" | "npc" | "general" | "location";

export interface CampaignNote {
  id: string;
  campaignId: string;
  title: string;
  category: NoteCategory;
  content: string;
  isGmOnly: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotesState {
  notes: CampaignNote[];
  /** Map campaignId → ISO timestamp da última hidratação. Evita refetch
   *  em loops curtos. */
  lastHydrated: Record<string, number>;

  hydrateNotes: (campaignId: string, dtos: NoteDto[]) => void;
  createNote: (
    note: Omit<CampaignNote, "id" | "createdAt" | "updatedAt">,
  ) => CampaignNote;
  updateNote: (
    id: string,
    updates: Partial<Omit<CampaignNote, "id" | "createdAt" | "campaignId">>,
  ) => void;
  deleteNote: (id: string) => void;
}

function dtoToNote(dto: NoteDto): CampaignNote {
  return {
    id: dto.id,
    campaignId: dto.campaignId,
    title: dto.title,
    category: notesApi.categoryFromDto(dto.category) as NoteCategory,
    content: dto.content,
    isGmOnly: notesApi.visibilityToIsGmOnly(dto.visibility),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function generateLocalId(): string {
  return `note_pending_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  lastHydrated: {},

  hydrateNotes: (campaignId, dtos) => {
    const fresh = dtos.map(dtoToNote);
    set((s) => {
      // Mantém notas de outras campanhas + notas otimistas (pending)
      // que ainda não voltaram do backend.
      const other = s.notes.filter(
        (n) => n.campaignId !== campaignId || n.id.startsWith("note_pending_"),
      );
      return {
        notes: [...fresh, ...other],
        lastHydrated: { ...s.lastHydrated, [campaignId]: Date.now() },
      };
    });
  },

  createNote: (note) => {
    const now = new Date().toISOString();
    const optimistic: CampaignNote = {
      ...note,
      id: generateLocalId(),
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ notes: [optimistic, ...s.notes] }));

    void notesApi
      .createNote(note.campaignId, {
        title: note.title,
        content: note.content,
        category: notesApi.categoryToDto(note.category),
        visibility: notesApi.isGmOnlyToVisibility(note.isGmOnly),
      })
      .then((dto) => {
        const real = dtoToNote(dto);
        set((s) => ({
          notes: s.notes.map((n) => (n.id === optimistic.id ? real : n)),
        }));
      })
      .catch((err) => {
        console.error("[notes-store] createNote failed", err);
        set((s) => ({ notes: s.notes.filter((n) => n.id !== optimistic.id) }));
      });

    return optimistic;
  },

  updateNote: (id, updates) => {
    const before = get().notes.find((n) => n.id === id);
    if (!before) return;
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === id
          ? { ...n, ...updates, updatedAt: new Date().toISOString() }
          : n,
      ),
    }));
    // Pending: a nota ainda não chegou ao backend; quando o POST original
    // resolver, ela será substituída pela canônica e o patch local é
    // descartado. Aceitamos esse trade-off (raro: usuário edita logo após
    // criar) em favor de não enfileirar mutações.
    if (id.startsWith("note_pending_")) return;
    void notesApi
      .updateNote(id, {
        ...(updates.title !== undefined ? { title: updates.title } : {}),
        ...(updates.content !== undefined ? { content: updates.content } : {}),
        ...(updates.category !== undefined
          ? { category: notesApi.categoryToDto(updates.category) }
          : {}),
        ...(updates.isGmOnly !== undefined
          ? { visibility: notesApi.isGmOnlyToVisibility(updates.isGmOnly) }
          : {}),
      })
      .then((dto) => {
        const real = dtoToNote(dto);
        set((s) => ({ notes: s.notes.map((n) => (n.id === id ? real : n)) }));
      })
      .catch((err) => {
        console.error("[notes-store] updateNote failed", err);
        set((s) => ({ notes: s.notes.map((n) => (n.id === id ? before : n)) }));
      });
  },

  deleteNote: (id) => {
    const before = get().notes.find((n) => n.id === id);
    if (!before) return;
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
    if (id.startsWith("note_pending_")) return;
    void notesApi.deleteNote(id).catch((err) => {
      console.error("[notes-store] deleteNote failed", err);
      set((s) => ({ notes: [before, ...s.notes] }));
    });
  },
}));

/** Hidrata notas da campanha ativa quando o componente monta ou o id
 *  muda. Throttle 5s pra evitar refetch em renders rápidos. */
export function useHydrateNotes(campaignId: string | null): void {
  const hydrate = useNotesStore((s) => s.hydrateNotes);
  const lastRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!campaignId) return;
    let cancelled = false;
    const last = lastRef.current[campaignId] ?? 0;
    if (Date.now() - last < 5_000) return;
    lastRef.current[campaignId] = Date.now();

    void notesApi
      .listNotes(campaignId)
      .then((dtos) => {
        if (cancelled) return;
        hydrate(campaignId, dtos);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[notes-store] hydrate failed", err);
      });

    return () => {
      cancelled = true;
    };
  }, [campaignId, hydrate]);
}

export const NOTE_CATEGORY_LABELS: Record<NoteCategory, string> = {
  plot: "Enredo",
  item: "Item",
  npc: "NPC",
  general: "Geral",
  location: "Local",
};

export const NOTE_CATEGORY_COLORS: Record<NoteCategory, string> = {
  plot: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  item: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  npc: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  general: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  location: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export const NOTE_CATEGORIES: NoteCategory[] = [
  "plot",
  "npc",
  "item",
  "location",
  "general",
];
