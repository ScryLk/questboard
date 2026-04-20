"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { MAP_OBJECT_CATALOG } from "@/lib/gameplay-mock-data";
import type { MapObjectInfo } from "@/lib/gameplay-mock-data";
import { ObjectSpriteIcon } from "@/components/gameplay/object-sprite-icon";

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "furniture", label: "Moveis" },
  { id: "container", label: "Recipientes" },
  { id: "decoration", label: "Decoracao" },
  { id: "nature", label: "Natureza" },
  { id: "light", label: "Luz" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

export function ObjectToolPicker() {
  const activeTool = useGameplayStore((s) => s.activeTool);
  const activeObjectType = useGameplayStore((s) => s.activeObjectType);
  const setActiveObjectType = useGameplayStore((s) => s.setActiveObjectType);
  const clearObjects = useGameplayStore((s) => s.clearObjects);
  const [category, setCategory] = useState<CategoryId>("all");

  if (activeTool !== "objects") return null;

  const filtered: MapObjectInfo[] =
    category === "all"
      ? MAP_OBJECT_CATALOG
      : MAP_OBJECT_CATALOG.filter((o) => o.category === category);

  return (
    <div className="absolute left-1/2 top-14 z-40 flex w-60 min-w-60 max-w-60 -translate-x-1/2 flex-col gap-2 overflow-hidden rounded-lg border border-brand-border bg-[#111116] px-3 py-2 shadow-xl">
      {/* Category tabs */}
      <div className="flex min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap">
        {CATEGORIES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setCategory(id)}
            className={`shrink-0 rounded px-2 py-0.5 text-[10px] transition-colors ${
              category === id
                ? "bg-white/10 font-semibold text-brand-text"
                : "text-brand-muted hover:bg-white/[0.04] hover:text-brand-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Object grid */}
      <div className="grid max-h-[160px] grid-cols-5 gap-1 overflow-y-auto">
        {filtered.map((obj) => (
          <button
            key={obj.type}
            title={obj.label}
            onClick={() => setActiveObjectType(obj.type)}
            className={`flex h-10 w-10 cursor-pointer flex-col items-center justify-center rounded transition-colors ${
              activeObjectType === obj.type
                ? "bg-brand-accent/20 ring-1 ring-brand-accent"
                : "bg-white/[0.03] hover:bg-white/[0.06]"
            }`}
          >
            <ObjectSpriteIcon
              type={obj.type}
              fallback={obj.icon}
              size={18}
              title={obj.label}
              className="text-brand-text"
            />
            <span className="mt-0.5 text-[7px] leading-none text-brand-muted">
              {obj.label}
            </span>
          </button>
        ))}
      </div>

      <div className="h-px bg-brand-border" />

      {/* Instructions + clear */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-brand-muted">
          Click: colocar | Shift+Click: remover
        </span>
        <button
          onClick={clearObjects}
          title="Limpar objetos"
          className="flex h-6 w-6 items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
