import type { NPCData } from "@/lib/npc-types";

// The form state mirrors NPCData exactly — we use the same type
// and apply partial updates via setState callbacks.
export type NPCFormState = NPCData;
export type NPCFormUpdater = (updates: Partial<NPCData>) => void;
