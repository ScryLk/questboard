import { Check, X } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { Campaign } from "@questboard/types";
import { SYSTEM_LABELS } from "../../lib/mock-data";
import { SYSTEM_ACCENT_COLORS } from "../../lib/campaign-mock-data";

interface PendingInviteCardProps {
  campaign: Campaign;
  gmName: string;
  onAccept: () => void;
  onDecline: () => void;
}

export function PendingInviteCard({
  campaign,
  gmName,
  onAccept,
  onDecline,
}: PendingInviteCardProps) {
  const accentColor = SYSTEM_ACCENT_COLORS[campaign.system] ?? "#6C5CE7";
  const systemLabel = SYSTEM_LABELS[campaign.system] ?? campaign.system;

  return (
    <YStack
      width={260}
      borderRadius={12}
      borderWidth={1}
      borderColor="rgba(253, 203, 110, 0.2)"
      backgroundColor="$bgCard"
      padding={14}
      gap={10}
    >
      {/* Header */}
      <YStack gap={4}>
        <XStack alignItems="center" gap={6}>
          <Stack
            height={4}
            width={20}
            borderRadius={2}
            backgroundColor={accentColor}
          />
          <Text fontSize={11} color={accentColor} fontWeight="600">
            {systemLabel}
          </Text>
        </XStack>
        <Text fontSize={15} fontWeight="600" color="$textPrimary" numberOfLines={1}>
          {campaign.name}
        </Text>
        <Text fontSize={12} color="$textMuted">
          Mestre: {gmName}
        </Text>
      </YStack>

      {/* Actions */}
      <XStack gap={8}>
        <Stack
          flex={1}
          height={36}
          borderRadius={8}
          backgroundColor="$success"
          alignItems="center"
          justifyContent="center"
          onPress={onAccept}
          pressStyle={{ opacity: 0.7 }}
        >
          <XStack alignItems="center" gap={4}>
            <Check size={14} color="white" />
            <Text fontSize={13} fontWeight="600" color="white">
              Aceitar
            </Text>
          </XStack>
        </Stack>

        <Stack
          flex={1}
          height={36}
          borderRadius={8}
          borderWidth={1}
          borderColor="$border"
          alignItems="center"
          justifyContent="center"
          onPress={onDecline}
          pressStyle={{ backgroundColor: "$border" }}
        >
          <XStack alignItems="center" gap={4}>
            <X size={14} color="#FF6B6B" />
            <Text fontSize={13} fontWeight="600" color="$textSecondary">
              Recusar
            </Text>
          </XStack>
        </Stack>
      </XStack>
    </YStack>
  );
}
