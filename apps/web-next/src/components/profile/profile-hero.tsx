"use client";

import { Calendar, Star } from "lucide-react";
import type { PublicProfile } from "@/types/profile";
import { GM_STYLE_TAG_LABELS } from "@/types/profile";
import { getCosmeticById } from "@/constants/cosmetics";
import { getLevelFromXP, getXPProgress } from "@/lib/profile-level";
import { AvatarFrame } from "./avatar-frame";
import { LevelBadge } from "./level-badge";

interface ProfileHeroProps {
  profile: PublicProfile;
  variant: "adventurer" | "gm";
}

export function ProfileHero({ profile, variant }: ProfileHeroProps) {
  const banner = profile.equipped.bannerId
    ? getCosmeticById(profile.equipped.bannerId)
    : null;
  const title = profile.equipped.titleId
    ? getCosmeticById(profile.equipped.titleId)
    : null;

  const level = getLevelFromXP(profile.xp);
  const progress = getXPProgress(profile.xp);

  const bannerStyle: React.CSSProperties = banner?.cssStyle ?? {
    background: "linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 50%, #16213E 100%)",
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border">
      {/* Banner */}
      <div className="relative h-36 w-full" style={bannerStyle}>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-surface/80 to-transparent" />
      </div>

      {/* Profile info */}
      <div className="relative bg-brand-surface px-6 pb-5">
        {/* Avatar overlapping banner */}
        <div className="flex items-end gap-4">
          <div className="-mt-12">
            <AvatarFrame
              src={profile.avatarUrl}
              fallbackInitials={profile.displayName}
              frameId={profile.equipped.frameId}
              size="xl"
            />
          </div>

          <div className="flex flex-1 items-start justify-between pb-1">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-xl font-bold text-brand-text">
                  {profile.displayName}
                </h1>
                <LevelBadge level={level} progressPercent={progress.percent} size="sm" />
              </div>

              {/* Title */}
              {title && (
                <p
                  className="mt-0.5 text-xs font-medium"
                  style={title.cssStyle}
                >
                  {title.name}
                </p>
              )}

              {/* Bio */}
              <p className="mt-1 max-w-lg text-sm text-brand-muted">{profile.bio}</p>

              {/* Meta */}
              <div className="mt-2 flex items-center gap-4 text-[11px] text-brand-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Membro desde {new Date(profile.memberSince).toLocaleDateString("pt-BR")}
                </span>
                <span>@{profile.username}</span>
              </div>

              {/* GM-specific: style tags + rating */}
              {variant === "gm" && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {profile.gmStyleTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-brand-accent/10 px-2 py-0.5 text-[10px] font-medium text-brand-accent"
                    >
                      {GM_STYLE_TAG_LABELS[tag]}
                    </span>
                  ))}
                  {profile.gmStats.totalReviews > 0 && (
                    <span className="flex items-center gap-1 rounded-md bg-brand-warning/10 px-2 py-0.5 text-[10px] font-medium text-brand-warning">
                      <Star className="h-3 w-3 fill-brand-warning" />
                      {profile.gmStats.averageRating.toFixed(1)} ({profile.gmStats.totalReviews})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
