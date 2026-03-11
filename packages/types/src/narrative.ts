// ── Narrative Branching Types ──

export type NarrativeNodeType = "event" | "choice" | "consequence" | "chapter";

export type BranchStatus = "active" | "pending" | "discarded" | "hidden";

export interface NarrativeNode {
  id: string;
  campaignId: string;
  type: NarrativeNodeType;
  title: string;
  description?: string | null;
  status: BranchStatus;
  position: { x: number; y: number };
  sessionId?: string | null;
  sessionNumber?: number | null;
  gmNotes?: string | null;
  linkedEncounterIds: string[];
  linkedNpcIds: string[];
  linkedMapIds: string[];
  chapterLabel?: string | null;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NarrativeEdge {
  id: string;
  campaignId: string;
  source: string;
  target: string;
  label?: string | null;
  status: BranchStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface NarrativeTree {
  id: string;
  campaignId: string;
  nodes: NarrativeNode[];
  edges: NarrativeEdge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  updatedAt: Date;
}
