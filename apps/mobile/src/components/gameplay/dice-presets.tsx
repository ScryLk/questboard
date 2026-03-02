import { memo } from "react";
import { Stack, Text, XStack, YStack } from "tamagui";

interface DicePreset {
  label: string;
  formula: string;
  type: string;
}

interface DicePresetsProps {
  presets: DicePreset[];
  onRoll: (formula: string, label: string) => void;
}

function DicePresetsInner({ presets, onRoll }: DicePresetsProps) {
  return (
    <YStack paddingHorizontal={16} marginTop={16}>
      <Text fontSize={13} fontWeight="600" color="#9090A0">
        Atalhos
      </Text>
      <Text fontSize={11} color="#5A5A6E" marginBottom={8}>
        Gerados da sua ficha
      </Text>
      <XStack flexWrap="wrap" gap={8}>
        {presets.map((preset, i) => (
          <Stack
            key={`${preset.label}-${i}`}
            flexBasis="47%"
            flexGrow={1}
            height={48}
            backgroundColor="#1C1C24"
            borderRadius={10}
            borderWidth={1}
            borderColor="#2A2A35"
            paddingHorizontal={10}
            justifyContent="center"
            pressStyle={{ opacity: 0.7, backgroundColor: "#1A1A2E" }}
            onPress={() => onRoll(preset.formula, preset.label)}
          >
            <Text
              fontSize={13}
              fontWeight="600"
              color="#E8E8ED"
              numberOfLines={1}
            >
              {preset.label}
            </Text>
            <Text fontSize={11} color="#9090A0">
              {preset.formula}
            </Text>
          </Stack>
        ))}
      </XStack>
    </YStack>
  );
}

export const DicePresets = memo(DicePresetsInner);
