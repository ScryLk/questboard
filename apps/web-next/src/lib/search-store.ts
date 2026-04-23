"use client";

import { createSearchStore } from "@questboard/store";
import { createJSONStorage } from "zustand/middleware";
import type { PersistStorage } from "zustand/middleware";
import type { SearchState } from "@questboard/store";

// `createJSONStorage` retorna `PersistStorage<unknown> | undefined` — afunilamos
// para o tipo concreto da SearchState.
const storage = createJSONStorage<SearchState>(() => {
  if (typeof window === "undefined") {
    // SSR safety: storage no-op no servidor.
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return window.localStorage;
}) as PersistStorage<SearchState>;

export const useSearchStore = createSearchStore(storage, "questboard-search");
