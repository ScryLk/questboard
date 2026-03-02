import { Stack, Text, XStack, YStack } from "tamagui";
import type { Race } from "../lib/data/dnd5e/types";
import { ABILITY_SHORT_LABELS } from "../lib/data/dnd5e/abilities";

interface RaceCardProps {
  race: Race;
  isSelected: boolean;
  onPress: () => void;
}

export function RaceCard({ race, isSelected, onPress }: RaceCardProps) {
  const Icon = race.icon;

  return (
    <Stack flex={1} padding={6} maxWidth="50%">
      <YStack
        borderRadius={14}
        borderWidth={1}
        borderColor={isSelected ? "$accent" : "$border"}
        backgroundColor="$bgCard"
        overflow="hidden"
        onPress={onPress}
        pressStyle={{ opacity: 0.85, scale: 0.98 }}
      >
        <YStack
          height={80}
          alignItems="center"
          justifyContent="center"
          backgroundColor={isSelected ? "$accentMuted" : "$border"}
        >
          <Icon size={36} color={isSelected ? "#6C5CE7" : "#9090A0"} />
        </YStack>
        <YStack padding={12} gap={4}>
          <Text
            fontSize={14}
            fontWeight="600"
            color="$textPrimary"
            numberOfLines={1}
          >
            {race.name}
          </Text>
          <Text
            fontSize={11}
            color="$textMuted"
            numberOfLines={2}
            lineHeight={15}
          >
            {race.tagline}
          </Text>
          <XStack gap={4} flexWrap="wrap" marginTop={4}>
            {race.abilityBonuses.map((b) => (
              <Stack
                key={b.ability}
                borderRadius={6}
                backgroundColor="$accentMuted"
                paddingHorizontal={6}
                paddingVertical={2}
              >
                <Text fontSize={10} fontWeight="600" color="$accent">
                  +{b.bonus} {ABILITY_SHORT_LABELS[b.ability]}
                </Text>
              </Stack>
            ))}
          </XStack>
        </YStack>
      </YStack>
    </Stack>
  );
}
