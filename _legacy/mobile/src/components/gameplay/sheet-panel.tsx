import { memo, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type {
  BottomSheetBackdropProps,
  BottomSheetHandleProps,
} from "@gorhom/bottom-sheet";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Package,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";
import { useAbilityStore } from "../../stores/abilityStore";
import {
  MOCK_CHARACTER_SHEET,
  MOCK_SPELLS,
  MOCK_SPELL_SLOTS,
  MOCK_INVENTORY,
  MOCK_COINS,
} from "../../lib/gameplay-mock-data";
import type { MockSpell, MockInventoryItem } from "../../lib/gameplay-mock-data";
import { CharacterHeader } from "./character-header";
import { HPBarCompact } from "./hp-bar-compact";
import { ConditionsRow } from "./conditions-row";
import { SheetTabs } from "./sheet-tabs";
import { AttributeGrid, ABILITY_LABELS } from "./attribute-grid";
import { SkillsList } from "./skills-list";
import { FeaturesList } from "./features-list";

const TABS = ["Atributos", "Perícias", "Magias", "Inventário", "Features", "Notas"] as const;
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

// ─── Spell Card ──────────────────────────────────────────

function SpellCard({
  spell,
  onCast,
  onUseAbility,
}: {
  spell: MockSpell;
  onCast: (spell: MockSpell) => void;
  onUseAbility?: (spellId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const schoolColors: Record<string, string> = {
    "Evocação": "#FF6B6B",
    "Conjuração": "#6C5CE7",
    "Transmutação": "#FDCB6E",
    "Abjuração": "#4FC3F7",
    "Adivinhação": "#34D399",
    "Necromancia": "#9B59B6",
    "Encantamento": "#E91E63",
    "Ilusão": "#00BCD4",
  };

  return (
    <Stack
      backgroundColor="rgba(255,255,255,0.03)"
      borderRadius={10}
      borderWidth={1}
      borderColor="rgba(255,255,255,0.05)"
      pressStyle={{ opacity: 0.7 }}
      onPress={() => setExpanded(!expanded)}
    >
      <XStack paddingHorizontal={10} paddingVertical={8} alignItems="center" gap={8}>
        <Wand2 size={14} color={schoolColors[spell.school] ?? "#5A5A6E"} />
        <YStack flex={1}>
          <Text fontSize={12} fontWeight="600" color="#E8E8ED">
            {spell.name}
          </Text>
          <XStack gap={6} alignItems="center">
            <Text fontSize={9} color={schoolColors[spell.school] ?? "#5A5A6E"}>
              {spell.school}
            </Text>
            <Text fontSize={9} color="#5A5A6E">{spell.range}</Text>
            {spell.concentration && <Text fontSize={9} color="#FDCB6E">C</Text>}
            {spell.isReaction && <Text fontSize={9} color="#4FC3F7">Reação</Text>}
            {spell.isBonusAction && <Text fontSize={9} color="#34D399">Bônus</Text>}
          </XStack>
        </YStack>
        {expanded ? (
          <ChevronDown size={14} color="#5A5A6E" />
        ) : (
          <ChevronRight size={14} color="#5A5A6E" />
        )}
      </XStack>

      {expanded && (
        <YStack paddingHorizontal={10} paddingBottom={10} gap={6}>
          <Text fontSize={11} color="#9090A0" lineHeight={16}>
            {spell.description}
          </Text>
          <XStack gap={8}>
            <Text fontSize={10} color="#5A5A6E">Tempo: {spell.castingTime}</Text>
            <Text fontSize={10} color="#5A5A6E">Duração: {spell.duration}</Text>
          </XStack>
          {spell.damage && (
            <Text fontSize={10} color="#FF6B6B">Dano: {spell.damage}</Text>
          )}
          <XStack gap={6}>
            {spell.level > 0 && (
              <Stack
                alignSelf="flex-start"
                height={28}
                paddingHorizontal={12}
                borderRadius={6}
                backgroundColor="rgba(108,92,231,0.15)"
                borderWidth={1}
                borderColor="rgba(108,92,231,0.3)"
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.7 }}
                onPress={() => onCast(spell)}
              >
                <Text fontSize={11} fontWeight="700" color="#6C5CE7">
                  Conjurar
                </Text>
              </Stack>
            )}
            {onUseAbility && (
              <Stack
                alignSelf="flex-start"
                height={28}
                paddingHorizontal={12}
                borderRadius={6}
                backgroundColor="rgba(52,211,153,0.15)"
                borderWidth={1}
                borderColor="rgba(52,211,153,0.3)"
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.7 }}
                onPress={() => onUseAbility(spell.id)}
              >
                <XStack alignItems="center" gap={4}>
                  <Zap size={10} color="#34D399" />
                  <Text fontSize={11} fontWeight="700" color="#34D399">
                    Usar
                  </Text>
                </XStack>
              </Stack>
            )}
          </XStack>
        </YStack>
      )}
    </Stack>
  );
}

