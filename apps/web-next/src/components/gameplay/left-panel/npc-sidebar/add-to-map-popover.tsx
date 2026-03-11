"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import type { NPCData } from "@/lib/npc-types";
import type { TokenAlignment } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useNPCStore } from "@/lib/npc-store";
import { CREATURE_COMPENDIUM } from "@/lib/creature-data";
import { useCustomCreaturesStore } from "@/lib/custom-creatures-store";

interface AddToMapPopoverProps {
  npc: NPCData;
  onClose: () => void;
}

function resolveNPCStats(npc: NPCData) {
  if (npc.statBlockSource === "inline" && npc.inlineStats) {
    return {
      hp: npc.inlineStats.hp,
      maxHp: npc.inlineStats.maxHp,
      ac: npc.inlineStats.ac,
      speed: npc.inlineStats.speed,
      size: npc.inlineStats.size,
      creatureId: null as string | null,
    };
  }
  if (npc.statBlockSource === "compendium" && npc.compendiumCreatureId) {
    const c = CREATURE_COMPENDIUM.find(
      (cr) => cr.id === npc.compendiumCreatureId,
    );
    if (c) {
      return {
        hp: c.hp,
        maxHp: c.hp,
        ac: c.ac,
        speed: parseInt(c.speed) || 30,
        size: 1,
        creatureId: c.id,
      };
    }
  }
  if (npc.statBlockSource === "custom" && npc.customCreatureId) {
    const customs = useCustomCreaturesStore.getState().creatures;
    const c = customs.find((cr) => cr.id === npc.customCreatureId);
    if (c) {
      return {
        hp: c.hp,
        maxHp: c.hp,
        ac: c.ac,
        speed: parseInt(c.speed) || 30,
        size: 1,
        creatureId: c.id,
      };
    }
  }
  return {
    hp: 10,
    maxHp: 10,
    ac: 10,
    speed: 30,
    size: 1,
    creatureId: null as string | null,
  };
}

const NPC_TYPE_TO_ALIGNMENT: Record<string, TokenAlignment> = {
  hostile: "hostile",
  neutral: "neutral",
  ally: "ally",
  merchant: "neutral",
};

export function AddToMapPopover({ npc, onClose }: AddToMapPopoverProps) {
  const [qty, setQty] = useState(1);
  const [visibility, setVisibility] = useState<
    "visible" | "hidden" | "invisible"
  >("visible");
  const ref = useRef<HTMLDivElement>(null);

  const addToken = useGameplayStore((s) => s.addToken);
  const linkTokenToCreature = useGameplayStore(
    (s) => s.linkTokenToCreature,
  );
  const npcTokenMap = useNPCStore((s) => s.npcTokenMap);
  const linkTokenToNpc = useNPCStore((s) => s.linkTokenToNpc);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  function handleAdd() {
    const stats = resolveNPCStats(npc);
    const existingCount = npcTokenMap[npc.id]?.length ?? 0;
    const alignment = NPC_TYPE_TO_ALIGNMENT[npc.type] ?? "neutral";

    for (let i = 0; i < qty; i++) {
      const instanceNum = existingCount + i + 1;
      const tokenName =
        qty > 1 || existingCount > 0
          ? `${npc.name} #${instanceNum}`
          : npc.name;
      const tokenId = `tok_npc_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 5)}`;

      addToken({
        id: tokenId,
        name: tokenName,
        alignment,
        hp: stats.hp,
        maxHp: stats.maxHp,
        ac: stats.ac,
        speed: stats.speed,
        size: stats.size,
        x: 8 + i,
        y: 8,
        icon: npc.portrait || undefined,
      });

      linkTokenToNpc(npc.id, tokenId);
      if (stats.creatureId) {
        linkTokenToCreature(tokenId, stats.creatureId);
      }
    }

    onClose();
  }

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full z-30 mt-1 w-56 rounded-lg border border-brand-border bg-[#0A0A0F] p-3 shadow-xl"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium text-brand-text">
          Adicionar ao Mapa
        </span>
        <button
          onClick={onClose}
          className="text-brand-muted hover:text-brand-text"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Quantity */}
      <div className="mb-2">
        <label className="mb-1 block text-[10px] text-brand-muted">
          Quantidade
        </label>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="flex h-6 w-6 items-center justify-center rounded border border-brand-border text-brand-muted hover:bg-white/[0.05]"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-6 text-center text-xs tabular-nums text-brand-text">
            {qty}
          </span>
          <button
            onClick={() => setQty(Math.min(10, qty + 1))}
            className="flex h-6 w-6 items-center justify-center rounded border border-brand-border text-brand-muted hover:bg-white/[0.05]"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Visibility */}
      <div className="mb-3">
        <label className="mb-1 block text-[10px] text-brand-muted">
          Visibilidade
        </label>
        <div className="flex gap-1">
          {(["visible", "hidden", "invisible"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVisibility(v)}
              className={`flex-1 rounded py-0.5 text-[10px] transition-colors ${
                visibility === v
                  ? "bg-brand-accent/20 text-brand-accent"
                  : "border border-brand-border text-brand-muted hover:text-brand-text"
              }`}
            >
              {v === "visible"
                ? "Visivel"
                : v === "hidden"
                  ? "Oculto"
                  : "Invisivel"}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={!npc.name.trim()}
        className="w-full rounded-md bg-brand-accent/80 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-brand-accent disabled:opacity-40"
      >
        Adicionar
      </button>
    </div>
  );
}
