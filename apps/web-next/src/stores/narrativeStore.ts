import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
} from "@xyflow/react";
import type {
  NarrativeFlowNode,
  NarrativeFlowEdge,
  NarrativeNodeType,
  BranchStatus,
  ContextMenuState,
} from "@/types/narrative";
import {
  MOCK_NARRATIVE_NODES,
  MOCK_NARRATIVE_EDGES,
  MOCK_VIEWPORT,
} from "@/lib/narrative-mock-data";

interface NarrativeProgress {
  total: number;
  completed: number;
  percent: number;
  currentEvent: string | null;
}

interface NarrativeStore {
  nodes: NarrativeFlowNode[];
  edges: NarrativeFlowEdge[];
  viewport: { x: number; y: number; zoom: number };

  selectedNodeId: string | null;
  detailDrawerOpen: boolean;
  contextMenu: ContextMenuState | null;
  isPlayerView: boolean;
  isStoryPanelOpen: boolean;

  // React Flow callbacks
  onNodesChange: OnNodesChange<NarrativeFlowNode>;
  onEdgesChange: OnEdgesChange<NarrativeFlowEdge>;
  onConnect: (connection: Connection) => void;

  // Node actions
  addNode: (type: NarrativeNodeType, position: { x: number; y: number }, title?: string) => void;
  updateNodeData: (nodeId: string, data: Partial<NarrativeFlowNode["data"]>) => void;
  updateNodeStatus: (nodeId: string, status: BranchStatus) => void;
  deleteNode: (nodeId: string) => void;
  deleteSubtree: (nodeId: string) => void;

  // Edge actions
  updateEdgeStatus: (edgeId: string, status: BranchStatus) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  deleteEdge: (edgeId: string) => void;

  // UI
  selectNode: (nodeId: string) => void;
  closeDrawer: () => void;
  setContextMenu: (menu: ContextMenuState | null) => void;
  togglePlayerView: () => void;
  openStoryPanel: () => void;
  closeStoryPanel: () => void;
  toggleStoryPanel: () => void;

  // Computed
  getProgress: () => NarrativeProgress;
}

let nodeCounter = 100;

export const useNarrativeStore = create<NarrativeStore>((set, get) => ({
  nodes: MOCK_NARRATIVE_NODES,
  edges: MOCK_NARRATIVE_EDGES,
  viewport: MOCK_VIEWPORT,

  selectedNodeId: null,
  detailDrawerOpen: false,
  contextMenu: null,
  isPlayerView: false,
  isStoryPanelOpen: false,

  // ── React Flow Callbacks ──

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    const id = `e-${Date.now()}`;
    const newEdge: NarrativeFlowEdge = {
      id,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? undefined,
      targetHandle: connection.targetHandle ?? undefined,
      type: "narrative",
      data: { status: "pending" },
    };
    set({ edges: [...get().edges, newEdge] });
  },

  // ── Node Actions ──

  addNode: (type, position, title) => {
    const id = `node-${++nodeCounter}`;
    const labels: Record<NarrativeNodeType, string> = {
      event: "Novo Evento",
      choice: "Nova Escolha",
      consequence: "Nova Consequência",
      chapter: "Novo Capítulo",
    };
    const newNode: NarrativeFlowNode = {
      id,
      type,
      position,
      data: {
        title: title ?? labels[type],
        status: "pending",
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
      ),
    });
  },

  updateNodeStatus: (nodeId, status) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, status } } : n,
      ),
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
      detailDrawerOpen: get().selectedNodeId === nodeId ? false : get().detailDrawerOpen,
    });
  },

  deleteSubtree: (nodeId) => {
    const edges = get().edges;
    const toDelete = new Set<string>([nodeId]);
    const queue = [nodeId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const edge of edges) {
        if (edge.source === current && !toDelete.has(edge.target)) {
          toDelete.add(edge.target);
          queue.push(edge.target);
        }
      }
    }

    set({
      nodes: get().nodes.filter((n) => !toDelete.has(n.id)),
      edges: get().edges.filter((e) => !toDelete.has(e.source) && !toDelete.has(e.target)),
      selectedNodeId: toDelete.has(get().selectedNodeId ?? "") ? null : get().selectedNodeId,
      detailDrawerOpen: toDelete.has(get().selectedNodeId ?? "") ? false : get().detailDrawerOpen,
    });
  },

  // ── Edge Actions ──

  updateEdgeStatus: (edgeId, status) => {
    set({
      edges: get().edges.map((e) =>
        e.id === edgeId ? { ...e, data: { ...e.data, status } } : e,
      ),
    });
  },

  updateEdgeLabel: (edgeId, label) => {
    set({
      edges: get().edges.map((e) =>
        e.id === edgeId
          ? { ...e, label, data: { status: e.data?.status ?? "pending", label } }
          : e,
      ),
    });
  },

  deleteEdge: (edgeId) => {
    set({ edges: get().edges.filter((e) => e.id !== edgeId) });
  },

  // ── UI ──

  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId, detailDrawerOpen: true, contextMenu: null });
  },

  closeDrawer: () => {
    set({ selectedNodeId: null, detailDrawerOpen: false });
  },

  setContextMenu: (menu) => {
    set({ contextMenu: menu });
  },

  togglePlayerView: () => {
    set({ isPlayerView: !get().isPlayerView });
  },

  openStoryPanel: () => set({ isStoryPanelOpen: true }),
  closeStoryPanel: () => set({ isStoryPanelOpen: false }),
  toggleStoryPanel: () => set({ isStoryPanelOpen: !get().isStoryPanelOpen }),

  getProgress: () => {
    const nodes = get().nodes;
    const trackable = nodes.filter(
      (n) => n.type === "event" || n.type === "consequence",
    );
    const completed = trackable.filter((n) => n.data.status === "active");
    const total = trackable.length;
    const percent = total > 0 ? Math.round((completed.length / total) * 100) : 0;

    const activeEvents = nodes.filter(
      (n) => n.type === "event" && n.data.status === "active",
    );
    const currentEvent =
      activeEvents.length > 0
        ? activeEvents[activeEvents.length - 1].data.title
        : null;

    return { total, completed: completed.length, percent, currentEvent };
  },
}));
