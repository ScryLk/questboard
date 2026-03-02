import { memo, useCallback, useState } from "react";
import { TextInput, StyleSheet } from "react-native";
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
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { TokenIcon } from "../token-icon";
import { CombatAddEnemy } from "./CombatAddEnemy";
import { useGameplayStore } from "../../../lib/gameplay-store";
import type { CombatParticipant } from "../../../lib/gameplay-store";

interface CombatActiveViewProps {
  onEnd: () => void;
}

function CombatActiveViewInner({ onEnd }: CombatActiveViewProps) {
  const combatParticipants = useGameplayStore((s) => s.combatParticipants);
  const currentTurnIndex = useGameplayStore((s) => s.currentTurnIndex);
  const combatRound = useGameplayStore((s) => s.combatRound);
  const tokens = useGameplayStore((s) => s.tokens);
  const nextTurn = useGameplayStore((s) => s.nextTurn);
  const endCombat = useGameplayStore((s) => s.endCombat);
  const toggleParticipantDead = useGameplayStore((s) => s.toggleParticipantDead);
  const removeParticipant = useGameplayStore((s) => s.removeParticipant);
  const reorderParticipant = useGameplayStore((s) => s.reorderParticipant);
  const delayTurn = useGameplayStore((s) => s.delayTurn);
  const addParticipantMidCombat = useGameplayStore((s) => s.addParticipantMidCombat);
  const addToken = useGameplayStore((s) => s.addToken);
  const updateToken = useGameplayStore((s) => s.updateToken);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hpDelta, setHpDelta] = useState("");
  const [showAddReinforcement, setShowAddReinforcement] = useState(false);

  const handleNextTurn = useCallback(() => {
    nextTurn();
  }, [nextTurn]);

  const handleEnd = useCallback(() => {
    endCombat();
    onEnd();
  }, [endCombat, onEnd]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setHpDelta("");
  }, []);

  const applyHpChange = useCallback(
    (participantId: string, delta: number) => {
      const participant = combatParticipants.find((p) => p.id === participantId);
      if (!participant) return;
      const token = tokens[participant.tokenId];
      if (!token?.hp) return;
      const newHp = Math.max(0, Math.min(token.hp.max, token.hp.current + delta));
      updateToken(participant.tokenId, {
        hp: { ...token.hp, current: newHp },
      });
      setHpDelta("");
    },
    [combatParticipants, tokens, updateToken],
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

  const totalAlive = combatParticipants.filter((p) => !p.isDead).length;

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
          <Stack
            width={8}
            height={8}
            borderRadius={4}
            backgroundColor="#00B894"
          />
          <Text fontSize={12} color="#9090A0">
            Rodada {combatRound} · {totalAlive} vivos
          </Text>
        </XStack>

        {/* Participant list */}
        <YStack gap={4}>
          {combatParticipants.map((participant, index) => {
            const isCurrent = index === currentTurnIndex;
            const isExpanded = expandedId === participant.id;
            const token = tokens[participant.tokenId];
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
                  {/* Initiative number */}
                  <Text
                    fontSize={11}
                    fontWeight="700"
                    color={isCurrent ? "#6C5CE7" : "#5A5A6E"}
                    width={20}
                    textAlign="center"
                  >
                    {participant.initiative}
                  </Text>

                  {/* Avatar */}
                  <Stack
                    width={32}
                    height={32}
                    borderRadius={16}
                    backgroundColor="#1A1A24"
                    borderWidth={2}
                    borderColor={
                      participant.isDead
                        ? "#5A5A6E"
                        : participant.isNPC
                          ? "#FF6B6B"
                          : "#6C5CE7"
                    }
                    alignItems="center"
                    justifyContent="center"
                  >
                    {participant.isDead ? (
                      <Skull size={14} color="#5A5A6E" />
                    ) : (
                      <TokenIcon
                        name={participant.icon}
                        size={14}
                        color="#E8E8ED"
                      />
                    )}
                  </Stack>

                  {/* Name */}
                  <Text
                    flex={1}
                    fontSize={13}
                    fontWeight={isCurrent ? "700" : "500"}
                    color={participant.isDead ? "#5A5A6E" : "#E8E8ED"}
                    textDecorationLine={participant.isDead ? "line-through" : "none"}
                    numberOfLines={1}
                  >
                    {participant.name}
                  </Text>

                  {/* HP bar + text */}
                  {hp && (
                    <XStack alignItems="center" gap={6}>
                      <Stack
                        width={40}
                        height={6}
                        borderRadius={3}
                        backgroundColor="#1A1A24"
                        overflow="hidden"
                      >
                        <Stack
                          width={`${hpPercent}%`}
                          height={6}
                          borderRadius={3}
                          backgroundColor={participant.isDead ? "#5A5A6E" : hpColor}
                        />
                      </Stack>
                      <Text fontSize={11} color={participant.isDead ? "#5A5A6E" : "#9090A0"} width={40} textAlign="right">
                        {hp.current}/{hp.max}
                      </Text>
                    </XStack>
                  )}

                  {/* Current turn indicator */}
                  {isCurrent && (
                    <Stack
                      width={4}
                      height={28}
                      borderRadius={2}
                      backgroundColor="#6C5CE7"
                    />
                  )}
                </XStack>

                {/* Expanded actions */}
                {isExpanded && !participant.isDead && (
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
                    {hp && (
                      <XStack alignItems="center" gap={6}>
                        <Text fontSize={11} color="#5A5A6E" width={24}>
                          HP:
                        </Text>
                        <Stack
                          width={28}
                          height={28}
                          borderRadius={6}
                          backgroundColor="#FF6B6B20"
                          alignItems="center"
                          justifyContent="center"
                          pressStyle={{ opacity: 0.7 }}
                          onPress={() => {
                            const val = parseInt(hpDelta, 10) || 1;
                            applyHpChange(participant.id, -val);
                          }}
                        >
                          <Minus size={12} color="#FF6B6B" />
                        </Stack>
                        <Stack
                          flex={1}
                          maxWidth={60}
                          backgroundColor="#0F0F12"
                          borderRadius={6}
                          borderWidth={1}
                          borderColor="#2A2A35"
                          paddingHorizontal={8}
                          paddingVertical={4}
                        >
                          <TextInput
                            value={hpDelta}
                            onChangeText={setHpDelta}
                            placeholder="1"
                            placeholderTextColor="#5A5A6E"
                            keyboardType="number-pad"
                            style={styles.hpInput}
                            textAlign="center"
                          />
                        </Stack>
                        <Stack
                          width={28}
                          height={28}
                          borderRadius={6}
                          backgroundColor="#00B89420"
                          alignItems="center"
                          justifyContent="center"
                          pressStyle={{ opacity: 0.7 }}
                          onPress={() => {
                            const val = parseInt(hpDelta, 10) || 1;
                            applyHpChange(participant.id, val);
                          }}
                        >
                          <Plus size={12} color="#00B894" />
                        </Stack>
                      </XStack>
                    )}

                    {/* Action buttons row */}
                    <XStack gap={6} flexWrap="wrap">
                      {/* Delay turn */}
                      <Stack
                        paddingHorizontal={8}
                        paddingVertical={5}
                        borderRadius={6}
                        backgroundColor="#1C1C24"
                        borderWidth={1}
                        borderColor="#2A2A35"
                        pressStyle={{ opacity: 0.7 }}
                        onPress={() => delayTurn(participant.id)}
                      >
                        <XStack alignItems="center" gap={4}>
                          <Clock size={10} color="#9090A0" />
                          <Text fontSize={10} color="#9090A0">
                            Atrasar
                          </Text>
                        </XStack>
                      </Stack>

                      {/* Move up */}
                      <Stack
                        paddingHorizontal={8}
                        paddingVertical={5}
                        borderRadius={6}
                        backgroundColor="#1C1C24"
                        borderWidth={1}
                        borderColor="#2A2A35"
                        pressStyle={{ opacity: 0.7 }}
                        onPress={() => reorderParticipant(participant.id, index - 1)}
                        disabled={index === 0}
                        opacity={index === 0 ? 0.4 : 1}
                      >
                        <ChevronUp size={12} color="#9090A0" />
                      </Stack>

                      {/* Move down */}
                      <Stack
                        paddingHorizontal={8}
                        paddingVertical={5}
                        borderRadius={6}
                        backgroundColor="#1C1C24"
                        borderWidth={1}
                        borderColor="#2A2A35"
                        pressStyle={{ opacity: 0.7 }}
                        onPress={() => reorderParticipant(participant.id, index + 1)}
                        disabled={index === combatParticipants.length - 1}
                        opacity={index === combatParticipants.length - 1 ? 0.4 : 1}
                      >
                        <ChevronDown size={12} color="#9090A0" />
                      </Stack>

                      {/* Mark dead */}
                      <Stack
                        paddingHorizontal={8}
                        paddingVertical={5}
                        borderRadius={6}
                        backgroundColor="#FF6B6B15"
                        borderWidth={1}
                        borderColor="#FF6B6B40"
                        pressStyle={{ opacity: 0.7 }}
                        onPress={() => toggleParticipantDead(participant.id)}
                      >
                        <XStack alignItems="center" gap={4}>
                          <Skull size={10} color="#FF6B6B" />
                          <Text fontSize={10} color="#FF6B6B">
                            Morto
                          </Text>
                        </XStack>
                      </Stack>

                      {/* Remove */}
                      <Stack
                        paddingHorizontal={8}
                        paddingVertical={5}
                        borderRadius={6}
                        backgroundColor="#1C1C24"
                        borderWidth={1}
                        borderColor="#2A2A35"
                        pressStyle={{ opacity: 0.7 }}
                        onPress={() => {
                          removeParticipant(participant.id);
                          setExpandedId(null);
                        }}
                      >
                        <Trash2 size={12} color="#5A5A6E" />
                      </Stack>
                    </XStack>
                  </YStack>
                )}

                {/* Collapsed dead: allow revive */}
                {isExpanded && participant.isDead && (
                  <XStack
                    paddingHorizontal={12}
                    paddingVertical={8}
                    gap={6}
                    backgroundColor="rgba(28, 28, 36, 0.6)"
                    borderRadius={8}
                    marginTop={2}
                    marginBottom={4}
                  >
                    <Stack
                      paddingHorizontal={10}
                      paddingVertical={5}
                      borderRadius={6}
                      backgroundColor="#00B89420"
                      borderWidth={1}
                      borderColor="#00B89440"
                      pressStyle={{ opacity: 0.7 }}
                      onPress={() => toggleParticipantDead(participant.id)}
                    >
                      <Text fontSize={10} color="#00B894">
                        Reviver
                      </Text>
                    </Stack>
                    <Stack
                      paddingHorizontal={10}
                      paddingVertical={5}
                      borderRadius={6}
                      backgroundColor="#1C1C24"
                      borderWidth={1}
                      borderColor="#2A2A35"
                      pressStyle={{ opacity: 0.7 }}
                      onPress={() => {
                        removeParticipant(participant.id);
                        setExpandedId(null);
                      }}
                    >
                      <XStack alignItems="center" gap={4}>
                        <Trash2 size={10} color="#5A5A6E" />
                        <Text fontSize={10} color="#5A5A6E">
                          Remover
                        </Text>
                      </XStack>
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
