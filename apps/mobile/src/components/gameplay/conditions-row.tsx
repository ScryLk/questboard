import { memo, useState } from "react";
import { CirclePlus } from "lucide-react-native";
import { Stack, XStack, YStack } from "tamagui";
import { ConditionBadges, ConditionSelector } from "./condition-selector";

interface ConditionsRowProps {
  conditions: string[];
  editable: boolean;
  onToggle: (conditionId: string) => void;
  onRemove: (conditionId: string) => void;
}

function ConditionsRowInner({
  conditions,
  editable,
  onToggle,
  onRemove,
}: ConditionsRowProps) {
  const [selectorOpen, setSelectorOpen] = useState(false);

  // Nothing to show if not editable and no conditions
  if (!editable && conditions.length === 0) return null;

  return (
    <YStack>
      {/* Conditions badges + add button */}
      {(conditions.length > 0 || (editable && selectorOpen)) && (
        <XStack
          paddingHorizontal={16}
          marginTop={4}
          gap={4}
          alignItems="center"
          flexWrap="wrap"
        >
          <ConditionBadges
            conditions={conditions}
            onRemove={editable ? onRemove : undefined}
            editable={editable}
          />
          {editable && (
            <Stack
              width={22}
              height={22}
              borderRadius={11}
              backgroundColor="#1C1C24"
              borderWidth={1}
              borderColor="#2A2A35"
              alignItems="center"
              justifyContent="center"
              pressStyle={{ opacity: 0.6 }}
              onPress={() => setSelectorOpen(!selectorOpen)}
            >
              <CirclePlus size={12} color="#6C5CE7" />
            </Stack>
          )}
        </XStack>
      )}

      {/* "+" button when no conditions and editable */}
      {conditions.length === 0 && editable && !selectorOpen && (
        <XStack paddingHorizontal={16} marginTop={4}>
          <Stack
            width={22}
            height={22}
            borderRadius={11}
            backgroundColor="#1C1C24"
            borderWidth={1}
            borderColor="#2A2A35"
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.6 }}
            onPress={() => setSelectorOpen(true)}
          >
            <CirclePlus size={12} color="#6C5CE7" />
          </Stack>
        </XStack>
      )}

      {/* Condition selector (expanded inline) */}
      {selectorOpen && editable && (
        <YStack paddingHorizontal={16} marginTop={4}>
          <ConditionSelector
            currentConditions={conditions}
            onToggle={onToggle}
          />
        </YStack>
      )}
    </YStack>
  );
}

export const ConditionsRow = memo(ConditionsRowInner);
