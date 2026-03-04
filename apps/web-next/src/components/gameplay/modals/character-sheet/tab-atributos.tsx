"use client";

import { formatModifier } from "@questboard/utils";
import {
  ABILITY_LABELS,
  ABILITY_SHORT_LABELS,
  ABILITY_ORDER,
} from "@questboard/constants";
import type { AbilityKey } from "@questboard/types";
import type { FullCharacter } from "@/lib/character-types";

interface TabAtributosProps {
  character: FullCharacter;
}

export function TabAtributos({ character }: TabAtributosProps) {
  const perceptionSkill = character.skills.find(
    (s) => s.name === "Percepção" || s.name === "Perception",
  );
  const passivePerception = 10 + (perceptionSkill?.modifier ?? 0);

  return (
    <div className="space-y-6">
      {/* ── Atributos ────────────────────────────────── */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Atributos
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {ABILITY_ORDER.map((key) => {
            const ability = character.abilities[key];
            return (
              <div
                key={key}
                className="flex flex-col items-center rounded-lg border border-brand-border bg-brand-primary p-3"
              >
                <span className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">
                  {ABILITY_SHORT_LABELS[key]}
                </span>
                <span className="mt-1 text-lg font-bold tabular-nums text-brand-text">
                  {formatModifier(ability.modifier)}
                </span>
                <span className="mt-0.5 text-[11px] tabular-nums text-brand-muted">
                  {ability.score}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Testes de Resistencia ─────────────────────── */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Testes de Resistencia
        </h3>
        <div className="space-y-1">
          {ABILITY_ORDER.map((key) => {
            const ability = character.abilities[key];
            const saveModifier = ability.saveProficiency
              ? ability.modifier + character.proficiencyBonus
              : ability.modifier;

            return (
              <div
                key={key}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-white/[0.03]"
              >
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full border ${
                    ability.saveProficiency
                      ? "border-brand-accent bg-brand-accent"
                      : "border-brand-muted bg-transparent"
                  }`}
                />
                <span className="flex-1 text-brand-text">
                  {ABILITY_LABELS[key]}
                </span>
                <span className="font-medium tabular-nums text-brand-text">
                  {formatModifier(saveModifier)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Pericias ─────────────────────────────────── */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Pericias
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {character.skills.map((skill) => (
            <div
              key={skill.name}
              className="flex items-center gap-2 rounded px-2 py-1 text-sm transition-colors hover:bg-white/[0.03]"
            >
              {/* Proficiency indicator */}
              {skill.proficiency === "expertise" ? (
                <span className="flex gap-0.5">
                  <span className="inline-block h-2 w-2 rounded-full border border-brand-accent bg-brand-accent" />
                  <span className="inline-block h-2 w-2 rounded-full border border-brand-accent bg-brand-accent" />
                </span>
              ) : (
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full border ${
                    skill.proficiency === "proficient"
                      ? "border-brand-accent bg-brand-accent"
                      : "border-brand-muted bg-transparent"
                  }`}
                />
              )}

              <span className="flex-1 truncate text-brand-text">
                {skill.name}
              </span>
              <span className="font-medium tabular-nums text-brand-text">
                {formatModifier(skill.modifier)}
              </span>
              <span className="text-[10px] text-brand-muted">
                {ABILITY_SHORT_LABELS[skill.ability]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Outros ───────────────────────────────────── */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Outros
        </h3>
        <div className="space-y-3">
          {/* Proficiency bonus */}
          <div className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-primary px-3 py-2">
            <span className="text-sm text-brand-muted">
              Bonus de Proficiencia
            </span>
            <span className="font-semibold tabular-nums text-brand-text">
              {formatModifier(character.proficiencyBonus)}
            </span>
          </div>

          {/* Passive perception */}
          <div className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-primary px-3 py-2">
            <span className="text-sm text-brand-muted">
              Percepcao Passiva
            </span>
            <span className="font-semibold tabular-nums text-brand-text">
              {passivePerception}
            </span>
          </div>

          {/* Languages */}
          {character.proficiencies.languages.length > 0 && (
            <div className="rounded-lg border border-brand-border bg-brand-primary px-3 py-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                Idiomas
              </span>
              <p className="mt-1 text-sm text-brand-text">
                {character.proficiencies.languages.join(", ")}
              </p>
            </div>
          )}

          {/* Tools */}
          {character.proficiencies.tools.length > 0 && (
            <div className="rounded-lg border border-brand-border bg-brand-primary px-3 py-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                Ferramentas
              </span>
              <p className="mt-1 text-sm text-brand-text">
                {character.proficiencies.tools.join(", ")}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
