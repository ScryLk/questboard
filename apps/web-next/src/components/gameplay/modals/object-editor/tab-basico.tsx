"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import type { CampaignObject, ObjectCategory, ObjectRarity } from "@/types/object";
import { CATEGORY_CONFIG, RARITY_CONFIG, ALL_RARITIES } from "@/types/object";

interface TabBasicoProps {
  form: CampaignObject;
  onUpdate: (updates: Partial<CampaignObject>) => void;
}

export function TabBasico({ form, onUpdate }: TabBasicoProps) {
  const [tagInput, setTagInput] = useState("");

  function addTag() {
    const tag = tagInput.trim();
    if (!tag || form.tags.includes(tag)) return;
    onUpdate({ tags: [...form.tags, tag] });
    setTagInput("");
  }

  function removeTag(tag: string) {
    onUpdate({ tags: form.tags.filter((t) => t !== tag) });
  }

  return (
    <div className="space-y-5">
      {/* Category */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Tipo
        </h3>
        <div className="flex gap-1">
          {(["scenery", "item"] as const).map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const isActive = form.category === cat;
            return (
              <button
                key={cat}
                onClick={() => onUpdate({ category: cat })}
                className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-white"
                    : "border border-brand-border text-brand-muted hover:text-brand-text"
                }`}
                style={
                  isActive
                    ? { backgroundColor: config.color + "30", color: config.color }
                    : undefined
                }
              >
                {config.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Name + Description */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Identidade
        </h3>

        <div className="mb-2 flex items-center gap-3">
          {/* Emoji preview */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-xl"
            style={{ backgroundColor: form.spriteColor + "20" }}
          >
            {form.spriteEmoji}
          </div>

          <div className="flex-1 space-y-2">
            <FormInput
              label="Nome"
              value={form.name}
              onChange={(v) => onUpdate({ name: v })}
              placeholder="Nome do objeto"
            />
          </div>

          {/* Favorite */}
          <div className="shrink-0">
            <label className="mb-1 block text-[10px] text-brand-muted">
              Favorito
            </label>
            <button
              onClick={() => onUpdate({ favorite: !form.favorite })}
              className={`flex h-7 w-10 items-center justify-center rounded-md border text-[10px] transition-colors ${
                form.favorite
                  ? "border-[#FDCB6E]/30 bg-[#FDCB6E]/10 text-[#FDCB6E]"
                  : "border-brand-border text-brand-muted hover:text-brand-text"
              }`}
            >
              <Star
                className={`h-3 w-3 ${form.favorite ? "fill-[#FDCB6E]" : ""}`}
              />
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-brand-muted">
            Descricao
          </label>
          <textarea
            value={form.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Descricao do objeto..."
            rows={2}
            className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
          />
        </div>
      </section>

      {/* Rarity (items only) */}
      {form.category === "item" && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
            Raridade
          </h3>
          <div className="flex flex-wrap gap-1">
            {ALL_RARITIES.map((rarity) => {
              const config = RARITY_CONFIG[rarity];
              const isActive = form.rarity === rarity;
              return (
                <button
                  key={rarity}
                  onClick={() => onUpdate({ rarity })}
                  className="rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors"
                  style={{
                    backgroundColor: isActive ? config.color + "20" : "transparent",
                    color: isActive ? config.color : "#6A6A7A",
                    border: `1px solid ${isActive ? config.color + "40" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Item properties */}
      {form.category === "item" && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
            Propriedades do Item
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <FormInput
              label="Peso (lb)"
              value={String(form.weight ?? "")}
              onChange={(v) => onUpdate({ weight: v ? Number(v) : undefined })}
              placeholder="0"
              type="number"
            />
            <FormInput
              label="Valor (po)"
              value={String(form.value ?? "")}
              onChange={(v) => onUpdate({ value: v ? Number(v) : undefined })}
              placeholder="0"
              type="number"
            />
            <div>
              <label className="mb-1 block text-[10px] text-brand-muted">
                Consumível
              </label>
              <button
                onClick={() => onUpdate({ isConsumable: !form.isConsumable })}
                className={`flex h-7 w-full items-center justify-center rounded-md border text-[10px] font-medium transition-colors ${
                  form.isConsumable
                    ? "border-brand-accent/30 bg-brand-accent/10 text-brand-accent"
                    : "border-brand-border text-brand-muted hover:text-brand-text"
                }`}
              >
                {form.isConsumable ? "Sim" : "Nao"}
              </button>
            </div>
          </div>
          {form.isConsumable && (
            <div className="mt-2 w-24">
              <FormInput
                label="Cargas"
                value={String(form.charges ?? 1)}
                onChange={(v) => onUpdate({ charges: Number(v) || 1 })}
                placeholder="1"
                type="number"
              />
            </div>
          )}
        </section>
      )}

      {/* Tags */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Tags
        </h3>
        <div className="flex flex-wrap gap-1">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-0.5 rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-brand-text"
            >
              {tag}
              <button onClick={() => removeTag(tag)}>
                <X className="h-2.5 w-2.5 text-brand-muted hover:text-brand-text" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="+ tag"
            className="h-5 w-16 bg-transparent text-[10px] text-brand-text outline-none placeholder:text-brand-muted/40"
          />
        </div>
      </section>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] text-brand-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
      />
    </div>
  );
}
