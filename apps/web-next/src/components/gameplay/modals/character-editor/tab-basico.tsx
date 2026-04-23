"use client";

import type { CampaignCharacter } from "@/types/character";
import {
  CHAR_CATEGORY_CONFIG,
  ROLE_CONFIG,
  DISPOSITION_CONFIG,
  CREATURE_TYPE_CONFIG,
  ALL_ROLES,
  ALL_DISPOSITIONS,
  ALL_CREATURE_TYPES,
} from "@/types/character";

interface TabBasicoProps {
  form: CampaignCharacter;
  onUpdate: (updates: Partial<CampaignCharacter>) => void;
}

export function TabBasico({ form, onUpdate }: TabBasicoProps) {
  return (
    <div className="space-y-5">
      {/* Category toggle */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Categoria
        </h3>
        <div className="flex gap-2">
          {(["npc", "creature"] as const).map((cat) => {
            const cfg = CHAR_CATEGORY_CONFIG[cat];
            const Icon = cfg.icon;
            const active = form.category === cat;
            return (
              <button
                key={cat}
                onClick={() => onUpdate({ category: cat })}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "border-brand-accent/30 bg-brand-accent/10 text-brand-accent"
                    : "border-brand-border text-brand-muted hover:text-brand-text"
                }`}
              >
                <Icon className="h-4 w-4" />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Name + Title */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Identidade
        </h3>
        <div className="space-y-2">
          <FormInput
            label="Nome"
            value={form.name}
            onChange={(v) => onUpdate({ name: v })}
            placeholder="Ex: Goblin Explorador, Capitao Aldric"
          />
          <FormInput
            label="Titulo (opcional)"
            value={form.title ?? ""}
            onChange={(v) => onUpdate({ title: v || undefined })}
            placeholder="Ex: Lider dos Goblins, Conde de Barovia"
          />
        </div>
      </section>

      {/* Description */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Descricao
        </h3>
        <textarea
          value={form.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Aparencia, personalidade, motivacoes..."
          rows={3}
          className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
        />
      </section>

      {/* Role (for NPCs and creatures) */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Papel
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {ALL_ROLES.map((role) => {
            const cfg = ROLE_CONFIG[role];
            const active = form.role === role;
            return (
              <button
                key={role}
                onClick={() =>
                  onUpdate({ role: active ? undefined : role })
                }
                className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-brand-muted hover:text-brand-text"
                }`}
                style={
                  active
                    ? { backgroundColor: cfg.color + "30", color: cfg.color }
                    : { backgroundColor: "rgba(255,255,255,0.04)" }
                }
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Disposition */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Disposicao
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {ALL_DISPOSITIONS.map((disp) => {
            const cfg = DISPOSITION_CONFIG[disp];
            const active = form.disposition === disp;
            return (
              <button
                key={disp}
                onClick={() => onUpdate({ disposition: disp })}
                className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-brand-muted hover:text-brand-text"
                }`}
                style={
                  active
                    ? { backgroundColor: cfg.color + "30", color: cfg.color }
                    : { backgroundColor: "rgba(255,255,255,0.04)" }
                }
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Creature type (only for creatures) */}
      {form.category === "creature" && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
            Tipo de Criatura
          </h3>
          <select
            value={form.creatureType ?? ""}
            onChange={(e) =>
              onUpdate({
                creatureType: (e.target.value || undefined) as
                  | CampaignCharacter["creatureType"]
                  | undefined,
              })
            }
            className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
          >
            <option value="">Selecionar tipo...</option>
            {ALL_CREATURE_TYPES.map((ct) => (
              <option key={ct} value={ct}>
                {CREATURE_TYPE_CONFIG[ct].label}
              </option>
            ))}
          </select>
        </section>
      )}

      {/* Traits (free text) */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Tracos Especiais
        </h3>
        <textarea
          value={form.traits ?? ""}
          onChange={(e) => onUpdate({ traits: e.target.value || undefined })}
          placeholder="Habilidades especiais, resistencias, etc..."
          rows={2}
          className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
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
