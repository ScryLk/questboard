"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Skull,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";

type Disposition = "hostile" | "neutral" | "ally";

export function QuickNPC() {
  const collapsed = useGameplayStore((s) => s.collapsedSections["quicknpc"]);
  const toggleSection = useGameplayStore((s) => s.toggleSection);

  const [name, setName] = useState("");
  const [hp, setHp] = useState("");
  const [ac, setAc] = useState("");
  const [disposition, setDisposition] = useState<Disposition>("hostile");
  const [qty, setQty] = useState("1");

  const dispositions: { key: Disposition; label: string; color: string }[] = [
    { key: "hostile", label: "Hostil", color: "#FF4444" },
    { key: "neutral", label: "Neutro", color: "#FDCB6E" },
    { key: "ally", label: "Aliado", color: "#00B894" },
  ];

  return (
    <div className="border-b border-brand-border">
      <button
        onClick={() => toggleSection("quicknpc")}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-white/[0.02]"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-brand-muted" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-brand-muted" />
        )}
        <Skull className="h-3.5 w-3.5 text-brand-accent" />
        <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-brand-text">
          NPC Rapido
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-1.5 px-2 pb-2">
          {/* Name */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do NPC"
            className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/50 focus:border-brand-accent/40"
          />

          {/* HP + AC row */}
          <div className="flex gap-1.5">
            <input
              type="number"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              placeholder="HP"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/50 focus:border-brand-accent/40"
            />
            <input
              type="number"
              value={ac}
              onChange={(e) => setAc(e.target.value)}
              placeholder="CA"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/50 focus:border-brand-accent/40"
            />
          </div>

          {/* Disposition */}
          <div className="flex gap-1">
            {dispositions.map((d) => (
              <button
                key={d.key}
                onClick={() => setDisposition(d.key)}
                className={`flex-1 rounded-md py-0.5 text-[10px] font-medium transition-colors ${
                  disposition === d.key
                    ? "text-white"
                    : "border border-brand-border text-brand-muted hover:text-brand-text"
                }`}
                style={
                  disposition === d.key
                    ? { backgroundColor: d.color + "30", color: d.color }
                    : undefined
                }
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Qty + Add */}
          <div className="flex gap-1.5">
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              min={1}
              max={10}
              className="h-7 w-12 rounded-md border border-brand-border bg-brand-primary px-1.5 text-center text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
            />
            <button
              disabled={!name.trim()}
              className="flex h-7 flex-1 items-center justify-center gap-1 rounded-md bg-brand-accent/80 text-[11px] font-medium text-white transition-colors hover:bg-brand-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-3 w-3" />
              Adicionar ao Mapa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
