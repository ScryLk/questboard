import { Sparkles } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { SessionHighlightPostData } from "@questboard/types";
import { SYSTEM_LABELS } from "../../lib/mock-data";

interface SessionHighlightPostCardProps {
  data: SessionHighlightPostData;
}

export function SessionHighlightPostCard({ data }: SessionHighlightPostCardProps) {
  const systemLabel = SYSTEM_LABELS[data.system] ?? data.system;

  return (
    <YStack gap={8}>
      {/* Highlight card */}
      <YStack
        borderRadius={12}
        backgroundColor="rgba(253, 203, 110, 0.08)"
        padding={14}
        gap={8}
      >
        <XStack alignItems="center" gap={8}>
          <Sparkles size={18} color="#FDCB6E" />
          <YStack flex={1}>
            <Text fontSize={14} fontWeight="600" color="$textPrimary" numberOfLines={1}>
              {data.sessionName}
            </Text>
            <XStack alignItems="center" gap={6}>
              {data.campaignName && (
                <Text fontSize={12} color="$textMuted" numberOfLines={1}>
                  {data.campaignName}
                </Text>
              )}
              <Text fontSize={12} color="$textMuted">
                · {systemLabel}
              </Text>
            </XStack>
          </YStack>
        </XStack>

        <Stack
          height={1}
          backgroundColor="rgba(253, 203, 110, 0.15)"
        />

        <YStack gap={4}>
          <Text fontSize={15} fontWeight="700" color="#FDCB6E">
            {data.momentTitle}
          </Text>
          <Text fontSize={14} color="$textSecondary" lineHeight={20}>
            {data.momentDescription}
          </Text>
        </YStack>
      </YStack>
    </YStack>
  );
}
