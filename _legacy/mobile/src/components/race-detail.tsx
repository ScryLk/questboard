import { ScrollView } from "react-native";
import { Footprints, Ruler, Languages } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { Race, RaceChoice } from "../lib/data/dnd5e/types";
import { ABILITY_SHORT_LABELS } from "../lib/data/dnd5e/abilities";
import { TraitList } from "./trait-list";
import { FeatureChoiceSelector } from "./feature-choice";
import { Button } from "./button";

interface RaceDetailProps {
  race: Race;
  selectedSubRaceId: string | null;
  choices: Record<string, string | string[]>;
  onSelectSubRace: (id: string) => void;
  onChoiceChange: (choiceId: string, value: string | string[]) => void;
  onConfirm: () => void;
}

export function RaceDetail({
  race,
  selectedSubRaceId,
  choices,
  onSelectSubRace,
  onChoiceChange,
  onConfirm,
}: RaceDetailProps) {
  const Icon = race.icon;
  const subRace = race.subRaces.find((s) => s.id === selectedSubRaceId);

  // Merge base + subrace traits
  const allTraits = [
    ...race.traits,
    ...(subRace?.traits ?? []),
  ];

  // Merge base + subrace ability bonuses
  const allBonuses = [
    ...race.abilityBonuses,
    ...(subRace?.abilityBonuses ?? []),
  ];

  // Merge base + subrace choices
  const allChoices: RaceChoice[] = [
    ...(race.choices ?? []),
    ...(subRace?.choices ?? []),
  ];

  const needsSubRace = race.subRaces.length > 0;
  const canConfirm = !needsSubRace || selectedSubRaceId !== null;

  return (
    <YStack flex={1}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <YStack alignItems="center" marginTop={20} marginBottom={20} gap={10}>
          <Stack
            height={80}
            width={80}
            borderRadius={9999}
            backgroundColor="$accentMuted"
            borderWidth={2}
            borderColor="$accent"
            alignItems="center"
            justifyContent="center"
          >
            <Icon size={40} color="#6C5CE7" />
          </Stack>
          <Text
            fontSize={22}
            fontWeight="700"
            color="$textPrimary"
            textAlign="center"
          >
            {race.name}
          </Text>
          <Text
            fontSize={13}
            color="$textMuted"
            textAlign="center"
          >
            {race.tagline}
          </Text>
        </YStack>

        {/* Ability Bonus Pills */}
        <XStack gap={8} justifyContent="center" marginBottom={20}>
          {allBonuses.map((b) => (
            <Stack
              key={`${b.ability}-${b.bonus}`}
              borderRadius={9999}
              backgroundColor="$accentMuted"
              paddingHorizontal={12}
              paddingVertical={4}
            >
              <Text fontSize={13} fontWeight="600" color="$accent">
                +{b.bonus} {ABILITY_SHORT_LABELS[b.ability]}
              </Text>
            </Stack>
          ))}
        </XStack>

        {/* Stats Row */}
        <XStack
          borderRadius={14}
          backgroundColor="$bgCard"
          borderWidth={1}
          borderColor="$border"
          padding={12}
          marginBottom={20}
          gap={8}
        >
          <YStack flex={1} alignItems="center" gap={4}>
            <Footprints size={16} color="#9090A0" />
            <Text fontSize={14} fontWeight="700" color="$textPrimary">
              {race.speed / 5 * 1.5}m
            </Text>
            <Text fontSize={10} color="$textMuted">
              Velocidade
            </Text>
          </YStack>
          <YStack flex={1} alignItems="center" gap={4}>
            <Ruler size={16} color="#9090A0" />
            <Text fontSize={14} fontWeight="700" color="$textPrimary">
              {race.size === "Medium" ? "Médio" : "Pequeno"}
            </Text>
            <Text fontSize={10} color="$textMuted">
              Tamanho
            </Text>
          </YStack>
          <YStack flex={1} alignItems="center" gap={4}>
            <Languages size={16} color="#9090A0" />
            <Text
              fontSize={12}
              fontWeight="600"
              color="$textPrimary"
              textAlign="center"
              numberOfLines={2}
            >
              {race.languages.join(", ")}
            </Text>
            <Text fontSize={10} color="$textMuted">
              Idiomas
            </Text>
          </YStack>
        </XStack>

        {/* Sub-race selector */}
        {needsSubRace && (
          <YStack gap={8} marginBottom={20}>
            <Text fontSize={14} fontWeight="600" color="$textPrimary">
              Sub-raça
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
            >
              {race.subRaces.map((sr) => {
                const isSelected = selectedSubRaceId === sr.id;
                return (
                  <Stack
                    key={sr.id}
                    width={140}
                    borderRadius={14}
                    borderWidth={1}
                    borderColor={isSelected ? "$accent" : "$border"}
                    backgroundColor={isSelected ? "$accentMuted" : "$bgCard"}
                    padding={14}
                    gap={4}
                    onPress={() => onSelectSubRace(sr.id)}
                    pressStyle={{ opacity: 0.85, scale: 0.98 }}
                  >
                    <Text
                      fontSize={14}
                      fontWeight="600"
                      color={isSelected ? "$textPrimary" : "$textSecondary"}
                    >
                      {sr.name}
                    </Text>
                    <Text fontSize={11} color="$textMuted">
                      {sr.abilityBonuses
                        .map(
                          (b) =>
                            `+${b.bonus} ${ABILITY_SHORT_LABELS[b.ability]}`,
                        )
                        .join(", ")}
                    </Text>
                  </Stack>
                );
              })}
            </ScrollView>
          </YStack>
        )}

        {/* Traits */}
        <YStack gap={8} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Traços Raciais
          </Text>
          <TraitList traits={allTraits} />
        </YStack>

        {/* Choices */}
        {allChoices.map((choice) => (
          <YStack key={choice.id} gap={8} marginBottom={20}>
            <FeatureChoiceSelector
              label={choice.label}
              options={choice.options.map((o) => ({
                id: o.id,
                name: o.name,
                description: o.description ?? "",
              }))}
              selected={
                typeof choices[choice.id] === "string"
                  ? (choices[choice.id] as string)
                  : null
              }
              onChange={(id) => onChoiceChange(choice.id, id)}
            />
          </YStack>
        ))}
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
          disabled={!canConfirm}
          onPress={onConfirm}
        >
          {`Escolher ${race.name}`}
        </Button>
      </YStack>
    </YStack>
  );
}
