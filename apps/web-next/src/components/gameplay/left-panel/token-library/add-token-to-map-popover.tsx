"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { SavedToken } from "@/lib/token-library-types";
import type { TokenAlignment } from "@/lib/gameplay-mock-data";

interface AddTokenToMapPopoverProps {
  token: SavedToken;
  onClose: () => void;
}

const TYPE_TO_ALIGNMENT: Record<string, TokenAlignment> = {
  hostile: "hostile",
  ally: "ally",
  neutral: "neutral",
  object: "neutral",
  trap: "neutral",
  mount: "ally",
};

export function AddTokenToMapPopover({
  token,
  onClose,
}: AddTokenToMapPopoverProps) {
  const [qty, setQty] = useState(1);
  const [visibility, setVisibility] = useState<"visible" | "hidden">("visible");

  const addToken = useGameplayStore((s) => s.addToken);
  const linkTokenToCreature = useGameplayStore((s) => s.linkTokenToCreature);

  function handleAdd() {
    const alignment = TYPE_TO_ALIGNMENT[token.type] ?? "neutral";

    for (let i = 0; i < qty; i++) {
      const suffix = qty > 1 ? ` #${i + 1}` : "";
      const tokenId = `tok_lib_${Date.now()}_${Math.random().toString(36).slice(2, 5)}_${i}`;
      addToken({
        id: tokenId,
        name: `${token.name}${suffix}`,
        alignment,
        hp: token.hp,
        maxHp: token.hp,
        ac: token.ac,
        speed: parseInt(token.speed) || 30,
        size: token.gridSize,
        x: 5 + i,
        y: 5,
        icon: token.icon || undefined,
      });

      // Link to compendium creature if applicable
      if (token.compendiumId) {
        linkTokenToCreature(tokenId, token.compendiumId);
      }
    }
    onClose();
  }

  return (
    <div
      className="absolute right-0 top-full z-30 mt-1 w-48 rounded-lg border border-brand-border bg-[#0A0A0F] p-3 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
        Adicionar ao Mapa
      </p>

      {/* Quantity */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] text-brand-muted">Quantidade</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="flex h-5 w-5 items-center justify-center rounded bg-white/5 text-brand-muted hover:bg-white/10"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-6 text-center text-[11px] tabular-nums text-brand-text">
            {qty}
          </span>
          <button
            onClick={() => setQty(Math.min(10, qty + 1))}
            className="flex h-5 w-5 items-center justify-center rounded bg-white/5 text-brand-muted hover:bg-white/10"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Visibility */}
      <div className="mb-3">
        <span className="mb-1 block text-[10px] text-brand-muted">
          Visibilidade
        </span>
        <div className="flex gap-1">
          {(["visible", "hidden"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVisibility(v)}
              className={`flex-1 rounded py-0.5 text-[10px] font-medium transition-colors ${
                visibility === v
                  ? "bg-brand-accent/20 text-brand-accent"
                  : "bg-white/5 text-brand-muted hover:text-brand-text"
              }`}
            >
              {v === "visible" ? "Visivel" : "Oculto"}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleAdd}
        className="w-full rounded-md bg-brand-accent py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-brand-accent-hover"
      >
        Adicionar ({qty})
      </button>
    </div>
  );
}
