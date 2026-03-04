"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { getModifier, formatModifier } from "@questboard/utils";
import { useGameplayStore } from "@/lib/gameplay-store";
import {
  getCRColor,
  sizeToGrid,
  CREATURE_TYPE_LABELS,
  CREATURE_SIZE_LABELS,
  type Creature,
} from "@/lib/creature-data";

interface CreatureStatBlockProps {
  creature: Creature;
}

const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;
const ABILITY_LABELS: Record<(typeof ABILITY_KEYS)[number], string> = {
  str: "FOR",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",
};

function Separator() {
  return <div className="my-3 h-px bg-brand-accent/40" />;
}

export function CreatureStatBlock({ creature }: CreatureStatBlockProps) {
  const [qty, setQty] = useState(1);
  const crColor = getCRColor(creature.cr);
  const addToken = useGameplayStore((s) => s.addToken);
  const addToast = useGameplayStore((s) => s.addToast);
  const closeModal = useGameplayStore((s) => s.closeModal);
  const getViewportCenter = useGameplayStore((s) => s.getViewportCenter);

  function handleAddToMap() {
    const center = getViewportCenter();
    const gridSize = sizeToGrid(creature.size);

    for (let i = 0; i < qty; i++) {
      const offsetX = qty > 1 ? (i % Math.ceil(Math.sqrt(qty))) * gridSize : 0;
      const offsetY = qty > 1 ? Math.floor(i / Math.ceil(Math.sqrt(qty))) * gridSize : 0;
      addToken({
        name: qty > 1 ? `${creature.name} ${i + 1}` : creature.name,
        x: center.x + offsetX,
        y: center.y + offsetY,
        alignment: "hostile",
        hp: creature.hp,
        maxHp: creature.hp,
        ac: creature.ac,
        size: gridSize,
      });
    }
    addToast(
      `${creature.name} adicionado${qty > 1 ? ` (x${qty})` : ""}`,
    );
    closeModal();
  }

  return (
    <div className="rounded-xl bg-white/[0.02] p-4">
      {/* ── Header ──────────────────────────────── */}
      <div className="mb-1">
        <h3 className="text-base font-bold text-brand-text">
          {creature.name}
        </h3>
        <p className="text-xs italic text-brand-muted">
          {CREATURE_SIZE_LABELS[creature.size]}{" "}
          {CREATURE_TYPE_LABELS[creature.type].toLowerCase()},{" "}
          {creature.alignment}
        </p>
        <div className="mt-1 flex items-center gap-3">
          <span
            className="rounded px-1.5 py-0.5 text-[11px] font-bold tabular-nums"
            style={{ color: crColor, backgroundColor: crColor + "18" }}
          >
            ND {creature.cr}
          </span>
          <span className="text-[11px] tabular-nums text-brand-muted">
            {creature.xp.toLocaleString()} XP
          </span>
        </div>
      </div>

      <Separator />

      {/* ── Defense ──────────────────────────────── */}
      <div className="space-y-1 text-sm">
        <p className="text-brand-text">
          <span className="font-semibold">Classe de Armadura</span>{" "}
          <span className="tabular-nums">{creature.ac}</span>
          {creature.acDesc && (
            <span className="text-brand-muted"> ({creature.acDesc})</span>
          )}
        </p>
        <p className="text-brand-text">
          <span className="font-semibold">Pontos de Vida</span>{" "}
          <span className="tabular-nums">{creature.hp}</span>
          {creature.hpFormula && (
            <span className="text-brand-muted"> ({creature.hpFormula})</span>
          )}
        </p>
        <p className="text-brand-text">
          <span className="font-semibold">Deslocamento</span>{" "}
          {creature.speed}
        </p>
      </div>

      <Separator />

      {/* ── Ability Scores ──────────────────────── */}
      <div className="grid grid-cols-6 gap-1.5">
        {ABILITY_KEYS.map((key) => {
          const score = creature[key];
          const mod = getModifier(score);
          return (
            <div
              key={key}
              className="flex flex-col items-center rounded-lg border border-brand-border bg-brand-primary px-1 py-2"
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">
                {ABILITY_LABELS[key]}
              </span>
              <span className="mt-0.5 text-sm font-bold tabular-nums text-brand-text">
                {formatModifier(mod)}
              </span>
              <span className="text-[10px] tabular-nums text-brand-muted">
                {score}
              </span>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* ── Details ──────────────────────────────── */}
      <div className="space-y-1 text-sm">
        {creature.skills.length > 0 && (
          <p className="text-brand-text">
            <span className="font-semibold">Pericias</span>{" "}
            {creature.skills
              .map((s) => `${s.name} ${formatModifier(s.bonus)}`)
              .join(", ")}
          </p>
        )}
        {creature.damageVulnerabilities && (
          <p className="text-brand-text">
            <span className="font-semibold">Vulnerabilidades</span>{" "}
            {creature.damageVulnerabilities}
          </p>
        )}
        {creature.damageResistances && (
          <p className="text-brand-text">
            <span className="font-semibold">Resistencias</span>{" "}
            {creature.damageResistances}
          </p>
        )}
        {creature.damageImmunities && (
          <p className="text-brand-text">
            <span className="font-semibold">Imunidades a Dano</span>{" "}
            {creature.damageImmunities}
          </p>
        )}
        {creature.conditionImmunities && (
          <p className="text-brand-text">
            <span className="font-semibold">Imunidades a Condicao</span>{" "}
            {creature.conditionImmunities}
          </p>
        )}
        <p className="text-brand-text">
          <span className="font-semibold">Sentidos</span> {creature.senses}
        </p>
        <p className="text-brand-text">
          <span className="font-semibold">Idiomas</span> {creature.languages}
        </p>
      </div>

      {/* ── Abilities (traits) ──────────────────── */}
      {creature.abilities.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            {creature.abilities.map((ability, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-semibold italic text-brand-text">
                  {ability.name}.
                </span>{" "}
                <span className="text-brand-text/90">{ability.desc}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Actions ─────────────────────────────── */}
      {creature.actions.length > 0 && (
        <>
          <Separator />
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-accent">
            Acoes
          </h4>
          <div className="space-y-2">
            {creature.actions.map((action, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-semibold italic text-brand-text">
                  {action.name}.
                </span>{" "}
                <span className="text-brand-text/90">{action.desc}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Reactions ───────────────────────────── */}
      {creature.reactions && creature.reactions.length > 0 && (
        <>
          <Separator />
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-accent">
            Reacoes
          </h4>
          <div className="space-y-2">
            {creature.reactions.map((reaction, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-semibold italic text-brand-text">
                  {reaction.name}.
                </span>{" "}
                <span className="text-brand-text/90">{reaction.desc}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Legendary Actions ───────────────────── */}
      {creature.legendaryActions && creature.legendaryActions.length > 0 && (
        <>
          <Separator />
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-accent">
            Acoes Lendarias
          </h4>
          <div className="space-y-2">
            {creature.legendaryActions.map((action, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-semibold italic text-brand-text">
                  {action.name}.
                </span>{" "}
                <span className="text-brand-text/90">{action.desc}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Add to Map ──────────────────────────── */}
      <Separator />
      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-border text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
          >
            <Minus className="h-3 w-3" />
          </button>
          <input
            type="number"
            min={1}
            max={10}
            value={qty}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v)) setQty(Math.max(1, Math.min(10, v)));
            }}
            className="h-7 w-10 rounded-md border border-brand-border bg-white/[0.04] text-center text-xs tabular-nums text-brand-text focus:border-brand-accent focus:outline-none"
          />
          <button
            onClick={() => setQty((q) => Math.min(10, q + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-border text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleAddToMap(); }}
          className="h-8 flex-1 rounded-lg bg-brand-accent px-4 text-xs font-semibold text-white transition-colors hover:bg-brand-accent/90"
        >
          Adicionar ao Mapa
        </button>
      </div>
    </div>
  );
}
