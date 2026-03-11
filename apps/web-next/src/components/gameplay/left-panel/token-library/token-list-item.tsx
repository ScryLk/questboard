"use client";

import { useState } from "react";
import {
  Copy,
  Eye,
  Pencil,
  PlusCircle,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useTokenLibraryStore } from "@/lib/token-library-store";
import type { SavedToken } from "@/lib/token-library-types";
import { SAVED_TOKEN_TYPE_CONFIG } from "@/lib/token-library-types";
import { AddTokenToMapPopover } from "./add-token-to-map-popover";

interface TokenListItemProps {
  token: SavedToken;
  isOnMap: boolean;
  mapTokenIds: string[];
}

export function TokenListItem({
  token,
  isOnMap,
  mapTokenIds,
}: TokenListItemProps) {
  const [showAddPopover, setShowAddPopover] = useState(false);
  const openModal = useGameplayStore((s) => s.openModal);
  const setTokenEditorTarget = useGameplayStore(
    (s) => s.setTokenEditorTarget,
  );
  const selectToken = useGameplayStore((s) => s.selectToken);
  const removeToken = useGameplayStore((s) => s.removeToken);
  const toggleFavorite = useTokenLibraryStore((s) => s.toggleFavorite);
  const duplicateToken = useTokenLibraryStore((s) => s.duplicateToken);
  const deleteToken = useTokenLibraryStore((s) => s.deleteToken);

  const typeConfig = SAVED_TOKEN_TYPE_CONFIG[token.type];

  function handleEdit() {
    setTokenEditorTarget(token.id);
    openModal("tokenEditor");
  }

  function handleFocus() {
    if (mapTokenIds.length > 0) {
      selectToken(mapTokenIds[0]);
    }
  }

  function handleRemoveFromMap() {
    for (const id of mapTokenIds) {
      removeToken(id);
    }
  }

  return (
    <div className="group relative flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors hover:bg-white/[0.03]">
      {/* Icon */}
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("application/questboard-token", token.id);
          e.dataTransfer.effectAllowed = "copy";
        }}
        className="flex h-6 w-6 shrink-0 cursor-grab items-center justify-center rounded-full text-[10px] font-bold active:cursor-grabbing"
        style={{
          backgroundColor: typeConfig.color + "20",
          color: typeConfig.color,
          border: `1.5px solid ${typeConfig.color}40`,
        }}
      >
        {token.icon || token.name.slice(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="truncate text-[11px] font-medium text-brand-text">
            {token.name || "Sem nome"}
          </p>
          {isOnMap && (
            <span className="shrink-0 rounded bg-brand-accent/15 px-1 text-[8px] text-brand-accent">
              ×{mapTokenIds.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-brand-muted">
          {token.cr !== "0" && <span>ND {token.cr}</span>}
          <span>HP {token.hp}</span>
          <span>CA {token.ac}</span>
        </div>
      </div>

      {/* Favorite */}
      <button
        onClick={() => toggleFavorite(token.id)}
        className={`shrink-0 ${
          token.favorite
            ? "text-yellow-400"
            : "text-transparent group-hover:text-brand-muted/30"
        }`}
      >
        <Star className="h-3 w-3" fill={token.favorite ? "currentColor" : "none"} />
      </button>

      {/* Hover actions */}
      <div className="invisible flex shrink-0 items-center gap-0.5 group-hover:visible">
        {isOnMap ? (
          <>
            <ActionButton
              icon={Eye}
              title="Focar"
              onClick={handleFocus}
            />
            <ActionButton
              icon={Pencil}
              title="Editar"
              onClick={handleEdit}
            />
            <ActionButton
              icon={X}
              title="Remover do mapa"
              onClick={handleRemoveFromMap}
              danger
            />
          </>
        ) : (
          <>
            <ActionButton
              icon={PlusCircle}
              title="Adicionar ao mapa"
              onClick={() => setShowAddPopover(true)}
            />
            <ActionButton
              icon={Pencil}
              title="Editar"
              onClick={handleEdit}
            />
            <ActionButton
              icon={Copy}
              title="Duplicar"
              onClick={() => duplicateToken(token.id)}
            />
            <ActionButton
              icon={Trash2}
              title="Excluir"
              onClick={() => deleteToken(token.id)}
              danger
            />
          </>
        )}
      </div>

      {/* Add popover */}
      {showAddPopover && (
        <AddTokenToMapPopover
          token={token}
          onClose={() => setShowAddPopover(false)}
        />
      )}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  title,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${
        danger
          ? "text-brand-muted/40 hover:bg-red-500/10 hover:text-red-400"
          : "text-brand-muted/40 hover:bg-white/5 hover:text-brand-text"
      }`}
    >
      <Icon className="h-3 w-3" />
    </button>
  );
}