// ─── Inventory Item ───────────────────────────────────────

function InventoryItemCard({
  item,
  onUse,
  onUseAbility,
}: {
  item: MockInventoryItem;
  onUse: (item: MockInventoryItem) => void;
  onUseAbility?: (itemId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const categoryColors: Record<string, string> = {
    weapon: "#FF6B6B",
    armor: "#4FC3F7",
    consumable: "#34D399",
    gear: "#FDCB6E",
    treasure: "#E91E63",
  };

  return (
    <Stack
      backgroundColor="rgba(255,255,255,0.03)"
      borderRadius={10}
      borderWidth={1}
      borderColor="rgba(255,255,255,0.05)"
      pressStyle={{ opacity: 0.7 }}
      onPress={() => setExpanded(!expanded)}
    >
      <XStack paddingHorizontal={10} paddingVertical={8} alignItems="center" gap={8}>
        <Package size={14} color={categoryColors[item.category] ?? "#5A5A6E"} />
        <YStack flex={1}>
          <XStack alignItems="center" gap={6}>
            <Text fontSize={12} fontWeight="600" color="#E8E8ED">
              {item.name}
            </Text>
            {item.equipped && (
              <Stack backgroundColor="rgba(108,92,231,0.2)" paddingHorizontal={4} paddingVertical={1} borderRadius={3}>
                <Text fontSize={8} fontWeight="700" color="#6C5CE7">E</Text>
              </Stack>
            )}
          </XStack>
          <XStack gap={6}>
            {item.quantity > 1 && <Text fontSize={10} color="#5A5A6E">×{item.quantity}</Text>}
            <Text fontSize={10} color="#5A5A6E">{item.weight}lb</Text>
          </XStack>
        </YStack>
        {expanded ? <ChevronDown size={14} color="#5A5A6E" /> : <ChevronRight size={14} color="#5A5A6E" />}
      </XStack>

      {expanded && (
        <YStack paddingHorizontal={10} paddingBottom={10} gap={4}>
          {item.damage && <Text fontSize={10} color="#FF6B6B">Dano: {item.damage}</Text>}
          {item.armorClass != null && <Text fontSize={10} color="#4FC3F7">CA: {item.armorClass}</Text>}
          {item.description && <Text fontSize={11} color="#9090A0">{item.description}</Text>}
          <XStack gap={6}>
            {item.category === "consumable" && (
              <Stack
                alignSelf="flex-start"
                height={28}
                paddingHorizontal={12}
                borderRadius={6}
                backgroundColor="rgba(52,211,153,0.15)"
                borderWidth={1}
                borderColor="rgba(52,211,153,0.3)"
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.7 }}
                onPress={() => onUse(item)}
              >
                <Text fontSize={11} fontWeight="700" color="#34D399">Usar</Text>
              </Stack>
            )}
            {onUseAbility && item.equipped && (item.category === "weapon" || item.category === "consumable") && (
              <Stack
                alignSelf="flex-start"
                height={28}
                paddingHorizontal={12}
                borderRadius={6}
                backgroundColor="rgba(108,92,231,0.15)"
                borderWidth={1}
                borderColor="rgba(108,92,231,0.3)"
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.7 }}
                onPress={() => onUseAbility(item.id)}
              >
                <XStack alignItems="center" gap={4}>
                  <Zap size={10} color="#6C5CE7" />
                  <Text fontSize={11} fontWeight="700" color="#6C5CE7">Gameplay</Text>
                </XStack>
              </Stack>
            )}
          </XStack>
        </YStack>
      )}
    </Stack>
  );
}

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
  const playerNotes = useGameplayStore((s) => s.playerNotes);
  const setPlayerNotes = useGameplayStore((s) => s.setPlayerNotes);

  const [spellSlots, setSpellSlots] = useState(MOCK_SPELL_SLOTS.map((s) => ({ ...s })));

  // Ability store for "Usar" buttons
  const storeAbilities = useAbilityStore((s) => s.abilities);
  const selectAbility = useAbilityStore((s) => s.selectAbility);

  const handleUseAbilityBySpellId = useCallback(
    (spellId: string) => {
      const match = storeAbilities.find(
        (a) => a.sourceId === spellId && a.category === "spell",
      );
      if (match) selectAbility(match);
    },
    [storeAbilities, selectAbility],
  );

  const handleUseAbilityByItemId = useCallback(
    (itemId: string) => {
      const match = storeAbilities.find(
        (a) => a.sourceId === itemId && (a.category === "weapon" || a.category === "item"),
      );
      if (match) selectAbility(match);
    },
    [storeAbilities, selectAbility],
  );

  const handleUseAbilityByFeatureName = useCallback(
    (featureName: string) => {
      const match = storeAbilities.find(
        (a) => a.name === featureName && a.category === "feature",
      );
      if (match) selectAbility(match);
    },
    [storeAbilities, selectAbility],
  );

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

  // ─── Spell Cast Handler ───────────────────────────────

  const handleCastSpell = useCallback(
    (spell: MockSpell) => {
      if (spell.level > 0) {
        // Find lowest available slot
        const slotIndex = spellSlots.findIndex(
          (s) => s.level >= spell.level && s.used < s.total,
        );
        if (slotIndex === -1) return; // No slots available
        setSpellSlots((prev) =>
          prev.map((s, i) =>
            i === slotIndex ? { ...s, used: s.used + 1 } : s,
          ),
        );

        addMessage({
          id: `msg-${Date.now()}`,
          channel: "GENERAL",
          type: "text",
          content: `${sheet.name.split(",")[0]} conjura ${spell.name} (slot ${spellSlots[slotIndex].level})`,
          senderName: sheet.name.split(",")[0],
          senderIcon: token?.icon ?? "sword",
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }
    },
    [spellSlots, sheet, token, addMessage],
  );

  // ─── Use Item Handler ─────────────────────────────────

  const handleUseItem = useCallback(
    (item: MockInventoryItem) => {
      addMessage({
        id: `msg-${Date.now()}`,
        channel: "GENERAL",
        type: "text",
        content: `${sheet.name.split(",")[0]} usa ${item.name}.`,
        senderName: sheet.name.split(",")[0],
        senderIcon: token?.icon ?? "sword",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    },
    [sheet, token, addMessage],
  );

  // ─── Grouped data ─────────────────────────────────────

  const spellsByLevel = MOCK_SPELLS.reduce<Record<number, MockSpell[]>>((acc, spell) => {
    if (!acc[spell.level]) acc[spell.level] = [];
    acc[spell.level].push(spell);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    weapon: "Armas",
    armor: "Armaduras",
    consumable: "Consumíveis",
    gear: "Equipamento",
    treasure: "Tesouros",
  };
  const inventoryByCategory = MOCK_INVENTORY.reduce<Record<string, MockInventoryItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
  const totalWeight = MOCK_INVENTORY.reduce((sum, item) => sum + item.weight * item.quantity, 0);

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

          {activeTab === "Magias" && (
            <YStack paddingHorizontal={16} gap={12}>
              {/* Spell Slots */}
              <YStack gap={6}>
                <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase">
                  Slots de Magia
                </Text>
                <XStack gap={8} flexWrap="wrap">
                  {spellSlots.map((slot) => (
                    <XStack key={slot.level} alignItems="center" gap={4}>
                      <Text fontSize={11} color="#9090A0" fontWeight="600">Nv.{slot.level}</Text>
                      <XStack gap={2}>
                        {Array.from({ length: slot.total }).map((_, i) => (
                          <Stack
                            key={i}
                            width={8}
                            height={8}
                            borderRadius={4}
                            backgroundColor={i < slot.total - slot.used ? "#6C5CE7" : "rgba(255,255,255,0.1)"}
                          />
                        ))}
                      </XStack>
                    </XStack>
                  ))}
                </XStack>
              </YStack>

              {/* Spells by Level */}
              {Object.entries(spellsByLevel)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([level, spells]) => (
                  <YStack key={level} gap={6}>
                    <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase">
                      {Number(level) === 0 ? "Truques" : `Nível ${level}`}
                    </Text>
                    <YStack gap={4}>
                      {spells.map((spell) => (
                        <SpellCard key={spell.id} spell={spell} onCast={handleCastSpell} onUseAbility={handleUseAbilityBySpellId} />
                      ))}
                    </YStack>
                  </YStack>
                ))}
            </YStack>
          )}

          {activeTab === "Inventário" && (
            <YStack paddingHorizontal={16} gap={12}>
              {Object.entries(inventoryByCategory).map(([cat, items]) => (
                <YStack key={cat} gap={6}>
                  <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase">
                    {categoryLabels[cat] ?? cat}
                  </Text>
                  <YStack gap={4}>
                    {items.map((item) => (
                      <InventoryItemCard key={item.id} item={item} onUse={handleUseItem} onUseAbility={handleUseAbilityByItemId} />
                    ))}
                  </YStack>
                </YStack>
              ))}

              {/* Weight and Coins Footer */}
              <YStack
                backgroundColor="rgba(255,255,255,0.03)"
                borderRadius={10}
                padding={10}
                gap={6}
              >
                <XStack justifyContent="space-between">
                  <Text fontSize={11} color="#5A5A6E">Peso total</Text>
                  <Text fontSize={11} fontWeight="600" color="#E8E8ED">
                    {totalWeight.toFixed(1)} / {sheet.carryCapacity ?? 150}lb
                  </Text>
                </XStack>
                <XStack gap={8} flexWrap="wrap">
                  {MOCK_COINS.gp > 0 && <Text fontSize={11} color="#FDCB6E" fontWeight="600">{MOCK_COINS.gp} gp</Text>}
                  {MOCK_COINS.sp > 0 && <Text fontSize={11} color="#C0C0C0" fontWeight="600">{MOCK_COINS.sp} sp</Text>}
                  {MOCK_COINS.cp > 0 && <Text fontSize={11} color="#CD7F32" fontWeight="600">{MOCK_COINS.cp} cp</Text>}
                  {MOCK_COINS.pp > 0 && <Text fontSize={11} color="#E8E8ED" fontWeight="600">{MOCK_COINS.pp} pp</Text>}
                  {MOCK_COINS.ep > 0 && <Text fontSize={11} color="#9090A0" fontWeight="600">{MOCK_COINS.ep} ep</Text>}
                </XStack>
              </YStack>
            </YStack>
          )}

          {activeTab === "Features" && (
            <FeaturesList features={sheet.features} onUseAbility={handleUseAbilityByFeatureName} />
          )}

          {activeTab === "Notas" && (
            <YStack paddingHorizontal={16} gap={8}>
              <XStack gap={6}>
                <Stack
                  height={28}
                  paddingHorizontal={10}
                  borderRadius={6}
                  backgroundColor="rgba(108,92,231,0.12)"
                  alignItems="center"
                  justifyContent="center"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() =>
                    setPlayerNotes(
                      playerNotes +
                        (playerNotes ? "\n\n" : "") +
                        `## NPC: [nome]\n- Localização: \n- Informações: \n`,
                    )
                  }
                >
                  <Text fontSize={10} fontWeight="600" color="#6C5CE7">+ Nota de NPC</Text>
                </Stack>
                <Stack
                  height={28}
                  paddingHorizontal={10}
                  borderRadius={6}
                  backgroundColor="rgba(52,211,153,0.12)"
                  alignItems="center"
                  justifyContent="center"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() =>
                    setPlayerNotes(
                      playerNotes +
                        (playerNotes ? "\n\n" : "") +
                        `## Pista\n- Fonte: \n- Detalhes: \n`,
                    )
                  }
                >
                  <Text fontSize={10} fontWeight="600" color="#34D399">+ Pista</Text>
                </Stack>
              </XStack>
              <TextInput
                style={sheetStyles.notesInput}
                value={playerNotes}
                onChangeText={setPlayerNotes}
                multiline
                placeholder="Anotações pessoais..."
                placeholderTextColor="#3A3A4E"
                textAlignVertical="top"
              />
            </YStack>
          )}
        </BottomSheetScrollView>

        {/* No footer — player's own sheet has no GM action buttons */}
      </BottomSheetView>
    </BottomSheet>
  );
}

export const SheetPanel = memo(SheetPanelInner);

const sheetStyles = StyleSheet.create({
  notesInput: {
    flex: 1,
    minHeight: 200,
    fontSize: 13,
    color: "#E8E8ED",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 12,
    lineHeight: 20,
  },
});

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
