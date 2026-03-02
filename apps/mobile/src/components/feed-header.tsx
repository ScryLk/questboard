import { Search } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";

export function FeedHeader() {
  return (
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
      <Stack padding={8}>
        <Search size={20} color="#5A5A6E" />
      </Stack>
    </XStack>
  );
}
