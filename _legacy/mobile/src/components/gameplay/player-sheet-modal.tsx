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
import { MessageSquare, ClipboardList } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";
import { MOCK_CHARACTER_SHEETS } from "../../lib/gameplay-mock-data";
import { TokenIcon } from "./token-icon";
import { ConditionBadges } from "./condition-selector";
import { GMNoteField } from "./gm-note-field";
import { CharacterHeader } from "./character-header";
import { HPBarCompact } from "./hp-bar-compact";
import { ConditionsRow } from "./conditions-row";
import { SheetTabs } from "./sheet-tabs";
import { AttributeGrid, ABILITY_LABELS } from "./attribute-grid";
import { SkillsList } from "./skills-list";

const TABS = ["Atributos", "Perícias", "Magias", "Inventário", "Notas"] as const;
type TabKey = (typeof TABS)[number];

// ─── Custom Handle ────────────────────────────────────────

const SheetHandle = memo(function SheetHandle(_: BottomSheetHandleProps) {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handleBar} />
    </View>
  );
});

// ─── Player Sheet Modal ──────────────────────────────────

function PlayerSheetModalInner() {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("Atributos");

  const viewingType = useGameplayStore((s) => s.viewingType);
  const viewingCharacterId = useGameplayStore((s) => s.viewingCharacterId);
  const viewingTokenId = useGameplayStore((s) => s.viewingTokenId);
  const tokens = useGameplayStore((s) => s.tokens);
  const isGM = useGameplayStore((s) => s.isGM);
  const onlinePlayers = useGameplayStore((s) => s.onlinePlayers);
  const closeCharacterSheet = useGameplayStore((s) => s.closeCharacterSheet);
  const updateTokenHp = useGameplayStore((s) => s.updateTokenHp);
  const updateTokenConditions = useGameplayStore((s) => s.updateTokenConditions);
  const showDiceResult = useGameplayStore((s) => s.showDiceResult);
  const addMessage = useGameplayStore((s) => s.addMessage);

  const isOpen = viewingType === "player";
  const sheet = viewingCharacterId
    ? MOCK_CHARACTER_SHEETS[viewingCharacterId]
    : null;
  const token = viewingTokenId ? tokens[viewingTokenId] : null;
  const player = token
    ? onlinePlayers.find((p) => p.id === token.ownerId)
    : null;

  const hpCurrent = token?.hp?.current ?? 0;
  const hpMax = token?.hp?.max ?? 1;

  useEffect(() => {
    if (isOpen) {
      setActiveTab("Atributos");
      bottomSheetRef.current?.snapToIndex(1);
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

  // ─── HP Handler ─────────────────────────────────────────

  const handleHpDelta = useCallback(
    (delta: number) => {
      if (!viewingTokenId) return;
      updateTokenHp(viewingTokenId, delta);
    },
    [viewingTokenId, updateTokenHp],
  );

  // ─── Roll Handlers ──────────────────────────────────────

  const handleRollForPlayer = useCallback(
    (abilityKey: string, modifier: number) => {
      if (!sheet || !token) return;
      const roll = Math.floor(Math.random() * 20) + 1;
      const total = roll + modifier;
      const label = `Teste de ${ABILITY_LABELS[abilityKey] ?? abilityKey}`;

      showDiceResult({
        rollerName: sheet.name,
        rollerIcon: token.icon,
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
        content: `GM rolou ${label} por ${sheet.name}`,
        senderName: "GM",
        senderIcon: "crown",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        diceResult: {
          formula: `1d20${modifier >= 0 ? "+" : ""}${modifier}`,
          rolls: [roll],
          total,
          label: `${label} (por ${sheet.name})`,
          isNat20: roll === 20,
          isNat1: roll === 1,
        },
      });
    },
    [sheet, token, showDiceResult, addMessage],
  );

  const handleRequestRoll = useCallback(
    (skillOrAbility: string) => {
      if (!sheet) return;
      addMessage({
        id: `msg-${Date.now()}`,
        channel: "GENERAL",
        type: "system",
        content: `GM pediu que ${sheet.name} role ${skillOrAbility}`,
        senderName: "Sistema",
        senderIcon: "bot",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    },
    [sheet, addMessage],
  );

  const handleWhisper = useCallback(() => {
    if (!player) return;
    addMessage({
      id: `msg-${Date.now()}`,
      channel: "WHISPER",
      type: "whisper",
      content: `[Sussurro para ${player.name}]`,
      senderName: "GM",
      senderIcon: "crown",
      targetName: player.name,
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  }, [player, addMessage]);

  // ─── Condition Handlers ─────────────────────────────────

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
      snapPoints={["45%", "85%"]}
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
          {token && sheet ? (
            <>
              <CharacterHeader
                icon={token.icon}
                iconColor={token.color}
                name={sheet.name}
                subtitle={`${sheet.race} ${sheet.class} · Nv.${sheet.level}`}
                hpCurrent={hpCurrent}
                hpMax={hpMax}
                ac={sheet.ac}
                speed={sheet.speed}
              />
              <HPBarCompact
                current={hpCurrent}
                max={hpMax}
                editable={isGM}
                onDelta={handleHpDelta}
              />
              <ConditionsRow
                conditions={token.conditions}
                editable={isGM}
                onToggle={handleConditionToggle}
                onRemove={handleConditionRemove}
              />
            </>
          ) : token ? (
            <XStack paddingHorizontal={16} alignItems="center" gap={10}>
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
              <YStack flex={1} gap={1}>
                <Text fontSize={15} fontWeight="700" color="#E8E8ED">
                  {token.name}
                </Text>
                <Text fontSize={11} color="#5A5A6E">
                  Ficha completa não disponível
                </Text>
              </YStack>
            </XStack>
          ) : null}
        </View>

        {/* ─── Scrollable Content ────────────────────── */}
        <BottomSheetScrollView
          style={styles.scrollFlex}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          contentContainerStyle={styles.scrollContent}
        >
          {token && sheet ? (
            <>
              <SheetTabs
                tabs={TABS}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {/* ─── Tab: Atributos ─────────────────── */}
              {activeTab === "Atributos" && (
                <AttributeGrid
                  abilities={sheet.abilities}
                  onPress={(key) =>
                    handleRequestRoll(ABILITY_LABELS[key] ?? key)
                  }
                  onLongPress={(key, mod) =>
                    handleRollForPlayer(key, mod)
                  }
                />
              )}

              {/* ─── Tab: Perícias ──────────────────── */}
              {activeTab === "Perícias" && (
                <SkillsList
                  skills={sheet.skills}
                  onPress={(name) => handleRequestRoll(name)}
                  onLongPress={(name, mod) =>
                    handleRollForPlayer(name.toLowerCase(), mod)
                  }
                />
              )}

              {/* ─── Tab: Magias ────────────────────── */}
              {activeTab === "Magias" && (
                <YStack alignItems="center" paddingVertical={32}>
                  <Text fontSize={13} color="#5A5A6E">
                    Sem magias
                  </Text>
                </YStack>
              )}

              {/* ─── Tab: Inventário ────────────────── */}
              {activeTab === "Inventário" && (
                <YStack alignItems="center" paddingVertical={32}>
                  <Text fontSize={13} color="#5A5A6E">
                    Sem itens
                  </Text>
                </YStack>
              )}

              {/* ─── Tab: Notas ─────────────────────── */}
              {activeTab === "Notas" && isGM && viewingCharacterId && (
                <YStack paddingHorizontal={12} marginTop={10}>
                  <GMNoteField characterId={viewingCharacterId} />
                </YStack>
              )}
            </>
          ) : token ? (
            <YStack paddingHorizontal={16} paddingTop={12} gap={10}>
              {token.hp && (
                <Stack
                  height={4}
                  borderRadius={2}
                  backgroundColor="#2A2A35"
                  overflow="hidden"
                >
                  <Stack
                    height={4}
                    borderRadius={2}
                    width={
                      `${Math.round((token.hp.current / token.hp.max) * 100)}%` as any
                    }
                    backgroundColor={
                      token.hp.current / token.hp.max > 0.5
                        ? "#00B894"
                        : token.hp.current / token.hp.max > 0.25
                          ? "#F9CA24"
                          : "#FF4444"
                    }
                  />
                </Stack>
              )}
              <ConditionBadges
                conditions={token.conditions}
                onRemove={isGM ? handleConditionRemove : undefined}
                editable={isGM}
              />
            </YStack>
          ) : null}
        </BottomSheetScrollView>

        {/* ─── Sticky Footer (GM only) ──────────────── */}
        {isGM && (
          <View
            style={[
              styles.footer,
              { paddingBottom: 8 + insets.bottom },
            ]}
          >
            <XStack gap={8}>
              <Stack
                flex={1}
                height={40}
                borderRadius={10}
                backgroundColor="#6C5CE7"
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.85 }}
                onPress={() => handleRequestRoll("Percepção")}
              >
                <XStack alignItems="center" gap={6}>
                  <ClipboardList size={14} color="white" />
                  <Text fontSize={13} fontWeight="600" color="white">
                    Pedir Teste
                  </Text>
                </XStack>
              </Stack>

              <Stack
                flex={1}
                height={40}
                borderRadius={10}
                backgroundColor="#1C1C24"
                borderWidth={1}
                borderColor="#2A2A35"
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.85 }}
                onPress={handleWhisper}
              >
                <XStack alignItems="center" gap={6}>
                  <MessageSquare size={14} color="#9090A0" />
                  <Text fontSize={13} fontWeight="600" color="#9090A0">
                    Sussurrar
                  </Text>
                </XStack>
              </Stack>
            </XStack>
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

export const PlayerSheetModal = memo(PlayerSheetModalInner);

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#16161C",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2A2A35",
  },
  handleContainer: {
    paddingVertical: 10,
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
    paddingTop: 2,
    paddingBottom: 8,
  },
  scrollFlex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#1E1E2A",
  },
});
