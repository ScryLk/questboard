import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "zustand/middleware";
import type { PersistStorage } from "zustand/middleware";
import { createSearchStore, type SearchState } from "@questboard/store";

const storage = createJSONStorage<SearchState>(() => ({
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
})) as PersistStorage<SearchState>;

export const useSearchStore = createSearchStore(storage, "questboard-search");
