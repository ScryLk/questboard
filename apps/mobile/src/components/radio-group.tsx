import { Stack, Text, XStack, YStack } from "tamagui";

interface RadioOption {
  key: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  selected: string;
  onChange: (key: string) => void;
}

export function RadioGroup({ options, selected, onChange }: RadioGroupProps) {
  return (
    <YStack gap={8}>
      {options.map((option) => {
        const isSelected = option.key === selected;
        return (
          <XStack
            key={option.key}
            borderRadius={12}
            borderWidth={1}
            borderColor={isSelected ? "$accent" : "$border"}
            backgroundColor={isSelected ? "$accentMuted" : "$bgCard"}
            padding={14}
            alignItems="center"
            gap={12}
            onPress={() => onChange(option.key)}
            pressStyle={{ opacity: 0.85 }}
          >
            {/* Radio indicator */}
            <Stack
              height={20}
              width={20}
              borderRadius={9999}
              borderWidth={2}
              borderColor={isSelected ? "$accent" : "$border"}
              alignItems="center"
              justifyContent="center"
            >
              {isSelected && (
                <Stack
                  height={10}
                  width={10}
                  borderRadius={9999}
                  backgroundColor="$accent"
                />
              )}
            </Stack>

            <YStack flex={1}>
              <Text
                fontSize={14}
                fontWeight="600"
                color={isSelected ? "$textPrimary" : "$textSecondary"}
              >
                {option.label}
              </Text>
              {option.description && (
                <Text fontSize={12} color="$textMuted" marginTop={2}>
                  {option.description}
                </Text>
              )}
            </YStack>
          </XStack>
        );
      })}
    </YStack>
  );
}
