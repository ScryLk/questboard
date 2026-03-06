"use client";

import { useState } from "react";
import { Plus, GripVertical, Trash2, Copy, Pencil } from "lucide-react";
import { useMapSidebarStore } from "@/lib/map-sidebar-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import { SCENE_TRANSITION_LABELS } from "@/lib/map-sidebar-types";
import type { SceneTransition } from "@/lib/map-sidebar-types";

export function SceneList() {
  const scenes = useMapSidebarStore((s) => s.scenes);
  const activeSceneId = useMapSidebarStore((s) => s.activeSceneId);
  const setActiveScene = useMapSidebarStore((s) => s.setActiveScene);
  const addScene = useMapSidebarStore((s) => s.addScene);
  const removeScene = useMapSidebarStore((s) => s.removeScene);
  const updateScene = useMapSidebarStore((s) => s.updateScene);
  const sceneTransition = useMapSidebarStore((s) => s.sceneTransition);
  const setSceneTransition = useMapSidebarStore((s) => s.setSceneTransition);
  const setIsTransitioning = useMapSidebarStore((s) => s.setIsTransitioning);
  const openModal = useGameplayStore((s) => s.openModal);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function handleSwitchScene(sceneId: string) {
    if (sceneId === activeSceneId) return;
    setIsTransitioning(true);
    // Small delay for transition effect
    setTimeout(() => {
      setActiveScene(sceneId);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 200);
  }

  function handleAddScene() {
    const scene = addScene({ name: `Cena ${scenes.length + 1}` });
    if (scenes.length === 0) {
      setActiveScene(scene.id);
    }
  }

  function handleDuplicate(sceneId: string) {
    const src = scenes.find((s) => s.id === sceneId);
    if (!src) return;
    addScene({
      name: `${src.name} (cópia)`,
      category: src.category,
      dimensions: src.dimensions,
      savedState: src.savedState ? { ...src.savedState } : null,
    });
  }

  function startRename(sceneId: string, name: string) {
    setEditingId(sceneId);
    setEditName(name);
  }

  function commitRename() {
    if (editingId && editName.trim()) {
      updateScene(editingId, { name: editName.trim() });
    }
    setEditingId(null);
  }

  const sorted = [...scenes].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-1">
      {sorted.map((scene) => (
        <div
          key={scene.id}
          onClick={() => handleSwitchScene(scene.id)}
          className={`group flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors ${
            scene.id === activeSceneId
              ? "bg-brand-accent/10 text-brand-accent"
              : "text-brand-text hover:bg-white/[0.03]"
          }`}
        >
          <GripVertical className="h-3 w-3 shrink-0 text-brand-muted/30" />
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              scene.id === activeSceneId ? "bg-brand-accent" : "bg-brand-muted/20"
            }`}
          />
          {editingId === scene.id ? (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setEditingId(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-5 flex-1 rounded border border-brand-accent/40 bg-brand-primary px-1 text-[10px] text-brand-text outline-none"
            />
          ) : (
            <span className="flex-1 truncate text-[10px]">{scene.name}</span>
          )}
          {scene.id === activeSceneId && (
            <span className="text-[8px] text-brand-accent">◀</span>
          )}
          {/* Hover actions */}
          <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                startRename(scene.id, scene.name);
              }}
              className="rounded p-0.5 text-brand-muted hover:text-brand-text"
              title="Renomear"
            >
              <Pencil className="h-2.5 w-2.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicate(scene.id);
              }}
              className="rounded p-0.5 text-brand-muted hover:text-brand-text"
              title="Duplicar"
            >
              <Copy className="h-2.5 w-2.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeScene(scene.id);
              }}
              className="rounded p-0.5 text-brand-muted hover:text-red-400"
              title="Remover"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      ))}

      {/* Add scene */}
      <button
        onClick={handleAddScene}
        className="flex w-full items-center gap-1.5 rounded-md border border-dashed border-brand-border px-2 py-1 text-[10px] text-brand-muted transition-colors hover:bg-white/[0.03] hover:text-brand-text"
      >
        <Plus className="h-3 w-3" />
        Adicionar cena
      </button>

      {/* Transition selector */}
      <div className="flex items-center gap-1.5 pt-1">
        <span className="text-[9px] text-brand-muted">Transição:</span>
        <select
          value={sceneTransition}
          onChange={(e) => setSceneTransition(e.target.value as SceneTransition)}
          className="h-5 flex-1 rounded border border-brand-border bg-brand-primary px-1 text-[9px] text-brand-text outline-none focus:border-brand-accent/40"
        >
          {Object.entries(SCENE_TRANSITION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
