// ── Combat Store ──
// Reflexo do servidor. Setters internos (prefixo `_`) são chamados apenas
// por handlers de socket (ou pelo mock provider em dev). Componentes
// emitem intent via `useCombatActions` — nunca mutam direto.
//
// Persistência injetada (CLAUDE.md §6). Web injeta `createJSONStorage(() =>
// localStorage)`; por padrão combate NÃO persiste entre sessões, mas o
// contrato do storage é opcional — se nenhum storage for passado, a store
// roda em memória.

import {
  create,
  type StoreApi,
  type UseBoundStore,
} from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";
import type {
  CombatState,
  CombatParticipant,
  CombatCondition,
  CombatConfig,
  CombatConditionId,
} from "@questboard/types";

export interface CombatStoreState {
  combat: CombatState | null;
  isLoading: boolean;
  error: string | null;

  // Setters internos — chamados por handlers de socket / mock provider.
  _setCombat: (combat: CombatState | null) => void;
  _setLoading: (loading: boolean) => void;
  _setError: (error: string | null) => void;

  _applyTurnChange: (
    round: number,
    currentIndex: number,
    turnStartedAt: number,
  ) => void;
  _applyInitiativeChange: (tokenId: string, value: number) => void;
  _applyReorder: (order: string[]) => void;
  _addParticipant: (participant: CombatParticipant) => void;
  _removeParticipant: (tokenId: string) => void;
  _addCondition: (tokenId: string, condition: CombatCondition) => void;
  _removeCondition: (tokenId: string, conditionId: CombatConditionId) => void;
  _applyConfigChange: (config: CombatConfig) => void;
  _applyHpChange: (tokenId: string, hpCurrent: number, hpTemp?: number) => void;

  // Fatia 3A
  _markActed: (tokenId: string, hasActed: boolean) => void;
  _updateCondition: (
    tokenId: string,
    conditionId: string,
    durationRounds: number | null,
  ) => void;
  _renameParticipant: (tokenId: string, name: string) => void;

  reset: () => void;
}

export type CombatStore = UseBoundStore<StoreApi<CombatStoreState>>;

const initialState = {
  combat: null as CombatState | null,
  isLoading: false,
  error: null as string | null,
};

function updateParticipant(
  state: CombatStoreState,
  tokenId: string,
  mutate: (p: CombatParticipant) => CombatParticipant,
): Partial<CombatStoreState> {
  if (!state.combat) return {};
  return {
    combat: {
      ...state.combat,
      participants: state.combat.participants.map((p) =>
        p.tokenId === tokenId ? mutate(p) : p,
      ),
    },
  };
}

export function createCombatStore(
  storage?: PersistStorage<CombatStoreState>,
  storeName = "questboard-combat",
): CombatStore {
  const definition = (
    set: StoreApi<CombatStoreState>["setState"],
  ): CombatStoreState => ({
    ...initialState,

    _setCombat: (combat) => set({ combat, error: null }),
    _setLoading: (isLoading) => set({ isLoading }),
    _setError: (error) => set({ error }),

    _applyTurnChange: (round, currentIndex, turnStartedAt) =>
      set((s) =>
        s.combat
          ? {
              combat: {
                ...s.combat,
                round,
                currentIndex,
                turnStartedAt,
              },
            }
          : s,
      ),

    _applyInitiativeChange: (tokenId, value) =>
      set((s) =>
        updateParticipant(s, tokenId, (p) => ({ ...p, initiative: value })),
      ),

    _applyReorder: (order) =>
      set((s) => {
        if (!s.combat) return s;
        const byId = new Map(
          s.combat.participants.map((p) => [p.tokenId, p]),
        );
        const reordered = order
          .map((id) => byId.get(id))
          .filter((p): p is CombatParticipant => Boolean(p));
        // Mantém participantes não referenciados ao fim (robustez contra
        // reorder parcial vindo do servidor).
        const missing = s.combat.participants.filter(
          (p) => !order.includes(p.tokenId),
        );
        return {
          combat: {
            ...s.combat,
            participants: [...reordered, ...missing],
          },
        };
      }),

    _addParticipant: (participant) =>
      set((s) =>
        s.combat
          ? {
              combat: {
                ...s.combat,
                participants: [...s.combat.participants, participant].sort(
                  (a, b) => b.initiative - a.initiative,
                ),
              },
            }
          : s,
      ),

    _removeParticipant: (tokenId) =>
      set((s) =>
        s.combat
          ? {
              combat: {
                ...s.combat,
                participants: s.combat.participants.filter(
                  (p) => p.tokenId !== tokenId,
                ),
              },
            }
          : s,
      ),

    _addCondition: (tokenId, condition) =>
      set((s) =>
        updateParticipant(s, tokenId, (p) => ({
          ...p,
          // Replace se já existir a mesma conditionId (evita duplicata).
          conditions: [
            ...p.conditions.filter(
              (c) => c.conditionId !== condition.conditionId,
            ),
            condition,
          ],
        })),
      ),

    _removeCondition: (tokenId, conditionId) =>
      set((s) =>
        updateParticipant(s, tokenId, (p) => ({
          ...p,
          conditions: p.conditions.filter(
            (c) => c.conditionId !== conditionId,
          ),
        })),
      ),

    _applyConfigChange: (config) =>
      set((s) =>
        s.combat ? { combat: { ...s.combat, config } } : s,
      ),

    _applyHpChange: (tokenId, hpCurrent, hpTemp) =>
      set((s) =>
        updateParticipant(s, tokenId, (p) => ({
          ...p,
          hpCurrent,
          ...(hpTemp !== undefined ? { hpTemp } : {}),
        })),
      ),

    _markActed: (tokenId, hasActed) =>
      set((s) => updateParticipant(s, tokenId, (p) => ({ ...p, hasActed }))),

    _updateCondition: (tokenId, conditionId, durationRounds) =>
      set((s) =>
        updateParticipant(s, tokenId, (p) => ({
          ...p,
          conditions: p.conditions.map((c) =>
            c.conditionId === conditionId ? { ...c, durationRounds } : c,
          ),
        })),
      ),

    _renameParticipant: (tokenId, name) =>
      set((s) => updateParticipant(s, tokenId, (p) => ({ ...p, name }))),

    reset: () => set({ ...initialState }),
  });

  if (storage) {
    return create<CombatStoreState>()(
      persist(definition, { name: storeName, storage }),
    );
  }

  return create<CombatStoreState>()(definition);
}
