import { Dice5 } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { DiceRollPostData } from "@questboard/types";

interface DiceRollPostCardProps {
  data: DiceRollPostData;
}

export function DiceRollPostCard({ data }: DiceRollPostCardProps) {
  const bgColor = data.isNat20
    ? "rgba(108, 92, 231, 0.15)"
    : data.isNat1
      ? "rgba(255, 107, 107, 0.15)"
      : "rgba(255, 255, 255, 0.04)";

  const accentColor = data.isNat20
    ? "#6C5CE7"
    : data.isNat1
      ? "#FF6B6B"
      : "#FDCB6E";

  return (
    <YStack gap={8}>
      {/* Dice result card */}
      <YStack
        borderRadius={12}
        backgroundColor={bgColor}
        padding={14}
        gap={8}
      >
        <XStack alignItems="center" gap={8}>
          <Dice5 size={20} color={accentColor} />
          {data.label && (
            <Text fontSize={14} fontWeight="600" color="$textPrimary">
              {data.label}
            </Text>
          )}
          <Stack flex={1} />
          <Text fontSize={12} color="$textMuted">
            {data.formula}
          </Text>
        </XStack>

        <XStack alignItems="baseline" gap={4}>
          <Text fontSize={32} fontWeight="800" color={accentColor}>
            {data.total}
          </Text>
          {data.isNat20 && (
            <Text fontSize={14} fontWeight="700" color="#6C5CE7">
              NAT 20!
            </Text>
          )}
          {data.isNat1 && (
            <Text fontSize={14} fontWeight="700" color="#FF6B6B">
              NAT 1!
            </Text>
          )}
        </XStack>
      </YStack>

      {/* Context */}
      {data.context && (
        <Text fontSize={14} color="$textSecondary" lineHeight={20}>
          {data.context}
        </Text>
      )}
    </YStack>
  );
}
