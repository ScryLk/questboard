"use client";

import { Copy, Pencil, Star, Trash2, Zap } from "lucide-react";
import type { CampaignObject } from "@/types/object";
import { RARITY_CONFIG, CATEGORY_CONFIG } from "@/types/object";

interface ObjectCardProps {
  object: CampaignObject;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function ObjectCard({
  object,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}: ObjectCardProps) {
  const rarity = RARITY_CONFIG[object.rarity];
  const category = CATEGORY_CONFIG[object.category];

  return (
    <div
      onClick={() => onEdit(object.id)}
      className="group relative cursor-pointer rounded-xl border border-brand-border bg-[#0F0F14] p-3 transition-all hover:border-brand-accent/30 hover:bg-[#12121A]"
    >
      {/* Sprite preview */}
      <div
        className="mb-3 flex h-20 items-center justify-center rounded-lg"
        style={{ backgroundColor: object.spriteColor + "15" }}
      >
        {object.spriteUrl ? (
          <img
            src={object.spriteUrl}
            alt={object.name}
            className="h-14 w-14 object-contain"
          />
        ) : (
          <span className="text-3xl">{object.spriteEmoji}</span>
        )}
      </div>

      {/* Name */}
      <p className="mb-1 truncate text-xs font-semibold text-brand-text">
        {object.name}
      </p>

      {/* Badges */}
      <div className="mb-2 flex items-center gap-1.5">
        <span
          className="rounded px-1.5 py-0.5 text-[9px] font-medium"
          style={{
            backgroundColor: category.color + "20",
            color: category.color,
          }}
        >
          {category.label}
        </span>
        {object.category === "item" && (
          <span
            className="rounded px-1.5 py-0.5 text-[9px] font-medium"
            style={{
              backgroundColor: rarity.color + "20",
              color: rarity.color,
            }}
          >
            {rarity.label}
          </span>
        )}
        {object.interactionEnabled && (
          <Zap className="h-3 w-3 text-brand-accent/60" />
        )}
      </div>

      {/* Tags */}
      {object.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {object.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-brand-muted"
            >
              {tag}
            </span>
          ))}
          {object.tags.length > 3 && (
            <span className="text-[9px] text-brand-muted">
              +{object.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Hover actions */}
      <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(object.id);
          }}
          className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
            object.favorite
              ? "bg-[#FDCB6E]/15 text-[#FDCB6E]"
              : "bg-black/60 text-brand-muted hover:text-brand-text"
          }`}
        >
          <Star
            className={`h-3 w-3 ${object.favorite ? "fill-[#FDCB6E]" : ""}`}
          />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(object.id);
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-brand-muted transition-colors hover:text-brand-text"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(object.id);
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-brand-muted transition-colors hover:text-brand-danger"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Favorite indicator */}
      {object.favorite && (
        <Star className="absolute left-2 top-2 h-3 w-3 fill-[#FDCB6E] text-[#FDCB6E]" />
      )}
    </div>
  );
}
