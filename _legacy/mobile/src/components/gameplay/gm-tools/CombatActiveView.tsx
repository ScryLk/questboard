import { memo, useCallback, useState } from "react";
import { TextInput, StyleSheet, Alert } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  ChevronUp,
  ChevronDown,
  Clock,
  Minus,
  Plus,
  Skull,
  Trash2,
  UserPlus,
  X,
  Shield,
  Zap,
  Sparkles,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { TokenIcon } from "../token-icon";
import { CombatAddEnemy } from "./CombatAddEnemy";
import { useGameplayStore } from "../../../lib/gameplay-store";
import { useCombatStore } from "../../../stores/combatStore";
import {
  ALL_CONDITIONS,
  INCAPACITATING_CONDITIONS,
  type Condition,
  type Combatant,
} from "../../../types/combat";

// ─── Sub-Components ──────────────────────────────────────

function ActionBadge({
  label,
  used,
  disabled,
  onToggle,
}: {
  label: string;
  used: boolean;
  disabled: boolean;
  onToggle?: () => void;
}) {
  const isIncapacitated = disabled && used;
  return (
    <Stack
      paddingHorizontal={8}
      paddingVertical={4}
      borderRadius={6}
      backgroundColor={
        isIncapacitated
          ? "#FF6B6B15"
          : used
            ? "#1C1C24"
            : "rgba(108, 92, 231, 0.12)"
      }
      borderWidth={1}
      borderColor={
        isIncapacitated
          ? "#FF6B6B40"
          : used
            ? "#2A2A35"
            : "rgba(108, 92, 231, 0.3)"
      }
      pressStyle={onToggle ? { opacity: 0.7 } : undefined}
      onPress={onToggle}
      opacity={disabled && !onToggle ? 0.5 : 1}
    >
      <XStack alignItems="center" gap={4}>
        <Stack
          width={8}
          height={8}
          borderRadius={4}
          backgroundColor={
            isIncapacitated
              ? "#FF6B6B"
              : used
                ? "#5A5A6E"
                : "#6C5CE7"
          }
        />
        <Text
          fontSize={10}
          fontWeight="600"
          color={
            isIncapacitated
              ? "#FF6B6B"
              : used
                ? "#5A5A6E"
                : "#E8E8ED"
          }
        >
          {label}
        </Text>
        {used && !isIncapacitated && (
          <X size={8} color="#5A5A6E" />
        )}
      </XStack>
    </Stack>
  );
}

function HpBar({
  current,
  max,
  temp,
}: {
  current: number;
  max: number;
  temp: number;
}) {
  const percent = Math.min(100, (current / max) * 100);
  const tempPercent = max > 0 ? Math.min(30, (temp / max) * 100) : 0;
  const color = percent > 50 ? "#00B894" : percent > 25 ? "#FDCB6E" : "#FF6B6B";

  return (
    <XStack alignItems="center" gap={6}>
      <Stack width={50} height={6} borderRadius={3} backgroundColor="#1A1A24" overflow="hidden">
        <XStack height={6}>
          <Stack width={`${percent}%`} height={6} backgroundColor={color} />
          {temp > 0 && (
            <Stack width={`${tempPercent}%`} height={6} backgroundColor="#4A90D9" />
          )}
        </XStack>
      </Stack>
      <Text fontSize={10} color="#9090A0" width={50} textAlign="right">
        {current}/{max}
        {temp > 0 && (
          <Text fontSize={10} color="#4A90D9">
            {" "}+{temp}
          </Text>
        )}
      </Text>
    </XStack>
  );
}

function MovementBar({
  used,
  max,
  isDashing,
}: {
  used: number;
  max: number;
  isDashing: boolean;
}) {
  const effective = isDashing ? max * 2 : max;
  const percent = effective > 0 ? Math.min(100, (used / effective) * 100) : 0;

  return (
    <XStack alignItems="center" gap={6}>
      <Text fontSize={10} color="#5A5A6E" width={34}>
        Mov:
      </Text>
      <Stack flex={1} maxWidth={60} height={4} borderRadius={2} backgroundColor="#1A1A24" overflow="hidden">
        <Stack width={`${percent}%`} height={4} borderRadius={2} backgroundColor="#6C5CE7" />
      </Stack>
      <Text fontSize={10} color="#9090A0">
        {used}/{effective}
      </Text>
      {isDashing && (
        <Stack
          paddingHorizontal={4}
          paddingVertical={1}
          borderRadius={3}
          backgroundColor="#FFA50020"
        >
          <Text fontSize={8} fontWeight="700" color="#FFA500">
            DASH
          </Text>
        </Stack>
      )}
    </XStack>
  );
}

