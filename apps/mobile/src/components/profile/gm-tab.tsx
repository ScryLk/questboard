import { Alert } from "react-native";
import { BookOpen, Clock, Shield, Star, Users } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type {
  GMStats,
  ProfileCampaign,
  GMReview,
} from "@questboard/types";
import { ProfileCampaignStatus } from "@questboard/types";
import { EmptyState } from "../empty-state";

// ─── GM Stats Row ────────────────────────────────────

function GMStatsRow({ stats }: { stats: GMStats }) {
  const items = [
    { icon: Shield, value: stats.campaigns, label: "Campanhas", color: "#6C5CE7" },
    { icon: Clock, value: `${stats.hoursNarrated}h`, label: "Narradas", color: "#00CEC9" },
    { icon: Users, value: stats.uniquePlayers, label: "Jogadores", color: "#FDCB6E" },
    { icon: Star, value: stats.averageRating.toFixed(1), label: "Avaliacao", color: "#FF6B9D" },
  ];

  return (
    <XStack justifyContent="space-around">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <YStack key={item.label} alignItems="center" gap={4}>
            <Icon size={18} color={item.color} />
            <Text fontSize={18} fontWeight="700" color="$textPrimary">
              {item.value}
            </Text>
            <Text fontSize={11} color="$textMuted">
              {item.label}
            </Text>
          </YStack>
        );
      })}
    </XStack>
  );
}

// ─── Tags ────────────────────────────────────────────

function StyleTags({ tags }: { tags: string[] }) {
  return (
    <XStack flexWrap="wrap" gap={8}>
      {tags.map((tag) => (
        <Stack
          key={tag}
          paddingHorizontal={12}
          paddingVertical={6}
          borderRadius={9999}
          backgroundColor="$accentMuted"
        >
          <Text fontSize={12} fontWeight="600" color="$accent">
            {tag}
          </Text>
        </Stack>
      ))}
    </XStack>
  );
}

// ─── Campaign Card (GM version) ──────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  [ProfileCampaignStatus.ONGOING]: { label: "AO VIVO", color: "#00B894" },
  [ProfileCampaignStatus.COMPLETED]: { label: "CONCLUIDA", color: "#6C5CE7" },
  [ProfileCampaignStatus.RECRUITING]: { label: "RECRUTANDO", color: "#00CEC9" },
  [ProfileCampaignStatus.ABANDONED]: { label: "ENCERRADA", color: "#5A5A6E" },
};

function GMCampaignCard({ campaign }: { campaign: ProfileCampaign }) {
  const status = STATUS_CONFIG[campaign.status] ?? {
    label: campaign.status,
    color: "#5A5A6E",
  };

  return (
    <YStack
      backgroundColor="#1C1C24"
      borderRadius={12}
      padding={14}
      gap={8}
    >
      <XStack alignItems="center" justifyContent="space-between">
        <Text
          fontSize={15}
          fontWeight="600"
          color="$textPrimary"
          flex={1}
          numberOfLines={1}
        >
          {campaign.name}
        </Text>
        <Stack
          paddingHorizontal={8}
          paddingVertical={2}
          borderRadius={6}
          backgroundColor={`${status.color}26`}
        >
          <Text fontSize={10} fontWeight="600" color={status.color}>
            {status.label}
          </Text>
        </Stack>
      </XStack>

      <Text fontSize={12} color="$textMuted">
        {campaign.system} · {campaign.playerCount}/{campaign.maxPlayers} jogadores · Sessao {campaign.totalSessions}
      </Text>

      {campaign.rating !== null && (
        <XStack alignItems="center" gap={4}>
          <Star size={12} color="#FDCB6E" />
          <Text fontSize={12} color="$textMuted">
            {campaign.rating.toFixed(1)} · {campaign.reviewCount} avaliacoes
          </Text>
        </XStack>
      )}

      {campaign.progress !== null && (
        <Stack
          height={4}
          borderRadius={2}
          backgroundColor="#2A2A35"
          overflow="hidden"
        >
          <Stack
            height={4}
            borderRadius={2}
            backgroundColor={status.color}
            width={`${campaign.progress}%` as unknown as number}
          />
        </Stack>
      )}

      {campaign.status === ProfileCampaignStatus.RECRUITING && (
        <Stack
          marginTop={4}
          height={36}
          borderRadius={8}
          backgroundColor="$accent"
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.8 }}
          onPress={() =>
            Alert.alert("Em breve", "Candidatura estara disponivel em breve!")
          }
        >
          <Text fontSize={13} fontWeight="600" color="white">
            Candidatar-me
          </Text>
        </Stack>
      )}
    </YStack>
  );
}

// ─── Rating Bars ─────────────────────────────────────

