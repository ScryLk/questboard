import { Users } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { CampaignRecruitPostData } from "@questboard/types";
import { SYSTEM_LABELS } from "../../lib/mock-data";

interface CampaignRecruitPostCardProps {
  data: CampaignRecruitPostData;
}

export function CampaignRecruitPostCard({ data }: CampaignRecruitPostCardProps) {
  const systemLabel = SYSTEM_LABELS[data.system] ?? data.system;
  const spotsLeft = data.maxPlayers - data.currentPlayers;

  return (
    <YStack gap={8}>
      {/* Recruit card */}
      <YStack
        borderRadius={12}
        backgroundColor="rgba(0, 206, 201, 0.08)"
        padding={14}
        gap={10}
      >
        <XStack alignItems="center" justifyContent="space-between">
          <YStack flex={1} gap={2}>
            <Text fontSize={16} fontWeight="700" color="$textPrimary">
              {data.campaignName}
            </Text>
            <Text fontSize={12} color="$textMuted">
              {systemLabel}
            </Text>
          </YStack>
          <XStack
            alignItems="center"
            gap={4}
            paddingHorizontal={8}
            paddingVertical={4}
            borderRadius={8}
            backgroundColor="rgba(0, 206, 201, 0.15)"
          >
            <Users size={14} color="#00CEC9" />
            <Text fontSize={12} fontWeight="600" color="#00CEC9">
              {data.currentPlayers}/{data.maxPlayers}
            </Text>
          </XStack>
        </XStack>

        <Text fontSize={14} color="$textSecondary" lineHeight={20}>
          {data.description}
        </Text>

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <XStack flexWrap="wrap" gap={6}>
            {data.tags.map((tag) => (
              <Stack
                key={tag}
                paddingHorizontal={8}
                paddingVertical={3}
                borderRadius={8}
                backgroundColor="rgba(0, 206, 201, 0.1)"
              >
                <Text fontSize={11} color="#00CEC9">
                  {tag}
                </Text>
              </Stack>
            ))}
          </XStack>
        )}

        {/* Join button */}
        {spotsLeft > 0 && (
          <Stack
            paddingVertical={10}
            borderRadius={10}
            backgroundColor="#00CEC9"
            alignItems="center"
            pressStyle={{ opacity: 0.8 }}
          >
            <Text fontSize={14} fontWeight="600" color="#0F0F12">
              Quero Participar ({spotsLeft} {spotsLeft === 1 ? "vaga" : "vagas"})
            </Text>
          </Stack>
        )}
      </YStack>
    </YStack>
  );
}
