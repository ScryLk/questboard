import { Heart, Wand2, Sword, Crosshair } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { MockCharacter } from "../lib/mock-data";
import { SYSTEM_LABELS } from "../lib/mock-data";

const AVATAR_ICON_MAP: Record<string, typeof Wand2> = {
  wand: Wand2,
  sword: Sword,
  crosshair: Crosshair,
};

function getHpColor(ratio: number): string {
  if (ratio > 0.75) return "#00B894";
  if (ratio > 0.5) return "#00B894";
  if (ratio > 0.25) return "#FDCB6E";
  return "#FF6B6B";
}

export function CharacterCard({ character, onPress }: { character: MockCharacter; onPress?: () => void }) {
  const hpRatio = character.currentHp / character.maxHp;
  const hpColor = getHpColor(hpRatio);
  const systemLabel = SYSTEM_LABELS[character.system] ?? character.system;
  const AvatarIcon = AVATAR_ICON_MAP[character.avatar] ?? Sword;

  return (
    <Stack flex={1} padding={6} maxWidth="50%">
      <YStack
        borderRadius={14}
        borderWidth={1}
        borderColor="$border"
        backgroundColor="$bgCard"
        overflow="hidden"
        onPress={onPress}
      >
        {/* Avatar section */}
        <YStack
          height={100}
          alignItems="center"
          justifyContent="center"
          backgroundColor="$accentMuted"
        >
          <AvatarIcon size={40} color="#6C5CE7" strokeWidth={1.5} />
        </YStack>

        {/* Info */}
        <YStack padding={12} gap={4}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary" numberOfLines={1}>
            {character.name}
          </Text>
          <Text fontSize={12} color="$textMuted">
            {character.class} · Nv. {character.level}
          </Text>

          {/* System badge */}
          <Stack
            alignSelf="flex-start"
            borderRadius={6}
            backgroundColor="$accentMuted"
            paddingHorizontal={6}
            paddingVertical={2}
            marginTop={2}
          >
            <Text fontSize={10} fontWeight="500" color="$accent">
              {systemLabel}
            </Text>
          </Stack>

          {/* HP bar */}
          <XStack marginTop={6} alignItems="center" gap={4}>
            <Heart size={10} color="#5A5A6E" fill="#5A5A6E" />
            <Text fontSize={10} color="$textMuted">
              {character.currentHp}/{character.maxHp}
            </Text>
          </XStack>
          <Stack
            height={4}
            borderRadius={9999}
            backgroundColor="$border"
            overflow="hidden"
          >
            <Stack
              height={4}
              borderRadius={9999}
              width={`${Math.round(hpRatio * 100)}%`}
              backgroundColor={hpColor}
            />
          </Stack>
        </YStack>
      </YStack>
    </Stack>
  );
}
