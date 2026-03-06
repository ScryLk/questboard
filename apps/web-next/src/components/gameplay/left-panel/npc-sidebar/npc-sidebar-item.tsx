"use client";

import { useState } from "react";
import {
  Copy,
  Eye,
  MapPin,
  Pencil,
  PlusCircle,
  Star,
  X,
} from "lucide-react";
import type { NPCData } from "@/lib/npc-types";
import { NPC_TYPE_CONFIG } from "@/lib/npc-types";
import { useNPCStore } from "@/lib/npc-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import { AddToMapPopover } from "./add-to-map-popover";

interface NPCSidebarItemProps {
  npc: NPCData;
  isOnMap: boolean;
  tokenIds: string[];
}

export function NPCSidebarItem({
  npc,
  isOnMap,
  tokenIds,
}: NPCSidebarItemProps) {
  const [showAddPopover, setShowAddPopover] = useState(false);
  const toggleFavorite = useNPCStore((s) => s.toggleFavorite);
  const duplicateNPC = useNPCStore((s) => s.duplicateNPC);
  const unlinkTokenFromNpc = useNPCStore((s) => s.unlinkTokenFromNpc);
  const openModal = useGameplayStore((s) => s.openModal);
  const setNpcEditorTarget = useGameplayStore((s) => s.setNpcEditorTarget);
  const selectToken = useGameplayStore((s) => s.selectToken);
  const removeToken = useGameplayStore((s) => s.removeToken);

  const typeConfig = NPC_TYPE_CONFIG.find((c) => c.key === npc.type);
  const initials = npc.portrait || npc.name.slice(0, 2).toUpperCase();

  function handleEdit() {
    setNpcEditorTarget(npc.id);
    openModal("npcEditor");
  }

  function handleFocus() {
    if (tokenIds.length > 0) {
      selectToken(tokenIds[0]);
    }
  }

  function handleRemoveFromMap() {
    for (const tokenId of tokenIds) {
      removeToken(tokenId);
      unlinkTokenFromNpc(npc.id, tokenId);
    }
  }

  return (
    <div className="group relative">
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("application/questboard-npc", npc.id);
          e.dataTransfer.effectAllowed = "copy";
        }}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.03] cursor-grab active:cursor-grabbing"
      >
        {/* Portrait */}
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ backgroundColor: npc.portraitColor + "40" }}
        >
          {initials}
        </div>

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-[11px] font-medium text-brand-text">
              {npc.name || "Sem nome"}
            </span>
            {npc.aiEnabled && (
              <span className="text-[8px] text-brand-accent">IA</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[9px] text-brand-muted">
            {npc.race && <span>{npc.race}</span>}
            {npc.race && npc.title && <span>·</span>}
            {npc.title && <span>{npc.title}</span>}
            {isOnMap && tokenIds.length > 1 && (
              <span className="text-brand-accent">×{tokenIds.length}</span>
            )}
          </div>
        </div>

        {/* Type badge */}
        {typeConfig && (
          <span
            className="shrink-0 rounded px-1 py-0.5 text-[8px] font-semibold uppercase"
            style={{
              backgroundColor: typeConfig.color + "20",
              color: typeConfig.color,
            }}
          >
            {typeConfig.label.slice(0, 3)}
          </span>
        )}

        {/* Favorite star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(npc.id);
          }}
          className="shrink-0"
        >
          <Star
            className={`h-3 w-3 ${
              npc.favorite
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
            <ActionBtn
              icon={X}
              title="Remover do mapa"
              onClick={handleRemoveFromMap}
              danger
            />
          </>
        ) : (
          <>
            <ActionBtn
              icon={PlusCircle}
              title="Adicionar ao mapa"
              onClick={() => setShowAddPopover(true)}
            />
            <ActionBtn icon={Pencil} title="Editar" onClick={handleEdit} />
            <ActionBtn
              icon={Copy}
              title="Duplicar"
              onClick={() => duplicateNPC(npc.id)}
            />
          </>
        )}
      </div>

      {/* Add to map popover */}
      {showAddPopover && (
        <AddToMapPopover
          npc={npc}
          onClose={() => setShowAddPopover(false)}
        />
      )}
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
