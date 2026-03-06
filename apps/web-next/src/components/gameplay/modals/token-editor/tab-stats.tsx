"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { SavedToken } from "@/lib/token-library-types";
import { getAbilityMod } from "@/lib/creature-data";

interface TabStatsProps {
  form: SavedToken;
  onUpdate: (updates: Partial<SavedToken>) => void;
}

const ABILITIES = ["FOR", "DES", "CON", "INT", "SAB", "CAR"] as const;
const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;

export function TabStats({ form, onUpdate }: TabStatsProps) {
  return (
    <div className="space-y-5">
      {/* Defenses */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Defesas
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              HP
            </label>
            <input
              type="number"
              value={form.hp}
              onChange={(e) =>
                onUpdate({ hp: parseInt(e.target.value) || 0 })
              }
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Formula HP
            </label>
            <input
              type="text"
              value={form.hpFormula}
              onChange={(e) => onUpdate({ hpFormula: e.target.value })}
              placeholder="2d6+2"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-1.5 pb-1.5">
              <input
                type="checkbox"
                checked={form.rollHPOnAdd}
                onChange={(e) =>
                  onUpdate({ rollHPOnAdd: e.target.checked })
                }
                className="accent-brand-accent"
              />
              <span className="text-[10px] text-brand-muted">
                Rolar ao adicionar
              </span>
            </label>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              CA (Armor Class)
            </label>
            <input
              type="number"
              value={form.ac}
              onChange={(e) =>
                onUpdate({ ac: parseInt(e.target.value) || 0 })
              }
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Descricao CA
            </label>
            <input
              type="text"
              value={form.acDesc}
              onChange={(e) => onUpdate({ acDesc: e.target.value })}
              placeholder="armadura de couro"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="mb-1 block text-[10px] text-brand-muted">
            Velocidade
          </label>
          <input
            type="text"
            value={form.speed}
            onChange={(e) => onUpdate({ speed: e.target.value })}
            placeholder="30ft, nadar 20ft"
            className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
          />
        </div>
      </section>

      {/* Ability Scores */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Atributos
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {ABILITIES.map((label, i) => {
            const key = ABILITY_KEYS[i];
            const score = form[key];
            return (
              <div key={label} className="text-center">
                <label className="mb-1 block text-[9px] font-semibold text-brand-muted/60">
                  {label}
                </label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) =>
                    onUpdate({ [key]: parseInt(e.target.value) || 0 })
                  }
                  className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-1 text-center text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
                />
                <div className="mt-0.5 text-[9px] text-brand-muted">
                  {getAbilityMod(score)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Saving Throws */}
      <section>
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Testes de Resistencia (proficiente)
        </h3>
        <div className="flex flex-wrap gap-2">
          {ABILITIES.map((label, i) => {
            const key = ABILITY_KEYS[i];
            const hasSave = form.savingThrows.some(
              (s) => s.ability === key,
            );
            return (
              <label
                key={label}
                className="flex items-center gap-1 text-[10px] text-brand-text"
              >
                <input
                  type="checkbox"
                  checked={hasSave}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onUpdate({
                        savingThrows: [
                          ...form.savingThrows,
                          { ability: key, bonus: 0 },
                        ],
                      });
                    } else {
                      onUpdate({
                        savingThrows: form.savingThrows.filter(
                          (s) => s.ability !== key,
                        ),
                      });
                    }
                  }}
                  className="accent-brand-accent"
                />
                {label}
              </label>
            );
          })}
        </div>
      </section>

      {/* Skills */}
      <SkillsSection form={form} onUpdate={onUpdate} />

      {/* Resistances & Immunities */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Resistencias e Imunidades
        </h3>
        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Vulnerabilidades
            </label>
            <input
              type="text"
              value={form.damageVulnerabilities ?? ""}
              onChange={(e) =>
                onUpdate({
                  damageVulnerabilities: e.target.value || undefined,
                })
              }
              placeholder="contundente"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Resistencias
            </label>
            <input
              type="text"
              value={form.damageResistances ?? ""}
              onChange={(e) =>
                onUpdate({
                  damageResistances: e.target.value || undefined,
                })
              }
              placeholder="necrotico"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Imunidades de dano
            </label>
            <input
              type="text"
              value={form.damageImmunities ?? ""}
              onChange={(e) =>
                onUpdate({
                  damageImmunities: e.target.value || undefined,
                })
              }
              placeholder="veneno"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Imunidades de condicao
            </label>
            <input
              type="text"
              value={form.conditionImmunities ?? ""}
              onChange={(e) =>
                onUpdate({
                  conditionImmunities: e.target.value || undefined,
                })
              }
              placeholder="envenenado, exausto"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
        </div>
      </section>

      {/* Senses & Languages */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Sentidos e Idiomas
        </h3>
        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Sentidos
            </label>
            <input
              type="text"
              value={form.senses}
              onChange={(e) => onUpdate({ senses: e.target.value })}
              placeholder="Darkvision 60ft, Percepcao Passiva 9"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Idiomas
            </label>
            <input
              type="text"
              value={form.languages}
              onChange={(e) => onUpdate({ languages: e.target.value })}
              placeholder="Comum, Goblin"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function SkillsSection({
  form,
  onUpdate,
}: {
  form: SavedToken;
  onUpdate: (updates: Partial<SavedToken>) => void;
}) {
  const [newName, setNewName] = useState("");
  const [newBonus, setNewBonus] = useState("");

  function addSkill() {
    if (!newName.trim()) return;
    onUpdate({
      skills: [
        ...form.skills,
        { name: newName.trim(), bonus: parseInt(newBonus) || 0 },
      ],
    });
    setNewName("");
    setNewBonus("");
  }

  function removeSkill(index: number) {
    onUpdate({
      skills: form.skills.filter((_, i) => i !== index),
    });
  }

  return (
    <section>
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
        Pericias
      </h3>
      <div className="space-y-1">
        {form.skills.map((skill, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="flex-1 text-[11px] text-brand-text">
              {skill.name}
            </span>
            <span className="text-[11px] text-brand-accent">
              +{skill.bonus}
            </span>
            <button
              onClick={() => removeSkill(i)}
              className="text-brand-muted/30 hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
          placeholder="Furtividade"
          className="h-6 flex-1 rounded border border-dashed border-brand-border bg-transparent px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/30 focus:border-brand-accent/40"
        />
        <input
          type="number"
          value={newBonus}
          onChange={(e) => setNewBonus(e.target.value)}
          placeholder="+6"
          className="h-6 w-12 rounded border border-dashed border-brand-border bg-transparent px-1 text-center text-[11px] text-brand-text outline-none placeholder:text-brand-muted/30 focus:border-brand-accent/40"
        />
        <button
          onClick={addSkill}
          disabled={!newName.trim()}
          className="flex h-6 items-center gap-0.5 rounded bg-white/5 px-2 text-[10px] text-brand-muted transition-colors hover:bg-white/10 hover:text-brand-text disabled:opacity-30"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </section>
  );
}