function SpellSlotDots({
  level,
  used,
  max,
  onUse,
}: {
  level: number;
  used: number;
  max: number;
  onUse: () => void;
}) {
  return (
    <XStack alignItems="center" gap={3}>
      <Text fontSize={10} color="#5A5A6E" width={14}>
        {level}
      </Text>
      {Array.from({ length: max }, (_, i) => {
        const isUsed = i < used;
        return (
          <Stack
            key={i}
            width={10}
            height={10}
            borderRadius={5}
            backgroundColor={isUsed ? "#1C1C24" : "#6C5CE7"}
            borderWidth={1}
            borderColor={isUsed ? "#2A2A35" : "#6C5CE7"}
            pressStyle={{ opacity: 0.7 }}
            onPress={() => {
              if (!isUsed) onUse();
            }}
          />
        );
      })}
    </XStack>
  );
}

function ConditionTag({
  condition,
  onRemove,
}: {
  condition: Condition;
  onRemove: () => void;
}) {
  const info = ALL_CONDITIONS.find((c) => c.id === condition);
  if (!info) return null;

  return (
    <Stack
      paddingHorizontal={6}
      paddingVertical={2}
      borderRadius={4}
      backgroundColor="#FF6B6B15"
      borderWidth={1}
      borderColor="#FF6B6B30"
    >
      <XStack alignItems="center" gap={3}>
        <Text fontSize={9} color="#FF6B6B">
          {info.label}
        </Text>
        <Stack pressStyle={{ opacity: 0.7 }} onPress={onRemove}>
          <X size={8} color="#FF6B6B" />
        </Stack>
      </XStack>
    </Stack>
  );
}

// ─── Conditions Bottom Sheet Content ─────────────────────

function ConditionsGrid({
  currentConditions,
  onAdd,
  onClose,
}: {
  currentConditions: Condition[];
  onAdd: (c: Condition) => void;
  onClose: () => void;
}) {
  return (
    <YStack gap={8} padding={8}>
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize={12} fontWeight="600" color="#E8E8ED">
          Adicionar Condição
        </Text>
        <Stack pressStyle={{ opacity: 0.7 }} onPress={onClose}>
          <X size={16} color="#9090A0" />
        </Stack>
      </XStack>
      <XStack flexWrap="wrap" gap={6}>
        {ALL_CONDITIONS.map((c) => {
          const alreadyHas = currentConditions.includes(c.id);
          return (
            <Stack
              key={c.id}
              paddingHorizontal={8}
              paddingVertical={6}
              borderRadius={6}
              backgroundColor={alreadyHas ? "#2A2A35" : "#1C1C24"}
              borderWidth={1}
              borderColor={alreadyHas ? "#5A5A6E" : "#2A2A35"}
              opacity={alreadyHas ? 0.5 : 1}
              pressStyle={alreadyHas ? undefined : { opacity: 0.7 }}
              onPress={() => {
                if (!alreadyHas) onAdd(c.id);
              }}
            >
              <Text fontSize={10} color={alreadyHas ? "#5A5A6E" : "#E8E8ED"}>
                {c.label}
              </Text>
            </Stack>
          );
        })}
      </XStack>
    </YStack>
  );
}

// ─── Main Component ──────────────────────────────────────

interface CombatActiveViewProps {
  onEnd: () => void;
}

