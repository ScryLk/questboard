"use client";

import { type Creature, getAbilityMod } from "@/lib/creature-data";

interface CompendiumInlineStatBlockProps {
  creature: Creature;
}

export function CompendiumInlineStatBlock({
  creature,
}: CompendiumInlineStatBlockProps) {
  return (
    <div className="border-t border-brand-border/30 px-2 py-1.5">
      {/* Basic stats */}
      <div className="mb-1 flex items-center gap-2 text-[10px] text-brand-muted">
        <span>HP {creature.hp}</span>
        <span>CA {creature.ac}</span>
        <span>{creature.speed}</span>
      </div>

      {/* Ability scores */}
      <div className="mb-1.5 grid grid-cols-6 gap-1">
        {(
          [
            ["FOR", creature.str],
            ["DES", creature.dex],
            ["CON", creature.con],
            ["INT", creature.int],
            ["SAB", creature.wis],
            ["CAR", creature.cha],
          ] as const
        ).map(([label, score]) => (
          <div key={label} className="text-center">
            <div className="text-[8px] font-semibold text-brand-muted/60">
              {label}
            </div>
            <div className="text-[10px] text-brand-text">
              {score}{" "}
              <span className="text-brand-muted">
                ({getAbilityMod(score)})
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Vulnerabilities / Resistances / Immunities */}
      {creature.damageVulnerabilities && (
        <StatLine label="Vulneravel" value={creature.damageVulnerabilities} />
      )}
      {creature.damageResistances && (
        <StatLine label="Resistente" value={creature.damageResistances} />
      )}
      {creature.damageImmunities && (
        <StatLine label="Imune" value={creature.damageImmunities} />
      )}
      {creature.conditionImmunities && (
        <StatLine label="Imune (cond.)" value={creature.conditionImmunities} />
      )}

      {/* Senses */}
      {creature.senses && (
        <StatLine label="Sentidos" value={creature.senses} />
      )}

      {/* Abilities */}
      {creature.abilities.length > 0 && (
        <div className="mt-1 border-t border-brand-border/20 pt-1">
          {creature.abilities.map((a, i) => (
            <div key={i} className="mb-0.5">
              <span className="text-[10px] font-medium text-brand-accent">
                {a.name}.{" "}
              </span>
              <span className="text-[10px] text-brand-muted">{a.desc}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {creature.actions.length > 0 && (
        <div className="mt-1 border-t border-brand-border/20 pt-1">
          {creature.actions.map((a, i) => (
            <div key={i} className="mb-0.5 flex items-start gap-1">
              <span className="mt-px text-[10px] text-brand-accent">⚔</span>
              <div>
                <span className="text-[10px] font-medium text-brand-text">
                  {a.name}.{" "}
                </span>
                <span className="text-[10px] text-brand-muted">{a.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reactions */}
      {creature.reactions && creature.reactions.length > 0 && (
        <div className="mt-1 border-t border-brand-border/20 pt-1">
          <div className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-muted/60">
            Reacoes
          </div>
          {creature.reactions.map((a, i) => (
            <div key={i} className="mb-0.5">
              <span className="text-[10px] font-medium text-brand-text">
                {a.name}.{" "}
              </span>
              <span className="text-[10px] text-brand-muted">{a.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[10px]">
      <span className="font-medium text-brand-muted/70">{label}: </span>
      <span className="text-brand-text/70">{value}</span>
    </div>
  );
}
