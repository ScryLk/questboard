"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { SavedToken } from "@/lib/token-library-types";

interface TabHabilidadesProps {
  form: SavedToken;
  onUpdate: (updates: Partial<SavedToken>) => void;
}

export function TabHabilidades({ form, onUpdate }: TabHabilidadesProps) {
  return (
    <div className="space-y-5">
      {/* Passive Abilities / Traits */}
      <AbilitiesSection
        title="Habilidades Passivas / Traits"
        items={form.abilities}
        onChange={(abilities) => onUpdate({ abilities })}
        placeholder="Adicionar habilidade..."
      />

      {/* Spellcasting */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Conjuracao
        </h3>

        <label className="flex cursor-pointer items-center gap-3">
          <div
            onClick={() => {
              if (form.spellcasting) {
                onUpdate({ spellcasting: undefined });
              } else {
                onUpdate({
                  spellcasting: {
                    ability: "int",
                    dc: 13,
                    attackBonus: 5,
                    notes: "",
                  },
                });
              }
            }}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              form.spellcasting ? "bg-brand-accent" : "bg-white/10"
            }`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                form.spellcasting ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-[11px] text-brand-text">
            Este token pode conjurar magias
          </span>
        </label>

        {form.spellcasting && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block text-[10px] text-brand-muted">
                  Habilidade
                </label>
                <select
                  value={form.spellcasting.ability}
                  onChange={(e) =>
                    onUpdate({
                      spellcasting: {
                        ...form.spellcasting!,
                        ability: e.target.value,
                      },
                    })
                  }
                  className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
                >
                  <option value="int">INT</option>
                  <option value="wis">SAB</option>
                  <option value="cha">CAR</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-brand-muted">
                  CD
                </label>
                <input
                  type="number"
                  value={form.spellcasting.dc}
                  onChange={(e) =>
                    onUpdate({
                      spellcasting: {
                        ...form.spellcasting!,
                        dc: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-brand-muted">
                  Ataque
                </label>
                <input
                  type="number"
                  value={form.spellcasting.attackBonus}
                  onChange={(e) =>
                    onUpdate({
                      spellcasting: {
                        ...form.spellcasting!,
                        attackBonus: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] text-brand-muted">
                Magias e Notas
              </label>
              <textarea
                value={form.spellcasting.notes}
                onChange={(e) =>
                  onUpdate({
                    spellcasting: {
                      ...form.spellcasting!,
                      notes: e.target.value,
                    },
                  })
                }
                placeholder="A vontade: Mage Hand, Prestidigitation&#10;1x/dia cada: Shield, Magic Missile&#10;Slots (nivel 1): 4 — Thunderwave, Detect Magic"
                rows={5}
                className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function AbilitiesSection({
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

  function addItem() {
    if (!newName.trim()) return;
    onChange([...items, { name: newName.trim(), desc: "" }]);
    setNewName("");
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
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

      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-md border border-brand-border bg-white/[0.01] px-2 py-1.5"
          >
            <div className="mb-1 flex items-center gap-1.5">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(i, { name: e.target.value })}
                className="flex-1 bg-transparent text-[11px] font-medium text-brand-text outline-none"
                placeholder="Nome da habilidade"
              />
              <button
                onClick={() => removeItem(i)}
                className="text-brand-muted/30 hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <textarea
              value={item.desc}
              onChange={(e) => updateItem(i, { desc: e.target.value })}
              placeholder="Descricao..."
              rows={2}
              className="w-full resize-none rounded border border-brand-border/50 bg-brand-primary px-2 py-1 text-[10px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
        ))}
      </div>

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
