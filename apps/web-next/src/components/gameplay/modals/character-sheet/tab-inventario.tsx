"use client";

import { useState } from "react";
import { formatModifier } from "@questboard/utils";
import type { FullCharacter, InventoryItem } from "@/lib/character-types";

interface TabInventarioProps {
  character: FullCharacter;
}

const COIN_LABELS: { key: "pp" | "gp" | "ep" | "sp" | "cp"; label: string }[] =
  [
    { key: "pp", label: "PP" },
    { key: "gp", label: "PO" },
    { key: "ep", label: "PE" },
    { key: "sp", label: "PP" },
    { key: "cp", label: "PC" },
  ];

// Friendly pt-BR coin labels
const COIN_NAMES: Record<string, string> = {
  pp: "Platina",
  gp: "Ouro",
  ep: "Electro",
  sp: "Prata",
  cp: "Cobre",
};

export function TabInventario({ character }: TabInventarioProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

  const totalWeight = character.inventory.reduce(
    (sum, item) => sum + item.weight * item.quantity,
    0,
  );

  // Convert all coins to gold equivalent for summary
  const totalGold =
    character.coins.cp * 0.01 +
    character.coins.sp * 0.1 +
    character.coins.ep * 0.5 +
    character.coins.gp * 1 +
    character.coins.pp * 10;

  const equippedItems = character.inventory.filter((item) => item.equipped);
  const weapons = character.inventory.filter(
    (item) => item.category === "weapon",
  );
  const backpackItems = character.inventory.filter(
    (item) => !item.equipped && item.category !== "weapon",
  );

  const renderItem = (item: InventoryItem) => {
    const isExpanded = expandedIds.has(item.id);
    return (
      <div key={item.id}>
        <button
          onClick={() => toggleExpanded(item.id)}
          className="flex w-full items-center gap-3 rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-white/[0.03]"
        >
          <span className="flex-1 font-medium text-brand-text">
            {item.name}
            {item.quantity > 1 && (
              <span className="ml-1 text-brand-muted">x{item.quantity}</span>
            )}
          </span>
          <span className="text-[11px] tabular-nums text-brand-muted">
            {item.weight > 0 ? `${item.weight} lb` : "—"}
          </span>
          <span className="text-[10px] text-brand-muted">
            {isExpanded ? "\u25B2" : "\u25BC"}
          </span>
        </button>
        {isExpanded && item.description && (
          <div className="mx-3 mb-2 rounded-lg border border-brand-border bg-brand-primary p-3">
            <p className="text-[12px] leading-relaxed text-brand-muted">
              {item.description}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Summary Bar ──────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 rounded-lg border border-brand-border bg-brand-primary px-3 py-2">
          <div className="flex-1">
            <span className="text-[10px] uppercase tracking-wider text-brand-muted">
              Peso Total
            </span>
            <p className="text-sm font-semibold tabular-nums text-brand-text">
              {totalWeight.toFixed(1)}{" "}
              <span className="text-brand-muted">
                / {character.carryCapacity} lb
              </span>
            </p>
          </div>
          <div className="border-l border-brand-border pl-3">
            <span className="text-[10px] uppercase tracking-wider text-brand-muted">
              Ouro Total
            </span>
            <p className="text-sm font-semibold tabular-nums text-brand-text">
              {totalGold.toFixed(1)} PO
            </p>
          </div>
        </div>
      </section>

      {/* ── Equipado ─────────────────────────────────── */}
      {equippedItems.length > 0 && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Equipado
          </h3>
          <div className="space-y-1">{equippedItems.map(renderItem)}</div>
        </section>
      )}

      {/* ── Armas ────────────────────────────────────── */}
      {weapons.length > 0 && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Armas
          </h3>
          <div className="space-y-1">
            {weapons.map((item) => {
              const isExpanded = expandedIds.has(item.id);
              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="flex w-full items-center gap-3 rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="flex-1 font-medium text-brand-text">
                      {item.name}
                    </span>
                    {item.attackBonus != null && (
                      <span className="rounded bg-brand-accent/15 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-brand-accent">
                        {formatModifier(item.attackBonus)}
                      </span>
                    )}
                    {item.damage && (
                      <span className="text-[11px] tabular-nums text-brand-muted">
                        {item.damage}
                      </span>
                    )}
                    {item.properties && item.properties.length > 0 && (
                      <span className="text-[11px] text-brand-muted">
                        {item.properties.join(", ")}
                      </span>
                    )}
                    <span className="text-[10px] text-brand-muted">
                      {isExpanded ? "\u25B2" : "\u25BC"}
                    </span>
                  </button>
                  {isExpanded && item.description && (
                    <div className="mx-3 mb-2 rounded-lg border border-brand-border bg-brand-primary p-3">
                      <p className="text-[12px] leading-relaxed text-brand-muted">
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Mochila ──────────────────────────────────── */}
      {backpackItems.length > 0 && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Mochila
          </h3>
          <div className="space-y-1">{backpackItems.map(renderItem)}</div>
        </section>
      )}

      {/* ── Moedas ───────────────────────────────────── */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Moedas
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {(["pp", "gp", "ep", "sp", "cp"] as const).map((key) => (
            <div
              key={key}
              className="flex flex-col items-center rounded-lg border border-brand-border bg-brand-primary p-2"
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">
                {COIN_NAMES[key]}
              </span>
              <span className="mt-0.5 text-base font-bold tabular-nums text-brand-text">
                {character.coins[key]}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
