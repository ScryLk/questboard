"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { NPCData, CombatBehavior, StatBlockSource } from "@/lib/npc-types";
import { COMBAT_BEHAVIOR_LABELS } from "@/lib/npc-types";
import { CREATURE_COMPENDIUM, parseCR } from "@/lib/creature-data";
import { useCustomCreaturesStore } from "@/lib/custom-creatures-store";

interface TabCombateProps {
  form: NPCData;
  onUpdate: (updates: Partial<NPCData>) => void;
}

export function TabCombate({ form, onUpdate }: TabCombateProps) {
  const [creatureSearch, setCreatureSearch] = useState("");
  const customCreatures = useCustomCreaturesStore((s) => s.creatures);

  const allCreatures = [...CREATURE_COMPENDIUM, ...customCreatures];
  const filteredCreatures = creatureSearch.trim()
    ? allCreatures.filter(
        (c) =>
          c.name.toLowerCase().includes(creatureSearch.toLowerCase()) ||
          c.nameEn.toLowerCase().includes(creatureSearch.toLowerCase()),
      )
    : [];

  const selectedCreature = form.compendiumCreatureId
    ? allCreatures.find((c) => c.id === form.compendiumCreatureId)
    : form.customCreatureId
      ? customCreatures.find((c) => c.id === form.customCreatureId)
      : null;

  return (
    <div className="space-y-5">
      {/* Combat Behavior */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Comportamento em Combate
        </h3>
        <div className="space-y-1">
          {(
            Object.entries(COMBAT_BEHAVIOR_LABELS) as [
              CombatBehavior,
              string,
            ][]
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-white/[0.02]"
            >
              <input
                type="radio"
                name="combatBehavior"
                checked={form.combatBehavior === key}
                onChange={() => onUpdate({ combatBehavior: key })}
                className="accent-brand-accent"
              />
              <span className="text-[11px] text-brand-text">{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Stat Block Source */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Stat Block
        </h3>
        <div className="mb-3 flex gap-1">
          {(
            [
              ["none", "Nenhum"],
              ["compendium", "Compendio"],
              ["custom", "Custom"],
              ["inline", "Rapido"],
            ] as [StatBlockSource, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() =>
                onUpdate({
                  statBlockSource: key,
                  ...(key === "none"
                    ? {
                        compendiumCreatureId: undefined,
                        customCreatureId: undefined,
                        inlineStats: undefined,
                      }
                    : {}),
                })
              }
              className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-colors ${
                form.statBlockSource === key
                  ? "bg-brand-accent/20 text-brand-accent"
                  : "border border-brand-border text-brand-muted hover:text-brand-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Compendium picker */}
        {form.statBlockSource === "compendium" && (
          <div>
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-brand-muted/50" />
              <input
                type="text"
                value={creatureSearch}
                onChange={(e) => setCreatureSearch(e.target.value)}
                placeholder="Buscar criatura..."
                className="h-7 w-full rounded-md border border-brand-border bg-brand-primary pl-7 pr-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
              />
            </div>

            {selectedCreature && (
              <div className="mb-2 rounded-md border border-brand-accent/20 bg-brand-accent/[0.05] p-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{selectedCreature.icon}</span>
                  <span className="text-[11px] font-medium text-brand-text">
                    {selectedCreature.name}
                  </span>
                  <span className="text-[9px] text-brand-muted">
                    ND {selectedCreature.cr}
                  </span>
                </div>
                <div className="mt-1 flex gap-3 text-[10px] text-brand-muted">
                  <span>CA {selectedCreature.ac}</span>
                  <span>HP {selectedCreature.hp}</span>
                  <span>{selectedCreature.speed}</span>
                </div>
              </div>
            )}

            {creatureSearch.trim() && (
              <div className="max-h-40 overflow-y-auto rounded-md border border-brand-border">
                {filteredCreatures.length === 0 ? (
                  <div className="px-2 py-3 text-center text-[10px] text-brand-muted">
                    Nenhuma criatura encontrada.
                  </div>
                ) : (
                  filteredCreatures.slice(0, 10).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        const isCustom = "isCustom" in c;
                        onUpdate({
                          compendiumCreatureId: isCustom ? undefined : c.id,
                          customCreatureId: isCustom ? c.id : undefined,
                        });
                        setCreatureSearch("");
                      }}
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-left transition-colors hover:bg-white/[0.03]"
                    >
                      <span className="text-sm">{c.icon}</span>
                      <span className="flex-1 text-[11px] text-brand-text">
                        {c.name}
                      </span>
                      <span className="text-[9px] text-brand-muted">
                        ND {c.cr}
                      </span>
                      <span className="text-[9px] text-brand-muted">
                        HP {c.hp}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Custom creatures */}
        {form.statBlockSource === "custom" && (
          <div>
            {customCreatures.length === 0 ? (
              <p className="text-[10px] text-brand-muted">
                Nenhuma criatura personalizada. Use o Compendio com IA para
                gerar.
              </p>
            ) : (
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {customCreatures.map((c) => (
                  <button
                    key={c.id}
                    onClick={() =>
                      onUpdate({
                        customCreatureId: c.id,
                        compendiumCreatureId: undefined,
                      })
                    }
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                      form.customCreatureId === c.id
                        ? "bg-brand-accent/10 text-brand-accent"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="text-sm">{c.icon}</span>
                    <span className="flex-1 text-[11px] text-brand-text">
                      {c.name}
                    </span>
                    <span className="text-[9px] text-brand-muted">
                      ND {c.cr}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inline quick stats */}
        {form.statBlockSource === "inline" && (
          <div className="grid grid-cols-5 gap-2">
            <div>
              <label className="mb-1 block text-[10px] text-brand-muted">
                CA
              </label>
              <input
                type="number"
                value={form.inlineStats?.ac ?? 10}
                onChange={(e) =>
                  onUpdate({
                    inlineStats: {
                      ...(form.inlineStats ?? {
                        ac: 10,
                        hp: 10,
                        maxHp: 10,
                        speed: 30,
                        size: 1,
                      }),
                      ac: parseInt(e.target.value) || 10,
                    },
                  })
                }
                className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-1.5 text-center text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-brand-muted">
                HP
              </label>
              <input
                type="number"
                value={form.inlineStats?.hp ?? 10}
                onChange={(e) => {
                  const hp = parseInt(e.target.value) || 10;
                  onUpdate({
                    inlineStats: {
                      ...(form.inlineStats ?? {
                        ac: 10,
                        hp: 10,
                        maxHp: 10,
                        speed: 30,
                        size: 1,
                      }),
                      hp,
                      maxHp: hp,
                    },
                  });
                }}
                className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-1.5 text-center text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-brand-muted">
                Velocidade
              </label>
              <input
                type="number"
                value={form.inlineStats?.speed ?? 30}
                onChange={(e) =>
                  onUpdate({
                    inlineStats: {
                      ...(form.inlineStats ?? {
                        ac: 10,
                        hp: 10,
                        maxHp: 10,
                        speed: 30,
                        size: 1,
                      }),
                      speed: parseInt(e.target.value) || 30,
                    },
                  })
                }
                className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-1.5 text-center text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-brand-muted">
                Tamanho
              </label>
              <input
                type="number"
                value={form.inlineStats?.size ?? 1}
                min={1}
                max={4}
                onChange={(e) =>
                  onUpdate({
                    inlineStats: {
                      ...(form.inlineStats ?? {
                        ac: 10,
                        hp: 10,
                        maxHp: 10,
                        speed: 30,
                        size: 1,
                      }),
                      size: parseInt(e.target.value) || 1,
                    },
                  })
                }
                className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-1.5 text-center text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
