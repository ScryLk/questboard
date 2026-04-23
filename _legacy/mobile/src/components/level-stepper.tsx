import { Minus, Plus } from "lucide-react-native";
import { Stack, Text, XStack } from "tamagui";

interface LevelStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function LevelStepper({
  value,
  min = 1,
  max = 20,
  onChange,
}: LevelStepperProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <XStack alignItems="center" gap={16}>
      <Stack
        height={40}
        width={40}
        borderRadius={12}
        backgroundColor={canDecrement ? "$accentMuted" : "$border"}
        alignItems="center"
        justifyContent="center"
        onPress={canDecrement ? () => onChange(value - 1) : undefined}
        opacity={canDecrement ? 1 : 0.4}
        pressStyle={canDecrement ? { opacity: 0.7 } : undefined}
      >
        <Minus size={18} color={canDecrement ? "#6C5CE7" : "#5A5A6E"} />
      </Stack>

      <Text
        fontSize={20}
        fontWeight="700"
        color="$textPrimary"
        minWidth={40}
        textAlign="center"
      >
        {value}
      </Text>

      <Stack
        height={40}
        width={40}
        borderRadius={12}
        backgroundColor={canIncrement ? "$accentMuted" : "$border"}
        alignItems="center"
        justifyContent="center"
        onPress={canIncrement ? () => onChange(value + 1) : undefined}
        opacity={canIncrement ? 1 : 0.4}
        pressStyle={canIncrement ? { opacity: 0.7 } : undefined}
      >
        <Plus size={18} color={canIncrement ? "#6C5CE7" : "#5A5A6E"} />
      </Stack>
    </XStack>
  );
}
