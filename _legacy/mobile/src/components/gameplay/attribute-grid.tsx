import { memo } from "react";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { CharacterSheetAbility } from "../../lib/gameplay-store";

export const ABILITY_LABELS: Record<string, string> = {
  str: "FOR",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",
};

interface AttributeGridProps {
  abilities: Record<string, CharacterSheetAbility>;
  onPress?: (abilityKey: string) => void;
  onLongPress?: (abilityKey: string, modifier: number) => void;
}

function AttributeGridInner({
  abilities,
  onPress,
  onLongPress,
}: AttributeGridProps) {
  return (
    <XStack gap={6} paddingHorizontal={12} marginTop={10}>
      {Object.entries(abilities).map(([key, ability]) => (
        <YStack
          key={key}
          flex={1}
          backgroundColor="#1C1C24"
          borderRadius={10}
          borderWidth={1}
          borderColor={
            ability.saveProficiency ? "rgba(108,92,231,0.3)" : "#2A2A35"
          }
          paddingVertical={8}
          alignItems="center"
          gap={1}
          pressStyle={{ opacity: 0.7 }}
          onPress={onPress ? () => onPress(key) : undefined}
          onLongPress={
            onLongPress ? () => onLongPress(key, ability.modifier) : undefined
          }
        >
          <Text fontSize={10} fontWeight="700" color="#5A5A6E">
            {ABILITY_LABELS[key]}
          </Text>
          <Text fontSize={20} fontWeight="800" color="#E8E8ED">
            {ability.modifier >= 0
              ? `+${ability.modifier}`
              : ability.modifier}
          </Text>
          <Text fontSize={11} color="#5A5A6E">
            {ability.score}
          </Text>
          {ability.saveProficiency && (
            <Stack
              width={4}
              height={4}
              borderRadius={2}
              backgroundColor="#6C5CE7"
              marginTop={2}
            />
          )}
        </YStack>
      ))}
    </XStack>
  );
}

export const AttributeGrid = memo(AttributeGridInner);
