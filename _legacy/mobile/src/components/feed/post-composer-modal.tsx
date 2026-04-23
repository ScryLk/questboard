import { useState } from "react";
import { Modal, TextInput, Keyboard } from "react-native";
import { X } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { PostType, PostVisibility } from "@questboard/types";
import type { TextFeedPost } from "@questboard/types";
import { useFeedStore } from "../../lib/feed-store";

interface PostComposerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PostComposerModal({ visible, onClose }: PostComposerModalProps) {
  const [text, setText] = useState("");
  const addPost = useFeedStore((s) => s.addPost);

  const canPublish = text.trim().length > 0;

  function handlePublish() {
    if (!canPublish) return;
    Keyboard.dismiss();

    const post: TextFeedPost = {
      id: `post-${Date.now()}`,
      type: PostType.TEXT,
      visibility: PostVisibility.PUBLIC,
      author: {
        id: "me",
        displayName: "Voce",
        username: "voce",
        avatarUrl: null,
      },
      data: {
        body: text.trim(),
      },
      engagement: {
        reactions: [],
        totalReactions: 0,
        comments: 0,
        reposts: 0,
        bookmarks: 0,
        myReaction: null,
        isBookmarked: false,
        isReposted: false,
      },
      createdAt: new Date().toISOString(),
    };

    addPost(post);
    setText("");
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <YStack flex={1} justifyContent="flex-end">
        <Stack
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          right={0}
          backgroundColor="rgba(0,0,0,0.5)"
          onPress={onClose}
        />
        <YStack
          borderTopLeftRadius={24}
          borderTopRightRadius={24}
          borderTopWidth={1}
          borderTopColor="$border"
          backgroundColor="$bgCard"
          paddingBottom={40}
          minHeight={300}
        >
          {/* Handle */}
          <YStack alignItems="center" paddingVertical={12}>
            <Stack
              height={4}
              width={40}
              borderRadius={9999}
              backgroundColor="$border"
            />
          </YStack>

          {/* Header */}
          <XStack
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal={20}
            paddingBottom={16}
          >
            <Stack onPress={onClose} padding={4} pressStyle={{ opacity: 0.6 }}>
              <X size={22} color="#E8E8ED" />
            </Stack>
            <Text fontSize={18} fontWeight="600" color="$textPrimary">
              Nova Publicacao
            </Text>
            <Stack
              paddingHorizontal={16}
              paddingVertical={8}
              borderRadius={10}
              backgroundColor={canPublish ? "$accent" : "rgba(108, 92, 231, 0.3)"}
              onPress={canPublish ? handlePublish : undefined}
              pressStyle={canPublish ? { opacity: 0.8 } : undefined}
            >
              <Text
                fontSize={14}
                fontWeight="600"
                color={canPublish ? "white" : "rgba(255,255,255,0.4)"}
              >
                Publicar
              </Text>
            </Stack>
          </XStack>

          {/* Text input */}
          <YStack paddingHorizontal={20} flex={1}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="O que esta acontecendo nas suas aventuras?"
              placeholderTextColor="#3A3A4E"
              multiline
              autoFocus
              maxLength={500}
              style={{
                color: "#E8E8ED",
                fontSize: 16,
                lineHeight: 24,
                minHeight: 120,
                textAlignVertical: "top",
              }}
            />
            <Text
              fontSize={12}
              color="$textMuted"
              textAlign="right"
              marginTop={8}
            >
              {text.length}/500
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </Modal>
  );
}
