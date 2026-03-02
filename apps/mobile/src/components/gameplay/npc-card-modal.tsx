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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Shield,
  Footprints,
  Eye,
  ChevronDown,
  ChevronUp,
  Dices,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";
import { MOCK_NPC_STAT_BLOCKS } from "../../lib/gameplay-mock-data";
import { TokenIcon } from "./token-icon";
import { HPAdjuster } from "./hp-adjuster";
import { ConditionBadges, ConditionSelector } from "./condition-selector";
import { GMNoteField } from "./gm-note-field";

const ABILITY_LABELS: Record<string, string> = {
  str: "FOR",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",
};

const HOSTILITY_COLORS: Record<string, string> = {
  hostile: "#FF6B6B",
  neutral: "#FDCB6E",
  friendly: "#00B894",
};

const HOSTILITY_LABELS: Record<string, string> = {
  hostile: "Hostil",
  neutral: "Neutro",
  friendly: "Aliado",
};

// ─── Custom Handle ────────────────────────────────────────

const SheetHandle = memo(function SheetHandle(_: BottomSheetHandleProps) {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handleBar} />
    </View>
  );
});

// ─── NPC Card Modal ──────────────────────────────────────

function NPCCardModalInner() {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [actionsExpanded, setActionsExpanded] = useState(false);

  const viewingType = useGameplayStore((s) => s.viewingType);
  const viewingCharacterId = useGameplayStore((s) => s.viewingCharacterId);
  const viewingTokenId = useGameplayStore((s) => s.viewingTokenId);
  const tokens = useGameplayStore((s) => s.tokens);
  const isGM = useGameplayStore((s) => s.isGM);
  const closeCharacterSheet = useGameplayStore((s) => s.closeCharacterSheet);
  const updateTokenConditions = useGameplayStore((s) => s.updateTokenConditions);
  const showDiceResult = useGameplayStore((s) => s.showDiceResult);
  const addMessage = useGameplayStore((s) => s.addMessage);

  const isOpen = viewingType === "npc";
  const token = viewingTokenId ? tokens[viewingTokenId] : null;
  const statBlock = viewingTokenId
    ? MOCK_NPC_STAT_BLOCKS[viewingTokenId]
    : null;

  useEffect(() => {
    if (isOpen) {
      setActionsExpanded(false);
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const handleChange = useCallback(
    (index: number) => {
      if (index === -1) {
        closeCharacterSheet();
      }
    },
    [closeCharacterSheet],
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

  const handleRollAction = useCallback(
    (actionName: string, attackBonus?: number, damage?: string) => {
      if (!token) return;

      if (attackBonus !== undefined) {
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + attackBonus;
        showDiceResult({
          rollerName: token.name,
          rollerIcon: token.icon,
          label: `${actionName} (Ataque)`,
          formula: `1d20+${attackBonus}`,
          rolls: [roll],
          total,
          isNat20: roll === 20,
          isNat1: roll === 1,
        });

        addMessage({
          id: `msg-${Date.now()}`,
          channel: "GENERAL",
          type: "dice_roll",
          content: `${actionName} — Ataque`,
          senderName: token.name,
          senderIcon: token.icon,
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          diceResult: {
            formula: `1d20+${attackBonus}`,
            rolls: [roll],
            total,
            label: `${actionName} (Ataque)`,
            isNat20: roll === 20,
            isNat1: roll === 1,
          },
        });
      }
    },
    [token, showDiceResult, addMessage],
  );

  const handleConditionToggle = useCallback(
    (conditionId: string) => {
      if (!viewingTokenId || !token) return;
      const current = token.conditions;
      const updated = current.includes(conditionId)
        ? current.filter((c) => c !== conditionId)
        : [...current, conditionId];
      updateTokenConditions(viewingTokenId, updated);
    },
    [viewingTokenId, token, updateTokenConditions],
  );

  const handleConditionRemove = useCallback(
    (conditionId: string) => {
      if (!viewingTokenId || !token) return;
      updateTokenConditions(
        viewingTokenId,
        token.conditions.filter((c) => c !== conditionId),
      );
    },
    [viewingTokenId, token, updateTokenConditions],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={["30%", "55%"]}
      index={-1}
      bottomInset={56 + insets.bottom}
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
      <BottomSheetView style={styles.sheetContent}>
        {token ? (
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 24,
            }}
          >
            {/* Header */}
            <XStack alignItems="center" gap={10} marginBottom={12}>
              <Stack
                width={36}
                height={36}
                borderRadius={18}
                backgroundColor="#1A1A24"
                borderWidth={2}
                borderColor={token.color}
                alignItems="center"
                justifyContent="center"
              >
                <TokenIcon name={token.icon} size={18} color={token.color} />
              </Stack>

              <YStack flex={1} gap={2}>
                <Text fontSize={15} fontWeight="700" color="#E8E8ED">
                  {statBlock?.name ?? token.name}
                </Text>
                {statBlock && (
                  <Text fontSize={11} color="#9090A0">
                    {statBlock.type}
                  </Text>
                )}
              </YStack>

              {statBlock && (
                <Stack
                  borderRadius={6}
                  paddingHorizontal={8}
                  paddingVertical={3}
                  backgroundColor={`${HOSTILITY_COLORS[statBlock.hostility]}15`}
                >
                  <Text
                    fontSize={10}
                    fontWeight="600"
                    color={HOSTILITY_COLORS[statBlock.hostility]}
                  >
                    {HOSTILITY_LABELS[statBlock.hostility]}
                  </Text>
                </Stack>
              )}
            </XStack>

            {/* HP */}
            {token.hp && (
              <YStack marginBottom={10}>
                <HPAdjuster
                  tokenId={viewingTokenId!}
                  current={token.hp.current}
                  max={token.hp.max}
                  editable={isGM}
                />
              </YStack>
            )}

            {/* Stats row */}
            {statBlock && (
              <XStack gap={16} marginBottom={10} justifyContent="center">
                <YStack alignItems="center" gap={2}>
                  <Shield size={12} color="#74B9FF" />
                  <Text fontSize={16} fontWeight="700" color="#E8E8ED">
                    {statBlock.ac}
                  </Text>
                  <Text fontSize={9} color="#5A5A6E">CA</Text>
                </YStack>

                <YStack alignItems="center" gap={2}>
                  <Footprints size={12} color="#00B894" />
                  <Text fontSize={16} fontWeight="700" color="#E8E8ED">
                    {statBlock.speed}
                  </Text>
                  <Text fontSize={9} color="#5A5A6E">Desl.</Text>
                </YStack>

                <YStack alignItems="center" gap={2}>
                  <Eye size={12} color="#FDCB6E" />
                  <Text fontSize={16} fontWeight="700" color="#E8E8ED">
                    {statBlock.passivePerception}
                  </Text>
                  <Text fontSize={9} color="#5A5A6E">Perc.</Text>
                </YStack>
              </XStack>
            )}

            {/* Abilities row (compact) */}
            {statBlock && (
              <XStack
                gap={4}
                marginBottom={10}
                justifyContent="space-between"
              >
                {Object.entries(statBlock.abilities).map(([key, ab]) => (
                  <YStack
                    key={key}
                    alignItems="center"
                    backgroundColor="#16161C"
                    borderRadius={8}
                    borderWidth={1}
                    borderColor="#2A2A35"
                    paddingHorizontal={6}
                    paddingVertical={4}
                    flex={1}
                  >
                    <Text fontSize={9} fontWeight="700" color="#5A5A6E">
                      {ABILITY_LABELS[key]}
                    </Text>
                    <Text fontSize={13} fontWeight="700" color="#E8E8ED">
                      {ab.modifier >= 0 ? `+${ab.modifier}` : ab.modifier}
                    </Text>
                    <Text fontSize={9} color="#5A5A6E">{ab.score}</Text>
                  </YStack>
                ))}
              </XStack>
            )}

            {/* Conditions */}
            {(token.conditions.length > 0 || isGM) && (
              <YStack marginBottom={10} gap={6}>
                <ConditionBadges
                  conditions={token.conditions}
                  onRemove={isGM ? handleConditionRemove : undefined}
                  editable={isGM}
                />
                {isGM && (
                  <ConditionSelector
                    currentConditions={token.conditions}
                    onToggle={handleConditionToggle}
                  />
                )}
              </YStack>
            )}

            {/* Actions (collapsible) */}
            {statBlock && statBlock.actions.length > 0 && (
              <YStack marginBottom={10}>
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  paddingVertical={8}
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => setActionsExpanded(!actionsExpanded)}
                >
                  <Text fontSize={13} fontWeight="600" color="#E8E8ED">
                    Ações ({statBlock.actions.length})
                  </Text>
                  {actionsExpanded ? (
                    <ChevronUp size={16} color="#5A5A6E" />
                  ) : (
                    <ChevronDown size={16} color="#5A5A6E" />
                  )}
                </Stack>

                {actionsExpanded && (
                  <YStack gap={6}>
                    {statBlock.actions.map((action) => (
                      <XStack
                        key={action.name}
                        backgroundColor="#16161C"
                        borderRadius={10}
                        borderWidth={1}
                        borderColor="#2A2A35"
                        paddingHorizontal={12}
                        paddingVertical={8}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <YStack flex={1} gap={2}>
                          <Text fontSize={12} fontWeight="600" color="#E8E8ED">
                            {action.name}
                            {action.attackBonus !== undefined &&
                              ` +${action.attackBonus}`}
                          </Text>
                          {action.damage && (
                            <Text fontSize={11} color="#9090A0">
                              {action.damage}
                            </Text>
                          )}
                        </YStack>

                        {action.attackBonus !== undefined && (
                          <Stack
                            paddingHorizontal={10}
                            paddingVertical={6}
                            borderRadius={8}
                            backgroundColor="#2D2557"
                            pressStyle={{ opacity: 0.7 }}
                            onPress={() =>
                              handleRollAction(
                                action.name,
                                action.attackBonus,
                                action.damage,
                              )
                            }
                          >
                            <XStack alignItems="center" gap={4}>
                              <Dices size={12} color="#6C5CE7" />
                              <Text
                                fontSize={11}
                                fontWeight="600"
                                color="#6C5CE7"
                              >
                                Rolar
                              </Text>
                            </XStack>
                          </Stack>
                        )}
                      </XStack>
                    ))}
                  </YStack>
                )}
              </YStack>
            )}

            {/* Traits */}
            {statBlock?.traits && statBlock.traits.length > 0 && (
              <YStack marginBottom={10} gap={4}>
                <Text fontSize={13} fontWeight="600" color="#E8E8ED">
                  Traços
                </Text>
                {statBlock.traits.map((trait) => (
                  <XStack
                    key={trait.name}
                    backgroundColor="#16161C"
                    borderRadius={8}
                    borderWidth={1}
                    borderColor="#2A2A35"
                    paddingHorizontal={12}
                    paddingVertical={6}
                    gap={6}
                  >
                    <Text fontSize={11} fontWeight="600" color="#FDCB6E">
                      {trait.name}:
                    </Text>
                    <Text
                      fontSize={11}
                      color="#9090A0"
                      flex={1}
                    >
                      {trait.description}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            )}

            {/* GM Notes */}
            {isGM && viewingCharacterId && (
              <GMNoteField characterId={viewingCharacterId} />
            )}
          </BottomSheetScrollView>
        ) : null}
      </BottomSheetView>
    </BottomSheet>
  );
}

export const NPCCardModal = memo(NPCCardModalInner);

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
  sheetContent: {
    flex: 1,
    paddingTop: 4,
  },
});
