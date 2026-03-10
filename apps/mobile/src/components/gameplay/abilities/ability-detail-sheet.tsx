import { memo, useCallback } from "react";
import { Stack, Text, XStack, YStack } from "tamagui";
import { Check, X, Dices } from "lucide-react-native";
import { useAbilityStore } from "../../../stores/abilityStore";
import { AbilityCardFull } from "./ability-card";
import { SubModalSheet } from "../gm-tools/SubModalSheet";

// ─── Upcast Level Pills ──────────────────────────────────

function UpcastPills({
  baseLevel,
  maxLevel,
  selectedLevel,
  onSelect,
}: {
  baseLevel: number;
  maxLevel: number;
  selectedLevel: number | null;
  onSelect: (level: number | null) => void;
}) {
  const levels: number[] = [];
  for (let i = baseLevel; i <= maxLevel; i++) {
    levels.push(i);
  }

  return (
    <YStack gap={6}>
      <Text
        fontSize={9}
        fontWeight="700"
        color="#5A5A6E"
        textTransform="uppercase"
        letterSpacing={1}
      >
        Nível do Slot
      </Text>
      <XStack gap={6} flexWrap="wrap">
        {levels.map((level) => {
          const isActive =
            selectedLevel === level ||
            (selectedLevel === null && level === baseLevel);
          return (
            <Stack
              key={level}
              width={40}
              height={36}
              borderRadius={8}
              borderWidth={1}
              borderColor={
                isActive ? "#6C5CE7" : "rgba(255,255,255,0.08)"
              }
              backgroundColor={
                isActive ? "rgba(108,92,231,0.2)" : "rgba(255,255,255,0.03)"
              }
              alignItems="center"
              justifyContent="center"
              pressStyle={{ opacity: 0.7 }}
              onPress={() =>
                onSelect(level === baseLevel ? null : level)
              }
            >
              <Text
                fontSize={14}
                fontWeight="700"
                color={isActive ? "#6C5CE7" : "#9090A0"}
              >
                {level}
              </Text>
            </Stack>
          );
        })}
      </XStack>
    </YStack>
  );
}

// ─── Result Display ───────────────────────────────────────

function UseResultDisplay() {
  const lastResult = useAbilityStore((s) => s.lastResult);

  if (!lastResult) return null;

  return (
    <YStack
      gap={8}
      borderWidth={1}
      borderColor={
        lastResult.success
          ? "rgba(52,211,153,0.2)"
          : "rgba(255,107,107,0.2)"
      }
      borderRadius={10}
      padding={12}
      backgroundColor={
        lastResult.success
          ? "rgba(52,211,153,0.05)"
          : "rgba(255,107,107,0.05)"
      }
    >
      {/* Status */}
      <XStack alignItems="center" gap={6}>
        {lastResult.success ? (
          <Check size={14} color="#34D399" />
        ) : (
          <X size={14} color="#FF6B6B" />
        )}
        <Text
          fontSize={12}
          fontWeight="700"
          color={lastResult.success ? "#34D399" : "#FF6B6B"}
        >
          {lastResult.success ? "Sucesso!" : "Falha"}
        </Text>
      </XStack>

      {/* Rolls */}
      {lastResult.rolls.map((roll, i) => (
        <XStack
          key={i}
          alignItems="center"
          justifyContent="space-between"
          gap={8}
        >
          <XStack alignItems="center" gap={6}>
            <Dices size={12} color="#9090A0" />
            <Text fontSize={11} color="#9090A0">
              {roll.label}: {roll.formula}
            </Text>
          </XStack>
          <XStack alignItems="center" gap={4}>
            <Text fontSize={10} color="#5A5A6E">
              [{roll.rolls.join(", ")}]
            </Text>
            <Text
              fontSize={16}
              fontWeight="800"
              color={
                roll.isNat20
                  ? "#FFD700"
                  : roll.isNat1
                    ? "#FF6B6B"
                    : "#E8E8ED"
              }
            >
              {roll.total}
            </Text>
          </XStack>
        </XStack>
      ))}

      {/* Effects */}
      {lastResult.effects.length > 0 && (
        <YStack gap={4} marginTop={4}>
          {lastResult.effects.map((effect, i) => (
            <Text key={i} fontSize={10} color="#9090A0">
              {effect.description}
            </Text>
          ))}
        </YStack>
      )}

      {/* Errors */}
      {lastResult.errors.map((err, i) => (
        <Text key={i} fontSize={11} color="#FF6B6B">
          {err}
        </Text>
      ))}
    </YStack>
  );
}

// ─── Main Component ───────────────────────────────────────

function AbilityDetailSheetInner() {
  const activeAbility = useAbilityStore((s) => s.activeAbility);
  const upcastLevel = useAbilityStore((s) => s.upcastLevel);
  const selectAbility = useAbilityStore((s) => s.selectAbility);
  const setUpcastLevel = useAbilityStore((s) => s.setUpcastLevel);
  const confirmUse = useAbilityStore((s) => s.confirmUse);
  const clearResult = useAbilityStore((s) => s.clearResult);
  const lastResult = useAbilityStore((s) => s.lastResult);

  const handleBack = useCallback(() => {
    selectAbility(null);
    clearResult();
  }, [selectAbility, clearResult]);

  const handleUse = useCallback(() => {
    if (!activeAbility) return;
    confirmUse(activeAbility, { upcastLevel: upcastLevel ?? undefined });
  }, [activeAbility, confirmUse, upcastLevel]);

  // Determine max spell slot level for upcast pills
  // This is approximate — real data would come from character
  const maxUpcastLevel = 9;

  const isOpen = activeAbility !== null;

  const footer = activeAbility ? (
    <Stack
      backgroundColor={
        activeAbility.available && !lastResult
          ? "#6C5CE7"
          : lastResult?.success
            ? "rgba(52,211,153,0.15)"
            : "rgba(255,255,255,0.05)"
      }
      borderRadius={12}
      paddingVertical={14}
      alignItems="center"
      opacity={activeAbility.available && !lastResult ? 1 : 0.6}
      pressStyle={
        activeAbility.available && !lastResult
          ? { opacity: 0.8 }
          : undefined
      }
      onPress={
        lastResult
          ? handleBack
          : activeAbility.available
            ? handleUse
            : undefined
      }
    >
      <Text
        fontSize={14}
        fontWeight="700"
        color={
          lastResult?.success
            ? "#34D399"
            : activeAbility.available && !lastResult
              ? "white"
              : "#5A5A6E"
        }
      >
        {lastResult
          ? "Fechar"
          : activeAbility.available
            ? "Usar Habilidade"
            : "Indisponível"}
      </Text>
    </Stack>
  ) : undefined;

  return (
    <SubModalSheet
      isOpen={isOpen}
      snapPoints={["50%", "85%"]}
      title={activeAbility?.name ?? "Habilidade"}
      onBack={handleBack}
      onDismiss={handleBack}
      footer={footer}
    >
      {activeAbility && (
        <YStack gap={16}>
          <AbilityCardFull ability={activeAbility} />

          {/* Upcast pills */}
          {activeAbility.upcastable &&
            activeAbility.spellLevel !== undefined &&
            !lastResult && (
              <UpcastPills
                baseLevel={activeAbility.spellLevel}
                maxLevel={maxUpcastLevel}
                selectedLevel={upcastLevel}
                onSelect={setUpcastLevel}
              />
            )}

          {/* Result display */}
          <UseResultDisplay />
        </YStack>
      )}
    </SubModalSheet>
  );
}

export const AbilityDetailSheet = memo(AbilityDetailSheetInner);
