import { Stack, Text, XStack, YStack } from "tamagui";
import { DND_ALIGNMENTS } from "../lib/mock-data";

interface AlignmentGridProps {
  selected: string | null;
  onSelect: (key: string) => void;
}

export function AlignmentGrid({ selected, onSelect }: AlignmentGridProps) {
  return (
    <YStack gap={6}>
      {[0, 1, 2].map((row) => (
        <XStack key={row} gap={6}>
          {[0, 1, 2].map((col) => {
            const alignment = DND_ALIGNMENTS[row * 3 + col];
            const isSelected = selected === alignment.key;

            return (
              <Stack
                key={alignment.key}
                flex={1}
                height={52}
                borderRadius={10}
                borderWidth={1}
                borderColor={isSelected ? "$accent" : "$border"}
                backgroundColor={isSelected ? "$accentMuted" : "$bgCard"}
                alignItems="center"
                justifyContent="center"
                onPress={() => onSelect(alignment.key)}
                pressStyle={{ opacity: 0.8 }}
              >
                <Text
                  fontSize={13}
                  fontWeight={isSelected ? "700" : "500"}
                  color={isSelected ? "$accent" : "$textSecondary"}
                  textAlign="center"
                >
                  {alignment.short}
                </Text>
                <Text
                  fontSize={8}
                  color="$textMuted"
                  textAlign="center"
                  marginTop={1}
                  numberOfLines={1}
                >
                  {alignment.label}
                </Text>
              </Stack>
            );
          })}
        </XStack>
      ))}
    </YStack>
  );
}
