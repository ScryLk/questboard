import type { Node, Edge } from "@xyflow/react";

// ── Node & Edge Types ──

export type NarrativeNodeType = "event" | "choice" | "consequence" | "chapter";

export type BranchStatus = "active" | "pending" | "discarded" | "hidden";

// ── Node Data Payloads ──

export interface BaseNodeData {
  title: string;
  description?: string;
  status: BranchStatus;
  color?: string;
  gmNotes?: string;
  sessionId?: string;
  sessionNumber?: number;
  linkedEncounterIds?: string[];
  linkedNpcIds?: string[];
  linkedMapIds?: string[];
  chapterLabel?: string;
  [key: string]: unknown;
}

export type NarrativeFlowNode = Node<BaseNodeData, NarrativeNodeType>;

export type NarrativeFlowEdge = Edge & {
  data?: {
    status: BranchStatus;
    label?: string;
  };
};

// ── Context Menu ──

export interface ContextMenuState {
  x: number;
  y: number;
  nodeId?: string;
  edgeId?: string;
}
