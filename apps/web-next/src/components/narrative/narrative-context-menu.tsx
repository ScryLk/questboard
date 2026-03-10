"use client";

import { useEffect, useRef } from "react";
import { useNarrativeStore } from "@/stores/narrativeStore";
import { useReactFlow } from "@xyflow/react";
import type { NarrativeNodeType, BranchStatus } from "@/types/narrative";

export function NarrativeContextMenu() {
  const ref = useRef<HTMLDivElement>(null);
  const {
    contextMenu,
    setContextMenu,
    addNode,
    deleteNode,
    deleteSubtree,
    updateNodeStatus,
    selectNode,
  } = useNarrativeStore();

  const { screenToFlowPosition, fitView } = useReactFlow();

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setContextMenu(null);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [setContextMenu]);

  if (!contextMenu) return null;

  const isNodeMenu = !!contextMenu.nodeId;

  function handleAddNode(type: NarrativeNodeType) {
    const position = screenToFlowPosition({ x: contextMenu!.x, y: contextMenu!.y });
    addNode(type, position);
    setContextMenu(null);
  }

  function handleSetStatus(status: BranchStatus) {
    if (contextMenu?.nodeId) {
      updateNodeStatus(contextMenu.nodeId, status);
    }
    setContextMenu(null);
  }

  function handleEdit() {
    if (contextMenu?.nodeId) selectNode(contextMenu.nodeId);
    setContextMenu(null);
  }

  function handleDelete() {
    if (contextMenu?.nodeId) deleteNode(contextMenu.nodeId);
    setContextMenu(null);
  }

  function handleDeleteSubtree() {
    if (contextMenu?.nodeId) deleteSubtree(contextMenu.nodeId);
    setContextMenu(null);
  }

  function handleFitView() {
    fitView({ padding: 0.3 });
    setContextMenu(null);
  }

  function handleAddChild(type: NarrativeNodeType) {
    if (!contextMenu?.nodeId) return;
    const nodes = useNarrativeStore.getState().nodes;
    const parentNode = nodes.find((n) => n.id === contextMenu.nodeId);
    if (!parentNode) return;

    const position = {
      x: parentNode.position.x,
      y: parentNode.position.y + 150,
    };
    addNode(type, position);

    // Auto-connect
    const newNodes = useNarrativeStore.getState().nodes;
    const newNode = newNodes[newNodes.length - 1];
    if (newNode) {
      useNarrativeStore.getState().onConnect({
        source: contextMenu.nodeId,
        target: newNode.id,
        sourceHandle: null,
        targetHandle: null,
      });
    }
    setContextMenu(null);
  }

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[200px] rounded-xl border border-brand-border bg-brand-surface shadow-2xl"
      style={{ top: contextMenu.y, left: contextMenu.x }}
    >
      {isNodeMenu ? (
        <>
          <MenuItem label="Editar Detalhes" shortcut="Clique" onClick={handleEdit} />
          <Divider />
          <MenuLabel label="Status" />
          <MenuItem label="✓ Caminho Escolhido" onClick={() => handleSetStatus("active")} />
          <MenuItem label="◷ Pendente" onClick={() => handleSetStatus("pending")} />
          <MenuItem label="✗ Não Escolhido" onClick={() => handleSetStatus("discarded")} />
          <MenuItem label="◌ Oculto" onClick={() => handleSetStatus("hidden")} />
          <Divider />
          <MenuItem label="+ Consequência" onClick={() => handleAddChild("consequence")} />
          <MenuItem label="+ Ramificação" onClick={() => handleAddChild("choice")} />
          <Divider />
          <MenuItem label="Deletar Nó" danger onClick={handleDelete} />
          <MenuItem label="Deletar Subárvore" danger onClick={handleDeleteSubtree} />
        </>
      ) : (
        <>
          <MenuLabel label="Adicionar" />
          <MenuItem label="● Evento" onClick={() => handleAddNode("event")} />
          <MenuItem label="◆ Escolha" onClick={() => handleAddNode("choice")} />
          <MenuItem label="↳ Consequência" onClick={() => handleAddNode("consequence")} />
          <MenuItem label="═ Capítulo" onClick={() => handleAddNode("chapter")} />
          <Divider />
          <MenuItem label="Ajustar ao Centro" onClick={handleFitView} />
        </>
      )}
    </div>
  );
}

function MenuItem({
  label,
  shortcut,
  danger,
  onClick,
}: {
  label: string;
  shortcut?: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer flex w-full items-center justify-between px-3 py-2 text-left text-[12px] transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-white/5 ${
        danger ? "text-red-400 hover:bg-red-500/10" : "text-brand-text"
      }`}
    >
      {label}
      {shortcut && <span className="text-[10px] text-brand-muted">{shortcut}</span>}
    </button>
  );
}

function MenuLabel({ label }: { label: string }) {
  return (
    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
      {label}
    </div>
  );
}

function Divider() {
  return <div className="mx-2 h-px bg-brand-border" />;
}
