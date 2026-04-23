import { memo, useCallback, useState } from "react";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";
import {
  Plus,
  Trash2,
  Swords,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { CombatAddEnemy } from "./CombatAddEnemy";
import { TokenIcon } from "../token-icon";
import { useGameplayStore } from "../../../lib/gameplay-store";
import type { CombatParticipant } from "../../../lib/gameplay-store";

interface EnemyEntry {
  id: string;
  name: string;
  count: number;
  hp: number;
  ac: number;
}

interface CombatSetupViewProps {
  onStartCombat: () => void;
}

function CombatSetupViewInner({ onStartCombat }: CombatSetupViewProps) {
  const onlinePlayers = useGameplayStore((s) => s.onlinePlayers);
  const tokens = useGameplayStore((s) => s.tokens);
  const startCombat = useGameplayStore((s) => s.startCombat);
  const addToken = useGameplayStore((s) => s.addToken);

  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(
    () => new Set(onlinePlayers.filter((p) => p.role === "player").map((p) => p.id)),
  );
  const [enemies, setEnemies] = useState<EnemyEntry[]>([]);
  const [showAddEnemy, setShowAddEnemy] = useState(false);

  const togglePlayer = useCallback((playerId: string) => {
    setSelectedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  }, []);

  const handleAddEnemy = useCallback(
    (name: string, count: number, hp: number, ac: number) => {
      setEnemies((prev) => [
        ...prev,
        { id: `enemy-${Date.now()}`, name, count, hp, ac },
      ]);
      setShowAddEnemy(false);
    },
    [],
  );

  const removeEnemy = useCallback((id: string) => {
    setEnemies((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleStart = useCallback(() => {
    const participants: CombatParticipant[] = [];

    // Add selected players
    for (const playerId of selectedPlayers) {
      const player = onlinePlayers.find((p) => p.id === playerId);
      if (!player) continue;
      const token = Object.values(tokens).find((t) => t.ownerId === playerId);
      participants.push({
        id: `init-${Date.now()}-${playerId}`,
        tokenId: token?.id ?? "",
        name: player.characterName ?? player.name,
        icon: token?.icon ?? player.icon,
        initiative: Math.floor(Math.random() * 20) + 1,
        isNPC: false,
        isDead: false,
      });
    }

    // Add enemies — create tokens for them
    for (const enemy of enemies) {
      for (let i = 0; i < enemy.count; i++) {
        const suffix = enemy.count > 1 ? ` #${i + 1}` : "";
        const tokenId = `token-combat-${Date.now()}-${enemy.id}-${i}`;
        addToken({
          id: tokenId,
          name: `${enemy.name}${suffix}`,
          imageUrl: null,
          icon: "skull",
          x: 12 + i,
          y: 6,
          size: 1,
          layer: "npc",
          visible: true,
          characterId: null,
          hp: { current: enemy.hp, max: enemy.hp },
          conditions: [],
          ownerId: "gm",
          color: "#FF6B6B",
          ac: enemy.ac,
          hostility: "hostile",
        });

        participants.push({
          id: `init-${Date.now()}-${tokenId}`,
          tokenId,
          name: `${enemy.name}${suffix}`,
          icon: "skull",
          initiative: Math.floor(Math.random() * 20) + 1,
          isNPC: true,
          isDead: false,
        });
      }
    }

    startCombat(participants);
    onStartCombat();
  }, [selectedPlayers, enemies, onlinePlayers, tokens, startCombat, addToken, onStartCombat]);

  const players = onlinePlayers.filter((p) => p.role === "player");
  const totalEnemyCount = enemies.reduce((sum, e) => sum + e.count, 0);
  const totalParticipants = selectedPlayers.size + totalEnemyCount;

  return (
    <>
      <BottomSheetScrollView
        style={styles.scrollFlex}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Players section */}
        <YStack gap={8}>
          <Text fontSize={13} fontWeight="600" color="#E8E8ED">
            Jogadores
          </Text>
          {players.map((player) => {
            const isSelected = selectedPlayers.has(player.id);
            const token = Object.values(tokens).find(
              (t) => t.ownerId === player.id,
            );
            return (
              <XStack
                key={player.id}
                height={48}
                alignItems="center"
                gap={10}
                paddingHorizontal={4}
                pressStyle={{ opacity: 0.7 }}
                onPress={() => togglePlayer(player.id)}
              >
                {/* Checkbox */}
                <Stack
                  width={20}
                  height={20}
                  borderRadius={4}
                  borderWidth={2}
                  borderColor={isSelected ? "#6C5CE7" : "#2A2A35"}
                  backgroundColor={isSelected ? "#6C5CE7" : "transparent"}
                  alignItems="center"
                  justifyContent="center"
                >
                  {isSelected && (
                    <Text fontSize={12} fontWeight="700" color="white">
                      ✓
                    </Text>
                  )}
                </Stack>

                {/* Avatar */}
                <Stack
                  width={32}
                  height={32}
                  borderRadius={16}
                  backgroundColor="#1A1A24"
                  borderWidth={2}
                  borderColor={token?.color ?? "#2A2A35"}
                  alignItems="center"
                  justifyContent="center"
                >
                  <TokenIcon name={token?.icon ?? player.icon} size={14} color="#E8E8ED" />
                </Stack>

                <YStack flex={1}>
                  <Text fontSize={13} fontWeight="600" color="#E8E8ED">
                    {player.characterName ?? player.name}
                  </Text>
                  <Text fontSize={11} color="#5A5A6E">
                    {player.name}
                  </Text>
                </YStack>

                <Text fontSize={11} color="#5A5A6E">
                  Init: Auto
                </Text>
              </XStack>
            );
          })}
        </YStack>

        {/* Separator */}
        <Stack height={1} backgroundColor="#1E1E2A" marginVertical={12} />

        {/* Enemies section */}
        <YStack gap={8}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={13} fontWeight="600" color="#E8E8ED">
              Inimigos
            </Text>
            {!showAddEnemy && (
              <Stack
                paddingHorizontal={10}
                paddingVertical={4}
                borderRadius={6}
                backgroundColor="rgba(108, 92, 231, 0.15)"
                pressStyle={{ opacity: 0.7 }}
                onPress={() => setShowAddEnemy(true)}
              >
                <XStack alignItems="center" gap={4}>
                  <Plus size={12} color="#6C5CE7" />
                  <Text fontSize={11} fontWeight="600" color="#6C5CE7">
                    Adicionar
                  </Text>
                </XStack>
              </Stack>
            )}
          </XStack>

          {enemies.map((enemy) => (
            <XStack
              key={enemy.id}
              height={48}
              alignItems="center"
              gap={10}
              paddingHorizontal={4}
            >
              <Stack
                width={32}
                height={32}
                borderRadius={16}
                backgroundColor="#1A1A24"
                borderWidth={2}
                borderColor="#FF6B6B"
                alignItems="center"
                justifyContent="center"
              >
                <TokenIcon name="skull" size={14} color="#E8E8ED" />
              </Stack>

              <YStack flex={1}>
                <Text fontSize={13} fontWeight="600" color="#E8E8ED">
                  {enemy.name} {enemy.count > 1 ? `×${enemy.count}` : ""}
                </Text>
                <Text fontSize={11} color="#5A5A6E">
                  HP {enemy.hp} · CA {enemy.ac}
                </Text>
              </YStack>

              <Stack
                width={28}
                height={28}
                borderRadius={6}
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.6 }}
                onPress={() => removeEnemy(enemy.id)}
              >
                <Trash2 size={14} color="#FF6B6B" />
              </Stack>
            </XStack>
          ))}

          {showAddEnemy && (
            <CombatAddEnemy
              onAdd={handleAddEnemy}
              onCancel={() => setShowAddEnemy(false)}
            />
          )}

          {enemies.length === 0 && !showAddEnemy && (
            <Text fontSize={12} color="#5A5A6E" paddingHorizontal={4}>
              Nenhum inimigo adicionado
            </Text>
          )}
        </YStack>
      </BottomSheetScrollView>

      {/* Footer */}
      <YStack
        paddingHorizontal={16}
        paddingVertical={12}
        borderTopWidth={1}
        borderTopColor="#1E1E2A"
        backgroundColor="#16161C"
        gap={8}
      >
        <Text fontSize={11} color="#5A5A6E" textAlign="center">
          {totalParticipants} participantes ({selectedPlayers.size} jogadores + {totalEnemyCount} inimigos)
        </Text>
        <Stack
          height={44}
          borderRadius={10}
          backgroundColor={totalParticipants > 0 ? "#6C5CE7" : "#2A2A35"}
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.85 }}
          onPress={handleStart}
          disabled={totalParticipants === 0}
        >
          <XStack alignItems="center" gap={6}>
            <Swords size={16} color="white" />
            <Text fontSize={14} fontWeight="600" color="white">
              Iniciar Combate
            </Text>
          </XStack>
        </Stack>
      </YStack>
    </>
  );
}

export const CombatSetupView = memo(CombatSetupViewInner);

const styles = StyleSheet.create({
  scrollFlex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
