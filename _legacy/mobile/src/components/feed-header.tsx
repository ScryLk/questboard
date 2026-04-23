import { useState } from "react";
import { PenSquare, Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Stack, Text, XStack, YStack } from "tamagui";
import { PostComposerModal } from "./feed/post-composer-modal";

export function FeedHeader() {
  const [composerOpen, setComposerOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal={20}
        paddingVertical={12}
      >
        <XStack alignItems="center" gap={10}>
          <YStack
            height={36}
            width={36}
            alignItems="center"
            justifyContent="center"
            borderRadius={12}
            backgroundColor="$accentMuted"
          >
            <Text fontSize={18} fontWeight="700" color="$accent">
              Q
            </Text>
          </YStack>
          <Text fontSize={20} fontWeight="700" color="$textPrimary">
            QuestBoard
          </Text>
        </XStack>
        <XStack alignItems="center" gap={4}>
          <Stack
            padding={8}
            borderRadius={10}
            onPress={() => setComposerOpen(true)}
            pressStyle={{ backgroundColor: "$border" }}
          >
            <PenSquare size={20} color="#6C5CE7" />
          </Stack>
          <Stack
            padding={8}
            borderRadius={10}
            pressStyle={{ backgroundColor: "$border" }}
            onPress={() => router.push("/search" as never)}
          >
            <Search size={20} color="#5A5A6E" />
          </Stack>
        </XStack>
      </XStack>
      <PostComposerModal
        visible={composerOpen}
        onClose={() => setComposerOpen(false)}
      />
    </>
  );
}