function RatingBars({ reviews }: { reviews: GMReview[] }) {
  const distribution = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating - 1]++;
    }
  }
  const max = Math.max(1, ...distribution);
  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <YStack gap={8}>
      <XStack alignItems="center" gap={8}>
        <Star size={18} color="#FDCB6E" />
        <Text fontSize={20} fontWeight="700" color="$textPrimary">
          {avg.toFixed(1)}
        </Text>
        <Text fontSize={13} color="$textMuted">
          MEDIA
        </Text>
        <Text flex={1} fontSize={13} color="$textMuted" textAlign="right">
          {reviews.length} avaliacoes
        </Text>
      </XStack>

      {[5, 4, 3, 2, 1].map((stars) => {
        const count = distribution[stars - 1];
        const pct = (count / max) * 100;
        return (
          <XStack key={stars} alignItems="center" gap={8}>
            <Text fontSize={12} color="$textMuted" width={14}>
              {stars}
            </Text>
            <Stack
              flex={1}
              height={6}
              borderRadius={3}
              backgroundColor="#2A2A35"
              overflow="hidden"
            >
              <Stack
                height={6}
                borderRadius={3}
                backgroundColor="#FDCB6E"
                width={`${pct}%` as unknown as number}
              />
            </Stack>
            <Text fontSize={12} color="$textMuted" width={20} textAlign="right">
              {count}
            </Text>
          </XStack>
        );
      })}
    </YStack>
  );
}

// ─── Review Card ─────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 7) return `ha ${days}d`;
  if (days < 30) return `ha ${Math.floor(days / 7)} semanas`;
  return `ha ${Math.floor(days / 30)} meses`;
}

function ReviewCard({ review }: { review: GMReview }) {
  return (
    <YStack
      backgroundColor="#1C1C24"
      borderRadius={12}
      padding={14}
      gap={8}
    >
      <XStack alignItems="center" gap={8}>
        <Stack
          height={32}
          width={32}
          borderRadius={16}
          backgroundColor="#2A2A35"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={12} fontWeight="700" color="$accent">
            {review.author.displayName[0]}
          </Text>
        </Stack>
        <YStack flex={1}>
          <Text fontSize={13} fontWeight="600" color="$textPrimary">
            {review.author.displayName}
          </Text>
          <Text fontSize={11} color="$textMuted">
            {formatTimeAgo(review.createdAt)}
          </Text>
        </YStack>
      </XStack>

      <XStack gap={2}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            color={i < review.rating ? "#FDCB6E" : "#2A2A35"}
            fill={i < review.rating ? "#FDCB6E" : "none"}
          />
        ))}
      </XStack>

      <Text fontSize={14} color="$textPrimary" lineHeight={20}>
        {review.content}
      </Text>
    </YStack>
  );
}

// ─── Section Header ──────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      fontSize={12}
      fontWeight="600"
      color="$textMuted"
      textTransform="uppercase"
      letterSpacing={1}
      marginBottom={12}
    >
      {title}
    </Text>
  );
}

// ─── Main Tab Component ──────────────────────────────

interface GMTabProps {
  gmStats: GMStats | null;
  campaigns: ProfileCampaign[];
  reviews: GMReview[];
  tags: string[];
  isOwnProfile: boolean;
}

export function GMTab({
  gmStats,
  campaigns,
  reviews,
  tags,
  isOwnProfile,
}: GMTabProps) {
  if (!gmStats) {
    return (
      <EmptyState
        icon={<BookOpen size={28} color="#6C5CE7" />}
        title={
          isOwnProfile
            ? "Voce ainda nao narrou nenhuma sessao"
            : "Este usuario nao e mestre"
        }
        message={
          isOwnProfile
            ? "Crie sua primeira campanha e convide seus amigos para jogar"
            : "Nenhuma campanha narrada encontrada"
        }
        actionLabel={isOwnProfile ? "+ Criar Campanha" : undefined}
      />
    );
  }

  const ongoing = campaigns.filter(
    (c) =>
      c.status === ProfileCampaignStatus.ONGOING ||
      c.status === ProfileCampaignStatus.RECRUITING,
  );
  const completed = campaigns.filter(
    (c) =>
      c.status === ProfileCampaignStatus.COMPLETED ||
      c.status === ProfileCampaignStatus.ABANDONED,
  );

  return (
    <YStack gap={28}>
      {/* Stats */}
      <GMStatsRow stats={gmStats} />

      {/* Tags */}
      {tags.length > 0 && (
        <YStack>
          <SectionHeader title="ESTILO DE JOGO" />
          <StyleTags tags={tags} />
        </YStack>
      )}

      {/* Ongoing Campaigns */}
      {ongoing.length > 0 && (
        <YStack>
          <SectionHeader title="EM ANDAMENTO" />
          <YStack gap={10}>
            {ongoing.map((c) => (
              <GMCampaignCard key={c.id} campaign={c} />
            ))}
          </YStack>
        </YStack>
      )}

      {/* Completed Campaigns */}
      {completed.length > 0 && (
        <YStack>
          <SectionHeader title={`CONCLUIDAS (${completed.length})`} />
          <YStack gap={10}>
            {completed.map((c) => (
              <GMCampaignCard key={c.id} campaign={c} />
            ))}
          </YStack>
        </YStack>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <YStack>
          <SectionHeader title="AVALIACOES" />
          <RatingBars reviews={reviews} />
          <YStack gap={10} marginTop={16}>
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </YStack>
        </YStack>
      )}
    </YStack>
  );
}
