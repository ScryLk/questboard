import { useState } from "react";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { AbilityKey } from "../lib/data/dnd5e/types";
import {
  ABILITY_LABELS,
  ABILITY_ORDER,
  STANDARD_ARRAY,
  formatModifier,
  getModifier,
} from "../lib/data/dnd5e/abilities";

interface StandardArrayAssignerProps {
  assignment: Record<AbilityKey, number | null>;
  racialBonuses: Record<AbilityKey, number>;
  onChange: (assignment: Record<AbilityKey, number | null>) => void;
}

export function StandardArrayAssigner({
  assignment,
  racialBonuses,
  onChange,
}: StandardArrayAssignerProps) {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const assignedValues = new Set(
    Object.values(assignment).filter((v): v is number => v !== null),
  );

  function handleValuePress(value: number) {
    if (assignedValues.has(value) && selectedValue !== value) return;
    setSelectedValue(selectedValue === value ? null : value);
  }

  function handleSlotPress(ability: AbilityKey) {
    if (selectedValue !== null) {
      // Assign selected value to this slot
      const newAssignment = { ...assignment };
      // Unassign from any other slot that had this value
      for (const key of ABILITY_ORDER) {
        if (newAssignment[key] === selectedValue) {
          newAssignment[key] = null;
        }
      }
      newAssignment[ability] = selectedValue;
      setSelectedValue(null);
      onChange(newAssignment);
    } else if (assignment[ability] !== null) {
      // Unassign this slot
      const newAssignment = { ...assignment };
      newAssignment[ability] = null;
      onChange(newAssignment);
    }
  }

  return (
    <YStack gap={16}>
      {/* Available values */}
      <YStack gap={8}>
        <Text fontSize={13} fontWeight="600" color="$textPrimary">
          Valores disponíveis
        </Text>
        <XStack gap={8} justifyContent="center">
          {STANDARD_ARRAY.map((value) => {
            const isAssigned = assignedValues.has(value);
            const isSelected = selectedValue === value;

            return (
              <Stack
                key={value}
                height={44}
                width={44}
                borderRadius={12}
                backgroundColor={
                  isSelected
                    ? "$accent"
                    : isAssigned
                      ? "$border"
                      : "$accentMuted"
                }
                borderWidth={isSelected ? 2 : 1}
                borderColor={
                  isSelected
                    ? "$accent"
                    : isAssigned
                      ? "$border"
                      : "$accent"
                }
                alignItems="center"
                justifyContent="center"
                opacity={isAssigned && !isSelected ? 0.4 : 1}
                onPress={() => handleValuePress(value)}
                pressStyle={
                  isAssigned && !isSelected
                    ? undefined
                    : { opacity: 0.7, scale: 0.95 }
                }
              >
                <Text
                  fontSize={16}
                  fontWeight="700"
                  color={isSelected ? "white" : isAssigned ? "$textMuted" : "$accent"}
                >
                  {value}
                </Text>
              </Stack>
            );
          })}
        </XStack>
      </YStack>

      {/* Ability slots */}
      <YStack gap={6}>
        {[0, 1, 2].map((row) => (
          <XStack key={row} gap={8}>
            {[0, 1].map((col) => {
              const ability = ABILITY_ORDER[row * 2 + col];
              const value = assignment[ability];
              const bonus = racialBonuses[ability];
              const finalValue = value !== null ? value + bonus : null;

              return (
                <Stack
                  key={ability}
                  flex={1}
                  height={64}
                  borderRadius={12}
                  borderWidth={1}
                  borderColor={
                    selectedValue !== null && value === null
                      ? "$accent"
                      : value !== null
                        ? "$accent"
                        : "$border"
                  }
                  backgroundColor={
                    value !== null ? "$accentMuted" : "$bgCard"
                  }
                  paddingHorizontal={12}
                  paddingVertical={8}
                  justifyContent="center"
                  onPress={() => handleSlotPress(ability)}
                  pressStyle={{ opacity: 0.85 }}
                >
                  <Text fontSize={12} color="$textMuted">
                    {ABILITY_LABELS[ability]}
                  </Text>
                  <XStack alignItems="baseline" gap={4}>
                    <Text
                      fontSize={20}
                      fontWeight="700"
                      color={
                        value !== null ? "$textPrimary" : "$textMuted"
                      }
                    >
                      {value !== null ? value : "—"}
                    </Text>
                    {value !== null && bonus > 0 && (
                      <Text fontSize={12} fontWeight="600" color="$accent">
                        +{bonus}={finalValue}
                      </Text>
                    )}
                    {finalValue !== null && (
                      <Text fontSize={11} color="$textMuted">
                        ({formatModifier(getModifier(finalValue))})
                      </Text>
                    )}
                  </XStack>
                </Stack>
              );
            })}
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
