import { Castle, Users } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { SYSTEM_LABELS, CAMPAIGN_TYPES } from "../lib/mock-data";

interface SessionPreviewCardProps {
  name: string;
  system: string;
  campaignType: string;
  maxPlayers: number;
  visibility: string;
  tags: string[];
  description?: string;
}

export function SessionPreviewCard({
  name,
  system,
  campaignType,
  maxPlayers,
  visibility,
  tags,
  description,
}: SessionPreviewCardProps) {
  const systemLabel = SYSTEM_LABELS[system] ?? system;
  const typeLabel =
    CAMPAIGN_TYPES.find((t) => t.key === campaignType)?.label ?? campaignType;

  return (
    <YStack
      borderRadius={14}
      backgroundColor="$bgCard"
      borderWidth={1}
      borderColor="$border"
      overflow="hidden"
    >
      {/* Header accent */}
      <Stack height={4} backgroundColor="$accent" />

      <YStack padding={16} gap={12}>
        {/* Title row */}
        <XStack alignItems="center" gap={10}>
          <Stack
            height={44}
            width={44}
            borderRadius={12}
            backgroundColor="$accentMuted"
            alignItems="center"
            justifyContent="center"
          >
            <Castle size={22} color="#6C5CE7" />
          </Stack>
          <YStack flex={1}>
            <Text fontSize={16} fontWeight="700" color="$textPrimary">
              {name || "Sem nome"}
            </Text>
            <Text fontSize={12} color="$textMuted">
              {systemLabel}
            </Text>
          </YStack>
        </XStack>

        {/* Info pills */}
        <XStack gap={8} flexWrap="wrap">
          <Stack
            borderRadius={9999}
            backgroundColor="$accentMuted"
            paddingHorizontal={10}
            paddingVertical={3}
          >
            <Text fontSize={11} fontWeight="600" color="$accent">
              {typeLabel}
            </Text>
          </Stack>

          <XStack
            borderRadius={9999}
            backgroundColor="$accentMuted"
            paddingHorizontal={10}
            paddingVertical={3}
            alignItems="center"
            gap={4}
          >
            <Users size={11} color="#6C5CE7" />
            <Text fontSize={11} fontWeight="600" color="$accent">
              {maxPlayers} jogadores
            </Text>
          </XStack>

          <Stack
            borderRadius={9999}
            paddingHorizontal={10}
            paddingVertical={3}
            backgroundColor={visibility === "public" ? "rgba(0,184,148,0.1)" : "$accentMuted"}
          >
            <Text
              fontSize={11}
              fontWeight="600"
              color={visibility === "public" ? "$success" : "$accent"}
            >
              {visibility === "public" ? "Pública" : "Privada"}
            </Text>
          </Stack>
        </XStack>

        {/* Description */}
        {description ? (
          <Text fontSize={13} color="$textSecondary" lineHeight={18}>
            {description}
          </Text>
        ) : null}

        {/* Tags */}
        {tags.length > 0 && (
          <XStack gap={6} flexWrap="wrap">
            {tags.map((tag) => (
              <Stack
                key={tag}
                borderRadius={9999}
                borderWidth={1}
                borderColor="$border"
                paddingHorizontal={8}
                paddingVertical={2}
              >
                <Text fontSize={11} color="$textMuted">
                  {tag}
                </Text>
              </Stack>
            ))}
          </XStack>
        )}
      </YStack>
    </YStack>
  );
}
