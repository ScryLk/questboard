"use client";

import { Check, Package, Search } from "lucide-react";
import { useState } from "react";
import { useDnd5eWizardStore } from "@/lib/dnd5e-wizard-store";
import { listItems } from "@/lib/srd";

// MVP: lista todo o catálogo SRD de armas + armaduras + ferramentas
// e o usuário marca o que quer levar. Pacotes de classe (PHB) ficam
// pra fatia futura quando o data dump real chegar.

export function Step7Equipment() {
  const equipment = useDnd5eWizardStore((s) => s.equipment);
  const toggle = useDnd5eWizardStore((s) => s.toggleEquipment);
  const [search, setSearch] = useState("");

  const allItems = listItems("dnd5e").filter(
    (i) =>
      i.category === "weapon" ||
      i.category === "armor" ||
      i.category === "tool" ||
      i.category === "adventuring-gear",
  );

  const filtered = allItems.filter((i) =>
    !search.trim() || i.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-brand-text">
          Equipamento inicial
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Selecione armas, armaduras e ferramentas. No MVP qualquer combinação é
          permitida — quando o pacote canônico do PHB estiver disponível, o
          wizard vai oferecer presets por classe.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar item..."
          className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary pl-9 pr-3 text-sm text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none"
        />
      </div>

      <p className="text-[11px] text-brand-muted">
        {equipment.length}{" "}
        {equipment.length === 1 ? "item selecionado" : "itens selecionados"}
      </p>

      <div className="grid gap-1.5 max-h-[360px] overflow-y-auto pr-1 sm:grid-cols-2">
        {filtered.map((it) => {
          const selected = equipment.includes(it.slug);
          return (
            <button
              key={it.slug}
              onClick={() => toggle(it.slug)}
              className={`flex items-start gap-2 rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                selected
                  ? "border-brand-accent bg-brand-accent/10"
                  : "border-brand-border hover:border-brand-accent/40"
              }`}
            >
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  selected
                    ? "border-brand-accent bg-brand-accent"
                    : "border-brand-border"
                }`}
              >
                {selected && <Check className="h-3 w-3 text-white" />}
              </div>
              <Package className="mt-0.5 h-3 w-3 shrink-0 text-brand-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-brand-text">{it.name}</p>
                <p className="text-[10px] text-brand-muted/80">
                  {it.damageDice ? `${it.damageDice} ${it.damageType}` : it.category}
                  {it.weight !== undefined && ` · ${it.weight} kg`}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
