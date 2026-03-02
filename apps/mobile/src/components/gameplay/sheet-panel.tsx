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
import { Text, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";
import { MOCK_CHARACTER_SHEET } from "../../lib/gameplay-mock-data";
import { CharacterHeader } from "./character-header";
import { HPBarCompact } from "./hp-bar-compact";
import { ConditionsRow } from "./conditions-row";
import { SheetTabs } from "./sheet-tabs";
import { AttributeGrid, ABILITY_LABELS } from "./attribute-grid";
import { SkillsList } from "./skills-list";
import { FeaturesList } from "./features-list";

const TABS = ["Atributos", "Perícias", "Features"] as const;
type TabKey = (typeof TABS)[number];

// ─── Custom Handle ────────────────────────────────────────

const SheetHandle = memo(function SheetHandle(_: BottomSheetHandleProps) {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handleBar} />
    </View>
  );
});

// ─── Noop helpers for non-editable conditions ─────────────

const noop = () => {};

// ─── Sheet Panel ──────────────────────────────────────────

function SheetPanelInner({ isOpen }: { isOpen: boolean }) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("Atributos");

  const myTokenId = useGameplayStore((s) => s.myTokenId);
  const tokens = useGameplayStore((s) => s.tokens);
  const setActivePanel = useGameplayStore((s) => s.setActivePanel);
  const showDiceResult = useGameplayStore((s) => s.showDiceResult);
  const addMessage = useGameplayStore((s) => s.addMessage);
  const updateTokenHp = useGameplayStore((s) => s.updateTokenHp);

  const sheet = MOCK_CHARACTER_SHEET;
  const token = myTokenId ? tokens[myTokenId] : null;

  const hpCurrent = token?.hp?.current ?? sheet.hp.current;
  const hpMax = token?.hp?.max ?? sheet.hp.max;

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

  // ─── Roll Handlers (roll directly) ─────────────────────

  const handleAbilityRoll = useCallback(
    (abilityKey: string) => {
      const ability = (sheet.abilities as Record<string, { score: number; modifier: number; saveProficiency: boolean }>)[abilityKey];
      if (!ability) return;
      const roll = Math.floor(Math.random() * 20) + 1;
      const total = roll + ability.modifier;
      const label = `Teste de ${ABILITY_LABELS[abilityKey]}`;

      showDiceResult({
        rollerName: sheet.name,
        rollerIcon: token?.icon ?? "sword",
        label,
        formula: `1d20${ability.modifier >= 0 ? "+" : ""}${ability.modifier}`,
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
        senderIcon: token?.icon ?? "sword",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        diceResult: {
          formula: `1d20${ability.modifier >= 0 ? "+" : ""}${ability.modifier}`,
          rolls: [roll],
          total,
          label,
          isNat20: roll === 20,
          isNat1: roll === 1,
        },
      });
    },
    [sheet, token, showDiceResult, addMessage],
  );

  const handleSkillRoll = useCallback(
    (skillName: string) => {
      const skill = sheet.skills.find((s) => s.name === skillName);
      if (!skill) return;
      const roll = Math.floor(Math.random() * 20) + 1;
      const total = roll + skill.modifier;
      const label = `Teste de ${skillName}`;

      showDiceResult({
        rollerName: sheet.name,
        rollerIcon: token?.icon ?? "sword",
        label,
        formula: `1d20${skill.modifier >= 0 ? "+" : ""}${skill.modifier}`,
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
        senderIcon: token?.icon ?? "sword",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        diceResult: {
          formula: `1d20${skill.modifier >= 0 ? "+" : ""}${skill.modifier}`,
          rolls: [roll],
          total,
          label,
          isNat20: roll === 20,
          isNat1: roll === 1,
        },
      });
    },
    [sheet, token, showDiceResult, addMessage],
  );

  // ─── HP Handler ─────────────────────────────────────────

  const handleHpDelta = useCallback(
    (delta: number) => {
      if (!myTokenId) return;
      updateTokenHp(myTokenId, delta);
    },
    [myTokenId, updateTokenHp],
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
          <CharacterHeader
            icon={token?.icon ?? "sword"}
            iconColor={token?.color ?? "#6C5CE7"}
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
            editable={true}
            onDelta={handleHpDelta}
          />
          {token && (
            <ConditionsRow
              conditions={token.conditions}
              editable={false}
              onToggle={noop}
              onRemove={noop}
            />
          )}
        </View>

        {/* ─── Scrollable Content ────────────────────── */}
        <BottomSheetScrollView
          style={styles.scrollFlex}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          contentContainerStyle={styles.scrollContent}
        >
          <SheetTabs
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === "Atributos" && (
            <AttributeGrid
              abilities={sheet.abilities}
              onPress={handleAbilityRoll}
            />
          )}

          {activeTab === "Perícias" && (
            <SkillsList
              skills={sheet.skills}
              onPress={handleSkillRoll}
            />
          )}

          {activeTab === "Features" && (
            <FeaturesList features={sheet.features} />
          )}
        </BottomSheetScrollView>

        {/* No footer — player's own sheet has no GM action buttons */}
      </BottomSheetView>
    </BottomSheet>
  );
}

export const SheetPanel = memo(SheetPanelInner);

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
    paddingTop: 2,
    paddingBottom: 8,
  },
  scrollFlex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
});
