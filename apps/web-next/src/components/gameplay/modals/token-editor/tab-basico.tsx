"use client";

import { useState } from "react";
import { Plus, Search, X } from "lucide-react";
import type { SavedToken, SavedTokenType } from "@/lib/token-library-types";
import { SAVED_TOKEN_TYPE_CONFIG } from "@/lib/token-library-types";
import {
  CREATURE_COMPENDIUM,
  CREATURE_TYPE_LABELS,
  CREATURE_SIZE_LABELS,
  type CreatureType,
  type CreatureSize,
} from "@/lib/creature-data";
import { useCustomCreaturesStore } from "@/lib/custom-creatures-store";
import { savedTokenFromCreature } from "@/lib/token-library-store";

interface TabBasicoProps {
  form: SavedToken;
  onUpdate: (updates: Partial<SavedToken>) => void;
}

export function TabBasico({ form, onUpdate }: TabBasicoProps) {
  const [creatureSearch, setCreatureSearch] = useState("");
  const [newTag, setNewTag] = useState("");
  const customCreatures = useCustomCreaturesStore((s) => s.creatures);

  const allCreatures = [...CREATURE_COMPENDIUM, ...customCreatures];
  const filteredCreatures = creatureSearch.trim()
    ? allCreatures.filter(
        (c) =>
          c.name.toLowerCase().includes(creatureSearch.toLowerCase()) ||
          c.nameEn.toLowerCase().includes(creatureSearch.toLowerCase()),
      )
    : [];

  function addTag() {
    if (!newTag.trim()) return;
    if (!form.tags.includes(newTag.trim())) {
      onUpdate({ tags: [...form.tags, newTag.trim()] });
    }
    setNewTag("");
  }

  function removeTag(tag: string) {
    onUpdate({ tags: form.tags.filter((t) => t !== tag) });
  }

  function handleSelectCompendium(creatureId: string) {
    const creature = allCreatures.find((c) => c.id === creatureId);
    if (!creature) return;
    const token = savedTokenFromCreature(creature);
    // Keep current id, name override, and meta
    onUpdate({
      source: "compendium",
      compendiumId: creature.id,
      creatureType: token.creatureType,
      size: token.size,
      alignment: token.alignment,
      cr: token.cr,
      xp: token.xp,
      hp: token.hp,
      hpFormula: token.hpFormula,
      ac: token.ac,
      acDesc: token.acDesc,
      speed: token.speed,
      str: token.str,
      dex: token.dex,
      con: token.con,
      int: token.int,
      wis: token.wis,
      cha: token.cha,
      skills: token.skills,
      damageVulnerabilities: token.damageVulnerabilities,
      damageResistances: token.damageResistances,
      damageImmunities: token.damageImmunities,
      conditionImmunities: token.conditionImmunities,
      senses: token.senses,
      languages: token.languages,
      abilities: token.abilities,
      actions: token.actions,
      reactions: token.reactions,
      legendaryActions: token.legendaryActions,
      icon: token.icon,
      color: token.color,
      gridSize: token.gridSize,
    });
    setCreatureSearch("");
  }

  const selectedCreatureName = form.compendiumId
    ? allCreatures.find((c) => c.id === form.compendiumId)?.name
    : null;

  return (
    <div className="space-y-5">
      {/* Identity */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Identidade
        </h3>
        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Nome
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Goblin Arqueiro"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Nome alternativo (jogadores veem este nome ate ser revelado)
            </label>
            <input
              type="text"
              value={form.displayName ?? ""}
              onChange={(e) =>
                onUpdate({
                  displayName: e.target.value || undefined,
                })
              }
              placeholder="Criatura Misteriosa"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
        </div>
      </section>

      {/* Type */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Tipo
        </h3>
        <div className="flex flex-wrap gap-1">
          {(
            Object.entries(SAVED_TOKEN_TYPE_CONFIG) as [
              SavedTokenType,
              { label: string; color: string },
            ][]
          ).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => onUpdate({ type: key })}
              className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                form.type === key
                  ? "text-white"
                  : "border border-brand-border text-brand-muted hover:text-brand-text"
              }`}
              style={
                form.type === key
                  ? { backgroundColor: cfg.color + "30", color: cfg.color }
                  : undefined
              }
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </section>

      {/* Source */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Fonte
        </h3>
        <div className="mb-2 flex gap-1">
          <button
            onClick={() => onUpdate({ source: "compendium" })}
            className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-colors ${
              form.source === "compendium"
                ? "bg-brand-accent/20 text-brand-accent"
                : "border border-brand-border text-brand-muted hover:text-brand-text"
            }`}
          >
            Baseado no Compendio
          </button>
          <button
            onClick={() =>
              onUpdate({ source: "custom", compendiumId: undefined })
            }
            className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-colors ${
              form.source === "custom"
                ? "bg-brand-accent/20 text-brand-accent"
                : "border border-brand-border text-brand-muted hover:text-brand-text"
            }`}
          >
            Totalmente Custom
          </button>
        </div>

        {form.source === "compendium" && (
          <div>
            <div className="relative mb-1">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-brand-muted/50" />
              <input
                type="text"
                value={creatureSearch}
                onChange={(e) => setCreatureSearch(e.target.value)}
                placeholder="Buscar criatura do compendio..."
                className="h-7 w-full rounded-md border border-brand-border bg-brand-primary pl-7 pr-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
              />
            </div>
            {selectedCreatureName && (
              <p className="mb-1 text-[10px] text-brand-accent">
                Selecionado: {selectedCreatureName} (ND {form.cr})
              </p>
            )}
            {creatureSearch.trim() && (
              <div className="max-h-32 overflow-y-auto rounded-md border border-brand-border">
                {filteredCreatures.length === 0 ? (
                  <div className="px-2 py-2 text-center text-[10px] text-brand-muted">
                    Nenhuma criatura encontrada.
                  </div>
                ) : (
                  filteredCreatures.slice(0, 10).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCompendium(c.id)}
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-left transition-colors hover:bg-white/[0.03]"
                    >
                      <span className="text-sm">{c.icon}</span>
                      <span className="flex-1 text-[11px] text-brand-text">
                        {c.name}
                      </span>
                      <span className="text-[9px] text-brand-muted">
                        ND {c.cr}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Classification */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Classificacao
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Tipo de criatura
            </label>
            <select
              value={form.creatureType}
              onChange={(e) => onUpdate({ creatureType: e.target.value })}
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
            >
              {Object.entries(CREATURE_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Subtipo
            </label>
            <input
              type="text"
              value={form.creatureSubtype ?? ""}
              onChange={(e) =>
                onUpdate({ creatureSubtype: e.target.value || undefined })
              }
              placeholder="Gobelinoide"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Tamanho
            </label>
            <select
              value={form.size}
              onChange={(e) =>
                onUpdate({ size: e.target.value as CreatureSize })
              }
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
            >
              {Object.entries(CREATURE_SIZE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Alinhamento
            </label>
            <input
              type="text"
              value={form.alignment}
              onChange={(e) => onUpdate({ alignment: e.target.value })}
              placeholder="Neutro Mau"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              ND (Challenge Rating)
            </label>
            <input
              type="text"
              value={form.cr}
              onChange={(e) => onUpdate({ cr: e.target.value })}
              placeholder="1/4"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              XP
            </label>
            <input
              type="number"
              value={form.xp}
              onChange={(e) => onUpdate({ xp: parseInt(e.target.value) || 0 })}
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
            />
          </div>
        </div>
      </section>

      {/* Tags */}
      <section>
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Tags
        </h3>
        <div className="mb-1.5 flex flex-wrap gap-1">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-0.5 rounded-full bg-brand-accent/10 px-2 py-0.5 text-[10px] text-brand-accent"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-0.5 text-brand-accent/60 hover:text-brand-accent"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Adicionar tag..."
            className="h-6 flex-1 rounded border border-dashed border-brand-border bg-transparent px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/30 focus:border-brand-accent/40"
          />
          <button
            onClick={addTag}
            disabled={!newTag.trim()}
            className="flex h-6 items-center gap-0.5 rounded bg-white/5 px-2 text-[10px] text-brand-muted transition-colors hover:bg-white/10 hover:text-brand-text disabled:opacity-30"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </section>

      {/* GM Notes */}
      <section>
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Notas do GM
        </h3>
        <textarea
          value={form.gmNotes}
          onChange={(e) => onUpdate({ gmNotes: e.target.value })}
          placeholder="Notas privadas do GM sobre este token..."
          rows={3}
          className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
        />
      </section>
    </div>
  );
}
