// ── Search Store ──
// Recent searches por usuário, persistidas via storage injetado.
// Web injeta `createJSONStorage(() => localStorage)`, mobile injeta MMKV.

import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";
import type { SearchResultItem, SearchType } from "@questboard/types";

export interface RecentSearchItem {
  id: string;
  type: SearchType;
  title: string;
  subtitle?: string;
  url: string;
  /** Epoch ms da última seleção */
  selectedAt: number;
}

export interface SearchState {
  recent: RecentSearchItem[];
  addRecent: (item: SearchResultItem) => void;
  removeRecent: (id: string, type: SearchType) => void;
  clearRecent: () => void;
}

const MAX_RECENT = 10;

export type SearchStore = UseBoundStore<StoreApi<SearchState>>;

export function createSearchStore(
  storage: PersistStorage<SearchState>,
  storeName = "questboard-search",
): SearchStore {
  return create<SearchState>()(
    persist(
      (set) => ({
        recent: [],
        addRecent: (item) =>
          set((state) => {
            const next: RecentSearchItem = {
              id: item.id,
              type: item.type,
              title: item.title,
              subtitle: item.subtitle,
              url: item.url,
              selectedAt: Date.now(),
            };
            const filtered = state.recent.filter(
              (r) => !(r.id === item.id && r.type === item.type),
            );
            return { recent: [next, ...filtered].slice(0, MAX_RECENT) };
          }),
        removeRecent: (id, type) =>
          set((state) => ({
            recent: state.recent.filter((r) => !(r.id === id && r.type === type)),
          })),
        clearRecent: () => set({ recent: [] }),
      }),
      { name: storeName, storage },
    ),
  );
}
