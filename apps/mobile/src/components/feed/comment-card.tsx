import { Pin } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { FeedComment, ReactionType } from "@questboard/types";
import { CommentBadge } from "@questboard/types";
import { REACTION_MAP } from "../../lib/feed-constants";

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
  return `${days}d`;
}

interface CommentCardProps {
  comment: FeedComment;
  postAuthorId: string;
  onReply?: (commentId: string) => void;
  onReact?: (commentId: string, type: ReactionType | null) => void;
  depth?: number;
}

export function CommentCard({
  comment,
  postAuthorId,
  onReply,
  onReact,
  depth = 0,
}: CommentCardProps) {
  const badge = comment.badge ?? (comment.author.id === postAuthorId ? CommentBadge.AUTHOR : null);
  const topReactions = comment.reactions
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <YStack gap={8} marginLeft={depth > 0 ? 40 : 0}>
      {/* Pinned label */}
      {comment.isPinned && depth === 0 && (
        <XStack alignItems="center" gap={4}>
          <Pin size={12} color="#FDCB6E" />
          <Text fontSize={11} fontWeight="600" color="#FDCB6E">
            Fixado
          </Text>
        </XStack>
      )}

      <XStack gap={8}>
        {/* Avatar */}
        <Stack
          height={32}
          width={32}
          borderRadius={16}
          backgroundColor="#2A2A35"
          alignItems="center"
          justifyContent="center"
          marginTop={2}
        >
          <Text fontSize={12} fontWeight="700" color="$accent">
            {getInitials(comment.author.displayName)}
          </Text>
        </Stack>

        <YStack flex={1} gap={4}>
          {/* Header */}
          <XStack alignItems="center" gap={6} flexWrap="wrap">
            <Text fontSize={13} fontWeight="600" color="$textPrimary">
              {comment.author.displayName}
            </Text>
            {badge === CommentBadge.AUTHOR && (
              <Stack
                paddingHorizontal={6}
                paddingVertical={1}
                borderRadius={6}
                backgroundColor="rgba(108, 92, 231, 0.15)"
              >
                <Text fontSize={10} fontWeight="600" color="#6C5CE7">
                  Autor
                </Text>
              </Stack>
            )}
            {badge === CommentBadge.GM && (
              <Stack
                paddingHorizontal={6}
                paddingVertical={1}
                borderRadius={6}
                backgroundColor="rgba(253, 203, 110, 0.15)"
              >
                <Text fontSize={10} fontWeight="600" color="#FDCB6E">
                  Mestre
                </Text>
              </Stack>
            )}
            <Text fontSize={11} color="$textMuted">
              {formatTimeAgo(comment.createdAt)}
            </Text>
          </XStack>

          {/* Content */}
          <Text fontSize={14} color="$textPrimary" lineHeight={20}>
            {comment.content}
          </Text>

          {/* Bottom row: reactions + reply */}
          <XStack alignItems="center" gap={12} marginTop={2}>
            {topReactions.length > 0 && (
              <XStack alignItems="center" gap={4}>
                {topReactions.map((r) => {
                  const RIcon = REACTION_MAP[r.type].icon;
                  return (
                    <XStack key={r.type} alignItems="center" gap={2}>
                      <RIcon size={12} color={REACTION_MAP[r.type].color} />
                      <Text fontSize={11} color="$textMuted">
                        {r.count}
                      </Text>
                    </XStack>
                  );
                })}
              </XStack>
            )}
            {depth === 0 && onReply && (
              <Text
                fontSize={12}
                fontWeight="600"
                color="$accent"
                onPress={() => onReply(comment.id)}
              >
                Responder
              </Text>
            )}
          </XStack>

          {/* Replies */}
          {depth === 0 && comment.replies.length > 0 && (
            <YStack gap={10} marginTop={6}>
              {comment.replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  postAuthorId={postAuthorId}
                  depth={1}
                />
              ))}
            </YStack>
          )}
        </YStack>
      </XStack>
    </YStack>
  );
}
