"use client";

// Singleton combat store (reflexo do servidor).
// Combate não persiste client-side por padrão — factory roda sem storage.
// Se um dia precisar persistir, basta passar `createJSONStorage(...)` igual
// ao padrão de `search-store.ts`.

import { createCombatStore } from "@questboard/store";

export const useCombatStore = createCombatStore();
