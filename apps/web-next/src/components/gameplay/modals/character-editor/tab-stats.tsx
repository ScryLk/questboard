"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { CampaignCharacter, CharacterStats } from "@/types/character";

interface TabStatsProps {
  form: CampaignCharacter;
  onUpdate: (updates: Partial<CampaignCharacter>) => void;
}

function getModifier(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

const ABILITY_KEYS: { key: keyof CharacterStats; label: string }[] = [
  { key: "str", label: "FOR" },
  { key: "dex", label: "DES" },
  { key: "con", label: "CON" },
  { key: "int", label: "INT" },
  { key: "wis", label: "SAB" },
  { key: "cha", label: "CAR" },
];

const COMMON_SAVES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const COMMON_SKILLS = [
  "Acrobatics",
  "Animal Handling",
  "Arcana",
  "Athletics",
  "Deception",
  "History",
  "Insight",
  "Intimidation",
  "Investigation",
  "Medicine",
  "Nature",
  "Perception",
  "Performance",
  "Persuasion",
  "Religion",
  "Sleight of Hand",
  "Stealth",
  "Survival",
];

export function TabStats({ form, onUpdate }: TabStatsProps) {
  function updateStats(updates: Partial<CharacterStats>) {
    onUpdate({ stats: { ...form.stats, ...updates } });
  }

  return (
    <div className="space-y-5">
      {/* Basic stats */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Stats Basicos
        </h3>
        <div className="grid grid-cols-5 gap-2">
          <StatInput
            label="HP"
            value={form.stats.hp}
            onChange={(v) => updateStats({ hp: v })}
          />
          <StatInput
            label="Max HP"
            value={form.stats.maxHp}
            onChange={(v) => updateStats({ maxHp: v })}
          />
          <StatInput
            label="AC"
            value={form.stats.ac}
            onChange={(v) => updateStats({ ac: v })}
          />
          <StatInput
            label="Speed"
            value={form.stats.speed}
            onChange={(v) => updateStats({ speed: v })}
          />
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              CR
            </label>
            <input
              type="text"
              value={form.stats.cr ?? ""}
              onChange={(e) =>
                updateStats({ cr: e.target.value || undefined })
              }
              placeholder="—"
              className="h-7 w-full rounded-md border border-brand-border bg-[#0A0A0F] px-2 text-center text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
        </div>
      </section>

      {/* Ability scores */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Atributos
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {ABILITY_KEYS.map(({ key, label }) => {
            const val = form.stats[key] as number;
            return (
              <div key={key} className="text-center">
                <label className="mb-1 block text-[10px] font-medium text-brand-muted">
                  {label}
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={val}
                  onChange={(e) =>
                    updateStats({
                      [key]: Number(e.target.value) || 10,
                    } as Partial<CharacterStats>)
                  }
                  className="h-8 w-full rounded-md border border-brand-border bg-[#0A0A0F] text-center text-sm font-medium text-brand-text outline-none focus:border-brand-accent/40"
                />
                <span className="mt-0.5 block text-[10px] font-medium text-brand-accent">
                  {getModifier(val)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Derived stats */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Stats Derivados
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <StatInput
            label="Iniciativa"
            value={form.stats.initiative ?? Math.floor((form.stats.dex - 10) / 2)}
            onChange={(v) => updateStats({ initiative: v })}
          />
          <StatInput
            label="Percepcao Passiva"
            value={form.stats.passivePerception ?? 10 + Math.floor((form.stats.wis - 10) / 2)}
            onChange={(v) => updateStats({ passivePerception: v })}
          />
        </div>
      </section>

      {/* Saving throws */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Testes de Resistencia
        </h3>
        <ChipSelector
          available={COMMON_SAVES}
          selected={form.stats.savingThrows ?? []}
          onChange={(v) => updateStats({ savingThrows: v.length > 0 ? v : undefined })}
        />
      </section>

      {/* Skills */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Pericias
        </h3>
        <ChipSelector
          available={COMMON_SKILLS}
          selected={form.stats.skills ?? []}
          onChange={(v) => updateStats({ skills: v.length > 0 ? v : undefined })}
        />
      </section>

      {/* Damage immunities */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Imunidades a Dano
        </h3>
        <TagInput
          tags={form.stats.damageImmunities ?? []}
          onChange={(v) =>
            updateStats({ damageImmunities: v.length > 0 ? v : undefined })
          }
          placeholder="Ex: fogo, veneno..."
        />
      </section>

      {/* Condition immunities */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Imunidades a Condicao
        </h3>
        <TagInput
          tags={form.stats.conditionImmunities ?? []}
          onChange={(v) =>
            updateStats({
              conditionImmunities: v.length > 0 ? v : undefined,
            })
          }
          placeholder="Ex: envenenado, amedrontado..."
        />
      </section>

      {/* Senses */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Sentidos
        </h3>
        <input
          type="text"
          value={form.stats.senses ?? ""}
          onChange={(e) =>
            updateStats({ senses: e.target.value || undefined })
          }
          placeholder="Ex: Darkvision 60ft, Blindsight 30ft"
          className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
        />
      </section>

      {/* Languages */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Idiomas
        </h3>
        <TagInput
          tags={form.stats.languages ?? []}
          onChange={(v) =>
            updateStats({ languages: v.length > 0 ? v : undefined })
          }
          placeholder="Ex: Comum, Elfico..."
        />
      </section>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────

function StatInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] text-brand-muted">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-7 w-full rounded-md border border-brand-border bg-[#0A0A0F] px-2 text-center text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
      />
    </div>
  );
}

function ChipSelector({
  available,
  selected,
  onChange,
}: {
  available: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {available.map((item) => {
        const active = selected.includes(item);
        return (
          <button
            key={item}
            onClick={() =>
              onChange(
                active
                  ? selected.filter((s) => s !== item)
                  : [...selected, item],
              )
            }
            className={`rounded-md px-2 py-0.5 text-[9px] font-medium transition-colors ${
              active
                ? "bg-brand-accent/20 text-brand-accent"
                : "bg-white/5 text-brand-muted hover:text-brand-text"
            }`}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  function addTag() {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput("");
    }
  }

  return (
    <div>
      {tags.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-0.5 rounded bg-brand-accent/10 px-1.5 py-0.5 text-[9px] text-brand-accent"
            >
              {tag}
              <button
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="ml-0.5 text-brand-accent/60 hover:text-brand-accent"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="h-6 flex-1 rounded-md border border-brand-border bg-brand-primary px-2 text-[10px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
        />
        <button
          onClick={addTag}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-brand-border text-brand-muted hover:text-brand-text"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
