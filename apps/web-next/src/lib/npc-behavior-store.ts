import { create } from "zustand";
import type {
  NpcBehavior,
  BehaviorType,
  BehaviorStatus,
  BehaviorParticipant,
  NpcState,
  BehaviorConfig,
  BehaviorTickPayload,
  AiBehaviorParams,
  BehaviorPhase,
} from "./npc-behavior-types";
import { computeNextState, TICK_INTERVAL_MS } from "./npc-behavior-engine";

function generateId(): string {
  return `beh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

interface TokenRenderState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facing: number;
  lastUpdateAt: number;
}

interface NpcBehaviorState {
  behaviors: Record<string, NpcBehavior>;
  npcStates: Record<string, Record<string, NpcState>>;
  renderStates: Record<string, TokenRenderState>;
  tickIntervals: Record<string, number>;

  createBehavior: (params: {
    sessionId: string;
    mapId: string;
    type: BehaviorType;
    config: Omit<BehaviorConfig, "walls" | "type">;
    participants: BehaviorParticipant[];
    durationMs?: number;
    aiParams?: AiBehaviorParams;
  }) => string;

  startBehavior: (behaviorId: string, walls: Set<string>) => void;
  pauseBehavior: (behaviorId: string) => void;
  resumeBehavior: (behaviorId: string) => void;
  stopBehavior: (behaviorId: string) => void;
  removeBehavior: (behaviorId: string) => void;

  updateBehaviorConfig: (
    behaviorId: string,
    patch: Partial<Omit<BehaviorConfig, "walls" | "type">>,
  ) => void;

  applyTick: (payload: BehaviorTickPayload) => void;

  getRenderPosition: (tokenId: string) => { x: number; y: number; facing: number } | null;
  getActiveBehaviors: () => NpcBehavior[];
  getBehaviorForToken: (tokenId: string) => NpcBehavior | null;

  pauseByTypes: (types: BehaviorType[]) => void;
  stopAllForMap: (mapId: string) => void;
}

export const useNpcBehaviorStore = create<NpcBehaviorState>((set, get) => ({
  behaviors: {},
  npcStates: {},
  renderStates: {},
  tickIntervals: {},

  createBehavior: (params) => {
    const id = generateId();
    const behavior: NpcBehavior = {
      id,
      sessionId: params.sessionId,
      mapId: params.mapId,
      type: params.type,
      status: "ACTIVE",
      config: params.config,
      aiParams: params.aiParams,
      participants: params.participants,
      startedAt: new Date().toISOString(),
      endedAt: null,
      durationMs: params.durationMs ?? null,
    };

    const initialStates: Record<string, NpcState> = {};
    for (const p of params.participants) {
      initialStates[p.tokenId] = {
        tokenId: p.tokenId,
        x: p.startX,
        y: p.startY,
        vx: 0,
        vy: 0,
        facing: 0,
        role: p.role,
      };
    }

    set((s) => ({
      behaviors: { ...s.behaviors, [id]: behavior },
      npcStates: { ...s.npcStates, [id]: initialStates },
    }));

    return id;
  },

  startBehavior: (behaviorId, walls) => {
    const state = get();
    const behavior = state.behaviors[behaviorId];
    if (!behavior || behavior.status !== "ACTIVE") return;

    let tickCount = 0;
    let currentPhaseIdx = 0;
    let phaseStartedAt = Date.now();

    const interval = window.setInterval(() => {
      const s = get();
      const beh = s.behaviors[behaviorId];
      if (!beh || beh.status !== "ACTIVE") return;

      const statesMap = s.npcStates[behaviorId];
      if (!statesMap) return;

      const npcList = Object.values(statesMap);

      let activeType = beh.type;
      const phases = beh.config.phases;
      if (phases && phases.length > 0) {
        const phaseDuration = phases[currentPhaseIdx]?.durationMs ?? Infinity;
        if (Date.now() - phaseStartedAt > phaseDuration && currentPhaseIdx < phases.length - 1) {
          currentPhaseIdx++;
          phaseStartedAt = Date.now();
        }
        activeType = phases[currentPhaseIdx]?.type ?? beh.type;
      }

      let target = beh.config.target;
      if (target?.tokenId) {
        const tokenTarget = get().renderStates[target.tokenId];
        if (tokenTarget) {
          target = { x: tokenTarget.targetX, y: tokenTarget.targetY };
        }
      }

      const config: BehaviorConfig = {
        ...beh.config,
        type: activeType,
        target,
        walls,
      };

      const updated: NpcState[] = npcList.map((npc) =>
        computeNextState(npc, npcList, config, tickCount),
      );

      const newStatesMap: Record<string, NpcState> = {};
      const newRenderStates: Record<string, TokenRenderState> = { ...s.renderStates };
      const now = Date.now();

      for (const npc of updated) {
        newStatesMap[npc.tokenId] = npc;
        const prev = newRenderStates[npc.tokenId];
        newRenderStates[npc.tokenId] = {
          x: prev?.x ?? npc.x,
          y: prev?.y ?? npc.y,
          targetX: npc.x,
          targetY: npc.y,
          facing: npc.facing,
          lastUpdateAt: now,
        };
      }

      tickCount++;

      set((prev) => ({
        npcStates: {
          ...prev.npcStates,
          [behaviorId]: newStatesMap,
        },
        renderStates: newRenderStates,
      }));
    }, TICK_INTERVAL_MS);

    set((s) => ({
      tickIntervals: { ...s.tickIntervals, [behaviorId]: interval },
    }));

    if (behavior.durationMs) {
      window.setTimeout(() => {
        get().stopBehavior(behaviorId);
      }, behavior.durationMs);
    }
  },

  pauseBehavior: (behaviorId) => {
    const interval = get().tickIntervals[behaviorId];
    if (interval) window.clearInterval(interval);

    set((s) => {
      const beh = s.behaviors[behaviorId];
      if (!beh) return s;
      return {
        behaviors: {
          ...s.behaviors,
          [behaviorId]: { ...beh, status: "PAUSED" as BehaviorStatus },
        },
        tickIntervals: (() => {
          const next = { ...s.tickIntervals };
          delete next[behaviorId];
          return next;
        })(),
      };
    });
  },

  resumeBehavior: (behaviorId) => {
    set((s) => {
      const beh = s.behaviors[behaviorId];
      if (!beh || beh.status !== "PAUSED") return s;
      return {
        behaviors: {
          ...s.behaviors,
          [behaviorId]: { ...beh, status: "ACTIVE" as BehaviorStatus },
        },
      };
    });
    get().startBehavior(behaviorId, new Set());
  },

  stopBehavior: (behaviorId) => {
    const interval = get().tickIntervals[behaviorId];
    if (interval) window.clearInterval(interval);

    set((s) => {
      const beh = s.behaviors[behaviorId];
      if (!beh) return s;

      const removedTokenIds = beh.participants.map((p) => p.tokenId);
      const newRender = { ...s.renderStates };
      for (const tid of removedTokenIds) {
        delete newRender[tid];
      }

      const newNpcStates = { ...s.npcStates };
      delete newNpcStates[behaviorId];
      const newIntervals = { ...s.tickIntervals };
      delete newIntervals[behaviorId];

      return {
        behaviors: {
          ...s.behaviors,
          [behaviorId]: {
            ...beh,
            status: "COMPLETED" as BehaviorStatus,
            endedAt: new Date().toISOString(),
          },
        },
        npcStates: newNpcStates,
        renderStates: newRender,
        tickIntervals: newIntervals,
      };
    });
  },

  removeBehavior: (behaviorId) => {
    get().stopBehavior(behaviorId);
    set((s) => {
      const next = { ...s.behaviors };
      delete next[behaviorId];
      return { behaviors: next };
    });
  },

  updateBehaviorConfig: (behaviorId, patch) => {
    set((s) => {
      const beh = s.behaviors[behaviorId];
      if (!beh) return s;
      return {
        behaviors: {
          ...s.behaviors,
          [behaviorId]: {
            ...beh,
            config: { ...beh.config, ...patch },
          },
        },
      };
    });
  },

  applyTick: (payload) => {
    const now = Date.now();
    set((s) => {
      const newRender = { ...s.renderStates };
      for (const pos of payload.positions) {
        const prev = newRender[pos.tokenId];
        newRender[pos.tokenId] = {
          x: prev?.x ?? pos.x,
          y: prev?.y ?? pos.y,
          targetX: pos.x,
          targetY: pos.y,
          facing: pos.facing,
          lastUpdateAt: now,
        };
      }
      return { renderStates: newRender };
    });
  },

  getRenderPosition: (tokenId) => {
    const rs = get().renderStates[tokenId];
    if (!rs) return null;
    const now = Date.now();
    const alpha = Math.min((now - rs.lastUpdateAt) / TICK_INTERVAL_MS, 1);
    return {
      x: rs.x + (rs.targetX - rs.x) * alpha,
      y: rs.y + (rs.targetY - rs.y) * alpha,
      facing: rs.facing,
    };
  },

  getActiveBehaviors: () =>
    Object.values(get().behaviors).filter(
      (b) => b.status === "ACTIVE" || b.status === "PAUSED",
    ),

  getBehaviorForToken: (tokenId) => {
    const behaviors = get().behaviors;
    for (const beh of Object.values(behaviors)) {
      if (
        (beh.status === "ACTIVE" || beh.status === "PAUSED") &&
        beh.participants.some((p) => p.tokenId === tokenId)
      ) {
        return beh;
      }
    }
    return null;
  },

  pauseByTypes: (types) => {
    const behaviors = get().behaviors;
    for (const beh of Object.values(behaviors)) {
      if (beh.status === "ACTIVE" && types.includes(beh.type)) {
        get().pauseBehavior(beh.id);
      }
    }
  },

  stopAllForMap: (mapId) => {
    const behaviors = get().behaviors;
    for (const beh of Object.values(behaviors)) {
      if (beh.mapId === mapId && (beh.status === "ACTIVE" || beh.status === "PAUSED")) {
        get().stopBehavior(beh.id);
      }
    }
  },
}));
