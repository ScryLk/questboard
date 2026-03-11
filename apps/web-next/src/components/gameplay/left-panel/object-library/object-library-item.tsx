"use client";

import { Copy, Eye, MapPin, Pencil, Star, X } from "lucide-react";
import type { CampaignObject } from "@/types/object";
import { CATEGORY_CONFIG, RARITY_CONFIG } from "@/types/object";
import { useObjectStore } from "@/stores/objectStore";
import { useGameplayStore } from "@/lib/gameplay-store";

interface ObjectLibraryItemProps {
  object: CampaignObject;
  isOnMap: boolean;
}

export function ObjectLibraryItem({ object, isOnMap }: ObjectLibraryItemProps) {
  const toggleFavorite = useObjectStore((s) => s.toggleFavorite);
  const duplicateObject = useObjectStore((s) => s.duplicateObject);
  const openModal = useGameplayStore((s) => s.openModal);
  const setObjectEditorTarget = useGameplayStore(
    (s) => s.setObjectEditorTarget,
  );

  function handleEdit() {
    setObjectEditorTarget(object.id);
    openModal("objectEditor");
  }

  return (
    <div className="group relative">
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(
            "application/questboard-object",
            object.id,
          );
          e.dataTransfer.effectAllowed = "copy";
        }}
        className="flex cursor-grab items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.03] active:cursor-grabbing"
      >
        {/* Sprite / Emoji avatar */}
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
          style={{ backgroundColor: object.spriteColor + "25" }}
        >
          {object.spriteUrl ? (
            <img
              src={object.spriteUrl}
              alt=""
              className="h-5 w-5 object-contain"
            />
          ) : (
            <span className="text-xs">{object.spriteEmoji}</span>
          )}
        </div>

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <span className="block truncate text-[11px] font-medium text-brand-text">
            {object.name || "Sem nome"}
          </span>
          <div className="flex items-center gap-1 text-[9px] text-brand-muted">
            <span>{CATEGORY_CONFIG[object.category].label}</span>
            {object.interactionEnabled && (
              <>
                <span>·</span>
                <span className="text-brand-accent">interativo</span>
              </>
            )}
          </div>
        </div>

        {/* Rarity badge */}
        {object.category === "item" && (
          <span
            className="shrink-0 rounded px-1 py-0.5 text-[8px] font-semibold uppercase"
            style={{
              backgroundColor: RARITY_CONFIG[object.rarity].color + "20",
              color: RARITY_CONFIG[object.rarity].color,
            }}
          >
            {RARITY_CONFIG[object.rarity].label.slice(0, 3)}
          </span>
        )}

        {/* Favorite star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(object.id);
          }}
          className="shrink-0"
        >
          <Star
            className={`h-3 w-3 ${
              object.favorite
                ? "fill-[#FDCB6E] text-[#FDCB6E]"
                : "text-brand-muted/30 hover:text-brand-muted"
            }`}
          />
        </button>
      </div>

      {/* Hover action buttons */}
      <div className="absolute right-1 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md bg-[#0A0A0F]/90 px-0.5 py-0.5 group-hover:flex">
        {isOnMap ? (
          <>
            <ActionBtn icon={Pencil} title="Editar" onClick={handleEdit} />
            <ActionBtn
              icon={X}
              title="Remover do mapa"
              onClick={() => {
                /* handled by map canvas */
              }}
              danger
            />
          </>
        ) : (
          <>
            <ActionBtn icon={MapPin} title="Colocar no mapa" onClick={() => {}} />
            <ActionBtn icon={Pencil} title="Editar" onClick={handleEdit} />
            <ActionBtn
              icon={Copy}
              title="Duplicar"
              onClick={() => duplicateObject(object.id)}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  title,
  onClick,
  danger,
}: {
  icon: typeof Eye;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${
        danger
          ? "text-brand-muted hover:bg-red-500/20 hover:text-red-400"
          : "text-brand-muted hover:bg-white/10 hover:text-brand-text"
      }`}
    >
      <Icon className="h-3 w-3" />
    </button>
  );
}
