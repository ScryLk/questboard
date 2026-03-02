// ── Story / Campaign Types ──

export type ArcStatus = "planned" | "active" | "completed" | "abandoned";
export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface StoryArc {
  id: string;
  sessionId: string;
  title: string;
  description: string;
  status: ArcStatus;
  order: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryEvent {
  id: string;
  arcId: string;
  sessionId: string;
  title: string;
  description: string;
  date: string;
  type: "plot" | "encounter" | "milestone" | "discovery" | "npc_interaction";
  isCompleted: boolean;
  order: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface StoryTask {
  id: string;
  arcId: string | null;
  sessionId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: Date | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryNote {
  id: string;
  sessionId: string;
  title: string;
  content: string;
  category: "plot" | "npc" | "location" | "item" | "general";
  isGmOnly: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  sessionId: string;
  createdAt: Date;
}
