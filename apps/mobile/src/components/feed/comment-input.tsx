import { useCallback, useState } from "react";
import { TextInput } from "react-native";
import { Send, X } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useFeedStore } from "../../lib/feed-store";

interface CommentInputProps {
  postId: string;
  replyTo?: { commentId: string; authorName: string } | null;
  onCancelReply?: () => void;
}

export function CommentInput({
  postId,
  replyTo,
  onCancelReply,
}: CommentInputProps) {
  const [text, setText] = useState("");
  const addComment = useFeedStore((s) => s.addComment);

  const canSend = text.trim().length > 0;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    addComment(postId, text.trim(), replyTo?.commentId);
    setText("");
    onCancelReply?.();
  }, [canSend, addComment, postId, text, replyTo, onCancelReply]);

  return (
    <YStack
      borderTopWidth={1}
      borderTopColor="rgba(255,255,255,0.06)"
      paddingTop={10}
    >
      {/* Reply context */}
      {replyTo && (
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal={4}
          paddingBottom={8}
        >
          <Text fontSize={12} color="$textMuted">
            Respondendo a{" "}
            <Text fontSize={12} color="$accent" fontWeight="600">
              @{replyTo.authorName}
            </Text>
          </Text>
          <Stack onPress={onCancelReply} padding={2}>
            <X size={14} color="#5A5A6E" />
          </Stack>
        </XStack>
      )}

      {/* Input row */}
      <XStack alignItems="center" gap={8}>
        {/* Avatar */}
        <Stack
          height={28}
          width={28}
          borderRadius={14}
          backgroundColor="#2A2A35"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={10} fontWeight="700" color="$accent">
            VC
          </Text>
        </Stack>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={
            replyTo ? "Escreva uma resposta..." : "Escreva um comentario..."
          }
          placeholderTextColor="#3A3A4E"
          maxLength={1000}
          multiline
          style={{
            flex: 1,
            color: "#E8E8ED",
            fontSize: 14,
            lineHeight: 20,
            maxHeight: 80,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: "#15151C",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#2A2A35",
          }}
        />

        <Stack
          onPress={canSend ? handleSend : undefined}
          padding={6}
          borderRadius={8}
          pressStyle={canSend ? { opacity: 0.6 } : undefined}
        >
          <Send size={18} color={canSend ? "#6C5CE7" : "#3A3A4E"} />
        </Stack>
      </XStack>
    </YStack>
  );
}
