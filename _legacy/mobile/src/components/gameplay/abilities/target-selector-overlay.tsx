import { memo, useCallback } from "react";
import { StyleSheet, Pressable } from "react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { Target, X } from "lucide-react-native";
import { useGameplayStore } from "../../../lib/gameplay-store";
import { useCombatStore } from "../../../stores/combatStore";

// ─── Target Row ───────────────────────────────────────────

function TargetRow({
  name,
  hp,
  isNPC,
  onSelect,
}: {
  name: string;
  hp: { current: number; max: number } | null;
  isNPC: boolean;
  onSelect: () => void;
}) {
  const hpRatio = hp ? hp.current / hp.max : 1;

  return (
    <Stack
      backgroundColor="rgba(255,255,255,0.04)"
      borderRadius={10}
      borderWidth={1}
      borderColor="rgba(255,255,255,0.06)"
      paddingHorizontal={12}
      paddingVertical={10}
      pressStyle={{ opacity: 0.7, backgroundColor: "rgba(108,92,231,0.1)" }}
      onPress={onSelect}
    >
      <XStack alignItems="center" gap={10}>
        <Target size={14} color={isNPC ? "#FF6B6B" : "#6C5CE7"} />
        <YStack flex={1} gap={2}>
          <Text fontSize={13} fontWeight="600" color="#E8E8ED">
            {name}
          </Text>
          {hp && (
            <XStack alignItems="center" gap={6}>
              <Stack
                flex={1}
                height={3}
                borderRadius={2}
                backgroundColor="rgba(255,255,255,0.08)"
                overflow="hidden"
              >
                <Stack
                  height={3}
                  borderRadius={2}
                  width={`${hpRatio * 100}%` as `${number}%`}
                  backgroundColor={
                    hpRatio > 0.5
                      ? "#34D399"
                      : hpRatio > 0.25
                        ? "#FDCB6E"
                        : "#FF6B6B"
                  }
                />
              </Stack>
              <Text fontSize={9} color="#5A5A6E" minWidth={40} textAlign="right">
                {hp.current}/{hp.max}
              </Text>
            </XStack>
          )}
        </YStack>
      </XStack>
    </Stack>
  );
}

// ─── Main Overlay ─────────────────────────────────────────

function TargetSelectorOverlayInner({
  visible,
  onSelect,
  onClose,
}: {
  visible: boolean;
  onSelect: (targetId: string) => void;
  onClose: () => void;
}) {
  const tokens = useGameplayStore((s) => s.tokens);
  const combatActive = useGameplayStore((s) => s.combatActive);
  const combatants = useCombatStore((s) => s.combatants);

  // In combat: show combatants. Out of combat: show visible tokens.
  const targets = combatActive
    ? combatants
        .filter((c) => !c.isDead)
        .map((c) => {
          const token = Object.values(tokens).find((t) => t.id === c.tokenId);
          return {
            id: c.id,
            name: c.name,
            hp: token?.hp ?? null,
            isNPC: !c.isPlayer,
          };
        })
    : Object.values(tokens)
        .filter((t) => t.visible)
        .map((t) => ({
          id: t.id,
          name: t.name,
          hp: t.hp,
          isNPC: t.layer === "npc",
        }));

  if (!visible) return null;

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable onPress={(e) => e.stopPropagation()}>
        <YStack
          backgroundColor="#16161C"
          borderRadius={16}
          borderWidth={1}
          borderColor="#2A2A35"
          padding={16}
          width={280}
          maxHeight={400}
          gap={8}
        >
          {/* Header */}
          <XStack alignItems="center" justifyContent="space-between" marginBottom={4}>
            <XStack alignItems="center" gap={6}>
              <Target size={14} color="#6C5CE7" />
              <Text fontSize={14} fontWeight="700" color="#E8E8ED">
                Selecionar Alvo
              </Text>
            </XStack>
            <Stack
              width={28}
              height={28}
              borderRadius={8}
              backgroundColor="rgba(255,255,255,0.05)"
              alignItems="center"
              justifyContent="center"
              pressStyle={{ opacity: 0.7 }}
              onPress={onClose}
            >
              <X size={14} color="#5A5A6E" />
            </Stack>
          </XStack>

          {/* Target list */}
          {targets.length === 0 ? (
            <Text fontSize={12} color="#5A5A6E" textAlign="center" paddingVertical={20}>
              Nenhum alvo disponível
            </Text>
          ) : (
            <YStack gap={6}>
              {targets.map((target) => (
                <TargetRow
                  key={target.id}
                  name={target.name}
                  hp={target.hp}
                  isNPC={target.isNPC}
                  onSelect={() => onSelect(target.id)}
                />
              ))}
            </YStack>
          )}
        </YStack>
      </Pressable>
    </Pressable>
  );
}

export const TargetSelectorOverlay = memo(TargetSelectorOverlayInner);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});
