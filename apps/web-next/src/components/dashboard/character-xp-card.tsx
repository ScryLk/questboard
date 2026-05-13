"use client";

// Card de XP do personagem do PLAYER nesta campanha. Mostra avatar
// placeholder, nível, barra de XP até próximo nível e próximo título.

import { Award } from "lucide-react";
import type { DashboardDto } from "@questboard/validators";

interface Props {
  character: NonNullable<DashboardDto["userCharacter"]>;
}

export function CharacterXpCard({ character }: Props) {
  const totalForNext =
    character.currentXp + character.xpToNextLevel === 0
      ? 1
      : character.currentXp + character.xpToNextLevel;
  const pct = Math.min(100, (character.currentXp / totalForNext) * 100);

  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent/15">
          <Award className="h-6 w-6 text-brand-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand-text">
            {character.name}
          </p>
          <p className="text-xs text-brand-muted">
            Nível {character.level} — {character.currentXp} XP
          </p>
        </div>
        <div className="text-right text-xs text-brand-muted">
          {character.xpToNextLevel === 0
            ? "Nível máximo"
            : `${character.xpToNextLevel} XP até Nv ${character.level + 1}`}
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-brand-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {character.nextRewardLevel && character.nextRewardTitle && (
        <p className="mt-2 text-xs text-brand-muted">
          Próxima recompensa (Nv. {character.nextRewardLevel}):{" "}
          <span className="font-medium text-brand-text">
            Título: {character.nextRewardTitle}
          </span>
        </p>
      )}
    </div>
  );
}
