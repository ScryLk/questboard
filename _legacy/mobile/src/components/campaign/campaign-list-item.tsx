import { Crown, ChevronRight } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { Campaign } from "@questboard/types";
import { SYSTEM_LABELS } from "../../lib/mock-data";
import { SYSTEM_ACCENT_COLORS } from "../../lib/campaign-mock-data";

interface CampaignListItemProps {
  campaign: Campaign;
  role: "gm" | "player";
  nextSessionLabel?: string | null;
  isLive?: boolean;
  characterName?: string | null;
  onPress: () => void;
  onLivePress?: () => void;
}

export function CampaignListItem({
  campaign,
  role,
  nextSessionLabel,
  isLive,
  characterName,
  onPress,
  onLivePress,
}: CampaignListItemProps) {
  const accentColor = SYSTEM_ACCENT_COLORS[campaign.system] ?? "#6C5CE7";
  const systemLabel = SYSTEM_LABELS[campaign.system] ?? campaign.system;

  return (
    <Stack onPress={onPress} marginHorizontal={16} marginBottom={12}>
      <XStack
        overflow="hidden"
        borderRadius={12}
        borderWidth={1}
        borderColor={isLive ? "rgba(0, 184, 148, 0.3)" : "$border"}
        backgroundColor="$bgCard"
      >
        {/* Color strip */}
        <YStack backgroundColor={accentColor} width={6} />

        {/* Content */}
        <YStack flex={1} padding={14} gap={6}>
          {/* Title row */}
          <XStack alignItems="center" justifyContent="space-between">
            <XStack flex={1} alignItems="center" gap={8}>
              <Text
                flex={1}
                fontSize={16}
                fontWeight="600"
                color="$textPrimary"
                numberOfLines={1}
              >
                {campaign.name}
              </Text>
              {role === "gm" && (
                <XStack
                  alignItems="center"
                  gap={3}
                  borderRadius={6}
                  backgroundColor="rgba(108, 92, 231, 0.15)"
                  paddingHorizontal={6}
                  paddingVertical={2}
                >
                  <Crown size={10} color="#6C5CE7" />
                  <Text fontSize={10} fontWeight="600" color="$accent">
                    Mestre
                  </Text>
                </XStack>
              )}
            </XStack>

            {isLive && (
              <XStack
                alignItems="center"
                gap={4}
                borderRadius={9999}
                backgroundColor="$successMuted"
                paddingHorizontal={8}
                paddingVertical={3}
              >
                <Stack
                  height={6}
                  width={6}
                  borderRadius={9999}
                  backgroundColor="$success"
                />
                <Text fontSize={10} fontWeight="600" color="$success">
                  AO VIVO
                </Text>
              </XStack>
            )}
          </XStack>

          {/* Meta row */}
          <XStack alignItems="center" gap={8}>
            <Text fontSize={12} color={accentColor}>
              {systemLabel}
            </Text>
            {characterName && (
              <Text fontSize={12} color="$textMuted" numberOfLines={1}>
                {characterName}
              </Text>
            )}
          </XStack>

          {/* Bottom row */}
          <XStack alignItems="center" justifyContent="space-between" marginTop={2}>
            {nextSessionLabel ? (
              <Text fontSize={12} color="$textSecondary">
                {nextSessionLabel}
              </Text>
            ) : (
              <Stack />
            )}

            {isLive && onLivePress && (
              <Stack
                onPress={(e) => {
                  e.stopPropagation();
                  onLivePress();
                }}
                borderRadius={8}
                backgroundColor="$success"
                paddingHorizontal={12}
                paddingVertical={6}
              >
                <Text fontSize={12} fontWeight="600" color="white">
                  Entrar na Sessão
                </Text>
              </Stack>
            )}

            {!isLive && (
              <ChevronRight size={16} color="#5A5A6E" />
            )}
          </XStack>
        </YStack>
      </XStack>
    </Stack>
  );
}
