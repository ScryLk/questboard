import { create } from "zustand";

export interface DiceAnimationPayload {
  id: string;
  sides: number;
  result: number;
  formula: string;
  details: string;
  actorName: string;
  isNat20: boolean;
  isNat1: boolean;
  /** "crit" = nat20, "fumble" = nat1, "normal" = rolagem comum (não usada
   *  no MVP — só crítico/falha disparam central). */
  kind: "crit" | "fumble";
}

interface DiceAnimationState {
  current: DiceAnimationPayload | null;
  queue: DiceAnimationPayload[];
  show: (payload: DiceAnimationPayload) => void;
  clear: () => void;
}

/**
 * Store da animação central de dados. Guarda 1 ativa + fila simples.
 * Rolagens normais NÃO passam por aqui — só crítico/falha (MVP).
 * Rolagens secretas nunca entram (filtrado no dispatcher).
 */
export const useDiceAnimationStore = create<DiceAnimationState>((set, get) => ({
  current: null,
  queue: [],

  show: (payload) => {
    const { current, queue } = get();
    if (!current) {
      set({ current: payload });
    } else {
      set({ queue: [...queue, payload] });
    }
  },

  clear: () => {
    const { queue } = get();
    if (queue.length === 0) {
      set({ current: null });
      return;
    }
    // 500ms entre animações (regra 6.4 da spec) — mesmo sem Lottie,
    // espaça pra não empilhar visualmente.
    setTimeout(() => {
      set({ current: queue[0], queue: queue.slice(1) });
    }, 500);
    set({ current: null });
  },
}));
