import { memo } from "react";
import { Stack, Text, XStack } from "tamagui";
import { ABILITY_SHORT_LABELS, formatModifier } from "../../lib/data/dnd5e/abilities";
import type { AbilityKey } from "../../lib/data/dnd5e/types";
import type { SkillProficiency } from "../../lib/character-types";

interface SkillEditRowProps {
  name: string;
  ability: AbilityKey;
  proficiency: SkillProficiency;
  modifier: number;
  onProficiencyChange: (p: SkillProficiency) => void;
}

const PROFICIENCY_CYCLE: Record<SkillProficiency, SkillProficiency> = {
  none: "proficient",
  proficient: "expertise",
  expertise: "none",
};

function getProfDotStyle(proficiency: SkillProficiency) {
  switch (proficiency) {
    case "proficient":
      return { bg: "#6C5CE7", border: "#6C5CE7" };
    case "expertise":
      return { bg: "#00B894", border: "#00B894" };
    default:
      return { bg: "transparent", border: "#3A3A45" };
  }
}

function SkillEditRowInner({
  name,
  ability,
  proficiency,
  modifier,
  onProficiencyChange,
}: SkillEditRowProps) {
  const dotStyle = getProfDotStyle(proficiency);

  return (
    <XStack
      paddingHorizontal={16}
      paddingVertical={8}
      alignItems="center"
      gap={10}
      pressStyle={{ opacity: 0.7 }}
      onPress={() => onProficiencyChange(PROFICIENCY_CYCLE[proficiency])}
    >
      {/* Proficiency dot */}
      <Stack
        width={14}
        height={14}
        borderRadius={7}
        borderWidth={2}
        borderColor={dotStyle.border}
        backgroundColor={dotStyle.bg}
      />

      {/* Skill name */}
      <Text flex={1} fontSize={13} color="#E8E8ED">
        {name}
      </Text>

      {/* Ability tag */}
      <Text fontSize={10} color="#5A5A6E">
        {ABILITY_SHORT_LABELS[ability]}
      </Text>

      {/* Modifier */}
      <Text
        fontSize={13}
        fontWeight="700"
        color={modifier >= 0 ? "#00B894" : "#FF6B6B"}
        width={32}
        textAlign="right"
      >
        {formatModifier(modifier)}
      </Text>
    </XStack>
  );
}

export const SkillEditRow = memo(SkillEditRowInner);
