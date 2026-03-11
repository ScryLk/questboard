"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import type { NPCData, NPCType } from "@/lib/npc-types";
import { NPC_TYPE_CONFIG } from "@/lib/npc-types";

const PORTRAIT_COLORS = [
  "#6C5CE7",
  "#FF4444",
  "#00B894",
  "#FDCB6E",
  "#74B9FF",
  "#E17055",
];

interface TabBasicoProps {
  form: NPCData;
  onUpdate: (updates: Partial<NPCData>) => void;
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
      {/* Identity */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Identidade
        </h3>

        {/* Portrait + Name */}
        <div className="mb-3 flex gap-3">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-white"
              style={{ backgroundColor: form.portraitColor + "40" }}
            >
              {form.portrait || form.name.slice(0, 2).toUpperCase() || "?"}
            </div>
            <input
              type="text"
              value={form.portrait}
              onChange={(e) => onUpdate({ portrait: e.target.value })}
              placeholder="Emoji"
              className="h-6 w-14 rounded border border-brand-border bg-brand-primary text-center text-xs text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
            <div className="flex gap-0.5">
              {PORTRAIT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => onUpdate({ portraitColor: c })}
                  className={`h-3.5 w-3.5 rounded-full border ${
                    form.portraitColor === c
                      ? "border-white"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <FormInput
              label="Nome"
              value={form.name}
              onChange={(v) => onUpdate({ name: v })}
              placeholder="Nome do NPC"
            />
            <FormInput
              label="Titulo / Ocupacao"
              value={form.title}
              onChange={(v) => onUpdate({ title: v })}
              placeholder="ex: Proprietario da Taverna"
            />
          </div>
        </div>

        {/* Details row */}
        <div className="grid grid-cols-4 gap-2">
          <FormInput
            label="Raca"
            value={form.race}
            onChange={(v) => onUpdate({ race: v })}
            placeholder="Anao"
          />
          <FormInput
            label="Genero"
            value={form.gender}
            onChange={(v) => onUpdate({ gender: v })}
            placeholder="Masculino"
          />
          <FormInput
            label="Idade"
            value={form.age}
            onChange={(v) => onUpdate({ age: v })}
            placeholder="~180 anos"
          />
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Favorito
            </label>
            <button
              onClick={() => onUpdate({ favorite: !form.favorite })}
              className={`flex h-7 w-full items-center justify-center gap-1 rounded-md border text-[10px] transition-colors ${
                form.favorite
                  ? "border-[#FDCB6E]/30 bg-[#FDCB6E]/10 text-[#FDCB6E]"
                  : "border-brand-border text-brand-muted hover:text-brand-text"
              }`}
            >
              <Star
                className={`h-3 w-3 ${form.favorite ? "fill-[#FDCB6E]" : ""}`}
              />
              {form.favorite ? "Sim" : "Nao"}
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="mt-2">
          <label className="mb-1 block text-[10px] text-brand-muted">
            Aparencia
          </label>
          <textarea
            value={form.appearance}
            onChange={(e) => onUpdate({ appearance: e.target.value })}
            placeholder="Anao robusto com barba trancada ruiva, cicatriz no olho esquerdo..."
            rows={2}
            className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
          />
        </div>
      </section>

      {/* Classification */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Classificacao
        </h3>

        {/* Type */}
        <div className="mb-3">
          <label className="mb-1 block text-[10px] text-brand-muted">
            Tipo
          </label>
          <div className="flex gap-1">
            {NPC_TYPE_CONFIG.map((d) => (
              <button
                key={d.key}
                onClick={() => onUpdate({ type: d.key as NPCType })}
                className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-colors ${
                  form.type === d.key
                    ? "text-white"
                    : "border border-brand-border text-brand-muted hover:text-brand-text"
                }`}
                style={
                  form.type === d.key
                    ? { backgroundColor: d.color + "30", color: d.color }
                    : undefined
                }
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-2">
          <label className="mb-1 block text-[10px] text-brand-muted">
            Tags
          </label>
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
        </div>

        {/* Location */}
        <FormInput
          label="Localizacao usual"
          value={form.location}
          onChange={(v) => onUpdate({ location: v })}
          placeholder="Taverna do Dragao, Barovia"
        />
      </section>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] text-brand-muted">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
      />
    </div>
  );
}
