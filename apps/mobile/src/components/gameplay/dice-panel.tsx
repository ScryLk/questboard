import { memo, useCallback, useState } from "react";
import { TextInput, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dices } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";
import { MOCK_DICE_PRESETS } from "../../lib/gameplay-mock-data";

const QUICK_DICE = ["d4", "d6", "d8", "d10", "d12", "d20"] as const;

function rollDice(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

function parseAndRoll(formula: string): {
  rolls: number[];
  total: number;
  formula: string;
} {
  // Simple parser: handles NdM+K format
  const match = formula.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
  if (!match) {
    // Fallback: just roll d20
    const r = rollDice(20);
    return { rolls: [r], total: r, formula: "1d20" };
  }

  const count = parseInt(match[1] || "1", 10);
  const sides = parseInt(match[2], 10);
  const modifier = parseInt(match[3] || "0", 10);

  const rolls: number[] = [];
  let sum = 0;
  for (let i = 0; i < count; i++) {
    const r = rollDice(sides);
    rolls.push(r);
    sum += r;
  }

  return { rolls, total: sum + modifier, formula };
}

function DicePanelInner() {
  const insets = useSafeAreaInsets();
  const [customFormula, setCustomFormula] = useState("1d20");
  const showDiceResult = useGameplayStore((s) => s.showDiceResult);
  const addMessage = useGameplayStore((s) => s.addMessage);
  const setActivePanel = useGameplayStore((s) => s.setActivePanel);

  const handleRoll = useCallback(
    (formula: string, label?: string) => {
      const result = parseAndRoll(formula);
      const isD20 = formula.match(/d20/i);
      const isNat20 = isD20 && result.rolls.length === 1 && result.rolls[0] === 20;
      const isNat1 = isD20 && result.rolls.length === 1 && result.rolls[0] === 1;

      showDiceResult({
        rollerName: "Você",
        rollerEmoji: "👤",
        label: label || formula,
        formula: result.formula,
        rolls: result.rolls,
        total: result.total,
        isNat20: !!isNat20,
        isNat1: !!isNat1,
      });

      addMessage({
        id: `msg-${Date.now()}`,
        channel: "GENERAL",
        type: "dice_roll",
        content: label || formula,
        senderName: "Você",
        senderEmoji: "👤",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        diceResult: {
          formula: result.formula,
          rolls: result.rolls,
          total: result.total,
          label,
          isNat20: !!isNat20,
          isNat1: !!isNat1,
        },
      });
    },
    [showDiceResult, addMessage],
  );

  const handleClose = useCallback(() => {
    setActivePanel(null);
  }, [setActivePanel]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.4}
      />
    ),
    [],
  );

  return (
    <BottomSheet
      snapPoints={["30%", "55%"]}
      index={0}
      bottomInset={56 + insets.bottom}
      enablePanDownToClose
      enableContentPanningGesture={true}
      enableHandlePanningGesture={true}
      enableOverDrag={true}
      enableDynamicSizing={false}
      overDragResistanceFactor={2.5}
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 }}
      >
          {/* Quick dice row */}
          <Text fontSize={13} fontWeight="600" color="#9090A0" marginBottom={8}>
            Dados rápidos
          </Text>
          <XStack flexWrap="wrap" gap={10} marginBottom={20}>
            {QUICK_DICE.map((die) => {
              const sides = parseInt(die.slice(1), 10);
              return (
                <Stack
                  key={die}
                  width={52}
                  height={52}
                  borderRadius={26}
                  backgroundColor="#1A1A24"
                  borderWidth={1}
                  borderColor="#2A2A35"
                  alignItems="center"
                  justifyContent="center"
                  pressStyle={{ opacity: 0.7, scale: 0.95, backgroundColor: "#6C5CE7" }}
                  onPress={() => handleRoll(`1${die}`, die.toUpperCase())}
                >
                  <Text fontSize={14} fontWeight="700" color="#E8E8ED">
                    {die}
                  </Text>
                </Stack>
              );
            })}
          </XStack>

          {/* Custom formula */}
          <Text fontSize={13} fontWeight="600" color="#9090A0" marginBottom={8}>
            Fórmula personalizada
          </Text>
          <XStack gap={8} marginBottom={20}>
            <Stack
              flex={1}
              backgroundColor="#12121A"
              borderRadius={10}
              borderWidth={1}
              borderColor="#2A2A35"
              paddingHorizontal={14}
              paddingVertical={10}
            >
              <TextInput
                value={customFormula}
                onChangeText={setCustomFormula}
                placeholder="Ex: 2d6+3"
                placeholderTextColor="#5A5A6E"
                style={styles.input}
              />
            </Stack>
            <Stack
              width={52}
              height={44}
              borderRadius={12}
              backgroundColor="#6C5CE7"
              alignItems="center"
              justifyContent="center"
              pressStyle={{ opacity: 0.85, scale: 0.95 }}
              onPress={() => handleRoll(customFormula)}
            >
              <Dices size={20} color="white" />
            </Stack>
          </XStack>

          {/* Presets */}
          <Text fontSize={13} fontWeight="600" color="#9090A0" marginBottom={8}>
            Presets da ficha
          </Text>
          <YStack gap={6}>
            {MOCK_DICE_PRESETS.map((preset, i) => (
              <Stack
                key={`${preset.label}-${i}`}
                backgroundColor="#16161C"
                borderRadius={10}
                borderWidth={1}
                borderColor="#2A2A35"
                paddingHorizontal={14}
                paddingVertical={10}
                pressStyle={{ opacity: 0.7, backgroundColor: "#1A1A2E" }}
                onPress={() => handleRoll(preset.formula, preset.label)}
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={13} fontWeight="600" color="#E8E8ED">
                    {preset.label}
                  </Text>
                  <Text fontSize={12} color="#6C5CE7">
                    {preset.formula}
                  </Text>
                </XStack>
              </Stack>
            ))}
          </YStack>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

export const DicePanel = memo(DicePanelInner);

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#0F0F12",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2A2A35",
  },
  handle: {
    backgroundColor: "#5A5A6E",
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  input: {
    color: "#E8E8ED",
    fontSize: 15,
    padding: 0,
  },
});
