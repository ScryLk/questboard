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
import { computeNextState, computeNextStateWithPath, TICK_INTERVAL_MS } from "./npc-behavior-engine";
import { findNearestExit } from "./npc-pathfinding";
import { buildEffectiveWallSet } from "./behavior-walls";
import type { ExitZone, SceneExitConfig } from "./exit-zone-types";
import type { WallData } from "./gameplay-mock-data";
import { broadcastSend } from "./broadcast-sync";

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

export type NpcPathStatus = "seeking" | "following" | "trapped" | "escaped";

interface NpcPathState {
  waypoints: Array<{ x: number; y: number }>;
  status: NpcPathStatus;
  targetExit: ExitZone | null;
}

interface NpcBehaviorState {
  behaviors: Record<string, NpcBehavior>;
  npcStates: Record<string, Record<string, NpcState>>;
  renderStates: Record<string, TokenRenderState>;
  tickIntervals: Record<string, number>;
  pathIntervals: Record<string, number>;
  npcPaths: Record<string, Record<string, NpcPathState>>;
  exitZones: ExitZone[];
  escapedTokens: Array<{ tokenId: string; behaviorId: string; exitLabel: string }>;

  setExitZones: (zones: ExitZone[]) => void;
  addExitZone: (zone: ExitZone) => void;
  removeExitZone: (id: string) => void;

  createBehavior: (params: {
    sessionId: string;
    mapId: string;
    type: BehaviorType;
    config: Omit<BehaviorConfig, "walls" | "type">;
    participants: BehaviorParticipant[];
    durationMs?: number;
    aiParams?: AiBehaviorParams;
  }) => string;

  startBehavior: (behaviorId: string, walls: Set<string>, wallEdges?: Record<string, WallData>, gridSize?: { w: number; h: number }) => void;
  pauseBehavior: (behaviorId: string) => void;
  resumeBehavior: (behaviorId: string) => void;
  stopBehavior: (behaviorId: string) => void;
  removeBehavior: (behaviorId: string) => void;

  updateBehaviorConfig: (
    behaviorId: string,
    patch: Partial<Omit<BehaviorConfig, "walls" | "type">>,
  ) => void;

  applyTick: (payload: BehaviorTickPayload) => void;
  markEscaped: (behaviorId: string, tokenId: string, exitLabel: string) => void;

  getRenderPosition: (tokenId: string) => { x: number; y: number; facing: number } | null;
  getActiveBehaviors: () => NpcBehavior[];
  getBehaviorForToken: (tokenId: string) => NpcBehavior | null;
  getNpcPathStatus: (behaviorId: string, tokenId: string) => NpcPathStatus | null;

  pauseByTypes: (types: BehaviorType[]) => void;
  stopAllForMap: (mapId: string) => void;
}

