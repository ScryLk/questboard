import { Shield } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { CharacterCardPostData } from "@questboard/types";
import { SYSTEM_LABELS } from "../../lib/mock-data";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

interface CharacterCardPostCardProps {
  data: CharacterCardPostData;
}

export function CharacterCardPostCard({ data }: CharacterCardPostCardProps) {
  const systemLabel = SYSTEM_LABELS[data.system] ?? data.system;

  return (
    <YStack gap={8}>
      {/* Character card */}
      <XStack
        borderRadius={12}
        backgroundColor="rgba(0, 184, 148, 0.08)"
        padding={14}
        gap={12}
        alignItems="center"
      >
        {/* Avatar */}
        <Stack
          height={56}
          width={56}
          borderRadius={16}
          backgroundColor="rgba(0, 184, 148, 0.2)"
          alignItems="center"
          justifyContent="center"
        >
          {data.avatarUrl ? (
            <Shield size={24} color="#00B894" />
          ) : (
            <Text fontSize={18} fontWeight="700" color="#00B894">
              {getInitials(data.characterName)}
            </Text>
          )}
        </Stack>

        <YStack flex={1} gap={2}>
          <Text fontSize={16} fontWeight="700" color="$textPrimary">
            {data.characterName}
          </Text>
          <XStack alignItems="center" gap={6}>
            {data.characterRace && (
              <Text fontSize={13} color="$textSecondary">
                {data.characterRace}
              </Text>
            )}
            {data.characterClass && (
              <>
                <Text fontSize={13} color="$textMuted">·</Text>
                <Text fontSize={13} color="$textSecondary">
                  {data.characterClass}
                </Text>
              </>
            )}
          </XStack>
          <XStack alignItems="center" gap={8} marginTop={2}>
            <Stack
              paddingHorizontal={6}
              paddingVertical={2}
              borderRadius={6}
              backgroundColor="rgba(0, 184, 148, 0.15)"
            >
              <Text fontSize={11} fontWeight="600" color="#00B894">
                Nv. {data.characterLevel}
              </Text>
            </Stack>
            <Text fontSize={11} color="$textMuted">
              {systemLabel}
            </Text>
          </XStack>
        </YStack>
      </XStack>

      {/* Caption */}
      {data.caption && (
        <Text fontSize={14} color="$textSecondary" lineHeight={20}>
          {data.caption}
        </Text>
      )}
    </YStack>
  );
}
