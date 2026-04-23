import { Alert, ScrollView } from "react-native";
import {
  Clock,
  Dice5,
  Flame,
  RotateCcw,
  Shield,
  Skull,
  Swords,
  Trophy,
  Users,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type {
  ProfileStats,
  ProfileCharacter,
  ProfileAchievement,
  ProfileCampaign,
} from "@questboard/types";
import { CharacterStatus, ProfileCampaignStatus } from "@questboard/types";

// ─── Stats Grid ─────────────────────────────────────

interface StatItem {
  icon: LucideIcon;
  value: number;
  label: string;
  color: string;
}

function buildStats(s: ProfileStats): StatItem[] {
  return [
    { icon: Swords, value: s.sessions, label: "Sessoes", color: "#6C5CE7" },
    { icon: Clock, value: s.hoursPlayed, label: "Horas", color: "#00CEC9" },
    { icon: Users, value: s.characters, label: "Personagens", color: "#00B894" },
    { icon: Dice5, value: s.diceRolled, label: "Dados", color: "#FDCB6E" },
    { icon: Trophy, value: s.achievements, label: "Conquistas", color: "#E17055" },
    { icon: Flame, value: s.nat20s, label: "Nat 20s", color: "#FF6B9D" },
  ];
}

function StatsGrid({ stats }: { stats: ProfileStats }) {
  const items = buildStats(stats);

  return (
    <YStack gap={8}>
      <XStack gap={8}>
        {items.slice(0, 3).map((item) => (
          <StatCard key={item.label} item={item} />
        ))}
      </XStack>
      <XStack gap={8}>
        {items.slice(3, 6).map((item) => (
          <StatCard key={item.label} item={item} />
        ))}
      </XStack>
    </YStack>
  );
}

function StatCard({ item }: { item: StatItem }) {
  const Icon = item.icon;
  return (
    <YStack
      flex={1}
      backgroundColor="#1C1C24"
      borderRadius={12}
      padding={14}
      alignItems="center"
      gap={6}
    >
      <Icon size={18} color={item.color} />
      <Text fontSize={20} fontWeight="700" color="$textPrimary">
        {item.value.toLocaleString()}
      </Text>
      <Text fontSize={11} color="$textMuted">
        {item.label}
      </Text>
    </YStack>
  );
}

// ─── Featured Characters ─────────────────────────────

function CharacterCard({ char }: { char: ProfileCharacter }) {
  const isDeceased = char.status === CharacterStatus.DECEASED;
  const isRetired = char.status === CharacterStatus.RETIRED;

  return (
    <YStack
      width={130}
      backgroundColor="#1C1C24"
      borderRadius={12}
      padding={12}
      gap={8}
      opacity={isRetired ? 0.7 : 1}
      marginRight={10}
    >
      {/* Avatar */}
      <Stack
        height={64}
        width={64}
        borderRadius={32}
        backgroundColor="#2A2A35"
        alignSelf="center"
        alignItems="center"
        justifyContent="center"
      >
        {isDeceased ? (
          <Skull size={24} color="#FF6B6B" />
        ) : isRetired ? (
          <RotateCcw size={24} color="#5A5A6E" />
        ) : (
          <Text fontSize={24} fontWeight="700" color="$accent">
            {char.name[0]}
          </Text>
        )}
      </Stack>

      <Text
        fontSize={14}
        fontWeight="600"
        color="$textPrimary"
        textAlign="center"
        numberOfLines={1}
      >
        {char.name}
      </Text>
      <Text
        fontSize={11}
        color="$textMuted"
        textAlign="center"
        numberOfLines={1}
      >
        {char.class} · Nv.{char.level}
      </Text>
      <Text
        fontSize={10}
        color="$textMuted"
        textAlign="center"
      >
        {char.system}
      </Text>

      {/* Status badge */}
      <Stack
        alignSelf="center"
        paddingHorizontal={8}
        paddingVertical={2}
        borderRadius={6}
        backgroundColor={
          isDeceased
            ? "rgba(255,107,107,0.15)"
            : isRetired
              ? "rgba(90,90,110,0.15)"
              : "rgba(0,184,148,0.15)"
        }
      >
        <Text
          fontSize={10}
          fontWeight="600"
          color={
            isDeceased ? "#FF6B6B" : isRetired ? "#5A5A6E" : "#00B894"
          }
        >
          {isDeceased ? "MORTO" : isRetired ? "APOSENTADO" : "ATIVO"}
        </Text>
      </Stack>

      {char.highlight && (
        <Text
          fontSize={10}
          color="#9B9BAF"
          textAlign="center"
          numberOfLines={2}
          fontStyle="italic"
        >
          "{char.highlight}"
        </Text>
      )}
    </YStack>
  );
}

// ─── Featured Achievements ───────────────────────────

const RARITY_COLORS: Record<string, string> = {
  common: "#5A5A6E",
  rare: "#00CEC9",
  epic: "#6C5CE7",
  legendary: "#FDCB6E",
};

function AchievementCard({ ach }: { ach: ProfileAchievement }) {
  const borderColor = RARITY_COLORS[ach.rarity] ?? "#5A5A6E";

  return (
    <YStack
      width={80}
      height={90}
      backgroundColor={ach.isUnlocked ? "#1C1C24" : "#13131A"}
      borderRadius={12}
      borderWidth={1}
      borderColor={ach.isUnlocked ? borderColor : "#2A2A35"}
      alignItems="center"
      justifyContent="center"
      gap={6}
      padding={6}
      marginRight={8}
    >
      <Stack
        height={32}
        width={32}
        borderRadius={8}
        backgroundColor={ach.isUnlocked ? `${borderColor}26` : "#1C1C24"}
        alignItems="center"
        justifyContent="center"
      >
        {ach.isUnlocked ? (
          <Trophy size={16} color={borderColor} />
        ) : (
          <Text fontSize={14} color="#3A3A4E">?</Text>
        )}
      </Stack>
      <Text
        fontSize={10}
        fontWeight="600"
        color={ach.isUnlocked ? "$textPrimary" : "#3A3A4E"}
        textAlign="center"
        numberOfLines={2}
      >
        {ach.isUnlocked ? ach.name : "???"}
      </Text>
    </YStack>
  );
}

// ─── Campaigns ───────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  [ProfileCampaignStatus.ONGOING]: { label: "Em andamento", color: "#00B894" },
  [ProfileCampaignStatus.COMPLETED]: { label: "Concluida", color: "#6C5CE7" },
  [ProfileCampaignStatus.ABANDONED]: { label: "Encerrada", color: "#5A5A6E" },
  [ProfileCampaignStatus.RECRUITING]: { label: "Recrutando", color: "#00CEC9" },
};

