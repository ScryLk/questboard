import { create } from "zustand";
import type { RadialActionId } from "@questboard/constants";

export interface RadialAction {
  id: RadialActionId;
  labelPt: string;
  enabled: boolean;
  disabledReasonPt?: string;
}

export interface RadialTargetInfo {
  tokenId: string;
  namePt: string;
  hpText?: string;
  distanceCells?: number;
}

interface RadialMenuState {
  open: boolean;
  target: RadialTargetInfo | null;
  screenX: number;
  screenY: number;
  actions: RadialAction[];
  /** Origem — usado pra decidir se a Pixi view precisa re-sincronizar
   *  coords quando o mapa pan/zoom. Player não precisa. */
  source: "gm" | "player" | null;

  openAt: (params: {
    target: RadialTargetInfo;
    screenX: number;
    screenY: number;
    actions: RadialAction[];
    source: "gm" | "player";
  }) => void;
  updateScreenPos: (x: number, y: number) => void;
  close: () => void;
}

export const useRadialMenuStore = create<RadialMenuState>((set) => ({
  open: false,
  target: null,
  screenX: 0,
  screenY: 0,
  actions: [],
  source: null,

  openAt: ({ target, screenX, screenY, actions, source }) =>
    set({ open: true, target, screenX, screenY, actions, source }),
  updateScreenPos: (screenX, screenY) => set({ screenX, screenY }),
  close: () =>
    set({
      open: false,
      target: null,
      actions: [],
      source: null,
    }),
}));
