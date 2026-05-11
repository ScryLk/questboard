import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  createNote: (
    note: Omit<CampaignNote, "id" | "createdAt" | "updatedAt">,
  ) => CampaignNote;
  updateNote: (
    id: string,
    updates: Partial<Omit<CampaignNote, "id" | "createdAt" | "campaignId">>,
  ) => void;
  deleteNote: (id: string) => void;
}

function generateId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// Store inicia vazio — dados vêm do backend via `useBackendNotes`
// (apps/api/src/modules/notes) ou da UI quando GM cria.
const SEED: CampaignNote[] = [];

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: SEED,

      createNote: (note) => {
        const now = new Date().toISOString();
        const newNote: CampaignNote = {
          ...note,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ notes: [newNote, ...s.notes] }));
        return newNote;
      },

      updateNote: (id, updates) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id
              ? { ...n, ...updates, updatedAt: new Date().toISOString() }
              : n,
          ),
        })),

      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
    }),
    {
      name: "questboard-notes",
      version: 1,
    },
  ),
);

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
