import { Bookmark, MessageCircle, Share2, Swords } from "lucide-react-native";
import { Stack, Text, XStack } from "tamagui";
import type { PostEngagement } from "@questboard/types";
import { REACTION_MAP } from "../../lib/feed-constants";

function formatCount(n: number): string {
  if (n === 0) return "";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

interface EngagementBarProps {
  engagement: PostEngagement;
  onReact?: () => void;
  onReactLongPress?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

export function EngagementBar({
  engagement,
  onReact,
  onReactLongPress,
  onComment,
  onShare,
  onBookmark,
}: EngagementBarProps) {
  const myMeta = engagement.myReaction
    ? REACTION_MAP[engagement.myReaction]
    : null;

  // Top 3 reactions by count
  const topReactions = [...engagement.reactions]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingTop={12}
      borderTopWidth={1}
      borderTopColor="rgba(255,255,255,0.06)"
    >
      {/* Reaction button + pills */}
      <XStack
        alignItems="center"
        gap={4}
        paddingVertical={6}
        paddingHorizontal={6}
        borderRadius={8}
        onPress={onReact}
        onLongPress={onReactLongPress}
        pressStyle={{ opacity: 0.6 }}
      >
        {myMeta ? (
          <Stack>
            <myMeta.icon size={18} color={myMeta.color} />
          </Stack>
        ) : topReactions.length > 0 ? (
          <XStack gap={2}>
            {topReactions.map((r) => {
              const Icon = REACTION_MAP[r.type].icon;
              return (
                <Stack key={r.type}>
                  <Icon size={14} color={REACTION_MAP[r.type].color} />
                </Stack>
              );
            })}
          </XStack>
        ) : (
          <Swords size={18} color="#5A5A6E" />
        )}
        <Text
          fontSize={13}
          color={myMeta ? myMeta.color : "$textMuted"}
          marginLeft={2}
        >
          {formatCount(engagement.totalReactions)}
        </Text>
      </XStack>

      {/* Comment */}
      <XStack
        alignItems="center"
        gap={5}
        paddingVertical={6}
        paddingHorizontal={8}
        borderRadius={8}
        onPress={onComment}
        pressStyle={{ opacity: 0.6 }}
      >
        <MessageCircle size={18} color="#5A5A6E" />
        <Text fontSize={13} color="$textMuted">
          {formatCount(engagement.comments)}
        </Text>
      </XStack>

      {/* Share */}
      <XStack
        alignItems="center"
        gap={5}
        paddingVertical={6}
        paddingHorizontal={8}
        borderRadius={8}
        onPress={onShare}
        pressStyle={{ opacity: 0.6 }}
      >
        <Share2
          size={18}
          color={engagement.isReposted ? "#00CEC9" : "#5A5A6E"}
        />
        <Text
          fontSize={13}
          color={engagement.isReposted ? "#00CEC9" : "$textMuted"}
        >
          {formatCount(engagement.reposts)}
        </Text>
      </XStack>

      {/* Bookmark */}
      <XStack
        alignItems="center"
        gap={5}
        paddingVertical={6}
        paddingHorizontal={8}
        borderRadius={8}
        onPress={onBookmark}
        pressStyle={{ opacity: 0.6 }}
      >
        <Bookmark
          size={18}
          color={engagement.isBookmarked ? "#FDCB6E" : "#5A5A6E"}
          fill={engagement.isBookmarked ? "#FDCB6E" : "none"}
        />
      </XStack>
    </XStack>
  );
}
