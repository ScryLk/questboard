"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Search, Trash2, X } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useTokenLibraryStore } from "@/lib/token-library-store";
import type {
  EncounterGroup,
  EncounterGroupMember,
  EncounterFormation,
  HPMode,
} from "@/lib/token-library-types";
import { FORMATION_LABELS, HP_MODE_LABELS } from "@/lib/token-library-types";
import {
  CREATURE_COMPENDIUM,
  type Creature,
} from "@/lib/creature-data";
import { useCustomCreaturesStore } from "@/lib/custom-creatures-store";
import {
  calculateEncounterDifficulty,
  getDifficultyColor,
  getDifficultyLabel,
  getDifficultyPercent,
  getXPForCR,
} from "@/lib/encounter-difficulty";

interface EncounterGroupEditorProps {
  onClose: () => void;
}

function generateId(): string {
  return `egrp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function createDefaultGroup(): EncounterGroup {
  return {
    id: generateId(),
    name: "",
    description: "",
    tags: [],
    members: [],
    formation: "free",
    hpMode: "fixed",
    autoRollInitiative: false,
    addToCombat: false,
    defaultVisibility: "visible",
    totalXP: 0,
    adjustedXP: 0,
    estimatedDifficulty: "trivial",
    favorite: false,
    createdAt: new Date().toISOString(),
  };
}

export function EncounterGroupEditor({ onClose }: EncounterGroupEditorProps) {
  const targetId = useGameplayStore(
    (s) => s.encounterGroupEditorTargetId,
  );
  const groups = useTokenLibraryStore((s) => s.encounterGroups);
  const createGroup = useTokenLibraryStore((s) => s.createGroup);
  const updateGroup = useTokenLibraryStore((s) => s.updateGroup);
  const savedTokens = useTokenLibraryStore((s) => s.savedTokens);
  const customCreatures = useCustomCreaturesStore((s) => s.creatures);

  const isEditing = targetId !== null;
  const existingGroup = isEditing
    ? groups.find((g) => g.id === targetId)
    : undefined;

  const [form, setForm] = useState<EncounterGroup>(() =>
    existingGroup ? { ...existingGroup, members: existingGroup.members.map((m) => ({ ...m })) } : createDefaultGroup(),
  );

  const [partySize, setPartySize] = useState(4);
  const [partyLevel, setPartyLevel] = useState(5);
  const [showAddSearch, setShowAddSearch] = useState(false);
  const [addSearch, setAddSearch] = useState("");

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const allCreatures = useMemo(
    () => [...CREATURE_COMPENDIUM, ...customCreatures],
    [customCreatures],
  );

  // Calculate difficulty
  const difficulty = useMemo(() => {
    const creatures = form.members.map((m) => ({
      cr: m.cr,
      count: m.count,
    }));
    const partyLevels = Array(partySize).fill(partyLevel);
    return calculateEncounterDifficulty(creatures, partyLevels);
  }, [form.members, partySize, partyLevel]);

  const totalMembers = form.members.reduce((sum, m) => sum + m.count, 0);
  const diffColor = getDifficultyColor(difficulty.difficulty);
  const diffLabel = getDifficultyLabel(difficulty.difficulty);
  const percent = getDifficultyPercent(
    difficulty.adjustedXP,
    difficulty.thresholds,
  );

  function updateMemberCount(index: number, delta: number) {
    const newMembers = form.members.map((m, i) =>
      i === index ? { ...m, count: Math.max(1, m.count + delta) } : m,
    );
    setForm({ ...form, members: newMembers });
  }

  function removeMember(index: number) {
    setForm({
      ...form,
      members: form.members.filter((_, i) => i !== index),
    });
  }

  function addCreature(creature: Creature) {
    const existing = form.members.findIndex(
      (m) => m.compendiumId === creature.id,
    );
    if (existing >= 0) {
      updateMemberCount(existing, 1);
    } else {
      const member: EncounterGroupMember = {
        compendiumId: creature.id,
        name: creature.name,
        count: 1,
        cr: creature.cr,
        xp: creature.xp,
      };
      setForm({ ...form, members: [...form.members, member] });
    }
    setAddSearch("");
    setShowAddSearch(false);
  }

  function addSavedToken(tokenId: string) {
    const token = savedTokens.find((t) => t.id === tokenId);
    if (!token) return;
    const existing = form.members.findIndex((m) => m.tokenId === tokenId);
    if (existing >= 0) {
      updateMemberCount(existing, 1);
    } else {
      const member: EncounterGroupMember = {
        tokenId,
        name: token.name,
        count: 1,
        cr: token.cr,
        xp: token.xp,
      };
      setForm({ ...form, members: [...form.members, member] });
    }
    setAddSearch("");
    setShowAddSearch(false);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    const totalXP = form.members.reduce(
      (sum, m) => sum + getXPForCR(m.cr) * m.count,
      0,
    );
    const saved: EncounterGroup = {
      ...form,
      totalXP,
      adjustedXP: difficulty.adjustedXP,
      estimatedDifficulty: difficulty.difficulty,
    };
    if (isEditing) {
      updateGroup(saved.id, saved);
    } else {
      createGroup(saved);
    }
    onClose();
  }

  const filteredCreatures = addSearch.trim()
    ? allCreatures.filter(
        (c) =>
          c.name.toLowerCase().includes(addSearch.toLowerCase()) ||
          c.nameEn.toLowerCase().includes(addSearch.toLowerCase()),
      )
    : [];

  const filteredSavedTokens = addSearch.trim()
    ? savedTokens.filter((t) =>
        t.name.toLowerCase().includes(addSearch.toLowerCase()),
      )
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-brand-border bg-[#0A0A0F] shadow-2xl"
        style={{ width: "min(600px, calc(100vw - 32px))" }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-brand-border px-5 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-text">
            {isEditing ? "Editar Grupo" : "Criar Grupo de Encontro"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-5">
            {/* Name & description */}
            <section>
              <div className="space-y-2">
                <div>
                  <label className="mb-1 block text-[10px] text-brand-muted">
                    Nome do Grupo
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Patrulha Goblin"
                    className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-brand-muted">
                    Notas
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Encontro tipico na estrada..."
                    rows={2}
                    className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
                  />
                </div>
              </div>
            </section>

            {/* Composition */}
            <section>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
                Composicao
              </h3>

              {form.members.length === 0 ? (
                <p className="mb-2 text-[10px] text-brand-muted">
                  Nenhum membro adicionado.
                </p>
              ) : (
                <div className="mb-2 space-y-1">
                  {form.members.map((member, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-md border border-brand-border px-2 py-1.5"
                    >
                      <span className="text-[10px] text-brand-accent">⚔</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-brand-text">
                          {member.name}
                        </p>
                        <p className="text-[9px] text-brand-muted">
                          ND {member.cr} · XP {member.xp}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateMemberCount(i, -1)}
                          className="flex h-5 w-5 items-center justify-center rounded bg-white/5 text-brand-muted hover:bg-white/10"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-[11px] tabular-nums text-brand-text">
                          {member.count}
                        </span>
                        <button
                          onClick={() => updateMemberCount(i, 1)}
                          className="flex h-5 w-5 items-center justify-center rounded bg-white/5 text-brand-muted hover:bg-white/10"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeMember(i)}
                        className="text-brand-muted/30 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add member */}
              {showAddSearch ? (
                <div className="rounded-md border border-brand-accent/30 p-2">
                  <div className="relative mb-1.5">
                    <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-brand-muted/50" />
                    <input
                      type="text"
                      value={addSearch}
                      onChange={(e) => setAddSearch(e.target.value)}
                      placeholder="Buscar criatura ou token..."
                      autoFocus
                      className="h-7 w-full rounded-md border border-brand-border bg-brand-primary pl-7 pr-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
                    />
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {/* Compendium results */}
                    {filteredCreatures.slice(0, 8).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => addCreature(c)}
                        className="flex w-full items-center gap-2 rounded px-2 py-1 text-left transition-colors hover:bg-white/[0.03]"
                      >
                        <span className="text-sm">{c.icon}</span>
                        <span className="flex-1 text-[11px] text-brand-text">
                          {c.name}
                        </span>
                        <span className="text-[9px] text-brand-muted">
                          ND {c.cr}
                        </span>
                      </button>
                    ))}
                    {/* Saved tokens */}
                    {filteredSavedTokens.slice(0, 5).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => addSavedToken(t.id)}
                        className="flex w-full items-center gap-2 rounded px-2 py-1 text-left transition-colors hover:bg-white/[0.03]"
                      >
                        <span className="text-[10px] text-brand-accent">
                          ★
                        </span>
                        <span className="flex-1 text-[11px] text-brand-text">
                          {t.name}
                        </span>
                        <span className="text-[9px] text-brand-muted">
                          ND {t.cr}
                        </span>
                      </button>
                    ))}
                    {addSearch.trim() &&
                      filteredCreatures.length === 0 &&
                      filteredSavedTokens.length === 0 && (
                        <p className="px-2 py-2 text-center text-[10px] text-brand-muted">
                          Nenhum resultado.
                        </p>
                      )}
                  </div>
                  <button
                    onClick={() => {
                      setShowAddSearch(false);
                      setAddSearch("");
                    }}
                    className="mt-1 w-full text-[10px] text-brand-muted hover:text-brand-text"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddSearch(true)}
                  className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-brand-border py-1.5 text-[10px] font-medium text-brand-muted transition-colors hover:border-brand-accent/30 hover:text-brand-text"
                >
                  <Plus className="h-3 w-3" />
                  Adicionar Membro
                </button>
              )}
            </section>

            {/* Difficulty */}
            {form.members.length > 0 && (
              <section>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
                  Dificuldade Estimada
                </h3>

                <div className="mb-2 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <label className="text-[10px] text-brand-muted">
                      Jogadores:
                    </label>
                    <input
                      type="number"
                      value={partySize}
                      onChange={(e) =>
                        setPartySize(
                          Math.max(1, parseInt(e.target.value) || 1),
                        )
                      }
                      min={1}
                      max={10}
                      className="h-6 w-10 rounded border border-brand-border bg-brand-primary px-1 text-center text-[10px] text-brand-text outline-none focus:border-brand-accent/40"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="text-[10px] text-brand-muted">
                      Nivel:
                    </label>
                    <input
                      type="number"
                      value={partyLevel}
                      onChange={(e) =>
                        setPartyLevel(
                          Math.max(
                            1,
                            Math.min(20, parseInt(e.target.value) || 1),
                          ),
                        )
                      }
                      min={1}
                      max={20}
                      className="h-6 w-10 rounded border border-brand-border bg-brand-primary px-1 text-center text-[10px] text-brand-text outline-none focus:border-brand-accent/40"
                    />
                  </div>
                </div>

                <div className="rounded-md border border-brand-border bg-white/[0.01] p-2.5">
                  <div className="mb-1 flex items-center justify-between text-[10px]">
                    <span className="text-brand-muted">
                      {totalMembers} criaturas · XP {difficulty.totalXP} (ajust.{" "}
                      {difficulty.adjustedXP})
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: diffColor }}
                    >
                      {diffLabel}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: diffColor,
                      }}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Options */}
            <section>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
                Opcoes
              </h3>

              <div className="space-y-2">
                {/* Formation */}
                <div>
                  <label className="mb-1 block text-[10px] text-brand-muted">
                    Formacao
                  </label>
                  <div className="flex gap-1">
                    {(
                      Object.entries(FORMATION_LABELS) as [
                        EncounterFormation,
                        string,
                      ][]
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setForm({ ...form, formation: key })}
                        className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-colors ${
                          form.formation === key
                            ? "bg-brand-accent/20 text-brand-accent"
                            : "border border-brand-border text-brand-muted hover:text-brand-text"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* HP Mode */}
                <div>
                  <label className="mb-1 block text-[10px] text-brand-muted">
                    HP ao Adicionar
                  </label>
                  <div className="flex gap-1">
                    {(
                      Object.entries(HP_MODE_LABELS) as [HPMode, string][]
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setForm({ ...form, hpMode: key })}
                        className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-colors ${
                          form.hpMode === key
                            ? "bg-brand-accent/20 text-brand-accent"
                            : "border border-brand-border text-brand-muted hover:text-brand-text"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility */}
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 text-[10px] text-brand-text">
                    <input
                      type="checkbox"
                      checked={form.defaultVisibility === "visible"}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          defaultVisibility: e.target.checked
                            ? "visible"
                            : "hidden",
                        })
                      }
                      className="accent-brand-accent"
                    />
                    Visivel para jogadores
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px] text-brand-text">
                    <input
                      type="checkbox"
                      checked={form.addToCombat}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          addToCombat: e.target.checked,
                        })
                      }
                      className="accent-brand-accent"
                    />
                    Adicionar ao combate
                  </label>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-brand-border px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-brand-border px-4 py-1.5 text-xs text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || form.members.length === 0}
            className="rounded-lg bg-brand-accent px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-accent-hover disabled:opacity-40"
          >
            {isEditing ? "Salvar Alteracoes" : "Criar Grupo"}
          </button>
        </div>
      </div>
    </div>
  );
}