function CampaignRow({ campaign }: { campaign: ProfileCampaign }) {
  const status = STATUS_CONFIG[campaign.status] ?? {
    label: campaign.status,
    color: "#5A5A6E",
  };

  return (
    <XStack
      backgroundColor="#1C1C24"
      borderRadius={12}
      padding={12}
      gap={12}
      alignItems="center"
    >
      {/* Thumbnail */}
      <Stack
        height={56}
        width={56}
        borderRadius={10}
        backgroundColor="#2A2A35"
        alignItems="center"
        justifyContent="center"
      >
        <Shield size={22} color="#5A5A6E" />
      </Stack>

      <YStack flex={1} gap={4}>
        <Text fontSize={14} fontWeight="600" color="$textPrimary" numberOfLines={1}>
          {campaign.name}
        </Text>
        <Text fontSize={12} color="$textMuted">
          {campaign.role === "PLAYER" ? "Jogador" : "Mestre"} · Sessao {campaign.totalSessions} · {campaign.system}
        </Text>

        {/* Progress bar for ongoing */}
        {campaign.progress !== null && (
          <XStack alignItems="center" gap={8} marginTop={2}>
            <Stack
              flex={1}
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
            <Text fontSize={11} color="$textMuted">
              {campaign.progress}%
            </Text>
          </XStack>
        )}

        {/* Status badge */}
        {campaign.progress === null && (
          <XStack alignItems="center" gap={4} marginTop={2}>
            <Stack
              paddingHorizontal={6}
              paddingVertical={1}
              borderRadius={4}
              backgroundColor={`${status.color}26`}
            >
              <Text fontSize={10} fontWeight="600" color={status.color}>
                {status.label}
                {campaign.status === ProfileCampaignStatus.COMPLETED ? " \u2713" : ""}
              </Text>
            </Stack>
          </XStack>
        )}
      </YStack>
    </XStack>
  );
}

// ─── Section Header ──────────────────────────────────

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      marginBottom={12}
    >
      <Text
        fontSize={12}
        fontWeight="600"
        color="$textMuted"
        textTransform="uppercase"
        letterSpacing={1}
      >
        {title}
      </Text>
      {actionLabel && (
        <Text
          fontSize={12}
          fontWeight="600"
          color="$accent"
          onPress={onAction}
        >
          {actionLabel}
        </Text>
      )}
    </XStack>
  );
}

// ─── Main Tab Component ──────────────────────────────

interface AdventurerTabProps {
  stats: ProfileStats;
  characters: ProfileCharacter[];
  achievements: ProfileAchievement[];
  campaigns: ProfileCampaign[];
}

export function AdventurerTab({
  stats,
  characters,
  achievements,
  campaigns,
}: AdventurerTabProps) {
  return (
    <YStack gap={28}>
      {/* Stats */}
      <StatsGrid stats={stats} />

      {/* Characters */}
      {characters.length > 0 && (
        <YStack>
          <SectionHeader
            title="PERSONAGENS EM DESTAQUE"
            actionLabel={`Ver todos (${stats.characters})`}
            onAction={() =>
              Alert.alert("Em breve", "Lista completa em breve!")
            }
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {characters.map((char) => (
              <CharacterCard key={char.id} char={char} />
            ))}
          </ScrollView>
        </YStack>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <YStack>
          <SectionHeader
            title="CONQUISTAS"
            actionLabel={`Ver todas (${stats.achievements})`}
            onAction={() =>
              Alert.alert("Em breve", "Lista completa em breve!")
            }
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {achievements.map((ach) => (
              <AchievementCard key={ach.id} ach={ach} />
            ))}
          </ScrollView>
        </YStack>
      )}

      {/* Campaigns */}
      {campaigns.length > 0 && (
        <YStack>
          <SectionHeader
            title="CAMPANHAS RECENTES"
            actionLabel="Ver todas"
            onAction={() =>
              Alert.alert("Em breve", "Lista completa em breve!")
            }
          />
          <YStack gap={10}>
            {campaigns.map((camp) => (
              <CampaignRow key={camp.id} campaign={camp} />
            ))}
          </YStack>
        </YStack>
      )}
    </YStack>
  );
}
