export type PhaseType =
  | "exploration"
  | "combat"
  | "roleplay"
  | "investigation"
  | "travel"
  | "rest_short"
  | "rest_long"
  | "narration";

export interface SessionPhase {
  id: string;
  type: PhaseType;
  label: string;
  startedAt: Date;
  endedAt?: Date;
  durationMinutes?: number;
  notes?: string;
}

export interface PhaseTransitionRule {
  from: PhaseType;
  suggestions: PhaseType[];
}
