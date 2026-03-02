import { memo, useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Heart, Shield, Footprints } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";
import { MOCK_CHARACTER_SHEET } from "../../lib/gameplay-mock-data";

const ABILITY_LABELS: Record<string, string> = {
  str: "FOR",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",
};

const TABS = ["Atributos", "Perícias", "Features"] as const;
type TabKey = (typeof TABS)[number];

function SheetPanelInner() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>("Atributos");
  const setActivePanel = useGameplayStore((s) => s.setActivePanel);
  const showDiceResult = useGameplayStore((s) => s.showDiceResult);
  const addMessage = useGameplayStore((s) => s.addMessage);

  const sheet = MOCK_CHARACTER_SHEET;

  const handleAbilityRoll = useCallback(
    (abilityKey: string, modifier: number) => {
      const roll = Math.floor(Math.random() * 20) + 1;
      const total = roll + modifier;
      const label = `Teste de ${ABILITY_LABELS[abilityKey]}`;

      showDiceResult({
        rollerName: sheet.name,
        rollerEmoji: "🧝",
        label,
        formula: `1d20${modifier >= 0 ? "+" : ""}${modifier}`,
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
        senderEmoji: "🧝",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        diceResult: {
          formula: `1d20${modifier >= 0 ? "+" : ""}${modifier}`,
          rolls: [roll],
          total,
          label,
          isNat20: roll === 20,
          isNat1: roll === 1,
        },
      });
    },
    [showDiceResult, addMessage, sheet.name],
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

  const hpPercent = (sheet.hp.current / sheet.hp.max) * 100;

  return (
    <BottomSheet
      snapPoints={["40%", "70%", "90%"]}
      index={0}
      bottomInset={56 + insets.bottom}
      enablePanDownToClose
      enableContentPanningGesture={false}
      enableHandlePanningGesture={true}
      enableOverDrag={true}
      enableDynamicSizing={false}
      overDragResistanceFactor={2.5}
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.sheetContent}>
        {/* Character header */}
        <YStack paddingHorizontal={16} gap={4} marginBottom={8}>
          <Text fontSize={18} fontWeight="700" color="#E8E8ED">
            {sheet.name}
          </Text>
          <Text fontSize={12} color="#5A5A6E">
            {sheet.race} {sheet.class} — Nível {sheet.level}
          </Text>
        </YStack>

        {/* Quick stats */}
        <XStack
          paddingHorizontal={16}
          gap={12}
          marginBottom={12}
        >
          {/* HP */}
          <YStack flex={1} gap={4}>
            <XStack alignItems="center" gap={4}>
              <Heart size={12} color="#FF6B6B" />
              <Text fontSize={11} color="#9090A0">
                PV
              </Text>
            </XStack>
            <XStack
              height={8}
              borderRadius={4}
              backgroundColor="#2A2A35"
              overflow="hidden"
            >
              <Stack
                height={8}
                borderRadius={4}
                width={`${hpPercent}%` as any}
                backgroundColor={
                  hpPercent > 50
                    ? "#00B894"
                    : hpPercent > 25
                      ? "#FDCB6E"
                      : "#FF6B6B"
                }
              />
            </XStack>
            <Text fontSize={11} color="#E8E8ED" textAlign="center">
              {sheet.hp.current}/{sheet.hp.max}
            </Text>
          </YStack>

          {/* AC */}
          <YStack alignItems="center" gap={2}>
            <Shield size={12} color="#74B9FF" />
            <Text fontSize={18} fontWeight="700" color="#E8E8ED">
              {sheet.ac}
            </Text>
            <Text fontSize={9} color="#5A5A6E">
              CA
            </Text>
          </YStack>

          {/* Speed */}
          <YStack alignItems="center" gap={2}>
            <Footprints size={12} color="#00B894" />
            <Text fontSize={18} fontWeight="700" color="#E8E8ED">
              {sheet.speed}
            </Text>
            <Text fontSize={9} color="#5A5A6E">
              Desl.
            </Text>
          </YStack>
        </XStack>

        {/* Tab selector */}
        <XStack paddingHorizontal={16} gap={6} marginBottom={8}>
          {TABS.map((tab) => (
            <Stack
              key={tab}
              paddingHorizontal={12}
              paddingVertical={6}
              borderRadius={8}
              backgroundColor={activeTab === tab ? "#6C5CE7" : "#1A1A24"}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                fontSize={12}
                fontWeight="600"
                color={activeTab === tab ? "white" : "#5A5A6E"}
              >
                {tab}
              </Text>
            </Stack>
          ))}
        </XStack>

        {/* Tab content */}
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        >
          {activeTab === "Atributos" && (
            <XStack flexWrap="wrap" gap={8}>
              {Object.entries(sheet.abilities).map(([key, ability]) => (
                <Stack
                  key={key}
                  width="30%"
                  backgroundColor="#16161C"
                  borderRadius={12}
                  borderWidth={1}
                  borderColor="#2A2A35"
                  padding={10}
                  alignItems="center"
                  gap={2}
                  pressStyle={{
                    opacity: 0.7,
                    backgroundColor: "#1A1A2E",
                  }}
                  onPress={() => handleAbilityRoll(key, ability.modifier)}
                >
                  <Text fontSize={10} fontWeight="700" color="#5A5A6E">
                    {ABILITY_LABELS[key]}
                  </Text>
                  <Text fontSize={24} fontWeight="800" color="#E8E8ED">
                    {ability.modifier >= 0
                      ? `+${ability.modifier}`
                      : ability.modifier}
                  </Text>
                  <Text fontSize={11} color="#5A5A6E">
                    {ability.score}
                  </Text>
                  {ability.saveProficiency && (
                    <Stack
                      width={6}
                      height={6}
                      borderRadius={3}
                      backgroundColor="#6C5CE7"
                      marginTop={2}
                    />
                  )}
                </Stack>
              ))}
            </XStack>
          )}

          {activeTab === "Perícias" && (
            <YStack gap={4}>
              {sheet.skills.map((skill) => (
                <XStack
                  key={skill.name}
                  backgroundColor="#16161C"
                  borderRadius={10}
                  borderWidth={1}
                  borderColor="#2A2A35"
                  paddingHorizontal={14}
                  paddingVertical={10}
                  justifyContent="space-between"
                  alignItems="center"
                  pressStyle={{ opacity: 0.7 }}
                >
                  <XStack alignItems="center" gap={6}>
                    {skill.proficient && (
                      <Stack
                        width={6}
                        height={6}
                        borderRadius={3}
                        backgroundColor="#6C5CE7"
                      />
                    )}
                    <Text fontSize={13} color="#E8E8ED">
                      {skill.name}
                    </Text>
                  </XStack>
                  <Text fontSize={13} fontWeight="600" color="#6C5CE7">
                    {skill.modifier >= 0
                      ? `+${skill.modifier}`
                      : skill.modifier}
                  </Text>
                </XStack>
              ))}
            </YStack>
          )}

          {activeTab === "Features" && (
            <YStack gap={6}>
              {sheet.features.map((feat) => (
                <YStack
                  key={feat.name}
                  backgroundColor="#16161C"
                  borderRadius={10}
                  borderWidth={1}
                  borderColor="#2A2A35"
                  padding={12}
                  gap={4}
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={13} fontWeight="600" color="#E8E8ED">
                      {feat.name}
                    </Text>
                    {feat.uses && (
                      <Text fontSize={11} color="#6C5CE7">
                        {feat.uses.current}/{feat.uses.max}
                      </Text>
                    )}
                  </XStack>
                  <Text fontSize={12} color="#9090A0" lineHeight={16}>
                    {feat.description}
                  </Text>
                </YStack>
              ))}
            </YStack>
          )}
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

export const SheetPanel = memo(SheetPanelInner);

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
  sheetContent: {
    flex: 1,
    paddingTop: 4,
  },
});