function CombatActiveViewInner({ onEnd }: CombatActiveViewProps) {
  // Gameplay store (tokens, legacy combat state)
  const gameplayTokens = useGameplayStore((s) => s.tokens);
  const legacyParticipants = useGameplayStore((s) => s.combatParticipants);
  const legacyCombatActive = useGameplayStore((s) => s.combatActive);
  const legacyRound = useGameplayStore((s) => s.combatRound);
  const legacyCurrentTurnIndex = useGameplayStore((s) => s.currentTurnIndex);
  const legacyNextTurn = useGameplayStore((s) => s.nextTurn);
  const legacyEndCombat = useGameplayStore((s) => s.endCombat);
  const legacyToggleDead = useGameplayStore((s) => s.toggleParticipantDead);
  const legacyRemoveParticipant = useGameplayStore((s) => s.removeParticipant);
  const legacyReorderParticipant = useGameplayStore((s) => s.reorderParticipant);
  const legacyDelayTurn = useGameplayStore((s) => s.delayTurn);
  const addParticipantMidCombat = useGameplayStore((s) => s.addParticipantMidCombat);
  const addToken = useGameplayStore((s) => s.addToken);
  const updateToken = useGameplayStore((s) => s.updateToken);

  // New combat store
  const combatants = useCombatStore((s) => s.combatants);
  const round = useCombatStore((s) => s.round);
  const activeIndex = useCombatStore((s) => s.activeIndex);
  const useAction = useCombatStore((s) => s.useAction);
  const useBonusAction = useCombatStore((s) => s.useBonusAction);
  const useReaction = useCombatStore((s) => s.useReaction);
  const toggleDash = useCombatStore((s) => s.toggleDash);
  const applyDamage = useCombatStore((s) => s.applyDamage);
  const applyHealing = useCombatStore((s) => s.applyHealing);
  const applyTempHp = useCombatStore((s) => s.applyTempHp);
  const useSpellSlot = useCombatStore((s) => s.useSpellSlot);
  const setConcentration = useCombatStore((s) => s.setConcentration);
  const breakConcentration = useCombatStore((s) => s.breakConcentration);
  const addCondition = useCombatStore((s) => s.addCondition);
  const removeCondition = useCombatStore((s) => s.removeCondition);
  const combatNextTurn = useCombatStore((s) => s.nextTurn);
  const combatEndCombat = useCombatStore((s) => s.endCombat);

  // Use new store if it has combatants, otherwise fallback to legacy
  const useNewStore = combatants.length > 0;
  const displayRound = useNewStore ? round : legacyRound;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hpDelta, setHpDelta] = useState("");
  const [showAddReinforcement, setShowAddReinforcement] = useState(false);
  const [conditionsForId, setConditionsForId] = useState<string | null>(null);

  const handleNextTurn = useCallback(() => {
    if (useNewStore) {
      combatNextTurn();
    } else {
      legacyNextTurn();
    }
  }, [useNewStore, combatNextTurn, legacyNextTurn]);

  const handleEnd = useCallback(() => {
    if (useNewStore) {
      combatEndCombat();
    }
    legacyEndCombat();
    onEnd();
  }, [useNewStore, combatEndCombat, legacyEndCombat, onEnd]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setHpDelta("");
  }, []);

  const handleApplyDamage = useCallback(
    (id: string, tokenId: string, amount: number) => {
      if (useNewStore) {
        applyDamage(id, amount);
        // Notifica teste de concentração
        const combatant = combatants.find((c) => c.id === id);
        if (combatant?.resources.concentrationSpellId) {
          const dc = Math.max(10, Math.floor(amount / 2));
          Alert.alert(
            "Teste de Concentração!",
            `CD ${dc} para manter a concentração.`,
          );
        }
      }
      // Sync with token store
      const token = gameplayTokens[tokenId];
      if (token?.hp) {
        updateToken(tokenId, {
          hp: { ...token.hp, current: Math.max(0, token.hp.current - amount) },
        });
      }
      setHpDelta("");
    },
    [useNewStore, applyDamage, combatants, gameplayTokens, updateToken],
  );

  const handleApplyHealing = useCallback(
    (id: string, tokenId: string, amount: number) => {
      if (useNewStore) {
        applyHealing(id, amount);
      }
      const token = gameplayTokens[tokenId];
      if (token?.hp) {
        updateToken(tokenId, {
          hp: {
            ...token.hp,
            current: Math.min(token.hp.max, token.hp.current + amount),
          },
        });
      }
      setHpDelta("");
    },
    [useNewStore, applyHealing, gameplayTokens, updateToken],
  );

  const handleAddReinforcement = useCallback(
    (name: string, count: number, hp: number, ac: number) => {
      for (let i = 0; i < count; i++) {
        const suffix = count > 1 ? ` #${i + 1}` : "";
        const tokenId = `token-reinforce-${Date.now()}-${i}`;
        addToken({
          id: tokenId,
          name: `${name}${suffix}`,
          imageUrl: null,
          icon: "skull",
          x: 12 + i,
          y: 6,
          size: 1,
          layer: "npc",
          visible: true,
          characterId: null,
          hp: { current: hp, max: hp },
          conditions: [],
          ownerId: "gm",
          color: "#FF6B6B",
          ac,
          hostility: "hostile",
        });

        addParticipantMidCombat({
          id: `init-${Date.now()}-${tokenId}`,
          tokenId,
          name: `${name}${suffix}`,
          icon: "skull",
          initiative: Math.floor(Math.random() * 20) + 1,
          isNPC: true,
          isDead: false,
        });
      }
      setShowAddReinforcement(false);
    },
    [addToken, addParticipantMidCombat],
  );

  // Determine which list to render
  const renderNewStore = useNewStore;
  const totalAlive = renderNewStore
    ? combatants.filter((c) => !c.isDead).length
    : legacyParticipants.filter((p) => !p.isDead).length;

  return (
    <>
      <BottomSheetScrollView
        style={styles.scrollFlex}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Round info */}
        <XStack justifyContent="center" alignItems="center" gap={6} marginBottom={8}>
          <Stack width={8} height={8} borderRadius={4} backgroundColor="#00B894" />
          <Text fontSize={12} color="#9090A0">
            Rodada {displayRound} · {totalAlive} vivos
          </Text>
        </XStack>

        {/* Participant list */}
        <YStack gap={4}>
          {renderNewStore
            ? combatants.map((combatant, index) => (
                <CombatantRow
                  key={combatant.id}
                  combatant={combatant}
                  index={index}
                  isCurrentTurn={index === activeIndex}
                  isExpanded={expandedId === combatant.id}
                  hpDelta={hpDelta}
                  conditionsForId={conditionsForId}
                  onToggleExpand={() => toggleExpanded(combatant.id)}
                  onSetHpDelta={setHpDelta}
                  onApplyDamage={(amount) =>
                    handleApplyDamage(combatant.id, combatant.tokenId, amount)
                  }
                  onApplyHealing={(amount) =>
                    handleApplyHealing(combatant.id, combatant.tokenId, amount)
                  }
                  onApplyTempHp={(amount) => applyTempHp(combatant.id, amount)}
                  onUseAction={() => useAction(combatant.id)}
                  onUseBonusAction={() => useBonusAction(combatant.id)}
                  onUseReaction={() => useReaction(combatant.id)}
                  onToggleDash={() => toggleDash(combatant.id)}
                  onUseSpellSlot={(level) => useSpellSlot(combatant.id, level)}
                  onBreakConcentration={() => breakConcentration(combatant.id)}
                  onAddCondition={(c) => addCondition(combatant.id, c)}
                  onRemoveCondition={(c) => removeCondition(combatant.id, c)}
                  onShowConditions={() => setConditionsForId(combatant.id)}
                  onCloseConditions={() => setConditionsForId(null)}
                  onDelay={() => useCombatStore.getState().delayTurn(combatant.id)}
                  onReorder={(newIdx) =>
                    useCombatStore.getState().reorderCombatant(combatant.id, newIdx)
                  }
                  onToggleDead={() => useCombatStore.getState().toggleDead(combatant.id)}
                  onRemove={() => {
                    useCombatStore.getState().removeCombatant(combatant.id);
                    setExpandedId(null);
                  }}
                  totalCount={combatants.length}
                />
              ))
            : legacyParticipants.map((participant, index) => {
                const isCurrent = index === legacyCurrentTurnIndex;
                const isExpanded = expandedId === participant.id;
                const token = gameplayTokens[participant.tokenId];
                const hp = token?.hp;
                const hpPercent = hp ? (hp.current / hp.max) * 100 : 0;
                const hpColor =
                  hpPercent > 50 ? "#00B894" : hpPercent > 25 ? "#FDCB6E" : "#FF6B6B";

                return (
                  <YStack key={participant.id}>
                    <XStack
                      height={52}
                      alignItems="center"
                      gap={8}
                      paddingHorizontal={8}
                      borderRadius={10}
                      backgroundColor={isCurrent ? "rgba(108, 92, 231, 0.1)" : "transparent"}
                      borderWidth={isCurrent ? 1 : 0}
                      borderColor={isCurrent ? "rgba(108, 92, 231, 0.3)" : "transparent"}
                      opacity={participant.isDead ? 0.4 : 1}
                      pressStyle={{ opacity: 0.7 }}
                      onPress={() => toggleExpanded(participant.id)}
                    >
                      <Text fontSize={11} fontWeight="700" color={isCurrent ? "#6C5CE7" : "#5A5A6E"} width={20} textAlign="center">
                        {participant.initiative}
                      </Text>
                      <Stack width={32} height={32} borderRadius={16} backgroundColor="#1A1A24" borderWidth={2} borderColor={participant.isDead ? "#5A5A6E" : participant.isNPC ? "#FF6B6B" : "#6C5CE7"} alignItems="center" justifyContent="center">
                        {participant.isDead ? <Skull size={14} color="#5A5A6E" /> : <TokenIcon name={participant.icon} size={14} color="#E8E8ED" />}
                      </Stack>
                      <Text flex={1} fontSize={13} fontWeight={isCurrent ? "700" : "500"} color={participant.isDead ? "#5A5A6E" : "#E8E8ED"} textDecorationLine={participant.isDead ? "line-through" : "none"} numberOfLines={1}>
                        {participant.name}
                      </Text>
                      {hp && (
                        <XStack alignItems="center" gap={6}>
                          <Stack width={40} height={6} borderRadius={3} backgroundColor="#1A1A24" overflow="hidden">
                            <Stack width={`${hpPercent}%`} height={6} borderRadius={3} backgroundColor={participant.isDead ? "#5A5A6E" : hpColor} />
                          </Stack>
                          <Text fontSize={11} color={participant.isDead ? "#5A5A6E" : "#9090A0"} width={40} textAlign="right">
                            {hp.current}/{hp.max}
                          </Text>
                        </XStack>
                      )}
                      {isCurrent && <Stack width={4} height={28} borderRadius={2} backgroundColor="#6C5CE7" />}
                    </XStack>

                    {isExpanded && !participant.isDead && (
                      <YStack paddingHorizontal={12} paddingVertical={8} gap={8} backgroundColor="rgba(28, 28, 36, 0.6)" borderRadius={8} marginTop={2} marginBottom={4}>
                        {hp && (
                          <XStack alignItems="center" gap={6}>
                            <Text fontSize={11} color="#5A5A6E" width={24}>HP:</Text>
                            <Stack width={28} height={28} borderRadius={6} backgroundColor="#FF6B6B20" alignItems="center" justifyContent="center" pressStyle={{ opacity: 0.7 }} onPress={() => { const val = parseInt(hpDelta, 10) || 1; const newHp = Math.max(0, Math.min(hp.max, hp.current - val)); updateToken(participant.tokenId, { hp: { ...hp, current: newHp } }); setHpDelta(""); }}>
                              <Minus size={12} color="#FF6B6B" />
                            </Stack>
                            <Stack flex={1} maxWidth={60} backgroundColor="#0F0F12" borderRadius={6} borderWidth={1} borderColor="#2A2A35" paddingHorizontal={8} paddingVertical={4}>
                              <TextInput value={hpDelta} onChangeText={setHpDelta} placeholder="1" placeholderTextColor="#5A5A6E" keyboardType="number-pad" style={styles.hpInput} textAlign="center" />
                            </Stack>
                            <Stack width={28} height={28} borderRadius={6} backgroundColor="#00B89420" alignItems="center" justifyContent="center" pressStyle={{ opacity: 0.7 }} onPress={() => { const val = parseInt(hpDelta, 10) || 1; const newHp = Math.max(0, Math.min(hp.max, hp.current + val)); updateToken(participant.tokenId, { hp: { ...hp, current: newHp } }); setHpDelta(""); }}>
                              <Plus size={12} color="#00B894" />
                            </Stack>
                          </XStack>
                        )}
                        <XStack gap={6} flexWrap="wrap">
                          <Stack paddingHorizontal={8} paddingVertical={5} borderRadius={6} backgroundColor="#1C1C24" borderWidth={1} borderColor="#2A2A35" pressStyle={{ opacity: 0.7 }} onPress={() => legacyDelayTurn(participant.id)}>
                            <XStack alignItems="center" gap={4}><Clock size={10} color="#9090A0" /><Text fontSize={10} color="#9090A0">Atrasar</Text></XStack>
                          </Stack>
                          <Stack paddingHorizontal={8} paddingVertical={5} borderRadius={6} backgroundColor="#1C1C24" borderWidth={1} borderColor="#2A2A35" pressStyle={{ opacity: 0.7 }} onPress={() => legacyReorderParticipant(participant.id, index - 1)} disabled={index === 0} opacity={index === 0 ? 0.4 : 1}>
                            <ChevronUp size={12} color="#9090A0" />
                          </Stack>
                          <Stack paddingHorizontal={8} paddingVertical={5} borderRadius={6} backgroundColor="#1C1C24" borderWidth={1} borderColor="#2A2A35" pressStyle={{ opacity: 0.7 }} onPress={() => legacyReorderParticipant(participant.id, index + 1)} disabled={index === legacyParticipants.length - 1} opacity={index === legacyParticipants.length - 1 ? 0.4 : 1}>
                            <ChevronDown size={12} color="#9090A0" />
                          </Stack>
                          <Stack paddingHorizontal={8} paddingVertical={5} borderRadius={6} backgroundColor="#FF6B6B15" borderWidth={1} borderColor="#FF6B6B40" pressStyle={{ opacity: 0.7 }} onPress={() => legacyToggleDead(participant.id)}>
                            <XStack alignItems="center" gap={4}><Skull size={10} color="#FF6B6B" /><Text fontSize={10} color="#FF6B6B">Morto</Text></XStack>
                          </Stack>
                          <Stack paddingHorizontal={8} paddingVertical={5} borderRadius={6} backgroundColor="#1C1C24" borderWidth={1} borderColor="#2A2A35" pressStyle={{ opacity: 0.7 }} onPress={() => { legacyRemoveParticipant(participant.id); setExpandedId(null); }}>
                            <Trash2 size={12} color="#5A5A6E" />
                          </Stack>
                        </XStack>
                      </YStack>
                    )}

                    {isExpanded && participant.isDead && (
                      <XStack paddingHorizontal={12} paddingVertical={8} gap={6} backgroundColor="rgba(28, 28, 36, 0.6)" borderRadius={8} marginTop={2} marginBottom={4}>
                        <Stack paddingHorizontal={10} paddingVertical={5} borderRadius={6} backgroundColor="#00B89420" borderWidth={1} borderColor="#00B89440" pressStyle={{ opacity: 0.7 }} onPress={() => legacyToggleDead(participant.id)}>
                          <Text fontSize={10} color="#00B894">Reviver</Text>
                        </Stack>
                        <Stack paddingHorizontal={10} paddingVertical={5} borderRadius={6} backgroundColor="#1C1C24" borderWidth={1} borderColor="#2A2A35" pressStyle={{ opacity: 0.7 }} onPress={() => { legacyRemoveParticipant(participant.id); setExpandedId(null); }}>
                          <XStack alignItems="center" gap={4}><Trash2 size={10} color="#5A5A6E" /><Text fontSize={10} color="#5A5A6E">Remover</Text></XStack>
                        </Stack>
                      </XStack>
                    )}
                  </YStack>
                );
              })}
        </YStack>

        {/* Add reinforcement */}
        {!showAddReinforcement ? (
          <Stack
            marginTop={12}
            paddingHorizontal={10}
            paddingVertical={6}
            borderRadius={6}
            backgroundColor="rgba(108, 92, 231, 0.1)"
            alignSelf="flex-start"
            pressStyle={{ opacity: 0.7 }}
            onPress={() => setShowAddReinforcement(true)}
          >
            <XStack alignItems="center" gap={4}>
              <UserPlus size={12} color="#6C5CE7" />
              <Text fontSize={11} fontWeight="600" color="#6C5CE7">
                Adicionar ao Combate
              </Text>
            </XStack>
          </Stack>
        ) : (
          <YStack marginTop={12}>
            <CombatAddEnemy
              onAdd={handleAddReinforcement}
              onCancel={() => setShowAddReinforcement(false)}
            />
          </YStack>
        )}
      </BottomSheetScrollView>

      {/* Footer */}
      <YStack
        paddingHorizontal={16}
        paddingVertical={12}
        borderTopWidth={1}
        borderTopColor="#1E1E2A"
        backgroundColor="#16161C"
      >
        <XStack gap={8}>
          <Stack
            flex={1}
            height={44}
            borderRadius={10}
            backgroundColor="#FF6B6B20"
            borderWidth={1}
            borderColor="#FF6B6B40"
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={handleEnd}
          >
            <Text fontSize={13} fontWeight="600" color="#FF6B6B">
              Encerrar
            </Text>
          </Stack>
          <Stack
            flex={2}
            height={44}
            borderRadius={10}
            backgroundColor="#6C5CE7"
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.85 }}
            onPress={handleNextTurn}
          >
            <Text fontSize={14} fontWeight="600" color="white">
              Próximo Turno
            </Text>
          </Stack>
        </XStack>
      </YStack>
    </>
  );
}

