import { useState, useMemo } from "react";
import { FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { YStack } from "tamagui";
import { WizardHeader } from "../../../../../components/wizard-header";
import { RaceCard } from "../../../../../components/race-card";
import { RaceDetail } from "../../../../../components/race-detail";
import { useCharacterCreationStore } from "../../../../../lib/character-creation-store";
import { DND5E_RACES } from "../../../../../lib/data/dnd5e/races";

export default function RaceScreen() {
  const { systemId } = useLocalSearchParams<{ systemId: string }>();
  const router = useRouter();
  const { race, updateRace, totalSteps } = useCharacterCreationStore();

  const [mode, setMode] = useState<"browse" | "detail">(
    race.raceId ? "detail" : "browse",
  );
  const [viewingRaceId, setViewingRaceId] = useState<string | null>(
    race.raceId,
  );

  const viewingRace = useMemo(
    () => DND5E_RACES.find((r) => r.id === viewingRaceId) ?? null,
    [viewingRaceId],
  );

  function handleRacePress(raceId: string) {
    setViewingRaceId(raceId);
    // Pre-select if different from current
    if (raceId !== race.raceId) {
      updateRace({ raceId: raceId, subRaceId: null, choices: {} });
    }
    setMode("detail");
  }

  function handleBack() {
    if (mode === "detail") {
      setMode("browse");
    } else {
      router.back();
    }
  }

  function handleConfirm() {
    router.push(`/(app)/characters/create/${systemId}/class`);
  }

  return (
    <YStack flex={1} backgroundColor="$bg">
      <WizardHeader
        currentStep={2}
        totalSteps={totalSteps}
        stepLabel="Raça"
        systemId={systemId}
        onBack={handleBack}
      />

      {mode === "browse" ? (
        <FlatList
          data={DND5E_RACES}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingBottom: 40,
            paddingTop: 8,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <RaceCard
              race={item}
              isSelected={race.raceId === item.id}
              onPress={() => handleRacePress(item.id)}
            />
          )}
        />
      ) : viewingRace ? (
        <RaceDetail
          race={viewingRace}
          selectedSubRaceId={race.subRaceId}
          choices={race.choices}
          onSelectSubRace={(id) => updateRace({ subRaceId: id })}
          onChoiceChange={(choiceId, value) =>
            updateRace({
              choices: { ...race.choices, [choiceId]: value },
            })
          }
          onConfirm={handleConfirm}
        />
      ) : null}
    </YStack>
  );
}
