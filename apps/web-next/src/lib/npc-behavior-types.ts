// ── NPC Group Behavior Types ──

export type BehaviorType =
  | "IDLE"
  | "CROWD"
  | "PATROL"
  | "GUARD"
  | "FLEE"
  | "PANIC"
  | "RIOT"
  | "FOLLOW"
  | "SEARCH";

export type BehaviorStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
export type ParticipantRole = "LEADER" | "MEMBER" | "OUTLIER";

export interface BehaviorTarget {
  x: number;
  y: number;
  tokenId?: string;
}

export interface BehaviorPhase {
  type: BehaviorType;
  durationMs: number;
}

export interface BehaviorConfig {
  type: BehaviorType;
  speed: number;
  chaosCoefficient: number;
  separationRadius: number;
  target?: BehaviorTarget;
  waypoints?: Array<{ x: number; y: number }>;
  phases?: BehaviorPhase[];
  loopPatrol?: boolean;
  walls: Set<string>;
}

export interface NpcState {
  tokenId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: number;
  role: ParticipantRole;
}

export interface BehaviorParticipant {
  tokenId: string;
  role: ParticipantRole;
  startX: number;
  startY: number;
}

export interface NpcBehavior {
  id: string;
  sessionId: string;
  mapId: string;
  type: BehaviorType;
  status: BehaviorStatus;
  config: Omit<BehaviorConfig, "walls" | "type">;
  aiParams?: AiBehaviorParams;
  participants: BehaviorParticipant[];
  startedAt: string;
  endedAt: string | null;
  durationMs: number | null;
}

export interface AiBehaviorParams {
  behaviorType: BehaviorType;
  config: {
    speed: number;
    chaosCoefficient: number;
    separationRadius: number;
    target?: { x: number; y: number };
  };
  phases?: BehaviorPhase[];
  participantRoles?: Array<{ index: number; role: ParticipantRole }>;
  narratorMessage?: string;
  reasoning?: string;
}

export interface BehaviorTickPayload {
  behaviorId: string;
  timestamp: number;
  positions: Array<{
    tokenId: string;
    x: number;
    y: number;
    facing: number;
  }>;
}

// ── UI Constants ──

export const BEHAVIOR_META: Record<
  BehaviorType,
  { label: string; emoji: string; description: string; defaultSpeed: number; defaultChaos: number }
> = {
  IDLE: { label: "Parado", emoji: "🧍", description: "Micro-movimentos sutis", defaultSpeed: 0.3, defaultChaos: 0 },
  CROWD: { label: "Multidão", emoji: "👥", description: "Boids — agrupam e circulam", defaultSpeed: 1, defaultChaos: 0.1 },
  PATROL: { label: "Patrulha", emoji: "🔄", description: "Seguem waypoints", defaultSpeed: 2, defaultChaos: 0 },
  GUARD: { label: "Guarda", emoji: "🛡️", description: "Vigiam um ponto", defaultSpeed: 0.5, defaultChaos: 0.1 },
  FLEE: { label: "Fuga", emoji: "🏃", description: "Fogem de um alvo", defaultSpeed: 3.5, defaultChaos: 0.3 },
  PANIC: { label: "Pânico", emoji: "😰", description: "Dispersão caótica", defaultSpeed: 3, defaultChaos: 0.8 },
  RIOT: { label: "Tumulto", emoji: "⚔️", description: "Líderes avançam, membros seguem", defaultSpeed: 2.5, defaultChaos: 0.7 },
  FOLLOW: { label: "Seguir", emoji: "🚶", description: "Seguem um líder", defaultSpeed: 2, defaultChaos: 0.2 },
  SEARCH: { label: "Busca", emoji: "🔍", description: "Percorrem o mapa", defaultSpeed: 2, defaultChaos: 0.2 },
};

export const DURATION_OPTIONS = [
  { value: 0, label: "Indefinido" },
  { value: 5000, label: "5 segundos" },
  { value: 10000, label: "10 segundos" },
  { value: 15000, label: "15 segundos" },
  { value: 30000, label: "30 segundos" },
  { value: 60000, label: "1 minuto" },
];
