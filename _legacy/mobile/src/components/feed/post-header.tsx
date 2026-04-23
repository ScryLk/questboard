import { MoreHorizontal } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { PostAuthor } from "@questboard/types";
import { PostType } from "@questboard/types";
import { useProfileStore } from "../../lib/profile-store";

const TYPE_LABELS: Record<PostType, string> = {
  [PostType.TEXT]: "",
  [PostType.CHARACTER_CARD]: "Personagem",
  [PostType.SESSION_HIGHLIGHT]: "Destaque",
  [PostType.ARTWORK]: "Arte",
  [PostType.CAMPAIGN_RECRUIT]: "Recrutamento",
  [PostType.DICE_ROLL]: "Rolagem",
  [PostType.QUOTE]: "Citação",
};

const TYPE_COLORS: Record<PostType, string> = {
  [PostType.TEXT]: "#5A5A6E",
  [PostType.CHARACTER_CARD]: "#00B894",
  [PostType.SESSION_HIGHLIGHT]: "#FDCB6E",
  [PostType.ARTWORK]: "#FF6B6B",
  [PostType.CAMPAIGN_RECRUIT]: "#00CEC9",
  [PostType.DICE_ROLL]: "#6C5CE7",
  [PostType.QUOTE]: "#6C5CE7",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}sem`;
}

interface PostHeaderProps {
  author: PostAuthor;
  postType: PostType;
  createdAt: string;
  onMorePress?: () => void;
}

export function PostHeader({ author, postType, createdAt, onMorePress }: PostHeaderProps) {
  const openProfile = useProfileStore((s) => s.openProfile);
  const label = TYPE_LABELS[postType];
  const labelColor = TYPE_COLORS[postType];

  return (
    <XStack alignItems="center" gap={10} paddingBottom={10}>
      {/* Avatar */}
      {author.avatarUrl ? (
        <Stack
          height={40}
          width={40}
          borderRadius={20}
          backgroundColor="#2A2A35"
          overflow="hidden"
          onPress={() => openProfile(author.username)}
          pressStyle={{ opacity: 0.8 }}
        />
      ) : (
        <Stack
          height={40}
          width={40}
          borderRadius={20}
          backgroundColor="#2A2A35"
          alignItems="center"
          justifyContent="center"
          onPress={() => openProfile(author.username)}
          pressStyle={{ opacity: 0.8 }}
        >
          <Text fontSize={14} fontWeight="700" color="$accent">
            {getInitials(author.displayName)}
          </Text>
        </Stack>
      )}

      {/* Name + username + time */}
      <YStack flex={1}>
        <XStack alignItems="center" gap={6}>
          <Text fontSize={15} fontWeight="600" color="$textPrimary" numberOfLines={1}>
            {author.displayName}
          </Text>
          {label ? (
            <Stack
              paddingHorizontal={6}
              paddingVertical={2}
              borderRadius={6}
              backgroundColor={`${labelColor}1A`}
            >
              <Text fontSize={10} fontWeight="600" color={labelColor}>
                {label}
              </Text>
            </Stack>
          ) : null}
        </XStack>
        <XStack alignItems="center" gap={4}>
          <Text fontSize={12} color="$textMuted">
            @{author.username}
          </Text>
          <Text fontSize={12} color="$textMuted">
            ·
          </Text>
          <Text fontSize={12} color="$textMuted">
            {formatTimeAgo(createdAt)}
          </Text>
        </XStack>
      </YStack>

      {/* More button */}
      <Stack padding={4} pressStyle={{ opacity: 0.6 }} onPress={onMorePress}>
        <MoreHorizontal size={18} color="#5A5A6E" />
      </Stack>
    </XStack>
  );
}
