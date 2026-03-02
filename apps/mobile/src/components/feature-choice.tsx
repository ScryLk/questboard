import { Stack, Text, YStack } from "tamagui";

interface FeatureChoiceOption {
  id: string;
  name: string;
  description: string;
}

interface FeatureChoiceSelectorProps {
  label: string;
  options: FeatureChoiceOption[];
  selected: string | null;
  onChange: (id: string) => void;
}

export function FeatureChoiceSelector({
  label,
  options,
  selected,
  onChange,
}: FeatureChoiceSelectorProps) {
  return (
    <YStack gap={8}>
      <Text fontSize={13} fontWeight="600" color="$textPrimary">
        {label}
      </Text>
      <YStack gap={6}>
        {options.map((option) => {
          const isSelected = selected === option.id;

          return (
            <Stack
              key={option.id}
              borderRadius={12}
              borderWidth={1}
              borderColor={isSelected ? "$accent" : "$border"}
              backgroundColor={isSelected ? "$accentMuted" : "$bgCard"}
              padding={12}
              onPress={() => onChange(option.id)}
              pressStyle={{ opacity: 0.85 }}
            >
              <Stack flexDirection="row" alignItems="center" gap={10}>
                <Stack
                  height={18}
                  width={18}
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
                <Text
                  fontSize={14}
                  fontWeight={isSelected ? "600" : "500"}
                  color={isSelected ? "$textPrimary" : "$textSecondary"}
                >
                  {option.name}
                </Text>
              </Stack>
              <Text
                fontSize={12}
                color="$textMuted"
                lineHeight={17}
                marginTop={6}
                paddingLeft={28}
                numberOfLines={3}
              >
                {option.description}
              </Text>
            </Stack>
          );
        })}
      </YStack>
    </YStack>
  );
}
