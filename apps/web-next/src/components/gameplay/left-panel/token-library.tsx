"use client";

import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Library,
  Plus,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { getAlignmentColor } from "@/lib/gameplay-mock-data";
import { HPBar } from "../shared/hp-bar";

export function TokenLibrary() {
  const tokens = useGameplayStore((s) => s.tokens);
  const collapsed = useGameplayStore((s) => s.collapsedSections["tokens"]);
  const toggleSection = useGameplayStore((s) => s.toggleSection);

  const offMapTokens = tokens.filter((t) => !t.onMap);

  return (
    <div className="border-b border-brand-border">
      {/* Header */}
      <button
        onClick={() => toggleSection("tokens")}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-white/[0.02]"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-brand-muted" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-brand-muted" />
        )}
        <Library className="h-3.5 w-3.5 text-brand-accent" />
        <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-brand-text">
          Tokens
        </span>
        <span className="text-[11px] text-brand-muted">
          {offMapTokens.length} fora
        </span>
      </button>

      {!collapsed && (
        <div className="px-1.5 pb-1.5">
          {offMapTokens.length === 0 ? (
            <p className="px-2 py-2 text-center text-[10px] text-brand-muted">
              Todos os tokens estao no mapa
            </p>
          ) : (
            offMapTokens.map((token) => {
              const color = getAlignmentColor(token.alignment);
              return (
                <div
                  key={token.id}
                  draggable
                  className="group flex cursor-grab items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors hover:bg-white/[0.03] active:cursor-grabbing"
                >
                  <GripVertical className="h-3 w-3 text-brand-muted/40 group-hover:text-brand-muted" />
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                    style={{
                      backgroundColor: color + "20",
                      color,
                      border: `1.5px solid ${color}40`,
                    }}
                  >
                    {token.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-brand-text">
                      {token.name}
                    </p>
                    <HPBar hp={token.hp} maxHp={token.maxHp} height={2} />
                  </div>
                  <span className="text-[10px] text-brand-muted">
                    CA {token.ac}
                  </span>
                </div>
              );
            })
          )}

          {/* Add token */}
          <button
            onClick={() => useGameplayStore.getState().openModal("createToken")}
            className="mt-1 flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-brand-border py-1 text-[10px] font-medium text-brand-muted transition-colors hover:border-brand-accent/30 hover:text-brand-text"
          >
            <Plus className="h-3 w-3" />
            Criar Token
          </button>
        </div>
      )}
    </div>
  );
}
