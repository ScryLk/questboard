"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Image,
  Map,
  MousePointerClick,
  X,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useObjectStore, createDefaultObject } from "@/stores/objectStore";
import type { CampaignObject } from "@/types/object";
import { TabBasico } from "./tab-basico";
import { TabVisual } from "./tab-visual";
import { TabMapa } from "./tab-mapa";
import { TabInteracao } from "./tab-interacao";

const TABS = [
  { key: "basico", label: "Basico", icon: Box },
  { key: "visual", label: "Visual", icon: Image },
  { key: "mapa", label: "Mapa", icon: Map },
  { key: "interacao", label: "Interacao", icon: MousePointerClick },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface ObjectEditorModalProps {
  onClose: () => void;
}

export function ObjectEditorModal({ onClose }: ObjectEditorModalProps) {
  const targetId = useGameplayStore((s) => s.objectEditorTargetId);
  const objects = useObjectStore((s) => s.objects);
  const createObject = useObjectStore((s) => s.createObject);
  const updateObject = useObjectStore((s) => s.updateObject);

  const isEditing = targetId !== null;
  const existingObject = isEditing
    ? objects.find((o) => o.id === targetId)
    : undefined;

  const [form, setForm] = useState<CampaignObject>(() =>
    existingObject ? { ...existingObject } : createDefaultObject(),
  );
  const [activeTab, setActiveTab] = useState<TabKey>("basico");

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function updateForm(updates: Partial<CampaignObject>) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (isEditing) {
      updateObject(form.id, form);
    } else {
      createObject(form);
    }
    onClose();
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
        style={{ width: "min(640px, calc(100vw - 32px))" }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-brand-border px-5 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-text">
            {isEditing
              ? `Editar: ${existingObject?.name || ""}`
              : "Novo Objeto"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 border-b border-brand-border">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-colors ${
                activeTab === key
                  ? "border-b-2 border-brand-accent text-brand-accent"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activeTab === "basico" && (
            <TabBasico form={form} onUpdate={updateForm} />
          )}
          {activeTab === "visual" && (
            <TabVisual form={form} onUpdate={updateForm} />
          )}
          {activeTab === "mapa" && (
            <TabMapa form={form} onUpdate={updateForm} />
          )}
          {activeTab === "interacao" && (
            <TabInteracao form={form} onUpdate={updateForm} />
          )}
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
            disabled={!form.name.trim()}
            className="rounded-lg bg-brand-accent px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-accent-hover disabled:opacity-40"
          >
            {isEditing ? "Salvar Alteracoes" : "Criar Objeto"}
          </button>
        </div>
      </div>
    </div>
  );
}
