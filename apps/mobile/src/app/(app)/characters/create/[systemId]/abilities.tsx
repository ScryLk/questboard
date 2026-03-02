import { ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Stack, Text, XStack, YStack } from "tamagui";
import { WizardHeader } from "../../../../../components/wizard-header";
import { AbilityMethodSelector } from "../../../../../components/ability-method-selector";
import { DiceRollRow } from "../../../../../components/dice-roll-row";
import { PointBuyRow } from "../../../../../components/point-buy-row";
import { StandardArrayAssigner } from "../../../../../components/standard-array";
import { ComputedStatsPanel } from "../../../../../components/computed-stats";
import { Button } from "../../../../../components/button";
import {
  useCharacterCreationStore,
  getRacialBonuses,
  type AbilityMethod,
} from "../../../../../lib/character-creation-store";
import type { AbilityKey, DiceRollResult } from "../../../../../lib/data/dnd5e/types";
import {
  ABILITY_ORDER,
  POINT_BUY_TOTAL,
  getPointsRemaining,
  roll4d6DropLowest,
} from "../../../../../lib/data/dnd5e/abilities";

export default function AbilitiesScreen() {
  const { systemId } = useLocalSearchParams<{ systemId: string }>();
  const router = useRouter();
  const store = useCharacterCreationStore();
  const {
    abilities,
    updateAbilities,
    setAbilityScore,
    totalSteps,
  } = store;

  const racialBonuses = getRacialBonuses(store);
  const method = abilities.method;

  // Validation per method
  const allScoresAssigned = (() => {
    if (!method) return false;
    if (method === "roll") {
      return abilities.rollResults.length === 6;
    }
    if (method === "point-buy") {
      return true; // always valid since defaults are set
    }
    if (method === "standard-array") {
      return ABILITY_ORDER.every(
        (k) => abilities.standardArrayAssignment[k] !== null,
      );
    }
    return false;
  })();

  function handleMethodChange(newMethod: AbilityMethod) {
    // Reset scores when changing method
    updateAbilities({
      method: newMethod,
      baseScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      rollResults: [],
      standardArrayAssignment: {
        str: null,
        dex: null,
        con: null,
        int: null,
        wis: null,
        cha: null,
      },
    });
  }

  function handleRoll(ability: AbilityKey) {
    const result = roll4d6DropLowest();
    result.ability = ability;

    const newResults = [...abilities.rollResults, result];
    const newScores = { ...abilities.baseScores };
    newScores[ability] = result.total;

    updateAbilities({ rollResults: newResults, baseScores: newScores });
  }

  function handleRollAll() {
    const newResults: DiceRollResult[] = [];
    const newScores = { ...abilities.baseScores };

    for (const ability of ABILITY_ORDER) {
      // Skip already rolled
      if (abilities.rollResults.find((r) => r.ability === ability)) continue;

      const result = roll4d6DropLowest();
      result.ability = ability;
      newResults.push(result);
      newScores[ability] = result.total;
    }

    updateAbilities({
      rollResults: [...abilities.rollResults, ...newResults],
      baseScores: newScores,
    });
  }

  function handleStandardArrayChange(
    assignment: Record<AbilityKey, number | null>,
  ) {
    const newScores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    for (const [key, value] of Object.entries(assignment)) {
      if (value !== null) {
        newScores[key as AbilityKey] = value;
      }
    }
    updateAbilities({
      standardArrayAssignment: assignment,
      baseScores: newScores,
    });
  }

  function handleNext() {
    router.push(`/(app)/characters/create/${systemId}/review`);
  }

  const pointsRemaining = getPointsRemaining(abilities.baseScores);

  return (
    <YStack flex={1} backgroundColor="$bg">
      <WizardHeader
        currentStep={4}
        totalSteps={totalSteps}
        stepLabel="Atributos"
        systemId={systemId}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Method Selector */}
        {!method && (
          <YStack marginTop={16}>
            <AbilityMethodSelector
              selected={method}
              onChange={handleMethodChange}
            />
          </YStack>
        )}

        {/* Rolling Method */}
        {method === "roll" && (
          <YStack marginTop={16} gap={12}>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={14} fontWeight="600" color="$textPrimary">
                Rolar Dados
              </Text>
              {abilities.rollResults.length < 6 && (
                <Stack
                  borderRadius={10}
                  backgroundColor="$accentMuted"
                  paddingHorizontal={12}
                  paddingVertical={6}
                  onPress={handleRollAll}
                  pressStyle={{ opacity: 0.7, scale: 0.98 }}
                >
                  <Text fontSize={12} fontWeight="600" color="$accent">
                    Rolar Todos
                  </Text>
                </Stack>
              )}
            </XStack>

            <YStack
              borderRadius={14}
              backgroundColor="$bgCard"
              borderWidth={1}
              borderColor="$border"
              padding={12}
            >
              {ABILITY_ORDER.map((ability) => (
                <DiceRollRow
                  key={ability}
                  ability={ability}
                  result={
                    abilities.rollResults.find(
                      (r) => r.ability === ability,
                    ) ?? null
                  }
                  racialBonus={racialBonuses[ability]}
                  onRoll={() => handleRoll(ability)}
                />
              ))}
            </YStack>

            <Stack
              alignSelf="center"
              onPress={() => handleMethodChange(null)}
              pressStyle={{ opacity: 0.7 }}
            >
              <Text fontSize={12} color="$accent" fontWeight="600">
                Trocar método
              </Text>
            </Stack>
          </YStack>
        )}

        {/* Point Buy Method */}
        {method === "point-buy" && (
          <YStack marginTop={16} gap={12}>
            <Text fontSize={14} fontWeight="600" color="$textPrimary">
              Compra de Pontos
            </Text>

            {/* Points bar */}
            <YStack
              borderRadius={12}
              backgroundColor="$bgCard"
              borderWidth={1}
              borderColor="$border"
              padding={12}
              gap={8}
            >
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={13} color="$textMuted">
                  Pontos Restantes
                </Text>
                <Text
                  fontSize={16}
                  fontWeight="700"
                  color={pointsRemaining > 0 ? "$accent" : "$success"}
                >
                  {pointsRemaining}/{POINT_BUY_TOTAL}
                </Text>
              </XStack>
              <Stack
                height={4}
                borderRadius={9999}
                backgroundColor="$border"
              >
                <Stack
                  height={4}
                  borderRadius={9999}
                  backgroundColor={pointsRemaining > 0 ? "$accent" : "$success"}
                  width={`${((POINT_BUY_TOTAL - pointsRemaining) / POINT_BUY_TOTAL) * 100}%`}
                />
              </Stack>
            </YStack>

            <YStack
              borderRadius={14}
              backgroundColor="$bgCard"
              borderWidth={1}
              borderColor="$border"
              padding={12}
            >
              {ABILITY_ORDER.map((ability) => (
                <PointBuyRow
                  key={ability}
                  ability={ability}
                  value={abilities.baseScores[ability]}
                  racialBonus={racialBonuses[ability]}
                  pointsRemaining={pointsRemaining}
                  onChange={(value) => setAbilityScore(ability, value)}
                />
              ))}
            </YStack>

            <Stack
              alignSelf="center"
              onPress={() => handleMethodChange(null)}
              pressStyle={{ opacity: 0.7 }}
            >
              <Text fontSize={12} color="$accent" fontWeight="600">
                Trocar método
              </Text>
            </Stack>
          </YStack>
        )}

        {/* Standard Array Method */}
        {method === "standard-array" && (
          <YStack marginTop={16} gap={12}>
            <Text fontSize={14} fontWeight="600" color="$textPrimary">
              Valores Padrão
            </Text>
            <Text fontSize={12} color="$textMuted">
              Toque um valor e depois toque o atributo para atribuí-lo
            </Text>

            <StandardArrayAssigner
              assignment={abilities.standardArrayAssignment}
              racialBonuses={racialBonuses}
              onChange={handleStandardArrayChange}
            />

            <Stack
              alignSelf="center"
              onPress={() => handleMethodChange(null)}
              pressStyle={{ opacity: 0.7 }}
            >
              <Text fontSize={12} color="$accent" fontWeight="600">
                Trocar método
              </Text>
            </Stack>
          </YStack>
        )}

        {/* Computed Stats Panel */}
        {method && (
          <YStack marginTop={20}>
            <Text
              fontSize={14}
              fontWeight="600"
              color="$textPrimary"
              marginBottom={8}
            >
              Estatísticas Calculadas
            </Text>
            <ComputedStatsPanel />
          </YStack>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingHorizontal={24}
        paddingBottom={40}
        paddingTop={16}
        backgroundColor="$bg"
        borderTopWidth={1}
        borderTopColor="$border"
      >
        <Button
          variant="primary"
          size="lg"
          disabled={!allScoresAssigned}
          onPress={handleNext}
        >
          Próximo: Revisão →
        </Button>
      </YStack>
    </YStack>
  );
}
