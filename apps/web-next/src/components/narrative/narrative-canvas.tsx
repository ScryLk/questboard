/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./narrative-flow.css";
import { useNarrativeStore } from "@/stores/narrativeStore";
import { narrativeNodeTypes } from "./nodes";
import { narrativeEdgeTypes } from "./narrative-edge";
import { NarrativeContextMenu } from "./narrative-context-menu";
import { NodeDetailDrawer } from "./node-detail-drawer";
import type { NarrativeNodeType } from "@/types/narrative";
import { Plus, Eye, EyeOff } from "lucide-react";

function NarrativeCanvasInner() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
    setContextMenu,
    contextMenu,
    detailDrawerOpen,
    isPlayerView,
    togglePlayerView,
    addNode,
  } = useNarrativeStore();

  const { screenToFlowPosition } = useReactFlow();

  // Filter nodes/edges for player view
  const visibleNodes = useMemo(() => {
    if (!isPlayerView) return nodes;
    return nodes.filter((n) => n.data.status === "active" || n.data.status === "pending");
  }, [nodes, isPlayerView]);

  const visibleEdges = useMemo(() => {
    if (!isPlayerView) return edges;
    const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
    return edges.filter(
      (e) =>
        visibleNodeIds.has(e.source) &&
        visibleNodeIds.has(e.target) &&
        (e.data?.status === "active" || e.data?.status === "pending"),
    );
  }, [edges, isPlayerView, visibleNodes]);

  const onNodeClick = useCallback(
    (_event: any, node: any) => {
      if (!isPlayerView) selectNode(node.id);
    },
    [selectNode, isPlayerView],
  );

  const onPaneContextMenu = useCallback(
    (event: any) => {
      event.preventDefault();
      if (isPlayerView) return;
      setContextMenu({ x: event.clientX, y: event.clientY });
    },
    [setContextMenu, isPlayerView],
  );

  const onNodeContextMenu = useCallback(
    (event: any, node: any) => {
      event.preventDefault();
      if (isPlayerView) return;
      setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
    },
    [setContextMenu, isPlayerView],
  );

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, [setContextMenu]);

  const onDoubleClick = useCallback(
    (event: any) => {
      if (isPlayerView) return;
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNode("event", position);
    },
    [addNode, screenToFlowPosition, isPlayerView],
  );

  const handleAddNode = useCallback(
    (type: NarrativeNodeType) => {
      const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      addNode(type, position);
    },
    [addNode, screenToFlowPosition],
  );

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        onNodesChange={isPlayerView ? undefined : onNodesChange}
        onEdgesChange={isPlayerView ? undefined : onEdgesChange}
        onConnect={isPlayerView ? undefined : onConnect}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={onPaneClick}
        onDoubleClick={onDoubleClick}
        nodeTypes={narrativeNodeTypes as any}
        edgeTypes={narrativeEdgeTypes as any}
        defaultEdgeOptions={{ type: "narrative" }}
        nodesDraggable={!isPlayerView}
        nodesConnectable={!isPlayerView}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        {/* @ts-expect-error React 19 JSX compat */}
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1E1E2A" />
        {/* @ts-expect-error React 19 JSX compat */}
        <Controls
          showInteractive={false}
          className="!border-brand-border !bg-brand-surface !shadow-lg"
        />
        <MiniMap
          nodeStrokeWidth={3}
          className="!border-brand-border !bg-brand-surface"
          maskColor="rgba(10, 10, 15, 0.7)"
        />
      </ReactFlow>

      {/* Toolbar */}
      {!isPlayerView && (
        <div className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-surface/90 p-1.5 backdrop-blur-sm">
          <ToolbarButton label="Evento" onClick={() => handleAddNode("event")} />
          <ToolbarButton label="Escolha" onClick={() => handleAddNode("choice")} />
          <ToolbarButton label="Consequência" onClick={() => handleAddNode("consequence")} />
          <ToolbarButton label="Capítulo" onClick={() => handleAddNode("chapter")} />
        </div>
      )}

      {/* Player View Toggle */}
      <div className="absolute right-4 top-4 z-10">
        <button
          onClick={togglePlayerView}
          className={`cursor-pointer flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-medium backdrop-blur-sm transition-colors ${
            isPlayerView
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-brand-border bg-brand-surface/90 text-brand-muted hover:text-brand-text"
          }`}
        >
          {isPlayerView ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {isPlayerView ? "Visão Jogador" : "Visão GM"}
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && <NarrativeContextMenu />}

      {/* Detail Drawer */}
      {detailDrawerOpen && <NodeDetailDrawer />}
    </div>
  );
}

function ToolbarButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
    >
      <Plus className="h-3 w-3" />
      {label}
    </button>
  );
}

export function NarrativeCanvas() {
  return (
    <ReactFlowProvider>
      <NarrativeCanvasInner />
    </ReactFlowProvider>
  );
}
