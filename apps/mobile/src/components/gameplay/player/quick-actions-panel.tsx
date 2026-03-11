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
import {
  Sword,
  Zap,
  Shield,
  Wind,
  Heart,
  Search,
  Hand,
  Eye,
  Package,
  Footprints,
  ArrowRight,
  Swords,
  Target,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../../lib/gameplay-store";
import { useCombatStore } from "../../../stores/combatStore";
import { useAbilityStore } from "../../../stores/abilityStore";
import { AbilityCardCompact } from "../abilities/ability-card";
import type { AbilityCategory } from "../../../types/ability";

// ─── Custom Handle ────────────────────────────────────────

const SheetHandle = memo(function SheetHandle(_: BottomSheetHandleProps) {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handleBar} />
    </View>
  );
});

// ─── Action Card ──────────────────────────────────────────

function ActionCard({
  icon,
  label,
  subtitle,
  disabled,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  disabled?: boolean;
  onPress?: () => void;
}) {
  return (
    <Stack
      width="48%"
      borderWidth={1}
      borderColor={disabled ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)"}
      backgroundColor={disabled ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.03)"}
      borderRadius={12}
      padding={12}
      gap={4}
      opacity={disabled ? 0.4 : 1}
      pressStyle={disabled ? undefined : { opacity: 0.7, backgroundColor: "rgba(255,255,255,0.06)" }}
      onPress={disabled ? undefined : onPress}
    >
      {icon}
      <Text fontSize={12} fontWeight="600" color={disabled ? "#3A3A4E" : "#E8E8ED"}>
        {label}
      </Text>
      <Text fontSize={9} color="#5A5A6E">
        {subtitle}
      </Text>
    </Stack>
  );
}

// ─── Economy Indicator ────────────────────────────────────

function EconomyDot({
  label,
  used,
  color,
}: {
  label: string;
  used: boolean;
  color: string;
}) {
  return (
    <XStack alignItems="center" gap={4} flex={1}>
      <Stack
        width={10}
        height={10}
        borderRadius={5}
        backgroundColor={used ? "rgba(255,255,255,0.08)" : color}
        borderWidth={1}
        borderColor={used ? "rgba(255,255,255,0.1)" : `${color}80`}
      />
      <Text fontSize={10} color={used ? "#3A3A4E" : "#9090A0"}>
        {label}
      </Text>
    </XStack>
  );
}

// ─── Ability Filter Pills ─────────────────────────────────

const FILTER_OPTIONS: { key: AbilityCategory | "all"; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "weapon", label: "Armas" },
  { key: "spell", label: "Magias" },
  { key: "feature", label: "Features" },
  { key: "item", label: "Itens" },
];

function AbilityFilterPills({
  activeFilter,
  onSelect,
}: {
  activeFilter: AbilityCategory | "all";
  onSelect: (f: AbilityCategory | "all") => void;
}) {
  return (
    <XStack gap={6} marginBottom={10}>
      {FILTER_OPTIONS.map((opt) => (
        <Stack
          key={opt.key}
          borderRadius={6}
          paddingHorizontal={10}
          paddingVertical={5}
          backgroundColor={
            activeFilter === opt.key
              ? "rgba(108,92,231,0.2)"
              : "rgba(255,255,255,0.04)"
          }
          borderWidth={1}
          borderColor={
            activeFilter === opt.key
              ? "#6C5CE7"
              : "rgba(255,255,255,0.06)"
          }
          pressStyle={{ opacity: 0.7 }}
          onPress={() => onSelect(opt.key)}
        >
          <Text
            fontSize={10}
            fontWeight="600"
            color={activeFilter === opt.key ? "#6C5CE7" : "#9090A0"}
          >
            {opt.label}
          </Text>
        </Stack>
      ))}
    </XStack>
  );
}

// ─── Panel ────────────────────────────────────────────────

