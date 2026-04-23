import { memo, useState, useCallback } from "react";
import { StyleSheet, TextInput } from "react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { DiceD4Icon } from "../icons/DiceD4Icon";
import { DiceD6Icon } from "../icons/DiceD6Icon";
import { DiceD8Icon } from "../icons/DiceD8Icon";
import { DiceD10Icon } from "../icons/DiceD10Icon";
import { DiceD12Icon } from "../icons/DiceD12Icon";
import { DiceD20Icon } from "../icons/DiceD20Icon";

const DICE = [
  { key: "d4", sides: 4, Icon: DiceD4Icon },
  { key: "d6", sides: 6, Icon: DiceD6Icon },
  { key: "d8", sides: 8, Icon: DiceD8Icon },
  { key: "d10", sides: 10, Icon: DiceD10Icon },
  { key: "d12", sides: 12, Icon: DiceD12Icon },
  { key: "d20", sides: 20, Icon: DiceD20Icon },
] as const;

const QTY_OPTIONS = [1, 2, 3, 4, 5];

interface QuickDiceRowProps {
  onRoll: (formula: string, label: string) => void;
}

function QuickDiceRowInner({ onRoll }: QuickDiceRowProps) {
  const [expandedDie, setExpandedDie] = useState<string | null>(null);
  const [customQty, setCustomQty] = useState("");

  const handleTap = useCallback(
    (sides: number, key: string) => {
      onRoll(`1d${sides}`, key.toUpperCase());
    },
    [onRoll],
  );

  const handleLongPress = useCallback((key: string) => {
    setExpandedDie((prev) => (prev === key ? null : key));
    setCustomQty("");
  }, []);

  const handleQtySelect = useCallback(
    (qty: number, sides: number) => {
      onRoll(`${qty}d${sides}`, `${qty}d${sides}`);
      setExpandedDie(null);
    },
    [onRoll],
  );

  const handleCustomQtySubmit = useCallback(() => {
    if (!expandedDie) return;
    const qty = parseInt(customQty, 10);
    if (isNaN(qty) || qty <= 0) return;
    const die = DICE.find((d) => d.key === expandedDie);
    if (!die) return;
    onRoll(`${qty}d${die.sides}`, `${qty}d${die.sides}`);
    setExpandedDie(null);
    setCustomQty("");
  }, [expandedDie, customQty, onRoll]);

  const expandedSides = expandedDie
    ? DICE.find((d) => d.key === expandedDie)?.sides
    : null;

  return (
    <YStack>
      <XStack justifyContent="space-between" paddingHorizontal={16}>
        {DICE.map(({ key, sides, Icon }) => (
          <YStack key={key} alignItems="center" gap={4}>
            <Stack
              width={48}
              height={48}
              borderRadius={24}
              backgroundColor="#1C1C24"
              borderWidth={1}
              borderColor={
                expandedDie === key
                  ? "#6C5CE7"
                  : key === "d20"
                    ? "rgba(108,92,231,0.25)"
                    : "#2A2A35"
              }
              alignItems="center"
              justifyContent="center"
              pressStyle={{ opacity: 0.7, borderColor: "#6C5CE7" }}
              onPress={() => handleTap(sides, key)}
              onLongPress={() => handleLongPress(key)}
            >
              <Icon size={24} color="#E8E8ED" />
            </Stack>
            <Text fontSize={10} color="#5A5A6E">
              {key}
            </Text>
          </YStack>
        ))}
      </XStack>

      {/* Quantity popover */}
      {expandedDie && expandedSides && (
        <XStack
          gap={6}
          paddingHorizontal={16}
          marginTop={8}
          alignItems="center"
        >
          {QTY_OPTIONS.map((qty) => (
            <Stack
              key={qty}
              height={32}
              paddingHorizontal={10}
              borderRadius={8}
              backgroundColor="#1C1C24"
              borderWidth={1}
              borderColor="#2A2A35"
              alignItems="center"
              justifyContent="center"
              pressStyle={{ opacity: 0.7, borderColor: "#6C5CE7" }}
              onPress={() => handleQtySelect(qty, expandedSides)}
            >
              <Text fontSize={12} fontWeight="600" color="#E8E8ED">
                {qty}
              </Text>
            </Stack>
          ))}
          <TextInput
            value={customQty}
            onChangeText={setCustomQty}
            placeholder="N"
            placeholderTextColor="#5A5A6E"
            keyboardType="numeric"
            onSubmitEditing={handleCustomQtySubmit}
            maxLength={2}
            style={styles.qtyInput}
          />
        </XStack>
      )}
    </YStack>
  );
}

export const QuickDiceRow = memo(QuickDiceRowInner);

const styles = StyleSheet.create({
  qtyInput: {
    width: 40,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#1C1C24",
    borderWidth: 1,
    borderColor: "#2A2A35",
    color: "#E8E8ED",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    padding: 0,
  },
});
