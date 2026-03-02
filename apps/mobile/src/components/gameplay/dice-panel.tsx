import { memo, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type {
  BottomSheetBackdropProps,
  BottomSheetHandleProps,
} from "@gorhom/bottom-sheet";
import { Text } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";
import { MOCK_DICE_PRESETS } from "../../lib/gameplay-mock-data";
import { QuickDiceRow } from "./quick-dice-row";
import { FormulaInput } from "./formula-input";
import { DicePresets } from "./dice-presets";
import { VisibilitySelector } from "./visibility-selector";
import type { DiceVisibility } from "./visibility-selector";
import { DiceHistory } from "./dice-history";

// ─── Dice Helpers ─────────────────────────────────────────

function rollDice(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

function parseAndRoll(formula: string): {
  rolls: number[];
  total: number;
  formula: string;
} {
  const match = formula.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
  if (!match) {
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

// ─── Custom Handle ────────────────────────────────────────

const SheetHandle = memo(function SheetHandle(_: BottomSheetHandleProps) {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handleBar} />
    </View>
  );
});

// ─── Dice Panel ───────────────────────────────────────────

function DicePanelInner({ isOpen }: { isOpen: boolean }) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [visibility, setVisibility] = useState<DiceVisibility>("public");

  const showDiceResult = useGameplayStore((s) => s.showDiceResult);
  const addMessage = useGameplayStore((s) => s.addMessage);
  const setActivePanel = useGameplayStore((s) => s.setActivePanel);

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const handleRoll = useCallback(
    (formula: string, label?: string) => {
      const result = parseAndRoll(formula);
      const isD20 = formula.match(/d20/i);
      const isNat20 =
        !!isD20 && result.rolls.length === 1 && result.rolls[0] === 20;
      const isNat1 =
        !!isD20 && result.rolls.length === 1 && result.rolls[0] === 1;

      showDiceResult({
        rollerName: "Você",
        rollerIcon: "user",
        label: label || formula,
        formula: result.formula,
        rolls: result.rolls,
        total: result.total,
        isNat20,
        isNat1,
      });

      addMessage({
        id: `msg-${Date.now()}`,
        channel: "GENERAL",
        type: "dice_roll",
        content: label || formula,
        senderName: "Você",
        senderIcon: "user",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        diceResult: {
          formula: result.formula,
          rolls: result.rolls,
          total: result.total,
          label,
          isNat20,
          isNat1,
        },
      });
    },
    [showDiceResult, addMessage],
  );

  const handleChange = useCallback(
    (index: number) => {
      if (index === -1) {
        setActivePanel(null);
      }
    },
    [setActivePanel],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={["40%", "88%"]}
      index={-1}
      bottomInset={0}
      enablePanDownToClose={true}
      enableContentPanningGesture={false}
      enableHandlePanningGesture={true}
      enableOverDrag={true}
      enableDynamicSizing={false}
      animateOnMount={true}
      onChange={handleChange}
      backdropComponent={renderBackdrop}
      handleComponent={SheetHandle}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetView style={styles.outerContainer}>
        {/* ─── Fixed Header ──────────────────────────── */}
        <View style={styles.headerSection}>
          <Text
            paddingHorizontal={16}
            fontSize={16}
            fontWeight="600"
            color="#E8E8ED"
            marginBottom={12}
          >
            Rolar Dados
          </Text>
          <QuickDiceRow onRoll={handleRoll} />
          <FormulaInput onRoll={(f) => handleRoll(f)} />
        </View>

        {/* ─── Scrollable Content ────────────────────── */}
        <BottomSheetScrollView
          style={styles.scrollFlex}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          contentContainerStyle={styles.scrollContent}
        >
          <DicePresets presets={MOCK_DICE_PRESETS} onRoll={handleRoll} />
          <VisibilitySelector value={visibility} onChange={setVisibility} />
          <DiceHistory onReroll={handleRoll} />
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

export const DicePanel = memo(DicePanelInner);

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#16161C",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2A2A35",
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#16161C",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#5A5A6E",
  },
  outerContainer: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  scrollFlex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
