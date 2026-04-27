"use client";

// Attack flow store. Estado leve, não persiste — modal aberto não
// sobrevive a recarregar. Quando o backend de attack subir, este store
// vira reflexo do servidor (mesmo padrão do combat-store).

import { create } from "zustand";
import type {
  AttackWithResults,
  AttackDamageType,
  AttackAdvantage,
  AttackMode,
} from "@questboard/types";

export type AttackPhase =
  | "idle"
  | "configuring"
  | "animating"
  | "done"
  | "applied";

export interface AttackPending {
  attackerTokenId: string;
  targetTokenIds: string[];
}

interface AttackStoreState {
  phase: AttackPhase;
  pending: AttackPending | null;
  result: AttackWithResults | null;

  /** Abre o modal de ataque com atacante e alvo(s). */
  openModal: (pending: AttackPending) => void;

  /** Recebe o resultado da rolagem (mock ou socket). Vai pra "animating". */
  setResult: (result: AttackWithResults) => void;

  /** Animação 3D terminou — vai pra "done" pra mostrar resumo + aplicar HP. */
  markAnimationDone: () => void;

  /** Marca como aplicado (HP dos alvos foi atualizado). */
  markApplied: () => void;

  /** Fecha modal e zera tudo. */
  close: () => void;
}

export const useAttackStore = create<AttackStoreState>((set) => ({
  phase: "idle",
  pending: null,
  result: null,

  openModal: (pending) =>
    set({
      phase: "configuring",
      pending,
      result: null,
    }),

  setResult: (result) =>
    set({
      phase: "animating",
      result,
    }),

  markAnimationDone: () => set({ phase: "done" }),

  markApplied: () => set({ phase: "applied" }),

  close: () =>
    set({
      phase: "idle",
      pending: null,
      result: null,
    }),
}));

// ── Re-export types pra facilitar imports ──
export type { AttackWithResults, AttackDamageType, AttackAdvantage, AttackMode };
