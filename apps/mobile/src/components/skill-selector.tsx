import { Check } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";

interface SkillSelectorProps {
  options: string[];
  selected: string[];
  maxCount: number;
  onChange: (skills: string[]) => void;
}

export function SkillSelector({
  options,
  selected,
  maxCount,
  onChange,
}: SkillSelectorProps) {
  function handleToggle(skill: string) {
    if (selected.includes(skill)) {
      onChange(selected.filter((s) => s !== skill));
    } else if (selected.length < maxCount) {
      onChange([...selected, skill]);
    }
  }

  return (
    <YStack gap={8}>
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize={14} fontWeight="600" color="$textPrimary">
          Escolha {maxCount} perícias
        </Text>
        <Stack
          borderRadius={9999}
          backgroundColor={
            selected.length === maxCount ? "$accentMuted" : "$bgCard"
          }
          paddingHorizontal={10}
          paddingVertical={3}
          borderWidth={1}
          borderColor={
            selected.length === maxCount ? "$accent" : "$border"
          }
        >
          <Text
            fontSize={12}
            fontWeight="600"
            color={selected.length === maxCount ? "$accent" : "$textMuted"}
          >
            {selected.length}/{maxCount}
          </Text>
        </Stack>
      </XStack>

      <YStack gap={6}>
        {options.map((skill) => {
          const isSelected = selected.includes(skill);
          const isDisabled = !isSelected && selected.length >= maxCount;

          return (
            <Stack
              key={skill}
              onPress={() => handleToggle(skill)}
              opacity={isDisabled ? 0.4 : 1}
              pressStyle={isDisabled ? undefined : { opacity: 0.7 }}
            >
              <XStack alignItems="center" gap={12} paddingVertical={8}>
                <Stack
                  height={22}
                  width={22}
                  borderRadius={6}
                  borderWidth={2}
                  borderColor={isSelected ? "$accent" : "$border"}
                  backgroundColor={isSelected ? "$accent" : "transparent"}
                  alignItems="center"
                  justifyContent="center"
                >
                  {isSelected && <Check size={14} color="white" />}
                </Stack>
                <Text
                  fontSize={14}
                  color={isSelected ? "$textPrimary" : "$textSecondary"}
                  fontWeight={isSelected ? "600" : "400"}
                >
                  {skill}
                </Text>
              </XStack>
            </Stack>
          );
        })}
      </YStack>
    </YStack>
  );
}
