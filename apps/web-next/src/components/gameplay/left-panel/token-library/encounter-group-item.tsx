"use client";

import {
  Copy,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useTokenLibraryStore } from "@/lib/token-library-store";
import type { EncounterGroup } from "@/lib/token-library-types";
import {
  getDifficultyColor,
  getDifficultyLabel,
  getDifficultyPercent,
  calculateEncounterDifficulty,
} from "@/lib/encounter-difficulty";
import {
  CREATURE_COMPENDIUM,
  type Creature,
} from "@/lib/creature-data";
import { useCustomCreaturesStore } from "@/lib/custom-creatures-store";
import type { TokenAlignment } from "@/lib/gameplay-mock-data";

interface EncounterGroupItemProps {
  group: EncounterGroup;
}

export function EncounterGroupItem({ group }: EncounterGroupItemProps) {
  const openModal = useGameplayStore((s) => s.openModal);
  const setTarget = useGameplayStore(
    (s) => s.setEncounterGroupEditorTarget,
  );
  const addToken = useGameplayStore((s) => s.addToken);
  const linkTokenToCreature = useGameplayStore((s) => s.linkTokenToCreature);
  const duplicateGroup = useTokenLibraryStore((s) => s.duplicateGroup);
  const deleteGroup = useTokenLibraryStore((s) => s.deleteGroup);
  const savedTokens = useTokenLibraryStore((s) => s.savedTokens);
  const customCreatures = useCustomCreaturesStore((s) => s.creatures);

  const totalMembers = group.members.reduce((sum, m) => sum + m.count, 0);
  const diffColor = getDifficultyColor(group.estimatedDifficulty);
  const diffLabel = getDifficultyLabel(group.estimatedDifficulty);

  // Recalculate difficulty for display
  const diff = calculateEncounterDifficulty(
    group.members.map((m) => ({ cr: m.cr, count: m.count })),
    [5, 5, 5, 5], // default party of 4 level 5
  );
  const percent = getDifficultyPercent(diff.adjustedXP, diff.thresholds);

  function handleEdit() {
    setTarget(group.id);
    openModal("encounterGroupEditor");
  }

  function handleAddToMap() {
    let offsetX = 0;
    for (const member of group.members) {
      const creature = resolveCreature(member.compendiumId, member.tokenId);
      for (let i = 0; i < member.count; i++) {
        const suffix = member.count > 1 ? ` #${i + 1}` : "";
        const tokenId = `tok_grp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}_${offsetX}`;
        addToken({
          id: tokenId,
          name: `${member.name}${suffix}`,
          alignment: "hostile" as TokenAlignment,
          hp: creature?.hp ?? 10,
          maxHp: creature?.hp ?? 10,
          ac: creature?.ac ?? 10,
          speed: creature ? parseInt(creature.speed) || 30 : 30,
          size: creature
            ? creature.size === "large"
              ? 2
              : creature.size === "huge"
                ? 3
                : creature.size === "gargantuan"
                  ? 4
                  : 1
            : 1,
          x: 5 + offsetX,
          y: 5,
          icon: creature?.icon || undefined,
        });
        if (member.compendiumId) {
          linkTokenToCreature(tokenId, member.compendiumId);
        }
        offsetX++;
      }
    }
  }

  function resolveCreature(
    compendiumId?: string,
    tokenId?: string,
  ): Creature | undefined {
    if (compendiumId) {
      return (
        CREATURE_COMPENDIUM.find((c) => c.id === compendiumId) ??
        customCreatures.find((c) => c.id === compendiumId)
      );
    }
    if (tokenId) {
      const saved = savedTokens.find((t) => t.id === tokenId);
      if (saved?.compendiumId) {
        return CREATURE_COMPENDIUM.find((c) => c.id === saved.compendiumId);
      }
    }
    return undefined;
  }

  return (
    <div className="group rounded-md border border-brand-border/50 px-2 py-1.5 transition-colors hover:border-brand-border">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-brand-accent">⚔</span>
        <p className="flex-1 truncate text-[11px] font-medium text-brand-text">
          {group.name || "Grupo sem nome"}
        </p>
        <span className="text-[9px] text-brand-muted">
          {totalMembers} criaturas
        </span>
      </div>

      {/* Members summary */}
      <div className="mt-0.5 text-[9px] text-brand-muted">
        {group.members
          .map((m) => `${m.count}× ${m.name}`)
          .join(" · ")}
      </div>

      {/* Difficulty bar */}
      <div className="mt-1.5 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${percent}%`,
              backgroundColor: diffColor,
            }}
          />
        </div>
        <span
          className="text-[9px] font-medium"
          style={{ color: diffColor }}
        >
          {diffLabel}
        </span>
      </div>

      {/* XP */}
      <div className="mt-0.5 text-[9px] text-brand-muted">
        XP {group.totalXP} (ajust. {diff.adjustedXP})
      </div>

      {/* Actions */}
      <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={handleAddToMap}
          className="flex items-center gap-0.5 rounded bg-brand-accent/10 px-1.5 py-0.5 text-[9px] font-medium text-brand-accent transition-colors hover:bg-brand-accent/20"
        >
          <MapPin className="h-2.5 w-2.5" />
          + Mapa
        </button>
        <button
          onClick={handleEdit}
          title="Editar"
          className="flex h-5 w-5 items-center justify-center rounded text-brand-muted/40 hover:bg-white/5 hover:text-brand-text"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={() => duplicateGroup(group.id)}
          title="Duplicar"
          className="flex h-5 w-5 items-center justify-center rounded text-brand-muted/40 hover:bg-white/5 hover:text-brand-text"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          onClick={() => deleteGroup(group.id)}
          title="Excluir"
          className="flex h-5 w-5 items-center justify-center rounded text-brand-muted/40 hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
