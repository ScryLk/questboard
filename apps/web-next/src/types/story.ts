export type ArcStatus = "completed" | "in_progress" | "planned";
export type EventStatus = "completed" | "in_progress" | "pending" | "skipped";
export type EventType =
  | "encounter"
  | "revelation"
  | "milestone"
  | "exploration"
  | "social"
  | "rest"
  | "custom";

export interface StoryTask {
  id: string;
  label: string;
  isDone: boolean;
}

export interface StoryEvent {
  id: string;
  arcId: string;
  title: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  sessionId?: string;
  sessionNumber?: number;
  order: number;

  linkedNpcIds: string[];
  linkedMapIds: string[];
  linkedEncounterIds: string[];
  loot: string[];

  tasks: StoryTask[];
  gmNotes?: string;
  aiGenerated?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface StoryArc {
  id: string;
  campaignId: string;
  title: string;
  description?: string;
  status: ArcStatus;
  order: number;
  color: string;
  events: StoryEvent[];
  createdAt: Date;
}

export function calcArcProgress(arc: StoryArc): number {
  if (!arc.events.length) return 0;
  const done = arc.events.filter((e) => e.status === "completed").length;
  return Math.round((done / arc.events.length) * 100);
}

export function calcCampaignProgress(arcs: StoryArc[]): number {
  const allEvents = arcs.flatMap((a) => a.events);
  if (!allEvents.length) return 0;
  const done = allEvents.filter((e) => e.status === "completed").length;
  return Math.round((done / allEvents.length) * 100);
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  encounter: "Encontro",
  revelation: "Revelação",
  milestone: "Marco",
  exploration: "Exploração",
  social: "Social",
  rest: "Descanso",
  custom: "Personalizado",
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  completed: "Concluído",
  in_progress: "Em Andamento",
  pending: "Pendente",
  skipped: "Pulado",
};

export const ARC_STATUS_LABELS: Record<ArcStatus, string> = {
  completed: "Completo",
  in_progress: "Em Progresso",
  planned: "Planejado",
};
