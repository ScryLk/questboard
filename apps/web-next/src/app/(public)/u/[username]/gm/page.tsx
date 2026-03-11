"use client";

import {
  Calendar,
  Clock,
  Gamepad2,
  Swords,
  Star,
  Users,
} from "lucide-react";
import { useProfileStore } from "@/stores/profileStore";
import { ProfileHero } from "@/components/profile/profile-hero";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { StatBar } from "@/components/profile/stat-bar";
import { CampaignCard } from "@/components/profile/campaign-card";
import { ReviewCard } from "@/components/profile/review-card";

export default function GMProfilePage() {
  const profile = useProfileStore((s) => s.profile);
  const gm = profile.gmStats;

  const gmCampaigns = profile.campaigns.filter((c) => c.role === "gm");
  const activeCampaigns = gmCampaigns.filter((c) => c.status === "active");
  const completedCampaigns = gmCampaigns.filter((c) => c.status === "completed");

  const avgRating = gm.averageRating;
  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: profile.reviews.filter((r) => r.rating === stars).length,
  }));

  return (
    <div className="space-y-8">
      {/* Hero */}
      <ProfileHero profile={profile} variant="gm" />

      {/* Tabs */}
      <ProfileTabs username={profile.username} activeTab="gm" />

      {/* GM Stats */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-brand-text">Estatísticas de Mestre</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatBar icon={Calendar} label="Sessões Mestradas" value={gm.sessionsRun} color="#6C5CE7" />
          <StatBar icon={Clock} label="Horas Mestradas" value={`${gm.hoursRun}h`} color="#3B82F6" />
          <StatBar icon={Gamepad2} label="Campanhas Criadas" value={gm.campaignsCreated} color="#10B981" />
          <StatBar icon={Users} label="Jogadores Recebidos" value={gm.playersHosted} color="#F59E0B" />
          <StatBar icon={Swords} label="Encontros Criados" value={gm.encountersDesigned} color="#EC4899" />
          <StatBar
            icon={Star}
            label="Avaliação Média"
            value={`${avgRating.toFixed(1)} / 5`}
            color="#FFD700"
          />
        </div>
      </section>

      {/* Campaign Portfolio */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-brand-text">Portfólio de Campanhas</h2>

        {activeCampaigns.length > 0 && (
          <>
            <h3 className="mb-2 text-xs font-medium text-brand-muted">Em Andamento</h3>
            <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeCampaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          </>
        )}

        {completedCampaigns.length > 0 && (
          <>
            <h3 className="mb-2 text-xs font-medium text-brand-muted">Concluídas</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completedCampaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          </>
        )}

        {gmCampaigns.length === 0 && (
          <p className="py-8 text-center text-sm text-brand-muted">
            Nenhuma campanha criada ainda.
          </p>
        )}
      </section>

      {/* Reviews */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-brand-text">
          Avaliações dos Jogadores{" "}
          <span className="text-brand-muted">({gm.totalReviews})</span>
        </h2>

        {/* Rating Summary */}
        <div className="mb-4 rounded-xl border border-brand-border bg-brand-surface p-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="text-3xl font-bold text-brand-text">{avgRating.toFixed(1)}</span>
              <div className="mt-1 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.round(avgRating)
                        ? "fill-brand-warning text-brand-warning"
                        : "text-white/10"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-[10px] text-brand-muted">{gm.totalReviews} reviews</p>
            </div>

            {/* Breakdown bars */}
            <div className="flex-1 space-y-1">
              {ratingBreakdown.map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="w-3 text-right text-[10px] text-brand-muted">{stars}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-brand-warning transition-all"
                      style={{
                        width: `${gm.totalReviews ? (count / gm.totalReviews) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="w-4 text-[10px] tabular-nums text-brand-muted">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Review Cards */}
        <div className="space-y-3">
          {profile.reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
