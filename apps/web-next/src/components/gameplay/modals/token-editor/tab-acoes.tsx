"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { SavedToken } from "@/lib/token-library-types";

interface TabAcoesProps {
  form: SavedToken;
  onUpdate: (updates: Partial<SavedToken>) => void;
}

export function TabAcoes({ form, onUpdate }: TabAcoesProps) {
  return (
    <div className="space-y-5">
      <ActionListSection
        title="Acoes"
        items={form.actions}
        onChange={(actions) => onUpdate({ actions })}
        placeholder="Adicionar acao..."
      />
      <ActionListSection
        title="Acoes Bonus"
        items={form.bonusActions}
        onChange={(bonusActions) => onUpdate({ bonusActions })}
        placeholder="Adicionar acao bonus..."
      />
      <ActionListSection
        title="Reacoes"
        items={form.reactions}
        onChange={(reactions) => onUpdate({ reactions })}
        placeholder="Adicionar reacao..."
      />
      <ActionListSection
        title="Acoes Lendarias"
        items={form.legendaryActions ?? []}
        onChange={(legendaryActions) =>
          onUpdate({
            legendaryActions:
              legendaryActions.length > 0 ? legendaryActions : undefined,
          })
        }
        placeholder="Adicionar acao lendaria..."
      />
    </div>
  );
}

function ActionListSection({
  title,
  items,
  onChange,
  placeholder,
}: {
  title: string;
  items: Array<{ name: string; desc: string }>;
  onChange: (items: Array<{ name: string; desc: string }>) => void;
  placeholder: string;
}) {
  const [newName, setNewName] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  function addItem() {
    if (!newName.trim()) return;
    onChange([...items, { name: newName.trim(), desc: "" }]);
    setNewName("");
    setExpandedIndex(items.length);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  }

  function updateItem(
    index: number,
    updates: Partial<{ name: string; desc: string }>,
  ) {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    );
  }

  return (
    <section>
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
        {title}
      </h3>

      <div className="space-y-1">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-md border border-brand-border bg-white/[0.01]"
          >
            {/* Header */}
            <div className="flex items-center gap-1.5 px-2 py-1.5">
              <button
                onClick={() =>
                  setExpandedIndex(expandedIndex === i ? null : i)
                }
                className="text-brand-muted/50 hover:text-brand-text"
              >
                {expandedIndex === i ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
              <span className="text-[10px] text-brand-accent">⚔</span>
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(i, { name: e.target.value })}
                className="flex-1 bg-transparent text-[11px] font-medium text-brand-text outline-none"
              />
              <button
                onClick={() => removeItem(i)}
                className="text-brand-muted/30 hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>

            {/* Expanded description */}
            {expandedIndex === i && (
              <div className="border-t border-brand-border/30 px-2 py-1.5">
                <textarea
                  value={item.desc}
                  onChange={(e) => updateItem(i, { desc: e.target.value })}
                  placeholder="Descricao da acao..."
                  rows={3}
                  className="w-full resize-none rounded border border-brand-border bg-brand-primary px-2 py-1 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="mt-1.5 flex gap-1">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className="h-6 flex-1 rounded border border-dashed border-brand-border bg-transparent px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/30 focus:border-brand-accent/40"
        />
        <button
          onClick={addItem}
          disabled={!newName.trim()}
          className="flex h-6 items-center gap-0.5 rounded bg-white/5 px-2 text-[10px] text-brand-muted transition-colors hover:bg-white/10 hover:text-brand-text disabled:opacity-30"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </section>
  );
}
