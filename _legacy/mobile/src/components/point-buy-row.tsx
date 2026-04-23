import { Minus, Plus } from "lucide-react-native";
import { Stack, Text, XStack } from "tamagui";
import type { AbilityKey } from "../lib/data/dnd5e/types";
import {
  ABILITY_SHORT_LABELS,
  POINT_BUY_COSTS,
  POINT_BUY_MIN,
  POINT_BUY_MAX,
  formatModifier,
  getModifier,
} from "../lib/data/dnd5e/abilities";

interface PointBuyRowProps {
  ability: AbilityKey;
  value: number;
  racialBonus: number;
  pointsRemaining: number;
  onChange: (value: number) => void;
}

export function PointBuyRow({
  ability,
  value,
  racialBonus,
  pointsRemaining,
  onChange,
}: PointBuyRowProps) {
  const currentCost = POINT_BUY_COSTS[value] ?? 0;
  const nextCost = POINT_BUY_COSTS[value + 1] ?? 0;
  const costToIncrease = nextCost - currentCost;

  const canDecrement = value > POINT_BUY_MIN;
  const canIncrement =
    value < POINT_BUY_MAX && costToIncrease <= pointsRemaining;

  const finalValue = value + racialBonus;

  return (
    <XStack alignItems="center" gap={6} paddingVertical={6}>
      <Text
        fontSize={13}
        fontWeight="600"
        color="$textPrimary"
        width={36}
      >
        {ABILITY_SHORT_LABELS[ability]}
      </Text>

      <Stack
        height={32}
        width={32}
        borderRadius={10}
        backgroundColor={canDecrement ? "$accentMuted" : "$border"}
        alignItems="center"
        justifyContent="center"
        onPress={canDecrement ? () => onChange(value - 1) : undefined}
        opacity={canDecrement ? 1 : 0.4}
        pressStyle={canDecrement ? { opacity: 0.7 } : undefined}
      >
        <Minus size={14} color={canDecrement ? "#6C5CE7" : "#5A5A6E"} />
      </Stack>

      <Text
        fontSize={16}
        fontWeight="700"
        color="$textPrimary"
        width={28}
        textAlign="center"
      >
        {value}
      </Text>

      <Stack
        height={32}
        width={32}
        borderRadius={10}
        backgroundColor={canIncrement ? "$accentMuted" : "$border"}
        alignItems="center"
        justifyContent="center"
        onPress={canIncrement ? () => onChange(value + 1) : undefined}
        opacity={canIncrement ? 1 : 0.4}
        pressStyle={canIncrement ? { opacity: 0.7 } : undefined}
      >
        <Plus size={14} color={canIncrement ? "#6C5CE7" : "#5A5A6E"} />
      </Stack>

      <Stack
        borderRadius={6}
        backgroundColor="$border"
        paddingHorizontal={6}
        paddingVertical={2}
        minWidth={28}
        alignItems="center"
      >
        <Text fontSize={10} fontWeight="600" color="$textMuted">
          {currentCost}pt
        </Text>
      </Stack>

      {racialBonus > 0 && (
        <Text fontSize={12} fontWeight="600" color="$accent">
          +{racialBonus}
        </Text>
      )}

      <Text fontSize={11} color="$textMuted">=</Text>

      <Text
        fontSize={16}
        fontWeight="700"
        color={racialBonus > 0 ? "$accent" : "$textPrimary"}
        width={24}
        textAlign="center"
      >
        {finalValue}
      </Text>

      <Text fontSize={11} color="$textMuted" width={26} textAlign="right">
        ({formatModifier(getModifier(finalValue))})
      </Text>
    </XStack>
  );
}
