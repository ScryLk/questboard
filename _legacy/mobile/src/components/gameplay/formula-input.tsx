import { memo, useState, useCallback } from "react";
import { StyleSheet, TextInput } from "react-native";
import { Stack, XStack } from "tamagui";
import { DiceD20Icon } from "../icons/DiceD20Icon";

interface FormulaInputProps {
  onRoll: (formula: string) => void;
}

function FormulaInputInner({ onRoll }: FormulaInputProps) {
  const [formula, setFormula] = useState("1d20");

  const handleSubmit = useCallback(() => {
    const trimmed = formula.trim();
    if (trimmed) {
      onRoll(trimmed);
    }
  }, [formula, onRoll]);

  return (
    <XStack gap={8} paddingHorizontal={16} marginTop={12}>
      <Stack
        flex={1}
        height={40}
        backgroundColor="#0F0F12"
        borderRadius={10}
        borderWidth={1}
        borderColor="#2A2A35"
        justifyContent="center"
        paddingHorizontal={14}
      >
        <TextInput
          value={formula}
          onChangeText={setFormula}
          placeholder="2d6+4, 1d20+5..."
          placeholderTextColor="#5A5A6E"
          onSubmitEditing={handleSubmit}
          style={styles.input}
        />
      </Stack>
      <Stack
        width={40}
        height={40}
        borderRadius={10}
        backgroundColor="#6C5CE7"
        alignItems="center"
        justifyContent="center"
        pressStyle={{ opacity: 0.85 }}
        onPress={handleSubmit}
      >
        <DiceD20Icon size={18} color="white" />
      </Stack>
    </XStack>
  );
}

export const FormulaInput = memo(FormulaInputInner);

const styles = StyleSheet.create({
  input: {
    color: "#E8E8ED",
    fontSize: 14,
    padding: 0,
  },
});
