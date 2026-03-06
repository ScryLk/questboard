"use client";

import { useState } from "react";
import { Lock, Plus, Trash2 } from "lucide-react";
import type { NPCData, NPCKnowledgeItem } from "@/lib/npc-types";

interface TabConhecimentoProps {
  form: NPCData;
  onUpdate: (updates: Partial<NPCData>) => void;
}

function generateItemId(): string {
  return `ki_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
}

export function TabConhecimento({ form, onUpdate }: TabConhecimentoProps) {
  return (
    <div className="space-y-5">
      {/* Knowledge */}
      <KnowledgeSection
        title="O Que Este NPC Sabe"
        subtitle="Informacoes que pode revelar aos jogadores"
        items={form.knowledge}
        onChange={(knowledge) => onUpdate({ knowledge })}
        showRevealed
      />

      {/* Secrets */}
      <KnowledgeSection
        title="Segredos"
        subtitle="So o GM ve — IA nao revela"
        items={form.secrets}
        onChange={(secrets) => onUpdate({ secrets })}
        isSecret
        showRevealed
      />

      {/* Revealed summary */}
      {(form.knowledge.some((k) => k.revealed) ||
        form.secrets.some((s) => s.revealed)) && (
        <section>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
            Informacoes Ja Reveladas
          </h3>
          <div className="space-y-1">
            {form.knowledge
              .filter((k) => k.revealed)
              .map((k) => (
                <div
                  key={k.id}
                  className="flex items-center gap-1.5 text-[11px] text-brand-text/70"
                >
                  <span className="text-green-400">✓</span>
                  {k.text}
                </div>
              ))}
            {form.secrets
              .filter((s) => s.revealed)
              .map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-1.5 text-[11px] text-brand-text/70"
                >
                  <span className="text-green-400">✓</span>
                  <Lock className="h-2.5 w-2.5 text-brand-muted" />
                  {s.text}
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

function KnowledgeSection({
  title,
  subtitle,
  items,
  onChange,
  isSecret,
  showRevealed,
}: {
  title: string;
  subtitle: string;
  items: NPCKnowledgeItem[];
  onChange: (items: NPCKnowledgeItem[]) => void;
  isSecret?: boolean;
  showRevealed?: boolean;
}) {
  const [newText, setNewText] = useState("");

  function addItem() {
    if (!newText.trim()) return;
    onChange([
      ...items,
      { id: generateItemId(), text: newText.trim(), revealed: false },
    ]);
    setNewText("");
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function toggleRevealed(id: string) {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, revealed: !item.revealed } : item,
      ),
    );
  }

  function updateText(id: string, text: string) {
    onChange(items.map((item) => (item.id === id ? { ...item, text } : item)));
  }

  return (
    <section>
      <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
        {isSecret && <Lock className="mr-1 inline h-3 w-3" />}
        {title}
      </h3>
      <p className="mb-2 text-[10px] text-brand-muted">{subtitle}</p>

      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-1.5">
            {showRevealed && (
              <button
                onClick={() => toggleRevealed(item.id)}
                title={item.revealed ? "Revelado" : "Nao revelado"}
                className={`mt-1 shrink-0 text-[10px] ${
                  item.revealed ? "text-green-400" : "text-brand-muted/30"
                }`}
              >
                {item.revealed ? "✓" : "○"}
              </button>
            )}
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateText(item.id, e.target.value)}
              className={`h-6 flex-1 rounded border border-brand-border bg-brand-primary px-2 text-[11px] outline-none focus:border-brand-accent/40 ${
                item.revealed
                  ? "text-brand-text/50 line-through"
                  : "text-brand-text"
              }`}
            />
            <button
              onClick={() => removeItem(item.id)}
              className="mt-0.5 shrink-0 text-brand-muted/30 hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="mt-1.5 flex gap-1">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={
            isSecret ? "Adicionar segredo..." : "Adicionar informacao..."
          }
          className="h-6 flex-1 rounded border border-dashed border-brand-border bg-transparent px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/30 focus:border-brand-accent/40"
        />
        <button
          onClick={addItem}
          disabled={!newText.trim()}
          className="flex h-6 items-center gap-0.5 rounded bg-white/5 px-2 text-[10px] text-brand-muted transition-colors hover:bg-white/10 hover:text-brand-text disabled:opacity-30"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </section>
  );
}
