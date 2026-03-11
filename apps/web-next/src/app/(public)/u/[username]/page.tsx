"use client";

import {
  Calendar,
  Clock,
  Crosshair,
  Gamepad2,
  Scroll,
  Swords,
  Zap,
} from "lucide-react";
import { useProfileStore, useProfileLevel } from "@/stores/profileStore";
import { ProfileHero } from "@/components/profile/profile-hero";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { StatBar } from "@/components/profile/stat-bar";
import { CharacterShowcaseCard } from "@/components/profile/character-showcase-card";
import { AchievementCard } from "@/components/profile/achievement-card";
import { CampaignCard } from "@/components/profile/campaign-card";
import { LevelBadge } from "@/components/profile/level-badge";
import { getXPForNextLevel } from "@/lib/profile-level";

export default function AdventurerProfilePage() {
  const profile = useProfileStore((s) => s.profile);
  const { level, xp, progress } = useProfileLevel();

  const stats = profile.adventurerStats;
  const unlockedAchievements = profile.achievements.filter((a) => a.unlocked);
  const inProgressAchievements = profile.achievements
    .filter((a) => !a.unlocked && a.progress > 0)
    .sort((a, b) => b.progress / b.maxProgress - a.progress / a.maxProgress)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <ProfileHero profile={profile} variant="adventurer" />

      {/* Tabs */}
      <ProfileTabs username={profile.username} activeTab="adventurer" />

      {/* Level Card */}
      <div className="rounded-xl border border-brand-border bg-brand-surface p-5">
        <div className="flex items-center gap-4">
          <LevelBadge level={level} progressPercent={progress.percent} />
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-brand-text">Nível {level}</span>
              <span className="text-[11px] text-brand-muted">
                {xp.toLocaleString("pt-BR")} XP total
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-brand-accent transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-brand-muted">
              {getXPForNextLevel(xp).toLocaleString("pt-BR")} XP para o próximo nível
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-brand-text">Estatísticas</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatBar icon={Calendar} label="Sessões Jogadas" value={stats.sessionsPlayed} color="#6C5CE7" />
          <StatBar icon={Clock} label="Horas Jogadas" value={`${stats.hoursPlayed}h`} color="#3B82F6" />
          <StatBar icon={Gamepad2} label="Campanhas" value={stats.campaignsJoined} color="#10B981" />
          <StatBar icon={Scroll} label="Personagens Criados" value={stats.charactersCreated} color="#F59E0B" />
          <StatBar icon={Crosshair} label="Missões Completas" value={stats.questsCompleted} color="#EC4899" />
          <StatBar icon={Zap} label="Acertos Críticos" value={stats.criticalHits} color="#EF4444" />
        </div>
      </section>

      {/* Characters */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-brand-text">Personagens</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profile.characters.map((char) => (
            <CharacterShowcaseCard key={char.id} character={char} />
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-brand-text">
          Conquistas{" "}
          <span className="text-brand-muted">
            ({unlockedAchievements.length}/{profile.achievements.length})
          </span>
        </h2>

        {/* Unlocked */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {unlockedAchievements.map((a) => (
            <AchievementCard key={a.id} achievement={a} />
          ))}
        </div>

        {/* In Progress */}
        {inProgressAchievements.length > 0 && (
          <>
            <h3 className="mb-2 mt-4 text-xs font-medium text-brand-muted">Em Progresso</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {inProgressAchievements.map((a) => (
                <AchievementCard key={a.id} achievement={a} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Campaigns */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-brand-text">Campanhas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profile.campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