export const useNpcBehaviorStore = create<NpcBehaviorState>((set, get) => ({
  behaviors: {},
  npcStates: {},
  renderStates: {},
  tickIntervals: {},
  pathIntervals: {},
  npcPaths: {},
  exitZones: [],
  escapedTokens: [],

  setExitZones: (zones) => set({ exitZones: zones }),
  addExitZone: (zone) => set((s) => ({ exitZones: [...s.exitZones, zone] })),
  removeExitZone: (id) => set((s) => ({ exitZones: s.exitZones.filter((z) => z.id !== id) })),

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

  startBehavior: (behaviorId, walls, wallEdges, gridSize) => {
    const state = get();
    const behavior = state.behaviors[behaviorId];
    if (!behavior || behavior.status !== "ACTIVE") return;

    let tickCount = 0;
    let currentPhaseIdx = 0;
    let phaseStartedAt = Date.now();

    const usePathfinding = ["PANIC", "FLEE", "RIOT"].includes(behavior.type);
    const mapW = gridSize?.w ?? 25;
    const mapH = gridSize?.h ?? 25;

    // Path recomputation interval (500ms) — only for behaviors that use pathfinding
    if (usePathfinding && wallEdges) {
      const recomputePaths = () => {
        const s = get();
        const beh = s.behaviors[behaviorId];
        if (!beh || beh.status !== "ACTIVE") return;

        const statesMap = s.npcStates[behaviorId];
        if (!statesMap) return;

        const exits = s.exitZones;
        if (exits.length === 0) return;

        const effectiveWalls = buildEffectiveWallSet(wallEdges!, beh.type);
        const newPaths: Record<string, NpcPathState> = {};

        for (const npc of Object.values(statesMap)) {
          const npcCell = { x: Math.round(npc.x), y: Math.round(npc.y) };

          // Check if already at an exit
          const isAtExit = exits.some((exit) =>
            exit.cells.some((c) => c.x === npcCell.x && c.y === npcCell.y),
          );
          if (isAtExit) {
            const exitZone = exits.find((exit) =>
              exit.cells.some((c) => c.x === npcCell.x && c.y === npcCell.y),
            );
            get().markEscaped(behaviorId, npc.tokenId, exitZone?.label ?? "saída");
            continue;
          }

          const result = findNearestExit(npcCell, exits, effectiveWalls, mapW, mapH);
          if (result && !result.blocked) {
            newPaths[npc.tokenId] = {
              waypoints: result.waypoints.slice(1), // skip current position
              status: "following",
              targetExit: result.targetExit,
            };
          } else {
            newPaths[npc.tokenId] = {
              waypoints: [],
              status: "trapped",
              targetExit: null,
            };
            broadcastSend("npc:trapped", { behaviorId, tokenId: npc.tokenId });
          }
        }

        set((prev) => ({
          npcPaths: { ...prev.npcPaths, [behaviorId]: newPaths },
        }));
      };

      recomputePaths();

      const pathInterval = window.setInterval(recomputePaths, 500);
      set((s) => ({
        pathIntervals: { ...s.pathIntervals, [behaviorId]: pathInterval },
      }));
    }

    // Movement tick (150ms)
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

      const paths = s.npcPaths[behaviorId];
      const newStatesMap: Record<string, NpcState> = {};
      const newRenderStates: Record<string, TokenRenderState> = { ...s.renderStates };
      const now = Date.now();
      const doorEvents: Array<{ type: "opened" | "broken"; doorKey: string; tokenId: string }> = [];

      for (const npc of npcList) {
        let updated: NpcState;

        if (usePathfinding && paths) {
          const npcPath = paths[npc.tokenId];
          let nextWaypoint: { x: number; y: number } | null = null;

          if (npcPath && npcPath.waypoints.length > 0 && npcPath.status === "following") {
            const wp = npcPath.waypoints[0];
            const distToWp = Math.hypot(wp.x - npc.x, wp.y - npc.y);
            if (distToWp < 0.4 && npcPath.waypoints.length > 1) {
              nextWaypoint = npcPath.waypoints[1];
            } else {
              nextWaypoint = wp;
            }
          }

          // Check door interaction for PANIC/RIOT
          if (wallEdges) {
            const npcCellX = Math.round(npc.x);
            const npcCellY = Math.round(npc.y);
            for (const [edgeKey, wallData] of Object.entries(wallEdges)) {
              if (wallData.type !== "door-closed" && wallData.type !== "door-locked") continue;
              if (wallData.style === "magic") continue;

              const [a, b] = edgeKey.split(":");
              const [ex1, ey1] = a.split(",").map(Number);
              const [ex2, ey2] = b.split(",").map(Number);
              const nearDoor =
                (npcCellX === ex1 && npcCellY === ey1) ||
                (npcCellX === ex2 && npcCellY === ey2);

              if (!nearDoor) continue;

              if (activeType === "PANIC" && wallData.type === "door-closed") {
                doorEvents.push({ type: "opened", doorKey: edgeKey, tokenId: npc.tokenId });
              } else if (activeType === "RIOT") {
                doorEvents.push({ type: "broken", doorKey: edgeKey, tokenId: npc.tokenId });
              }
            }
          }

          updated = computeNextStateWithPath(npc, npcList, config, nextWaypoint, tickCount);
        } else {
          updated = computeNextState(npc, npcList, config, tickCount);
        }

        newStatesMap[npc.tokenId] = updated;
        const prev = newRenderStates[npc.tokenId];
        newRenderStates[npc.tokenId] = {
          x: prev?.x ?? updated.x,
          y: prev?.y ?? updated.y,
          targetX: updated.x,
          targetY: updated.y,
          facing: updated.facing,
          lastUpdateAt: now,
        };
      }

      tickCount++;

      // Emit door events
      for (const evt of doorEvents) {
        broadcastSend(
          evt.type === "opened" ? "door:npc-opened" : "door:npc-broken",
          { doorKey: evt.doorKey, tokenId: evt.tokenId },
        );
      }

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
    const pathInterval = get().pathIntervals[behaviorId];
    if (pathInterval) window.clearInterval(pathInterval);

    set((s) => {
      const beh = s.behaviors[behaviorId];
      if (!beh) return s;
      const nextTick = { ...s.tickIntervals };
      delete nextTick[behaviorId];
      const nextPath = { ...s.pathIntervals };
      delete nextPath[behaviorId];
      return {
        behaviors: {
          ...s.behaviors,
          [behaviorId]: { ...beh, status: "PAUSED" as BehaviorStatus },
        },
        tickIntervals: nextTick,
        pathIntervals: nextPath,
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
    const pathInterval = get().pathIntervals[behaviorId];
    if (pathInterval) window.clearInterval(pathInterval);

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
      const newPathIntervals = { ...s.pathIntervals };
      delete newPathIntervals[behaviorId];
      const newPaths = { ...s.npcPaths };
      delete newPaths[behaviorId];

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
        pathIntervals: newPathIntervals,
        npcPaths: newPaths,
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

  markEscaped: (behaviorId, tokenId, exitLabel) => {
    set((s) => {
      const statesMap = s.npcStates[behaviorId];
      if (!statesMap) return s;

      const newStates = { ...statesMap };
      delete newStates[tokenId];

      const newRender = { ...s.renderStates };
      delete newRender[tokenId];

      const beh = s.behaviors[behaviorId];
      const newParticipants = beh
        ? beh.participants.filter((p) => p.tokenId !== tokenId)
        : [];

      return {
        npcStates: { ...s.npcStates, [behaviorId]: newStates },
        renderStates: newRender,
        behaviors: beh
          ? { ...s.behaviors, [behaviorId]: { ...beh, participants: newParticipants } }
          : s.behaviors,
        escapedTokens: [...s.escapedTokens, { tokenId, behaviorId, exitLabel }],
      };
    });

    broadcastSend("npc:escaped", { behaviorId, tokenId, exitLabel });

    // Check if all participants escaped — stop behavior
    const beh = get().behaviors[behaviorId];
    if (beh && beh.participants.length === 0) {
      get().stopBehavior(behaviorId);
    }
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

  getNpcPathStatus: (behaviorId, tokenId) => {
    const paths = get().npcPaths[behaviorId];
    if (!paths) return null;
    return paths[tokenId]?.status ?? null;
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
