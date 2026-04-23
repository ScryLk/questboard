import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { FeedComment, ReactionType } from "@questboard/types";
import { useFeedStore } from "../../lib/feed-store";
import { CommentCard } from "./comment-card";
import { CommentInput } from "./comment-input";

const EMPTY_COMMENTS: FeedComment[] = [];

interface CommentSectionProps {
  postId: string;
  postAuthorId: string;
  totalComments: number;
  onClose: () => void;
}

export function CommentSection({
  postId,
  postAuthorId,
  totalComments,
  onClose,
}: CommentSectionProps) {
  const loadComments = useFeedStore((s) => s.loadComments);
  const commentsMap = useFeedStore((s) => s.comments);
  const comments = commentsMap[postId] ?? EMPTY_COMMENTS;
  const reactToComment = useFeedStore((s) => s.reactToComment);

  const [replyTo, setReplyTo] = useState<{
    commentId: string;
    authorName: string;
  } | null>(null);

  useEffect(() => {
    loadComments(postId);
  }, [loadComments, postId]);

  // Pinned first, then chronological
  const pinned = comments.filter((c) => c.isPinned);
  const rest = comments.filter((c) => !c.isPinned);
  const visible = [...pinned, ...rest].slice(0, 3);
  const hasMore = comments.length > 3;

  const handleReply = useCallback(
    (commentId: string) => {
      const comment = comments.find((c) => c.id === commentId);
      if (comment) {
        setReplyTo({
          commentId,
          authorName: comment.author.username,
        });
      }
    },
    [comments],
  );

  return (
    <YStack
      marginTop={12}
      paddingTop={12}
      borderTopWidth={1}
      borderTopColor="rgba(255,255,255,0.06)"
      gap={12}
    >
      {/* Header */}
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontSize={13} fontWeight="600" color="$textSecondary">
          COMENTARIOS
        </Text>
        <Stack onPress={onClose} padding={4} pressStyle={{ opacity: 0.6 }}>
          <X size={16} color="#5A5A6E" />
        </Stack>
      </XStack>

      {/* Comments */}
      {visible.length > 0 ? (
        <YStack gap={14}>
          {visible.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              postAuthorId={postAuthorId}
              onReply={handleReply}
              onReact={(commentId, type) =>
                reactToComment(commentId, postId, type)
              }
            />
          ))}
        </YStack>
      ) : (
        <Text fontSize={13} color="$textMuted" textAlign="center" paddingVertical={8}>
          Nenhum comentario ainda. Seja o primeiro!
        </Text>
      )}

      {/* See more */}
      {hasMore && (
        <Text fontSize={13} fontWeight="600" color="$accent" textAlign="center">
          Ver todos os {totalComments} comentarios
        </Text>
      )}

      {/* Input */}
      <CommentInput
        postId={postId}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </YStack>
  );
}
