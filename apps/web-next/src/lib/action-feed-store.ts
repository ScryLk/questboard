import { create } from "zustand";
import { useGameplayStore } from "./gameplay-store";
import type { ConditionType } from "./gameplay-mock-data";

// ─── Tipos ──────────────────────────────────────────────────────────

export type ActionType =
  | "TOKEN_MOVED"
  | "TOKEN_REMOVED"
  | "TOKEN_DUPLICATED"
  | "HP_CHANGED"
  | "CONDITION_ADDED"
  | "CONDITION_REMOVED"
  | "DICE_ROLLED";
// TODO: adicionar TOKEN_ADDED, FOG_REVEALED/HIDDEN, OBJECT_PLACED/REMOVED,
// MAP_CHANGED quando backend persistir (prompt seção 5.2).

export type ActionCategory = "movimento" | "combate" | "dados" | "outros";

export type FeedFilter = "todas" | ActionCategory;

export interface BaseFeedEntry {
  id: string;
  type: ActionType;
  actorId: string;
  actorName: string;
  actorRole: "GM" | "PLAYER";
  /** Nome do token/alvo afetado, se aplicável. */
  targetLabel: string | null;
  /** Texto pronto pra exibir no feed, em pt-BR. */
  summary: string;
  category: ActionCategory;
  appliedAt: number;
  /** `appliedAt + WINDOW_MS` — limite pra reverter. */
  expiresAt: number;
  revertedAt: number | null;
  revertedBy: string | null;
  revertReason: string | null;
  /** DICE_ROLLED e similares não voltam — só ficam "descartadas". */
  revertible: boolean;
}

/** Payload tipado por ação — armazena o mínimo pra reverter. */
export type FeedEntry =
  | (BaseFeedEntry & {
      type: "TOKEN_MOVED";
      payload: { tokenId: string; fromX: number; fromY: number; toX: number; toY: number };
    })
  | (BaseFeedEntry & {
      type: "TOKEN_REMOVED";
      // Fullstate do token pra reinserir — snapshot shallow basta, é mock.
      payload: { token: import("./gameplay-mock-data").GameToken };
    })
  | (BaseFeedEntry & {
      type: "TOKEN_DUPLICATED";
      payload: { newTokenId: string };
    })
  | (BaseFeedEntry & {
      type: "HP_CHANGED";
      payload: { tokenId: string; previousHp: number; newHp: number };
    })
  | (BaseFeedEntry & {
      type: "CONDITION_ADDED";
      payload: { tokenId: string; condition: ConditionType };
    })
  | (BaseFeedEntry & {
      type: "CONDITION_REMOVED";
      payload: { tokenId: string; condition: ConditionType };
    })
  | (BaseFeedEntry & {
      type: "DICE_ROLLED";
      payload: { notation: string; result: number };
    });

// ─── Constantes ─────────────────────────────────────────────────────

export const REVERT_WINDOW_MS = 30_000;
const MAX_ENTRIES = 40; // chão duro pra não crescer infinito

// ─── Helpers de categorização ────────────────────────────────────────

const CATEGORY_BY_TYPE: Record<ActionType, ActionCategory> = {
  TOKEN_MOVED: "movimento",
  TOKEN_REMOVED: "outros",
  TOKEN_DUPLICATED: "outros",
  HP_CHANGED: "combate",
  CONDITION_ADDED: "combate",
  CONDITION_REMOVED: "combate",
  DICE_ROLLED: "dados",
};

