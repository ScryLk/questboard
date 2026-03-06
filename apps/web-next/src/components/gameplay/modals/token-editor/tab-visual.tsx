"use client";

import type { SavedToken } from "@/lib/token-library-types";

interface TabVisualProps {
  form: SavedToken;
  onUpdate: (updates: Partial<SavedToken>) => void;
}

const PRESET_COLORS = [
  "#FF4444",
  "#F97316",
  "#FBBF24",
  "#4ADE80",
  "#60A5FA",
  "#A78BFA",
  "#F472B6",
  "#6B7280",
];

const SIZE_OPTIONS = [
  { value: 1, label: "Pequeno/Medio (1×1)" },
  { value: 2, label: "Grande (2×2)" },
  { value: 3, label: "Enorme (3×3)" },
  { value: 4, label: "Colossal (4×4)" },
];

export function TabVisual({ form, onUpdate }: TabVisualProps) {
  return (
    <div className="space-y-5">
      {/* Icon */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Icone do Token
        </h3>
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-xl"
            style={{
              backgroundColor: form.color + "20",
              color: form.color,
              border: `2px solid ${form.color}40`,
            }}
          >
            {form.icon || form.name.slice(0, 2).toUpperCase() || "?"}
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-[10px] text-brand-muted">
              Emoji ou texto curto
            </label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => onUpdate({ icon: e.target.value })}
              placeholder="💀 ou SK"
              maxLength={4}
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
        </div>
      </section>

      {/* Color */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Cor do Token
        </h3>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onUpdate({ color })}
              className={`h-7 w-7 rounded-full transition-transform ${
                form.color === color
                  ? "scale-110 ring-2 ring-white/40"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={form.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent"
            />
            <input
              type="text"
              value={form.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="h-7 w-20 rounded-md border border-brand-border bg-brand-primary px-2 text-[10px] text-brand-text outline-none focus:border-brand-accent/40"
            />
          </div>
        </div>
      </section>

      {/* Grid Size */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Tamanho no Grid
        </h3>
        <div className="space-y-1">
          {SIZE_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-white/[0.02]"
            >
              <input
                type="radio"
                name="gridSize"
                checked={form.gridSize === value}
                onChange={() => onUpdate({ gridSize: value })}
                className="accent-brand-accent"
              />
              <span className="text-[11px] text-brand-text">{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* HP Bar */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Barra de HP
        </h3>
        <label className="flex cursor-pointer items-center gap-3">
          <div
            onClick={() => onUpdate({ showHPBar: !form.showHPBar })}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              form.showHPBar ? "bg-brand-accent" : "bg-white/10"
            }`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                form.showHPBar ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-[11px] text-brand-text">
            Mostrar barra de HP no mapa
          </span>
        </label>
      </section>

      {/* Name Display */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Nome no Mapa
        </h3>
        <label className="mb-3 flex cursor-pointer items-center gap-3">
          <div
            onClick={() => onUpdate({ showName: !form.showName })}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              form.showName ? "bg-brand-accent" : "bg-white/10"
            }`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                form.showName ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-[11px] text-brand-text">
            Mostrar nome no mapa
          </span>
        </label>

        {form.showName && (
          <div className="flex gap-1">
            {(
              [
                ["full", "Completo"],
                ["short", "Curto"],
                ["initials", "Iniciais"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => onUpdate({ nameDisplay: key })}
                className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-colors ${
                  form.nameDisplay === key
                    ? "bg-brand-accent/20 text-brand-accent"
                    : "border border-brand-border text-brand-muted hover:text-brand-text"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