// ─── Combatant Row (New Store) ───────────────────────────

interface CombatantRowProps {
  combatant: Combatant;
  index: number;
  isCurrentTurn: boolean;
  isExpanded: boolean;
  hpDelta: string;
  conditionsForId: string | null;
  onToggleExpand: () => void;
  onSetHpDelta: (v: string) => void;
  onApplyDamage: (amount: number) => void;
  onApplyHealing: (amount: number) => void;
  onApplyTempHp: (amount: number) => void;
  onUseAction: () => void;
  onUseBonusAction: () => void;
  onUseReaction: () => void;
  onToggleDash: () => void;
  onUseSpellSlot: (level: number) => void;
  onBreakConcentration: () => void;
  onAddCondition: (c: Condition) => void;
  onRemoveCondition: (c: Condition) => void;
  onShowConditions: () => void;
  onCloseConditions: () => void;
  onDelay: () => void;
  onReorder: (newIndex: number) => void;
  onToggleDead: () => void;
  onRemove: () => void;
  totalCount: number;
}

function CombatantRow({
  combatant,
  index,
  isCurrentTurn,
  isExpanded,
  hpDelta,
  conditionsForId,
  onToggleExpand,
  onSetHpDelta,
  onApplyDamage,
  onApplyHealing,
  onApplyTempHp,
  onUseAction,
  onUseBonusAction,
  onUseReaction,
  onToggleDash,
  onUseSpellSlot,
  onBreakConcentration,
  onAddCondition,
  onRemoveCondition,
  onShowConditions,
  onCloseConditions,
  onDelay,
  onReorder,
  onToggleDead,
  onRemove,
  totalCount,
}: CombatantRowProps) {
  const r = combatant.resources;
  const ae = r.actionEconomy;
  const isIncapacitated = r.conditions.some((c) =>
    INCAPACITATING_CONDITIONS.includes(c as Condition),
  );

  return (
    <YStack>
      {/* Header row */}
      <XStack
        minHeight={isCurrentTurn ? 56 : 48}
        alignItems="center"
        gap={8}
        paddingHorizontal={8}
        borderRadius={10}
        backgroundColor={isCurrentTurn ? "rgba(108, 92, 231, 0.1)" : "transparent"}
        borderWidth={isCurrentTurn ? 1 : 0}
        borderColor={isCurrentTurn ? "rgba(108, 92, 231, 0.3)" : "transparent"}
        opacity={combatant.isDead ? 0.4 : 1}
        pressStyle={{ opacity: 0.7 }}
        onPress={onToggleExpand}
      >
        {/* Initiative */}
        <Text fontSize={11} fontWeight="700" color={isCurrentTurn ? "#6C5CE7" : "#5A5A6E"} width={20} textAlign="center">
          {combatant.initiative}
        </Text>

        {/* Avatar */}
        <Stack width={32} height={32} borderRadius={16} backgroundColor="#1A1A24" borderWidth={2} borderColor={combatant.isDead ? "#5A5A6E" : combatant.isPlayer ? "#6C5CE7" : "#FF6B6B"} alignItems="center" justifyContent="center">
          {combatant.isDead ? (
            <Skull size={14} color="#5A5A6E" />
          ) : (
            <TokenIcon name={combatant.icon} size={14} color="#E8E8ED" />
          )}
        </Stack>

        {/* Name + secondary info */}
        <YStack flex={1}>
          <Text fontSize={13} fontWeight={isCurrentTurn ? "700" : "500"} color={combatant.isDead ? "#5A5A6E" : "#E8E8ED"} textDecorationLine={combatant.isDead ? "line-through" : "none"} numberOfLines={1}>
            {combatant.name}
          </Text>
          {!combatant.isDead && (
            <XStack gap={4} marginTop={2}>
              <ActionBadge label="Ação" used={ae.action} disabled={isIncapacitated} />
              <ActionBadge label="Bônus" used={ae.bonusAction} disabled={isIncapacitated} />
              <ActionBadge label="Reação" used={ae.reaction} disabled={isIncapacitated} />
            </XStack>
          )}
        </YStack>

        {/* HP bar */}
        {!combatant.isDead && (
          <HpBar current={r.hpCurrent} max={r.hpMax} temp={r.hpTemp} />
        )}

        {/* Current turn bar */}
        {isCurrentTurn && <Stack width={4} height={36} borderRadius={2} backgroundColor="#6C5CE7" />}
      </XStack>

      {/* Expanded content */}
      {isExpanded && !combatant.isDead && (
        <YStack
          paddingHorizontal={12}
          paddingVertical={8}
          gap={8}
          backgroundColor="rgba(28, 28, 36, 0.6)"
          borderRadius={8}
          marginTop={2}
          marginBottom={4}
        >
          {/* HP adjustment */}
          <XStack alignItems="center" gap={6}>
            <Text fontSize={11} color="#5A5A6E" width={24}>HP:</Text>
            <Stack width={28} height={28} borderRadius={6} backgroundColor="#FF6B6B20" alignItems="center" justifyContent="center" pressStyle={{ opacity: 0.7 }} onPress={() => onApplyDamage(parseInt(hpDelta, 10) || 1)}>
              <Minus size={12} color="#FF6B6B" />
            </Stack>
            <Stack flex={1} maxWidth={60} backgroundColor="#0F0F12" borderRadius={6} borderWidth={1} borderColor="#2A2A35" paddingHorizontal={8} paddingVertical={4}>
              <TextInput value={hpDelta} onChangeText={onSetHpDelta} placeholder="1" placeholderTextColor="#5A5A6E" keyboardType="number-pad" style={styles.hpInput} textAlign="center" />
            </Stack>
            <Stack width={28} height={28} borderRadius={6} backgroundColor="#00B89420" alignItems="center" justifyContent="center" pressStyle={{ opacity: 0.7 }} onPress={() => onApplyHealing(parseInt(hpDelta, 10) || 1)}>
              <Plus size={12} color="#00B894" />
            </Stack>
            <Stack width={28} height={28} borderRadius={6} backgroundColor="#4A90D920" alignItems="center" justifyContent="center" pressStyle={{ opacity: 0.7 }} onPress={() => onApplyTempHp(parseInt(hpDelta, 10) || 1)}>
              <Shield size={12} color="#4A90D9" />
            </Stack>
          </XStack>

          {/* Movement bar */}
          <MovementBar used={ae.movementUsed} max={ae.movementMax} isDashing={ae.isDashing} />

          {/* Action toggles (GM can toggle) */}
          <XStack gap={6} flexWrap="wrap" alignItems="center">
            <ActionBadge label="Ação" used={ae.action} disabled={isIncapacitated} onToggle={onUseAction} />
            <ActionBadge label="Bônus" used={ae.bonusAction} disabled={isIncapacitated} onToggle={onUseBonusAction} />
            <ActionBadge label="Reação" used={ae.reaction} disabled={isIncapacitated} onToggle={onUseReaction} />
            <Stack
              paddingHorizontal={6}
              paddingVertical={3}
              borderRadius={4}
              backgroundColor={ae.isDashing ? "#FFA50020" : "#1C1C24"}
              borderWidth={1}
              borderColor={ae.isDashing ? "#FFA50040" : "#2A2A35"}
              pressStyle={{ opacity: 0.7 }}
              onPress={onToggleDash}
            >
              <Text fontSize={9} fontWeight="600" color={ae.isDashing ? "#FFA500" : "#5A5A6E"}>
                Dash
              </Text>
            </Stack>
          </XStack>

          {/* Spell Slots */}
          {r.spellSlots && Object.keys(r.spellSlots).length > 0 && (
            <YStack gap={3}>
              <Text fontSize={10} color="#5A5A6E" fontWeight="600">Slots:</Text>
              <XStack gap={8} flexWrap="wrap">
                {Object.entries(r.spellSlots)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([lvl, slot]) => (
                    <SpellSlotDots
                      key={lvl}
                      level={Number(lvl)}
                      used={slot.used}
                      max={slot.max}
                      onUse={() => onUseSpellSlot(Number(lvl))}
                    />
                  ))}
              </XStack>
            </YStack>
          )}

          {/* Concentration */}
          {r.concentrationSpellId && (
            <XStack alignItems="center" gap={4}>
              <Sparkles size={10} color="#FDCB6E" />
              <Text fontSize={10} color="#FDCB6E">
                Concentração: {r.concentrationSpellId}
              </Text>
              <Stack pressStyle={{ opacity: 0.7 }} onPress={onBreakConcentration}>
                <X size={10} color="#FDCB6E" />
              </Stack>
            </XStack>
          )}

          {/* Conditions */}
          <XStack gap={4} flexWrap="wrap" alignItems="center">
            {r.conditions.map((c) => (
              <ConditionTag
                key={c}
                condition={c as Condition}
                onRemove={() => onRemoveCondition(c as Condition)}
              />
            ))}
            <Stack
              width={20}
              height={20}
              borderRadius={4}
              backgroundColor="#1C1C24"
              borderWidth={1}
              borderColor="#2A2A35"
              alignItems="center"
              justifyContent="center"
              pressStyle={{ opacity: 0.7 }}
              onPress={onShowConditions}
            >
              <Plus size={10} color="#9090A0" />
            </Stack>
          </XStack>

          {/* Conditions grid */}
          {conditionsForId === combatant.id && (
            <ConditionsGrid
              currentConditions={r.conditions as Condition[]}
              onAdd={(c) => {
                onAddCondition(c);
                onCloseConditions();
              }}
              onClose={onCloseConditions}
            />
          )}

          {/* Admin actions */}
          <XStack gap={6} flexWrap="wrap" marginTop={4}>
            <Stack paddingHorizontal={8} paddingVertical={5} borderRadius={6} backgroundColor="#1C1C24" borderWidth={1} borderColor="#2A2A35" pressStyle={{ opacity: 0.7 }} onPress={onDelay}>
              <XStack alignItems="center" gap={4}><Clock size={10} color="#9090A0" /><Text fontSize={10} color="#9090A0">Atrasar</Text></XStack>
            </Stack>
            <Stack paddingHorizontal={8} paddingVertical={5} borderRadius={6} backgroundColor="#1C1C24" borderWidth={1} borderColor="#2A2A35" pressStyle={{ opacity: 0.7 }} onPress={() => onReorder(index - 1)} disabled={index === 0} opacity={index === 0 ? 0.4 : 1}>
              <ChevronUp size={12} color="#9090A0" />
            </Stack>
            <Stack paddingHorizontal={8} paddingVertical={5} borderRadius={6} backgroundColor="#1C1C24" borderWidth={1} borderColor="#2A2A35" pressStyle={{ opacity: 0.7 }} onPress={() => onReorder(index + 1)} disabled={index === totalCount - 1} opacity={index === totalCount - 1 ? 0.4 : 1}>
              <ChevronDown size={12} color="#9090A0" />
            </Stack>
            <Stack paddingHorizontal={8} paddingVertical={5} borderRadius={6} backgroundColor="#FF6B6B15" borderWidth={1} borderColor="#FF6B6B40" pressStyle={{ opacity: 0.7 }} onPress={onToggleDead}>
              <XStack alignItems="center" gap={4}><Skull size={10} color="#FF6B6B" /><Text fontSize={10} color="#FF6B6B">Morto</Text></XStack>
            </Stack>
            <Stack paddingHorizontal={8} paddingVertical={5} borderRadius={6} backgroundColor="#1C1C24" borderWidth={1} borderColor="#2A2A35" pressStyle={{ opacity: 0.7 }} onPress={onRemove}>
              <Trash2 size={12} color="#5A5A6E" />
            </Stack>
          </XStack>
        </YStack>
      )}

      {/* Dead: revive/remove */}
      {isExpanded && combatant.isDead && (
        <XStack paddingHorizontal={12} paddingVertical={8} gap={6} backgroundColor="rgba(28, 28, 36, 0.6)" borderRadius={8} marginTop={2} marginBottom={4}>
          <Stack paddingHorizontal={10} paddingVertical={5} borderRadius={6} backgroundColor="#00B89420" borderWidth={1} borderColor="#00B89440" pressStyle={{ opacity: 0.7 }} onPress={onToggleDead}>
            <Text fontSize={10} color="#00B894">Reviver</Text>
          </Stack>
          <Stack paddingHorizontal={10} paddingVertical={5} borderRadius={6} backgroundColor="#1C1C24" borderWidth={1} borderColor="#2A2A35" pressStyle={{ opacity: 0.7 }} onPress={onRemove}>
            <XStack alignItems="center" gap={4}><Trash2 size={10} color="#5A5A6E" /><Text fontSize={10} color="#5A5A6E">Remover</Text></XStack>
          </Stack>
        </XStack>
      )}
    </YStack>
  );
}

export const CombatActiveView = memo(CombatActiveViewInner);

const styles = StyleSheet.create({
  scrollFlex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  hpInput: {
    color: "#E8E8ED",
    fontSize: 12,
    padding: 0,
  },
});