function uuid(): string {
  return `act_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Flag pra evitar loop quando reverter ─────────────────────────────
// Quando a reversão chama o setter do gameplayStore (ex: moveToken), o
// próprio gameplayStore vai tentar gravar uma nova entry — isso criaria
// loop. Durante a reversão, desligamos a gravação.

let recordingEnabled = true;
export function isRecordingEnabled() {
  return recordingEnabled;
}
function withRecordingDisabled(fn: () => void) {
  recordingEnabled = false;
  try {
    fn();
  } finally {
    recordingEnabled = true;
  }
}

// ─── Store ───────────────────────────────────────────────────────────

interface ActionFeedState {
  entries: FeedEntry[];
  filter: FeedFilter;
  isOpen: boolean;
  /** Último tick (Date.now) — força re-render em countdown. */
  tick: number;

  recordEntry: (
    entry: Omit<
      FeedEntry,
      | "id"
      | "appliedAt"
      | "expiresAt"
      | "revertedAt"
      | "revertedBy"
      | "revertReason"
      | "category"
    >,
  ) => void;
  revertEntry: (id: string, reason?: string) => void;
  discardEntry: (id: string) => void;
  setFilter: (filter: FeedFilter) => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  tickNow: () => void;
  clear: () => void;
}

export const useActionFeedStore = create<ActionFeedState>((set, get) => ({
  entries: [],
  filter: "todas",
  isOpen: true,
  tick: Date.now(),

  recordEntry: (data) => {
    if (!recordingEnabled) return;
    const now = Date.now();
    const id = uuid();
    const entry = {
      ...data,
      id,
      category: CATEGORY_BY_TYPE[data.type],
      appliedAt: now,
      expiresAt: now + REVERT_WINDOW_MS,
      revertedAt: null,
      revertedBy: null,
      revertReason: null,
    } as FeedEntry;
    set((s) => ({
      entries: [entry, ...s.entries].slice(0, MAX_ENTRIES),
    }));
  },

  revertEntry: (id, reason) => {
    const entry = get().entries.find((e) => e.id === id);
    if (!entry) return;
    if (entry.revertedAt) return; // já revertida
    if (Date.now() > entry.expiresAt) return; // janela fechou
    if (!entry.revertible) return;

    const gm = useGameplayStore.getState();
    const currentUserId = gm.currentUserId ?? "gm";

    // Dispatch da reversão — desligamos gravação durante a operação pra
    // o setter inverso não criar outra entry em cima.
    withRecordingDisabled(() => {
      switch (entry.type) {
        case "TOKEN_MOVED":
          gm.moveToken(
            entry.payload.tokenId,
            entry.payload.fromX,
            entry.payload.fromY,
          );
          break;
        case "HP_CHANGED":
          gm.updateTokenHp(entry.payload.tokenId, entry.payload.previousHp);
          break;
        case "CONDITION_ADDED":
          // Adicionar = toggle quando ativo; pra remover, toggle novamente
          // só se ainda está ativo (reversão deve ser idempotente).
          {
            const t = useGameplayStore
              .getState()
              .tokens.find((tok) => tok.id === entry.payload.tokenId);
            if (t?.conditions.includes(entry.payload.condition)) {
              gm.toggleTokenCondition(
                entry.payload.tokenId,
                entry.payload.condition,
              );
            }
          }
          break;
        case "CONDITION_REMOVED":
          {
            const t = useGameplayStore
              .getState()
              .tokens.find((tok) => tok.id === entry.payload.tokenId);
            if (t && !t.conditions.includes(entry.payload.condition)) {
              gm.toggleTokenCondition(
                entry.payload.tokenId,
                entry.payload.condition,
              );
            }
          }
          break;
        case "TOKEN_REMOVED":
          // Reinsere o token no store.
          useGameplayStore.setState((s) => ({
            tokens: [...s.tokens, entry.payload.token],
          }));
          break;
        case "TOKEN_DUPLICATED":
          // Remover o duplicado recria o estado anterior.
          gm.removeToken(entry.payload.newTokenId);
          break;
        case "DICE_ROLLED":
          // Dados não voltam — mas chegou aqui indevidamente; ignora.
          break;
      }
    });

    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === id
          ? {
              ...e,
              revertedAt: Date.now(),
              revertedBy: currentUserId,
              revertReason: reason ?? null,
            }
          : e,
      ),
    }));
  },

  discardEntry: (id) => {
    // DICE_ROLLED pode ser "descartado" — só marca como revertido no feed,
    // sem operação no estado. Serve pra GM sinalizar "esse rolaço não conta".
    const entry = get().entries.find((e) => e.id === id);
    if (!entry || entry.revertedAt) return;
    const currentUserId = useGameplayStore.getState().currentUserId ?? "gm";
    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === id
          ? {
              ...e,
              revertedAt: Date.now(),
              revertedBy: currentUserId,
              revertReason: "Descartado",
            }
          : e,
      ),
    }));
  },

  setFilter: (filter) => set({ filter }),
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  tickNow: () => set({ tick: Date.now() }),
  clear: () => set({ entries: [] }),
}));

// ─── Helpers pra quem emite (gameplayStore setters) ─────────────────

/**
 * Facade simples — callsite do setter patcheado invoca esses helpers
 * em vez de manipular `recordEntry` direto. Mantém a shape consistente.
 */
export const feed = {
  tokenMoved(args: {
    actorId: string;
    actorName: string;
    actorRole: "GM" | "PLAYER";
    tokenId: string;
    tokenName: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }) {
    useActionFeedStore.getState().recordEntry({
      type: "TOKEN_MOVED",
      actorId: args.actorId,
      actorName: args.actorName,
      actorRole: args.actorRole,
      targetLabel: args.tokenName,
      summary: `${args.tokenName} moveu para (${args.toX}, ${args.toY})`,
      revertible: true,
      payload: {
        tokenId: args.tokenId,
        fromX: args.fromX,
        fromY: args.fromY,
        toX: args.toX,
        toY: args.toY,
      },
    });
  },
  hpChanged(args: {
    actorId: string;
    actorName: string;
    actorRole: "GM" | "PLAYER";
    tokenId: string;
    tokenName: string;
    previousHp: number;
    newHp: number;
  }) {
    const delta = args.newHp - args.previousHp;
    const verb =
      delta < 0
        ? `tomou ${-delta} de dano`
        : delta > 0
          ? `curou ${delta}`
          : `teve HP ajustado para ${args.newHp}`;
    useActionFeedStore.getState().recordEntry({
      type: "HP_CHANGED",
      actorId: args.actorId,
      actorName: args.actorName,
      actorRole: args.actorRole,
      targetLabel: args.tokenName,
      summary: `${args.tokenName} ${verb}`,
      revertible: true,
      payload: {
        tokenId: args.tokenId,
        previousHp: args.previousHp,
        newHp: args.newHp,
      },
    });
  },
  conditionToggled(args: {
    actorId: string;
    actorName: string;
    actorRole: "GM" | "PLAYER";
    tokenId: string;
    tokenName: string;
    condition: ConditionType;
    added: boolean;
    label: string;
  }) {
    useActionFeedStore.getState().recordEntry({
      type: args.added ? "CONDITION_ADDED" : "CONDITION_REMOVED",
      actorId: args.actorId,
      actorName: args.actorName,
      actorRole: args.actorRole,
      targetLabel: args.tokenName,
      summary: args.added
        ? `${args.tokenName} ganhou condição ${args.label}`
        : `${args.tokenName} perdeu condição ${args.label}`,
      revertible: true,
      payload: { tokenId: args.tokenId, condition: args.condition },
    });
  },
  tokenRemoved(args: {
    actorId: string;
    actorName: string;
    actorRole: "GM" | "PLAYER";
    token: import("./gameplay-mock-data").GameToken;
  }) {
    useActionFeedStore.getState().recordEntry({
      type: "TOKEN_REMOVED",
      actorId: args.actorId,
      actorName: args.actorName,
      actorRole: args.actorRole,
      targetLabel: args.token.name,
      summary: `${args.token.name} removido do mapa`,
      revertible: true,
      payload: { token: args.token },
    });
  },
  tokenDuplicated(args: {
    actorId: string;
    actorName: string;
    actorRole: "GM" | "PLAYER";
    originalName: string;
    newTokenId: string;
  }) {
    useActionFeedStore.getState().recordEntry({
      type: "TOKEN_DUPLICATED",
      actorId: args.actorId,
      actorName: args.actorName,
      actorRole: args.actorRole,
      targetLabel: args.originalName,
      summary: `${args.originalName} duplicado`,
      revertible: true,
      payload: { newTokenId: args.newTokenId },
    });
  },
};