function QuickActionsPanelInner({ isOpen }: { isOpen: boolean }) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const setActivePanel = useGameplayStore((s) => s.setActivePanel);

  const combatActive = useGameplayStore((s) => s.combatActive);
  const combatRound = useGameplayStore((s) => s.combatRound);
  const currentTurnIndex = useGameplayStore((s) => s.currentTurnIndex);
  const participants = useGameplayStore((s) => s.combatParticipants);
  const myTokenId = useGameplayStore((s) => s.myTokenId);
  const nextTurn = useGameplayStore((s) => s.nextTurn);

  const combatants = useCombatStore((s) => s.combatants);
  const useAction = useCombatStore((s) => s.useAction);
  const useBonusAction = useCombatStore((s) => s.useBonusAction);
  const useReaction = useCombatStore((s) => s.useReaction);

  // Ability store
  const abilityFilter = useAbilityStore((s) => s.filter);
  const setAbilityFilter = useAbilityStore((s) => s.setFilter);
  const filteredAbilities = useAbilityStore((s) => s.filteredAbilities);
  const selectAbility = useAbilityStore((s) => s.selectAbility);
  const abilities = filteredAbilities();

  const currentParticipant = participants[currentTurnIndex];
  const isMyTurn = combatActive && currentParticipant?.tokenId === myTokenId;

  // Find my combatant in combat store
  const myCombatant = combatants.find((c) => c.tokenId === myTokenId);
  const actionUsed = myCombatant?.resources.actionEconomy.action ?? false;
  const bonusUsed = myCombatant?.resources.actionEconomy.bonusAction ?? false;
  const reactionUsed = myCombatant?.resources.actionEconomy.reaction ?? false;
  const movementUsed = myCombatant?.resources.actionEconomy.movementUsed ?? 0;
  const movementMax = myCombatant?.resources.actionEconomy.movementMax ?? 6;
  const movementRatio = Math.min(1, movementUsed / movementMax);

  // Calculate turns until my turn
  const turnsUntilMe = (() => {
    if (!combatActive || isMyTurn) return 0;
    const myIndex = participants.findIndex((p) => p.tokenId === myTokenId);
    if (myIndex === -1) return -1;
    if (myIndex > currentTurnIndex) return myIndex - currentTurnIndex;
    return participants.length - currentTurnIndex + myIndex;
  })();

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const handleChange = useCallback(
    (index: number) => {
      if (index === -1) setActivePanel(null);
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

  const handleAction = useCallback(
    (type: "action" | "bonus" | "reaction") => {
      if (!myCombatant) return;
      if (type === "action") useAction(myCombatant.id);
      if (type === "bonus") useBonusAction(myCombatant.id);
      if (type === "reaction") useReaction(myCombatant.id);
    },
    [myCombatant, useAction, useBonusAction, useReaction],
  );

  const handleEndTurn = useCallback(() => {
    nextTurn();
    setActivePanel(null);
  }, [nextTurn, setActivePanel]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={["40%", "75%"]}
      index={-1}
      enablePanDownToClose
      enableHandlePanningGesture
      enableContentPanningGesture={false}
      onChange={handleChange}
      backdropComponent={renderBackdrop}
      handleComponent={SheetHandle}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetView style={styles.outerContainer}>
        {/* ─── Not in combat ──────────────────── */}
        {!combatActive && (
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase" marginBottom={8}>
              Ações Livres
            </Text>
            <XStack flexWrap="wrap" gap={8}>
              <ActionCard icon={<Sword size={16} color="#FF6B6B" />} label="Atacar" subtitle="Ataque corpo a corpo ou à distância" />
              <ActionCard icon={<Zap size={16} color="#FDCB6E" />} label="Conjurar Magia" subtitle="Usar uma magia conhecida" />
              <ActionCard icon={<Package size={16} color="#4FC3F7" />} label="Usar Item" subtitle="Consumível ou objeto" />
              <ActionCard icon={<Hand size={16} color="#34D399" />} label="Interagir" subtitle="Com objeto ou ambiente" />
              <ActionCard icon={<Heart size={16} color="#FF6B6B" />} label="Ajudar" subtitle="Dar vantagem a um aliado" />
              <ActionCard icon={<Search size={16} color="#FDCB6E" />} label="Examinar" subtitle="Investigar algo no ambiente" />
            </XStack>

            {/* Character abilities */}
            {abilities.length > 0 && (
              <YStack marginTop={16}>
                <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase" marginBottom={8}>
                  Minhas Habilidades
                </Text>
                <AbilityFilterPills activeFilter={abilityFilter} onSelect={setAbilityFilter} />
                <XStack flexWrap="wrap" gap={8}>
                  {abilities.map((a) => (
                    <AbilityCardCompact
                      key={a.id}
                      ability={a}
                      onPress={() => selectAbility(a)}
                    />
                  ))}
                </XStack>
              </YStack>
            )}
          </BottomSheetScrollView>
        )}

        {/* ─── In combat: My turn ──────────────── */}
        {combatActive && isMyTurn && (
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <XStack alignItems="center" gap={6} marginBottom={12}>
              <Swords size={14} color="#6C5CE7" />
              <Text fontSize={12} fontWeight="800" color="#6C5CE7" textTransform="uppercase" letterSpacing={1}>
                Rodada {combatRound} — Seu Turno
              </Text>
            </XStack>

            {/* Action economy */}
            <XStack marginBottom={12} gap={4}>
              <EconomyDot label="Ação" used={actionUsed} color="#34D399" />
              <EconomyDot label="Bônus" used={bonusUsed} color="#FDCB6E" />
              <EconomyDot label="Reação" used={reactionUsed} color="#4FC3F7" />
            </XStack>

            {/* Movement bar */}
            <YStack marginBottom={16} gap={4}>
              <XStack alignItems="center" justifyContent="space-between">
                <Text fontSize={10} color="#5A5A6E">Movimento</Text>
                <Text fontSize={10} color="#9090A0">{movementMax - movementUsed}/{movementMax} quadrados</Text>
              </XStack>
              <Stack height={4} backgroundColor="rgba(255,255,255,0.08)" borderRadius={2} overflow="hidden">
                <Stack height={4} width={`${(1 - movementRatio) * 100}%` as `${number}%`} backgroundColor="#6C5CE7" borderRadius={2} />
              </Stack>
            </YStack>

            {/* Main actions */}
            <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase" marginBottom={8}>
              Ações Principais
            </Text>
            <XStack flexWrap="wrap" gap={8} marginBottom={16}>
              <ActionCard icon={<Sword size={16} color="#FF6B6B" />} label="Atacar" subtitle="Usa: Ação" disabled={actionUsed} onPress={() => handleAction("action")} />
              <ActionCard icon={<Zap size={16} color="#FDCB6E" />} label="Conjurar" subtitle="Usa: Ação" disabled={actionUsed} onPress={() => handleAction("action")} />
              <ActionCard icon={<Footprints size={16} color="#34D399" />} label="Dash" subtitle="Usa: Ação" disabled={actionUsed} onPress={() => handleAction("action")} />
              <ActionCard icon={<Shield size={16} color="#4FC3F7" />} label="Defender" subtitle="Usa: Ação" disabled={actionUsed} onPress={() => handleAction("action")} />
              <ActionCard icon={<Heart size={16} color="#FF6B6B" />} label="Ajudar" subtitle="Usa: Ação" disabled={actionUsed} onPress={() => handleAction("action")} />
              <ActionCard icon={<Eye size={16} color="#FDCB6E" />} label="Esconder" subtitle="Usa: Ação" disabled={actionUsed} onPress={() => handleAction("action")} />
              <ActionCard icon={<Search size={16} color="#9090A0" />} label="Procurar" subtitle="Usa: Ação" disabled={actionUsed} onPress={() => handleAction("action")} />
              <ActionCard icon={<ArrowRight size={16} color="#9090A0" />} label="Desengajar" subtitle="Usa: Ação" disabled={actionUsed} onPress={() => handleAction("action")} />
            </XStack>

            {/* Bonus actions */}
            <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase" marginBottom={8}>
              Ações de Bônus
            </Text>
            <XStack flexWrap="wrap" gap={8} marginBottom={16}>
              <ActionCard icon={<Wind size={16} color="#6C5CE7" />} label="Passo Místico" subtitle="Usa: Bônus" disabled={bonusUsed} onPress={() => handleAction("bonus")} />
              <ActionCard icon={<Package size={16} color="#FDCB6E" />} label="Usar Objeto" subtitle="Usa: Bônus" disabled={bonusUsed} onPress={() => handleAction("bonus")} />
            </XStack>

            {/* Reactions */}
            <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase" marginBottom={8}>
              Reações
            </Text>
            <XStack flexWrap="wrap" gap={8} marginBottom={16}>
              <ActionCard icon={<Shield size={16} color="#4FC3F7" />} label="Escudo Arcano" subtitle="Usa: Reação" disabled={reactionUsed} onPress={() => handleAction("reaction")} />
            </XStack>

            {/* Character abilities */}
            {abilities.length > 0 && (
              <YStack marginBottom={16}>
                <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase" marginBottom={8}>
                  Minhas Habilidades
                </Text>
                <AbilityFilterPills activeFilter={abilityFilter} onSelect={setAbilityFilter} />
                <XStack flexWrap="wrap" gap={8}>
                  {abilities.map((a) => (
                    <AbilityCardCompact
                      key={a.id}
                      ability={a}
                      onPress={() => selectAbility(a)}
                    />
                  ))}
                </XStack>
              </YStack>
            )}

            {/* End turn button */}
            <Stack
              backgroundColor="#6C5CE7"
              borderRadius={12}
              paddingVertical={14}
              alignItems="center"
              pressStyle={{ opacity: 0.8 }}
              onPress={handleEndTurn}
            >
              <XStack alignItems="center" gap={6}>
                <Target size={16} color="white" />
                <Text fontSize={14} fontWeight="700" color="white">
                  Encerrar Meu Turno
                </Text>
              </XStack>
            </Stack>
          </BottomSheetScrollView>
        )}

        {/* ─── In combat: Not my turn ──────────── */}
        {combatActive && !isMyTurn && (
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <XStack alignItems="center" gap={6} marginBottom={12}>
              <Swords size={14} color="#5A5A6E" />
              <Text fontSize={12} fontWeight="800" color="#5A5A6E" textTransform="uppercase" letterSpacing={1}>
                Rodada {combatRound} — Turno de {currentParticipant?.name ?? "..."}
              </Text>
            </XStack>

            <Text fontSize={13} color="#5A5A6E" marginBottom={16}>
              Aguardando turno...
            </Text>

            {/* Reactions available */}
            {!reactionUsed && (
              <YStack gap={8} marginBottom={16}>
                <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase">
                  Reações Disponíveis
                </Text>
                <XStack flexWrap="wrap" gap={8}>
                  <ActionCard icon={<Shield size={16} color="#4FC3F7" />} label="Escudo Arcano" subtitle="Usa: Reação" onPress={() => handleAction("reaction")} />
                </XStack>
              </YStack>
            )}

            {turnsUntilMe > 0 && (
              <Text fontSize={11} color="#5A5A6E">
                Seu próximo turno: em {turnsUntilMe} {turnsUntilMe === 1 ? "posição" : "posições"}
              </Text>
            )}
          </BottomSheetScrollView>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

export const QuickActionsPanel = memo(QuickActionsPanelInner);

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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
});
