"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Save } from "lucide-react";
import { useNarrativeStore } from "@/stores/narrativeStore";
import type { NarrativeNodeType, BranchStatus } from "@/types/narrative";

const TYPE_LABELS: Record<NarrativeNodeType, string> = {
  event: "Evento",
  choice: "Escolha",
  consequence: "Consequência",
  chapter: "Capítulo",
};

const STATUS_OPTIONS: { value: BranchStatus; label: string; dot: string }[] = [
  { value: "active", label: "Ativo", dot: "bg-emerald-400" },
  { value: "pending", label: "Pendente", dot: "bg-brand-muted" },
  { value: "discarded", label: "Descartado", dot: "bg-gray-600" },
  { value: "hidden", label: "Oculto", dot: "bg-red-800" },
];

const NODE_COLORS = [
  { value: undefined, label: "Padrão" },
  { value: "#10B981", label: "Verde" },
  { value: "#EF4444", label: "Vermelho" },
  { value: "#C9A84C", label: "Dourado" },
  { value: "#6C5CE7", label: "Roxo" },
  { value: "#3B82F6", label: "Azul" },
];

export function NodeDetailDrawer() {
  const {
    selectedNodeId,
    nodes,
    closeDrawer,
    updateNodeData,
    updateNodeStatus,
    deleteNode,
  } = useNarrativeStore();

  const node = nodes.find((n) => n.id === selectedNodeId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gmNotes, setGmNotes] = useState("");
  const [sessionNumber, setSessionNumber] = useState<string>("");
  const [chapterLabel, setChapterLabel] = useState("");

  // Sync local state when selected node changes
  useEffect(() => {
    if (node) {
      setTitle(node.data.title);
      setDescription(node.data.description ?? "");
      setGmNotes(node.data.gmNotes ?? "");
      setSessionNumber(node.data.sessionNumber?.toString() ?? "");
      setChapterLabel(node.data.chapterLabel ?? "");
    }
  }, [node?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!node) return null;

  function handleSave() {
    if (!selectedNodeId) return;
    updateNodeData(selectedNodeId, {
      title,
      description: description || undefined,
      gmNotes: gmNotes || undefined,
      sessionNumber: sessionNumber ? parseInt(sessionNumber, 10) : undefined,
      chapterLabel: chapterLabel || undefined,
    });
    closeDrawer();
  }

  function handleDelete() {
    if (!selectedNodeId) return;
    deleteNode(selectedNodeId);
    closeDrawer();
  }

  function handleStatusChange(status: BranchStatus) {
    if (!selectedNodeId) return;
    updateNodeStatus(selectedNodeId, status);
  }

  function handleColorChange(color: string | undefined) {
    if (!selectedNodeId) return;
    updateNodeData(selectedNodeId, { color });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-[400px] flex-col border-l border-brand-border bg-brand-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              {TYPE_LABELS[node.type as NarrativeNodeType] ?? node.type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="cursor-pointer rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10"
              title="Deletar nó"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={closeDrawer}
              className="cursor-pointer rounded-lg p-2 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {/* Status */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Status
            </label>
            <div className="flex gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className={`cursor-pointer flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                    node.data.status === opt.value
                      ? "bg-white/10 text-brand-text"
                      : "text-brand-muted hover:bg-white/5 hover:text-brand-text"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-brand-border bg-brand-primary px-3 py-2.5 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Visível para jogadores no caminho ativo..."
              className="w-full resize-none rounded-lg border border-brand-border bg-brand-primary px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 outline-none focus:border-brand-accent"
            />
          </div>

          {/* Session */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Sessão
            </label>
            <input
              type="number"
              value={sessionNumber}
              onChange={(e) => setSessionNumber(e.target.value)}
              placeholder="Nº da sessão"
              className="w-full rounded-lg border border-brand-border bg-brand-primary px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 outline-none focus:border-brand-accent"
            />
          </div>

          {/* Chapter Label (only for chapter type) */}
          {node.type === "chapter" && (
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
                Label do Capítulo
              </label>
              <input
                type="text"
                value={chapterLabel}
                onChange={(e) => setChapterLabel(e.target.value)}
                placeholder="Ex: Ato II"
                className="w-full rounded-lg border border-brand-border bg-brand-primary px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 outline-none focus:border-brand-accent"
              />
            </div>
          )}

          {/* GM Notes */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Notas do GM <span className="text-[9px] normal-case text-brand-muted">(privado)</span>
            </label>
            <textarea
              value={gmNotes}
              onChange={(e) => setGmNotes(e.target.value)}
              rows={4}
              placeholder="Jogadores nunca veem este campo..."
              className="w-full resize-none rounded-lg border border-brand-border bg-brand-primary px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 outline-none focus:border-brand-accent"
            />
          </div>

          {/* Color */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Cor do Nó
            </label>
            <div className="flex gap-2">
              {NODE_COLORS.map((c) => (
                <button
                  key={c.label}
                  onClick={() => handleColorChange(c.value)}
                  title={c.label}
                  className={`cursor-pointer h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                    node.data.color === c.value || (!node.data.color && !c.value)
                      ? "border-white scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.value ?? "#2A2A3A" }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-brand-border px-5 py-4">
          <button
            onClick={handleSave}
            className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg bg-brand-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-accent/80"
          >
            <Save className="h-4 w-4" />
            Salvar Alterações
          </button>
        </div>
      </div>
    </>
  );
}
