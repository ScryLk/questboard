"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  ArrowRight,
  Flag,
  Dice5,
} from "lucide-react";
import { useNpcConversationStore } from "@/lib/npc-conversation-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import type {
  DialogueNode,
  DialogueOption,
  DialogueCondition,
  NpcConversationProfile,
} from "@/lib/npc-conversation-types";

function genId() {
  return `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function genOptId() {
  return `opt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

interface DialogueTreeEditorProps {
  onClose: () => void;
}

export function DialogueTreeEditor({ onClose }: DialogueTreeEditorProps) {
  const npcEditorTargetId = useGameplayStore((s) => s.npcEditorTargetId);
  const getProfile = useNpcConversationStore((s) => s.getProfile);
  const setProfile = useNpcConversationStore((s) => s.setProfile);

  const profile = npcEditorTargetId ? getProfile(npcEditorTargetId) : null;

  const [nodes, setNodes] = useState<DialogueNode[]>(
    profile?.dialogueTree ?? [],
  );
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);

  function addNode() {
    const isFirst = nodes.length === 0;
    const newNode: DialogueNode = {
      id: genId(),
      npcText: "",
      isRoot: isFirst,
      conditions: [],
      options: [],
    };
    setNodes((prev) => [...prev, newNode]);
    setExpandedNodeId(newNode.id);
  }

  function updateNode(nodeId: string, updates: Partial<DialogueNode>) {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
    );
  }

  function removeNode(nodeId: string) {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    if (expandedNodeId === nodeId) setExpandedNodeId(null);
  }

  function addOption(nodeId: string) {
    const newOpt: DialogueOption = {
      id: genOptId(),
      text: "",
      nextNodeId: null,
    };
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, options: [...n.options, newOpt] } : n,
      ),
    );
  }

  function updateOption(
    nodeId: string,
    optionId: string,
    updates: Partial<DialogueOption>,
  ) {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              options: n.options.map((o) =>
                o.id === optionId ? { ...o, ...updates } : o,
              ),
            }
          : n,
      ),
    );
  }

  function removeOption(nodeId: string, optionId: string) {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? { ...n, options: n.options.filter((o) => o.id !== optionId) }
          : n,
      ),
    );
  }

  function handleSave() {
    if (!npcEditorTargetId || !profile) return;
    setProfile(npcEditorTargetId, {
      ...profile,
      dialogueTree: nodes,
    });
    onClose();
  }

  function toggleRoot(nodeId: string) {
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        isRoot: n.id === nodeId ? !n.isRoot : n.isRoot,
      })),
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-brand-border bg-[#0A0A0F] shadow-2xl"
        style={{ width: "min(900px, calc(100vw - 32px))" }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-brand-border px-5 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-text">
            Editor de Árvore de Diálogos
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {nodes.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <MessageSquare className="h-10 w-10 text-brand-muted/30" />
              <p className="text-sm text-brand-muted">
                Nenhum nó de diálogo criado ainda.
              </p>
              <p className="text-xs text-brand-muted/60">
                Crie nós para definir o que o NPC fala e as respostas disponíveis para o jogador.
              </p>
            </div>
          )}

          {nodes.map((node, idx) => {
            const isExpanded = expandedNodeId === node.id;
            return (
              <div
                key={node.id}
                className="rounded-lg border border-brand-border bg-white/[0.02]"
              >
                {/* Node header */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <GripVertical className="h-4 w-4 shrink-0 text-brand-muted/30 cursor-grab" />
                  <button
                    onClick={() =>
                      setExpandedNodeId(isExpanded ? null : node.id)
                    }
                    className="text-brand-muted"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <span className="text-[10px] font-mono text-brand-muted/50">
                    #{idx + 1}
                  </span>
                  {node.isRoot && (
                    <span className="rounded bg-brand-accent/20 px-1.5 py-0.5 text-[9px] font-semibold text-brand-accent">
                      RAIZ
                    </span>
                  )}
                  <span className="flex-1 truncate text-[11px] text-brand-text">
                    {node.npcText || "(texto vazio)"}
                  </span>
                  <span className="text-[9px] text-brand-muted">
                    {node.options.length} opções
                  </span>
                  {node.conditions.length > 0 && (
                    <span className="rounded bg-[#E17055]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#E17055]">
                      {node.conditions.length} condições
                    </span>
                  )}
                  <button
                    onClick={() => removeNode(node.id)}
                    className="flex h-6 w-6 items-center justify-center rounded text-brand-muted hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-brand-border/50 px-4 py-3 space-y-4">
                    {/* Root toggle */}
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={node.isRoot}
                        onChange={() => toggleRoot(node.id)}
                        className="accent-brand-accent"
                      />
                      <span className="text-[11px] text-brand-text">
                        Nó raiz (primeiro a ser exibido)
                      </span>
                    </label>

                    {/* NPC text */}
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
                        Texto do NPC
                      </label>
                      <textarea
                        value={node.npcText}
                        onChange={(e) =>
                          updateNode(node.id, { npcText: e.target.value })
                        }
                        placeholder="O que o NPC fala neste nó..."
                        rows={3}
                        className="mt-1 w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
                      />
                    </div>

                    {/* Options */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
                          Opções do Jogador
                        </label>
                        <button
                          onClick={() => addOption(node.id)}
                          className="flex items-center gap-1 text-[10px] text-brand-accent hover:text-brand-accent/80"
                        >
                          <Plus className="h-3 w-3" />
                          Adicionar
                        </button>
                      </div>
                      <div className="mt-2 space-y-2">
                        {node.options.map((opt, optIdx) => (
                          <div
                            key={opt.id}
                            className="flex items-start gap-2 rounded-md border border-brand-border/50 bg-white/[0.01] p-2"
                          >
                            <span className="mt-1.5 text-[10px] font-bold text-brand-accent/50">
                              {optIdx + 1}.
                            </span>
                            <div className="flex-1 space-y-1.5">
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) =>
                                  updateOption(node.id, opt.id, {
                                    text: e.target.value,
                                  })
                                }
                                placeholder="Texto da resposta..."
                                className="w-full rounded border border-brand-border/40 bg-brand-primary px-2 py-1 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
                              />
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-3 w-3 text-brand-muted/40" />
                                <select
                                  value={opt.nextNodeId ?? ""}
                                  onChange={(e) =>
                                    updateOption(node.id, opt.id, {
                                      nextNodeId: e.target.value || null,
                                    })
                                  }
                                  className="flex-1 rounded border border-brand-border/40 bg-brand-primary px-2 py-0.5 text-[10px] text-brand-text outline-none"
                                >
                                  <option value="">Encerrar conversa</option>
                                  {nodes
                                    .filter((n) => n.id !== node.id)
                                    .map((n, i) => (
                                      <option key={n.id} value={n.id}>
                                        #{i + 1}: {n.npcText.slice(0, 40) || "(vazio)"}
                                      </option>
                                    ))}
                                </select>
                              </div>

                              {/* Condition */}
                              {opt.condition ? (
                                <div className="flex items-center gap-2">
                                  <ConditionBadge condition={opt.condition} />
                                  <button
                                    onClick={() =>
                                      updateOption(node.id, opt.id, {
                                        condition: undefined,
                                      })
                                    }
                                    className="text-[9px] text-red-400 hover:text-red-300"
                                  >
                                    remover
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    updateOption(node.id, opt.id, {
                                      condition: {
                                        type: "skill_check",
                                        skill: "Persuasão",
                                        dc: 15,
                                      },
                                    })
                                  }
                                  className="text-[10px] text-brand-muted hover:text-brand-accent"
                                >
                                  + Condição
                                </button>
                              )}
                            </div>
                            <button
                              onClick={() => removeOption(node.id, opt.id)}
                              className="mt-1 flex h-5 w-5 items-center justify-center rounded text-brand-muted hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add node button */}
          <button
            onClick={addNode}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-brand-border py-3 text-[11px] text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-accent"
          >
            <Plus className="h-4 w-4" />
            Adicionar Nó
          </button>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-brand-border px-5 py-3">
          <span className="text-[10px] text-brand-muted">
            {nodes.length} nós · {nodes.reduce((a, n) => a + n.options.length, 0)} opções
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-brand-border px-4 py-1.5 text-xs text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-brand-accent px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-accent-hover"
            >
              Salvar Árvore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConditionBadge({ condition }: { condition: DialogueCondition }) {
  switch (condition.type) {
    case "skill_check":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-[#E17055]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#E17055]">
          <Dice5 className="h-2.5 w-2.5" />
          {condition.skill} CD{condition.dc}
        </span>
      );
    case "reputation":
      return (
        <span className="rounded bg-[#6C5CE7]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#6C5CE7]">
          Rep ≥ {condition.min}
        </span>
      );
    case "class":
      return (
        <span className="rounded bg-[#00B894]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#00B894]">
          Classe: {condition.value}
        </span>
      );
    case "item":
      return (
        <span className="rounded bg-[#FDCB6E]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#FDCB6E]">
          Tem: {condition.value}
        </span>
      );
    case "race":
      return (
        <span className="rounded bg-[#74B9FF]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#74B9FF]">
          Raça: {condition.value}
        </span>
      );
    default:
      return (
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-brand-muted">
          {condition.type}
        </span>
      );
  }
}
