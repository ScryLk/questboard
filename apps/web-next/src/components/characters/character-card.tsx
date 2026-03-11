"use client";

import { Copy, Star, Trash2 } from "lucide-react";
import type { CampaignCharacter } from "@/types/character";
import {
  CHAR_CATEGORY_CONFIG,
  ROLE_CONFIG,
  DISPOSITION_CONFIG,
} from "@/types/character";

interface CharacterCardProps {
  character: CampaignCharacter;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function CharacterCard({
  character,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}: CharacterCardProps) {
  const cat = CHAR_CATEGORY_CONFIG[character.category];
  const role = character.role ? ROLE_CONFIG[character.role] : null;
  const disp = DISPOSITION_CONFIG[character.disposition];
  const initials = character.name.slice(0, 2).toUpperCase() || "??";

  return (
    <div
      onClick={() => onEdit(character.id)}
      className="group relative cursor-pointer rounded-xl border border-brand-border bg-[#0F0F14] p-3 transition-all hover:border-brand-accent/30 hover:bg-[#12121A]"
    >
      {/* Portrait preview */}
      <div
        className="mb-3 flex h-20 items-center justify-center rounded-lg"
        style={{ backgroundColor: character.portraitColor + "15" }}
      >
        {character.spriteUrl ? (
          <img
            src={character.spriteUrl}
            alt={character.name}
            className="h-14 w-14 rounded-full object-contain"
          />
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: character.portraitColor + "40" }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Name */}
      <p className="mb-0.5 truncate text-xs font-semibold text-brand-text">
        {character.name || "Sem nome"}
      </p>
      {character.title && (
        <p className="mb-1.5 truncate text-[9px] text-brand-muted">
          {character.title}
        </p>
      )}

      {/* Badges */}
      <div className="mb-2 flex flex-wrap items-center gap-1">
        <span
          className="rounded px-1.5 py-0.5 text-[9px] font-medium"
          style={{
            backgroundColor: cat.color + "20",
            color: cat.color,
          }}
        >
          {cat.label}
        </span>
        {role && (
          <span
            className="rounded px-1.5 py-0.5 text-[9px] font-medium"
            style={{
              backgroundColor: role.color + "20",
              color: role.color,
            }}
          >
            {role.label}
          </span>
        )}
        <span
          className="rounded px-1.5 py-0.5 text-[9px] font-medium"
          style={{
            backgroundColor: disp.color + "20",
            color: disp.color,
          }}
        >
          {disp.label}
        </span>
      </div>

      {/* Stats summary */}
      <div className="flex items-center gap-1.5 text-[9px] text-brand-muted">
        <span>
          HP {character.stats.hp}/{character.stats.maxHp}
        </span>
        <span>·</span>
        <span>AC {character.stats.ac}</span>
        {character.stats.cr && (
          <>
            <span>·</span>
            <span>CR {character.stats.cr}</span>
          </>
        )}
      </div>

      {/* Hover actions */}
      <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(character.id);
          }}
          className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
            character.favorite
              ? "bg-[#FDCB6E]/15 text-[#FDCB6E]"
              : "bg-black/60 text-brand-muted hover:text-brand-text"
          }`}
        >
          <Star
            className={`h-3 w-3 ${character.favorite ? "fill-[#FDCB6E]" : ""}`}
          />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(character.id);
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-brand-muted transition-colors hover:text-brand-text"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(character.id);
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-brand-muted transition-colors hover:text-brand-danger"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Favorite indicator */}
      {character.favorite && (
        <Star className="absolute left-2 top-2 h-3 w-3 fill-[#FDCB6E] text-[#FDCB6E]" />
      )}
    </div>
  );
}
