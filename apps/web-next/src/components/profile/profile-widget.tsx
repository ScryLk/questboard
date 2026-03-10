"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useProfileStore, useProfileLevel } from "@/stores/profileStore";
import { getXPForNextLevel } from "@/lib/profile-level";
import { AvatarFrame } from "./avatar-frame";
import { LevelBadge } from "./level-badge";

export function ProfileWidget() {
  const profile = useProfileStore((s) => s.profile);
  const { level, xp, progress, nextReward } = useProfileLevel();

  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AvatarFrame
            src={profile.avatarUrl}
            fallbackInitials={profile.displayName}
            frameId={profile.equipped.frameId}
            size="sm"
          />
          <div>
            <p className="text-sm font-semibold text-brand-text">{profile.displayName}</p>
            <p className="text-[11px] text-brand-muted">@{profile.username}</p>
          </div>
        </div>
        <LevelBadge level={level} progressPercent={progress.percent} size="sm" />
      </div>

      {/* XP Bar */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] text-brand-muted">
            Nível {level} — {xp.toLocaleString("pt-BR")} XP
          </span>
          <span className="text-[10px] font-medium tabular-nums text-brand-text">
            {progress.percent}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-brand-accent transition-all"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-brand-muted">
          {getXPForNextLevel(xp).toLocaleString("pt-BR")} XP para nível {level + 1}
        </p>
      </div>

      {/* Next Reward */}
      {nextReward && (
        <div className="mt-3 rounded-lg bg-white/[0.03] px-3 py-2">
          <p className="text-[10px] text-brand-muted">
            Próxima recompensa (Nv. {nextReward.level}):{" "}
            <span className="font-medium text-brand-accent">{nextReward.label}</span>
          </p>
        </div>
      )}

      {/* Link */}
      <Link
        href={`/u/${profile.username}`}
        className="mt-3 flex items-center justify-between text-xs text-brand-accent hover:underline"
      >
        Ver Perfil Público
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
