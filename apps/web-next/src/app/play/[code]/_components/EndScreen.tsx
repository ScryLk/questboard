"use client";

import { Trophy, Clock, MessageCircle, Dices, Star } from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";

export function EndScreen() {
  const campaignName = usePlayerViewStore((s) => s.campaignName) || "A Maldição de Strahd";
  const sessionNumber = usePlayerViewStore((s) => s.sessionNumber) || 13;
  const playerName = usePlayerViewStore((s) => s.playerName);
  const summary = usePlayerViewStore((s) => s.sessionSummary);

  const stats = summary ?? {
    duration: "3h 42min",
    totalRounds: 18,
    totalMessages: 147,
    totalRolls: 63,
    mvp: playerName || "Thorin",
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      {/* Trophy */}
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-accent/10">
          <Trophy className="h-10 w-10 text-brand-accent" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD700]/20">
          <Star className="h-4 w-4 text-[#FFD700]" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-white">Sessão Encerrada!</h1>
      <p className="mt-1 text-sm text-white/40">
        {campaignName} — Sessão #{sessionNumber}
      </p>

      {/* Stats */}
      <div className="mt-8 grid w-full max-w-sm grid-cols-2 gap-3">
        <StatCard
          icon={<Clock className="h-4 w-4 text-brand-info" />}
          label="Duração"
          value={stats.duration}
        />
        <StatCard
          icon={<MessageCircle className="h-4 w-4 text-brand-success" />}
          label="Mensagens"
          value={String(stats.totalMessages)}
        />
        <StatCard
          icon={<Dices className="h-4 w-4 text-brand-accent" />}
          label="Rolagens"
          value={String(stats.totalRolls)}
        />
        <StatCard
          icon={<Trophy className="h-4 w-4 text-[#FFD700]" />}
          label="Rodadas"
          value={String(stats.totalRounds)}
        />
      </div>

      {/* MVP */}
      {stats.mvp && (
        <div className="mt-6 rounded-xl border border-[#FFD700]/20 bg-[#FFD700]/5 px-6 py-3 text-center">
          <p className="text-xs text-[#FFD700]/60">MVP da Sessão</p>
          <p className="mt-0.5 text-lg font-bold text-[#FFD700]">{stats.mvp}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="w-full rounded-xl bg-brand-accent py-3 text-sm font-semibold text-white transition-all active:scale-[0.98]"
        >
          Voltar ao Início
        </button>
        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: "QuestBoard",
                text: `Jogamos ${campaignName} por ${stats.duration}!`,
              });
            }
          }}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white/60 transition-all active:scale-[0.98]"
        >
          Compartilhar Resumo
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
      <div className="mb-2 flex justify-center">{icon}</div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
    </div>
  );
}
