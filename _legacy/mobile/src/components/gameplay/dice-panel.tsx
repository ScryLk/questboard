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
import { Sword } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";
import { MOCK_DICE_PRESETS, MOCK_CHARACTER_SHEET } from "../../lib/gameplay-mock-data";
import { ABILITY_LABELS } from "./attribute-grid";
import { useAbilityStore } from "../../stores/abilityStore";
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

// ─── Character Shortcut Button ────────────────────────────

function ShortcutButton({
  label,
  modifier,
  proficient,
  onPress,
}: {
  label: string;
  modifier: number;
  proficient?: boolean;
  onPress: () => void;
}) {
  const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
  return (
    <Stack
      flex={1}
      minWidth="30%"
      height={36}
      borderRadius={8}
      backgroundColor="rgba(255,255,255,0.04)"
      borderWidth={1}
      borderColor="rgba(255,255,255,0.06)"
      alignItems="center"
      justifyContent="center"
      pressStyle={{ opacity: 0.6, backgroundColor: "rgba(108,92,231,0.12)" }}
      onPress={onPress}
    >
      <Text fontSize={11} fontWeight="600" color="#E8E8ED">
        {label} {modStr}{proficient ? " ●" : ""}
      </Text>
    </Stack>
  );
}

// ─── Weapon Attack Shortcuts ──────────────────────────────

function WeaponShortcuts({ onRoll }: { onRoll: (formula: string, label?: string) => void }) {
  const weapons = useAbilityStore((s) =>
    s.abilities.filter((a) => a.category === "weapon"),
  );

  if (weapons.length === 0) return null;

  return (
    <>
      <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase">
        Ataques
      </Text>
      <XStack flexWrap="wrap" gap={6}>
        {weapons.map((weapon) => {
          const attackRoll = weapon.rolls.find((r) => r.label.toLowerCase().includes("ataque"));
          const damageRoll = weapon.rolls.find((r) => r.label.toLowerCase().includes("dano"));
          return (
            <Stack
              key={weapon.id}
              flex={1}
              minWidth="30%"
              borderRadius={8}
              backgroundColor="rgba(255,255,255,0.04)"
              borderWidth={1}
              borderColor="rgba(255,255,255,0.06)"
              padding={8}
              gap={4}
              pressStyle={{ opacity: 0.6, backgroundColor: "rgba(108,92,231,0.12)" }}
              onPress={() => {
                if (attackRoll) onRoll(attackRoll.formula, `${weapon.name} — Ataque`);
                if (damageRoll) {
                  setTimeout(() => onRoll(damageRoll.formula, `${weapon.name} — Dano`), 100);
                }
              }}
            >
              <XStack alignItems="center" gap={4}>
                <Sword size={12} color="#FF6B6B" />
                <Text fontSize={11} fontWeight="600" color="#E8E8ED" numberOfLines={1}>
                  {weapon.name}
                </Text>
              </XStack>
              {attackRoll && (
                <Text fontSize={9} color="#5A5A6E">
                  {attackRoll.formula} atk{damageRoll ? ` / ${damageRoll.formula} dmg` : ""}
                </Text>
              )}
            </Stack>
          );
        })}
      </XStack>
    </>
  );
}

// ─── Dice Panel ───────────────────────────────────────────

function DicePanelInner({ isOpen }: { isOpen: boolean }) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [visibility, setVisibility] = useState<DiceVisibility>("public");

  const showDiceResult = useGameplayStore((s) => s.showDiceResult);
  const addMessage = useGameplayStore((s) => s.addMessage);
  const setActivePanel = useGameplayStore((s) => s.setActivePanel);
  const isGM = useGameplayStore((s) => s.isGM);

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

  const handleCharacterRoll = useCallback(
    (label: string, modifier: number) => {
      const roll = Math.floor(Math.random() * 20) + 1;
      const total = roll + modifier;
      const sheet = MOCK_CHARACTER_SHEET;
      const formula = `1d20${modifier >= 0 ? "+" : ""}${modifier}`;

      showDiceResult({
        rollerName: sheet.name,
        rollerIcon: "sword",
        label,
        formula,
        rolls: [roll],
        total,
        isNat20: roll === 20,
        isNat1: roll === 1,
      });

      addMessage({
        id: `msg-${Date.now()}`,
        channel: "GENERAL",
        type: "dice_roll",
        content: label,
        senderName: sheet.name,
        senderIcon: "sword",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        diceResult: {
          formula,
          rolls: [roll],
          total,
          label,
          isNat20: roll === 20,
          isNat1: roll === 1,
        },
      });
    },
    [showDiceResult, addMessage],
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

  const sheet = MOCK_CHARACTER_SHEET;
  const abilities = sheet.abilities as Record<string, { score: number; modifier: number; saveProficiency: boolean }>;
  const abilityKeys = ["str", "dex", "con", "int", "wis", "cha"];
  const trainedSkills = sheet.skills.filter((s) => s.proficient);

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

          {/* Zone 3: Character Shortcuts (player only) */}
          {!isGM && (
            <YStack paddingHorizontal={16} marginTop={16} gap={12}>
              {/* Ability Checks */}
              <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase">
                Testes de Atributo
              </Text>
              <XStack flexWrap="wrap" gap={6}>
                {abilityKeys.map((key) => (
                  <ShortcutButton
                    key={key}
                    label={ABILITY_LABELS[key] ?? key.toUpperCase()}
                    modifier={abilities[key].modifier}
                    onPress={() =>
                      handleCharacterRoll(
                        `Teste de ${ABILITY_LABELS[key] ?? key}`,
                        abilities[key].modifier,
                      )
                    }
                  />
                ))}
              </XStack>

              {/* Saving Throws */}
              <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase">
                Testes de Resistência
              </Text>
              <XStack flexWrap="wrap" gap={6}>
                {abilityKeys.map((key) => {
                  const a = abilities[key];
                  const saveBonus = a.saveProficiency
                    ? a.modifier + (sheet.proficiencyBonus ?? 2)
                    : a.modifier;
                  return (
                    <ShortcutButton
                      key={key}
                      label={ABILITY_LABELS[key] ?? key.toUpperCase()}
                      modifier={saveBonus}
                      proficient={a.saveProficiency}
                      onPress={() =>
                        handleCharacterRoll(
                          `TR de ${ABILITY_LABELS[key] ?? key}`,
                          saveBonus,
                        )
                      }
                    />
                  );
                })}
              </XStack>

              {/* Trained Skills */}
              {trainedSkills.length > 0 && (
                <>
                  <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase">
                    Perícias Treinadas
                  </Text>
                  <XStack flexWrap="wrap" gap={6}>
                    {trainedSkills.map((skill) => (
                      <ShortcutButton
                        key={skill.name}
                        label={skill.name}
                        modifier={skill.modifier}
                        proficient
                        onPress={() =>
                          handleCharacterRoll(
                            `Teste de ${skill.name}`,
                            skill.modifier,
                          )
                        }
                      />
                    ))}
                  </XStack>
                </>
              )}

              {/* Weapon Attack Shortcuts */}
              <WeaponShortcuts onRoll={handleRoll} />
            </YStack>
          )}
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
