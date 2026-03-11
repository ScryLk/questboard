"use client";

import { Copy, Eye, MapPin, Pencil, Star, X } from "lucide-react";
import type { CampaignCharacter } from "@/types/character";
import { CHAR_CATEGORY_CONFIG, ROLE_CONFIG, DISPOSITION_CONFIG } from "@/types/character";
import { useCharacterStore } from "@/stores/characterStore";
import { useGameplayStore } from "@/lib/gameplay-store";

interface CharacterSidebarItemProps {
  character: CampaignCharacter;
  isOnMap: boolean;
  tokenIds: string[];
}

export function CharacterSidebarItem({
  character,
  isOnMap,
  tokenIds,
}: CharacterSidebarItemProps) {
  const toggleFavorite = useCharacterStore((s) => s.toggleFavorite);
  const duplicateCharacter = useCharacterStore((s) => s.duplicateCharacter);
  const openModal = useGameplayStore((s) => s.openModal);
  const setCharacterEditorTarget = useGameplayStore(
    (s) => s.setCharacterEditorTarget,
  );
  const selectToken = useGameplayStore((s) => s.selectToken);

  const initials = character.name.slice(0, 2).toUpperCase() || "??";
  const disp = DISPOSITION_CONFIG[character.disposition];
  const role = character.role ? ROLE_CONFIG[character.role] : null;

  function handleEdit() {
    setCharacterEditorTarget(character.id);
    openModal("characterEditor");
  }

  function handleFocus() {
    if (tokenIds.length > 0) {
      selectToken(tokenIds[0]);
    }
  }

  return (
    <div className="group relative">
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(
            "application/questboard-character",
            character.id,
          );
          e.dataTransfer.effectAllowed = "copy";
        }}
        className="flex cursor-grab items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.03] active:cursor-grabbing"
      >
        {/* Portrait */}
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ backgroundColor: character.portraitColor + "40" }}
        >
          {character.spriteUrl ? (
            <img
              src={character.spriteUrl}
              alt=""
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-[11px] font-medium text-brand-text">
              {character.name || "Sem nome"}
            </span>
            {character.dialogueEnabled && (
              <span className="text-[8px] text-brand-accent">DLG</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[9px] text-brand-muted">
            <span>{CHAR_CATEGORY_CONFIG[character.category].label}</span>
            {character.title && (
              <>
                <span>·</span>
                <span className="truncate">{character.title}</span>
              </>
            )}
            {isOnMap && tokenIds.length > 1 && (
              <span className="text-brand-accent">x{tokenIds.length}</span>
            )}
          </div>
        </div>

        {/* Disposition badge */}
        <span
          className="shrink-0 rounded px-1 py-0.5 text-[8px] font-semibold uppercase"
          style={{
            backgroundColor: disp.color + "20",
            color: disp.color,
          }}
        >
          {disp.label.slice(0, 3)}
        </span>

        {/* Favorite star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(character.id);
          }}
          className="shrink-0"
        >
          <Star
            className={`h-3 w-3 ${
              character.favorite
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
            <ActionBtn
              icon={Eye}
              title="Focar no mapa"
              onClick={handleFocus}
            />
            <ActionBtn icon={Pencil} title="Editar" onClick={handleEdit} />
          </>
        ) : (
          <>
            <ActionBtn
              icon={MapPin}
              title="Colocar no mapa"
              onClick={() => {}}
            />
            <ActionBtn icon={Pencil} title="Editar" onClick={handleEdit} />
            <ActionBtn
              icon={Copy}
              title="Duplicar"
              onClick={() => duplicateCharacter(character.id)}
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
