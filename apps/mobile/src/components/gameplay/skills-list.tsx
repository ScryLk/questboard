import { memo } from "react";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { CharacterSheetSkill } from "../../lib/gameplay-store";

interface SkillsListProps {
  skills: CharacterSheetSkill[];
  onPress?: (skillName: string) => void;
  onLongPress?: (skillName: string, modifier: number) => void;
}

function SkillRow({
  skill,
  onPress,
  onLongPress,
}: {
  skill: CharacterSheetSkill;
  onPress?: (name: string) => void;
  onLongPress?: (name: string, modifier: number) => void;
}) {
  return (
    <XStack
      height={28}
      paddingHorizontal={4}
      alignItems="center"
      justifyContent="space-between"
      pressStyle={{ opacity: 0.7 }}
      onPress={onPress ? () => onPress(skill.name) : undefined}
      onLongPress={
        onLongPress
          ? () => onLongPress(skill.name, skill.modifier)
          : undefined
      }
    >
      <XStack alignItems="center" gap={4} flex={1}>
        {skill.proficient && (
          <Stack
            width={4}
            height={4}
            borderRadius={2}
            backgroundColor="#6C5CE7"
          />
        )}
        <Text
          fontSize={12}
          color={skill.proficient ? "#E8E8ED" : "#7A7A8E"}
          numberOfLines={1}
          flexShrink={1}
        >
          {skill.name}
        </Text>
      </XStack>
      <Text fontSize={12} fontWeight="600" color="#6C5CE7">
        {skill.modifier >= 0 ? `+${skill.modifier}` : skill.modifier}
      </Text>
    </XStack>
  );
}

function SkillsListInner({ skills, onPress, onLongPress }: SkillsListProps) {
  const mid = Math.ceil(skills.length / 2);
  const col1 = skills.slice(0, mid);
  const col2 = skills.slice(mid);

  return (
    <XStack gap={8} paddingHorizontal={12} marginTop={10}>
      <YStack flex={1}>
        {col1.map((skill) => (
          <SkillRow
            key={skill.name}
            skill={skill}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        ))}
      </YStack>
      <YStack flex={1}>
        {col2.map((skill) => (
          <SkillRow
            key={skill.name}
            skill={skill}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        ))}
      </YStack>
    </XStack>
  );
}

export const SkillsList = memo(SkillsListInner);
