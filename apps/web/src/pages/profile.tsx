import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  TextInput,
  Avatar,
  Badge,
  Divider,
  ProgressBar,
} from "@questboard/ui";
import { Plan, AchievementRarity } from "@questboard/shared";

// Mock data
const MOCK_USER = {
  displayName: "Aventureiro",
  username: "aventureiro42",
  email: "aventureiro@email.com",
  avatarUrl: null,
  bannerUrl: null,
  bio: "Mestre de D&D há 5 anos. Amo Tormenta20 e Call of Cthulhu.",
  plan: Plan.ADVENTURER,
  createdAt: "2025-06-15T00:00:00",
};

const MOCK_STATS = {
  totalSessions: 24,
  totalSessionsAsGm: 15,
  totalSessionsAsPlayer: 9,
  totalSessionMinutes: 5160,
  totalDiceRolled: 847,
  totalNat20s: 42,
  totalNat1s: 38,
  totalCharactersCreated: 7,
  totalFriendsAdded: 12,
  currentWeeklyStreak: 3,
  longestWeeklyStreak: 8,
};

const MOCK_ACHIEVEMENTS = [
  {
    id: "1",
    name: "Primeira Aventura",
    description: "Complete sua primeira sessão",
    rarity: AchievementRarity.COMMON,
    unlocked: true,
    icon: "⚔️",
  },
  {
    id: "2",
    name: "Mestre de Cerimônias",
    description: "Conduza 10 sessões como mestre",
    rarity: AchievementRarity.UNCOMMON,
    unlocked: true,
    icon: "🎭",
  },
  {
    id: "3",
    name: "Dado Sortudo",
    description: "Role 20 natural 20s",
    rarity: AchievementRarity.RARE,
    unlocked: true,
    icon: "🎲",
  },
  {
    id: "4",
    name: "Lendário",
    description: "Alcance 100 sessões jogadas",
    rarity: AchievementRarity.LEGENDARY,
    unlocked: false,
    icon: "👑",
  },
];

const RARITY_COLORS = {
  [AchievementRarity.COMMON]: "default" as const,
  [AchievementRarity.UNCOMMON]: "success" as const,
  [AchievementRarity.RARE]: "accent" as const,
  [AchievementRarity.EPIC]: "legendary" as const,
  [AchievementRarity.LEGENDARY]: "gold" as const,
};

const PLAN_LABELS = {
  [Plan.FREE]: "Gratuito",
  [Plan.ADVENTURER]: "Aventureiro",
  [Plan.LEGENDARY]: "Lendário",
  [Plan.PLAYER_PLUS]: "Player Plus",
};

type ProfileTab = "overview" | "achievements" | "stats";

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-muted mt-0.5">{label}</div>
    </div>
  );
}

export function ProfilePage() {
  const [tab, setTab] = useState<ProfileTab>("overview");

  const totalHours = Math.round(MOCK_STATS.totalSessionMinutes / 60);

  return (
    <div className="space-y-6">
      {/* Banner + Avatar */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-accent/30 to-secondary/20 rounded-lg" />
        <div className="absolute -bottom-10 left-6 flex items-end gap-4">
          <Avatar size="2xl" fallback={MOCK_USER.displayName[0]} />
          <div className="pb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-display font-bold text-text-primary">
                {MOCK_USER.displayName}
              </h1>
              <Badge
                variant={MOCK_USER.plan === Plan.LEGENDARY ? "gold" : "accent"}
                size="sm"
              >
                {PLAN_LABELS[MOCK_USER.plan]}
              </Badge>
            </div>
            <p className="text-sm text-text-muted">@{MOCK_USER.username}</p>
          </div>
        </div>
        <div className="absolute -bottom-10 right-6 pb-2">
          <Link to="/profile/edit">
            <Button variant="outline" size="sm">
              Editar Perfil
            </Button>
          </Link>
        </div>
      </div>

      {/* Spacer for absolute avatar */}
      <div className="h-8" />

      {/* Bio */}
      {MOCK_USER.bio && (
        <p className="text-sm text-text-secondary">{MOCK_USER.bio}</p>
      )}

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-border-default">
        {(
          [
            { key: "overview", label: "Visão Geral" },
            { key: "achievements", label: "Conquistas" },
            { key: "stats", label: "Estatísticas" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-fast ${
              tab === t.key
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatBlock label="Sessões" value={MOCK_STATS.totalSessions} />
            <StatBlock label="Horas jogadas" value={`${totalHours}h`} />
            <StatBlock label="Dados rolados" value={MOCK_STATS.totalDiceRolled} />
            <StatBlock label="Streak semanal" value={`${MOCK_STATS.currentWeeklyStreak}🔥`} />
          </div>

          <section>
            <h2 className="text-base font-display font-semibold text-text-primary mb-3">
              Conquistas Recentes
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {MOCK_ACHIEVEMENTS.filter((a) => a.unlocked)
                .slice(0, 4)
                .map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 bg-surface border border-border-default rounded-lg p-3"
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">
                        {achievement.name}
                      </div>
                      <div className="text-xs text-text-muted">{achievement.description}</div>
                    </div>
                    <Badge variant={RARITY_COLORS[achievement.rarity]} size="sm">
                      {achievement.rarity}
                    </Badge>
                  </div>
                ))}
            </div>
          </section>
        </div>
      )}

      {tab === "achievements" && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-sm text-text-muted">
            {MOCK_ACHIEVEMENTS.filter((a) => a.unlocked).length}/{MOCK_ACHIEVEMENTS.length} desbloqueadas
          </p>
          {MOCK_ACHIEVEMENTS.map((achievement) => (
            <div
              key={achievement.id}
              className={`flex items-center gap-3 bg-surface border rounded-lg p-4 transition-all ${
                achievement.unlocked
                  ? "border-border-default"
                  : "border-border-default opacity-50"
              }`}
            >
              <span className="text-3xl">{achievement.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary">
                  {achievement.name}
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  {achievement.description}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={RARITY_COLORS[achievement.rarity]} size="sm">
                  {achievement.rarity}
                </Badge>
                {achievement.unlocked ? (
                  <span className="text-xs text-success">Desbloqueada</span>
                ) : (
                  <span className="text-xs text-text-muted">Bloqueada</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "stats" && (
        <div className="space-y-4 animate-fade-in">
          <Card>
            <h3 className="text-base font-display font-semibold text-text-primary mb-4">
              Sessões
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <StatBlock label="Total" value={MOCK_STATS.totalSessions} />
              <StatBlock label="Como Mestre" value={MOCK_STATS.totalSessionsAsGm} />
              <StatBlock label="Como Jogador" value={MOCK_STATS.totalSessionsAsPlayer} />
            </div>
          </Card>

          <Card>
            <h3 className="text-base font-display font-semibold text-text-primary mb-4">
              Dados
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <StatBlock label="Dados rolados" value={MOCK_STATS.totalDiceRolled} />
              <StatBlock label="Nat 20" value={`${MOCK_STATS.totalNat20s} 🎯`} />
              <StatBlock label="Nat 1" value={`${MOCK_STATS.totalNat1s} 💀`} />
            </div>
          </Card>

          <Card>
            <h3 className="text-base font-display font-semibold text-text-primary mb-4">
              Dedicação
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <StatBlock label="Horas jogadas" value={`${totalHours}h`} />
              <StatBlock label="Streak atual" value={MOCK_STATS.currentWeeklyStreak} />
              <StatBlock label="Maior streak" value={MOCK_STATS.longestWeeklyStreak} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
