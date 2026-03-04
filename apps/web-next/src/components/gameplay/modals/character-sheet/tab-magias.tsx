"use client";

import { useState } from "react";
import { formatModifier } from "@questboard/utils";
import { ABILITY_LABELS } from "@questboard/constants";
import type { FullCharacter, CharacterSpell } from "@/lib/character-types";

interface TabMagiasProps {
  character: FullCharacter;
}

export function TabMagias({ character }: TabMagiasProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (!character.spellcasting) {
    return (
      <div className="flex h-48 flex-col items-center justify-center text-center">
        <p className="text-sm text-brand-muted">
          Este personagem nao possui habilidades magicas.
        </p>
      </div>
    );
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const cantrips = character.spells.filter((s) => s.level === 0);
  const spellsByLevel = character.spells
    .filter((s) => s.level > 0)
    .reduce<Record<number, CharacterSpell[]>>((acc, spell) => {
      if (!acc[spell.level]) acc[spell.level] = [];
      acc[spell.level].push(spell);
      return acc;
    }, {});

  const sortedLevels = Object.keys(spellsByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* ── Spellcasting Info ────────────────────────── */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Conjuracao
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-brand-muted">
              Habilidade
            </span>
            <p className="mt-0.5 text-sm font-semibold text-brand-text">
              {ABILITY_LABELS[character.spellcasting.ability]}
            </p>
          </div>
          <div className="rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-brand-muted">
              CD de Resistencia
            </span>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-brand-text">
              {character.spellcasting.saveDC}
            </p>
          </div>
          <div className="rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-brand-muted">
              Bonus de Ataque
            </span>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-brand-text">
              {formatModifier(character.spellcasting.attackBonus)}
            </p>
          </div>
        </div>
      </section>

      {/* ── Spell Slots ──────────────────────────────── */}
      {character.spellSlots.length > 0 && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Espacos de Magia
          </h3>
          <div className="space-y-2">
            {character.spellSlots.map((slot) => (
              <div
                key={slot.level}
                className="flex items-center gap-3 rounded-lg border border-brand-border bg-brand-primary px-3 py-2"
              >
                <span className="min-w-[60px] text-sm text-brand-muted">
                  Nivel {slot.level}
                </span>
                <div className="flex gap-1.5">
                  {Array.from({ length: slot.total }).map((_, i) => (
                    <span
                      key={i}
                      className={`inline-block h-3 w-3 rounded-full border ${
                        i < slot.used
                          ? "border-brand-muted/40 bg-brand-muted/30"
                          : "border-brand-accent bg-brand-accent"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-auto text-[11px] tabular-nums text-brand-muted">
                  {slot.total - slot.used}/{slot.total}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Truques (Cantrips) ───────────────────────── */}
      {cantrips.length > 0 && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Truques
          </h3>
          <div className="space-y-1">
            {cantrips.map((spell) => (
              <div
                key={spell.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded px-3 py-1.5 text-sm transition-colors hover:bg-white/[0.03]"
              >
                <span className="font-medium text-brand-text">
                  {spell.name}
                </span>
                <span className="text-[11px] text-brand-muted">
                  {spell.school}
                </span>
                <span className="text-[11px] tabular-nums text-brand-muted">
                  {spell.range}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Spells by Level ──────────────────────────── */}
      {sortedLevels.map((level) => (
        <section key={level}>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Magias de Nivel {level}
          </h3>
          <div className="space-y-1">
            {spellsByLevel[level].map((spell) => {
              const isExpanded = expandedIds.has(spell.id);
              return (
                <div key={spell.id}>
                  <button
                    onClick={() => toggleExpanded(spell.id)}
                    className="flex w-full items-center gap-3 rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="flex-1 font-medium text-brand-text">
                      {spell.name}
                    </span>
                    <span className="text-[11px] text-brand-muted">
                      {spell.school}
                    </span>
                    <span className="text-[11px] tabular-nums text-brand-muted">
                      {spell.castingTime}
                    </span>
                    <span className="text-[11px] tabular-nums text-brand-muted">
                      {spell.range}
                    </span>
                    <span className="text-[10px] text-brand-muted">
                      {isExpanded ? "\u25B2" : "\u25BC"}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mx-3 mb-2 rounded-lg border border-brand-border bg-brand-primary p-3">
                      <div className="mb-2 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-brand-muted">
                            Componentes:{" "}
                          </span>
                          <span className="text-brand-text">
                            {spell.components}
                          </span>
                        </div>
                        <div>
                          <span className="text-brand-muted">Duracao: </span>
                          <span className="text-brand-text">
                            {spell.duration}
                          </span>
                        </div>
                      </div>
                      <p className="text-[12px] leading-relaxed text-brand-muted">
                        {spell.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
