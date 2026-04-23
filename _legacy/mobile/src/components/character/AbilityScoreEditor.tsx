import { memo } from "react";
import { Minus, Plus } from "lucide-react-native";
import { Stack, Text, XStack } from "tamagui";
import { ABILITY_LABELS } from "../../lib/data/dnd5e/abilities";
import { formatModifier } from "../../lib/data/dnd5e/abilities";
import type { AbilityKey } from "../../lib/data/dnd5e/types";

interface AbilityScoreEditorProps {
  ability: AbilityKey;
  score: number;
  saveProficiency: boolean;
  onScoreChange: (value: number) => void;
  onSaveToggle: (value: boolean) => void;
}

const MIN_SCORE = 1;
const MAX_SCORE = 30;

function AbilityScoreEditorInner({
  ability,
  score,
  saveProficiency,
  onScoreChange,
  onSaveToggle,
}: AbilityScoreEditorProps) {
  const modifier = Math.floor((score - 10) / 2);
  const canDec = score > MIN_SCORE;
  const canInc = score < MAX_SCORE;

  return (
    <XStack
      backgroundColor="#1C1C24"
      borderRadius={10}
      borderWidth={1}
      borderColor="#2A2A35"
      paddingHorizontal={12}
      paddingVertical={10}
      alignItems="center"
      gap={8}
    >
      {/* Ability label */}
      <Text fontSize={13} fontWeight="700" color="#E8E8ED" width={42}>
        {ABILITY_LABELS[ability].slice(0, 3).toUpperCase()}
      </Text>

      {/* Stepper */}
      <XStack alignItems="center" gap={6} flex={1}>
        <Stack
          width={30}
          height={30}
          borderRadius={8}
          backgroundColor={canDec ? "rgba(108,92,231,0.15)" : "#1A1A24"}
          alignItems="center"
          justifyContent="center"
          pressStyle={canDec ? { opacity: 0.7 } : undefined}
          onPress={canDec ? () => onScoreChange(score - 1) : undefined}
        >
          <Minus size={14} color={canDec ? "#6C5CE7" : "#3A3A45"} />
        </Stack>

        <Text
          fontSize={18}
          fontWeight="700"
          color="#E8E8ED"
          minWidth={32}
          textAlign="center"
        >
          {score}
        </Text>

        <Stack
          width={30}
          height={30}
          borderRadius={8}
          backgroundColor={canInc ? "rgba(108,92,231,0.15)" : "#1A1A24"}
          alignItems="center"
          justifyContent="center"
          pressStyle={canInc ? { opacity: 0.7 } : undefined}
          onPress={canInc ? () => onScoreChange(score + 1) : undefined}
        >
          <Plus size={14} color={canInc ? "#6C5CE7" : "#3A3A45"} />
        </Stack>
      </XStack>

      {/* Modifier */}
      <Text fontSize={14} fontWeight="600" color="#9090A0" width={36} textAlign="center">
        {formatModifier(modifier)}
      </Text>

      {/* Save proficiency toggle */}
      <Stack
        width={30}
        height={30}
        borderRadius={8}
        borderWidth={1.5}
        borderColor={saveProficiency ? "#6C5CE7" : "#3A3A45"}
        backgroundColor={saveProficiency ? "rgba(108,92,231,0.2)" : "transparent"}
        alignItems="center"
        justifyContent="center"
        pressStyle={{ opacity: 0.7 }}
        onPress={() => onSaveToggle(!saveProficiency)}
      >
        <Text fontSize={9} fontWeight="700" color={saveProficiency ? "#6C5CE7" : "#5A5A6E"}>
          SLV
        </Text>
      </Stack>
    </XStack>
  );
}

export const AbilityScoreEditor = memo(AbilityScoreEditorInner);
