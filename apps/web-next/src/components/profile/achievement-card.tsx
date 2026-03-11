"use client";

import {
  Award, BookOpen, Compass, Crosshair, Crown, Flame,
  Gem, Globe, Heart, Map, MessageCircle, Palette,
  Shield, Sparkles, Star, Swords, Theater, Trophy, Zap,
} from "lucide-react";
import type { Achievement } from "@/types/profile";
import { ACHIEVEMENT_TIER_COLORS } from "@/types/profile";

const ICON_MAP: Record<string, React.ElementType> = {
  Swords, Zap, Flame, Heart, MessageCircle, Crown, BookOpen, Theater,
  Map, Gem, Compass, Shield, Globe, Star, Crosshair, Trophy, Sparkles,
  Award, Palette,
};

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const Icon = ICON_MAP[achievement.icon] ?? Trophy;
  const tierColor = ACHIEVEMENT_TIER_COLORS[achievement.tier];
  const progressPct = Math.round((achievement.progress / achievement.maxProgress) * 100);

  return (
    <div
      className={`rounded-xl border border-brand-border bg-brand-surface p-3 transition-colors ${
        achievement.unlocked ? "" : "opacity-50 grayscale"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: tierColor + "15" }}
        >
          <Icon className="h-4 w-4" style={{ color: tierColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-xs font-semibold text-brand-text">
              {achievement.unlocked ? achievement.name : "???"}
            </span>
            <span
              className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
              style={{ color: tierColor, backgroundColor: tierColor + "15" }}
            >
              {achievement.tier}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-brand-muted">
            {achievement.unlocked ? achievement.description : "Conquista bloqueada"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {!achievement.unlocked && (
        <div className="mt-2.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] text-brand-muted">
              {achievement.progress}/{achievement.maxProgress}
            </span>
            <span className="text-[10px] text-brand-muted">{progressPct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progressPct}%`, backgroundColor: tierColor }}
            />
          </div>
        </div>
      )}

      {achievement.unlocked && achievement.unlockedAt && (
        <p className="mt-2 text-[10px] text-brand-muted">
          Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString("pt-BR")}
        </p>
      )}
    </div>
  );
}
