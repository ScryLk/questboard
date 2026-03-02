import { useState, useMemo } from "react";
import { FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { YStack } from "tamagui";
import { WizardHeader } from "../../../../../components/wizard-header";
import { ClassCard } from "../../../../../components/class-card";
import { ClassDetail } from "../../../../../components/class-detail";
import { useCharacterCreationStore } from "../../../../../lib/character-creation-store";
import { DND5E_CLASSES } from "../../../../../lib/data/dnd5e/classes";

export default function ClassScreen() {
  const { systemId } = useLocalSearchParams<{ systemId: string }>();
  const router = useRouter();
  const { race, class_, updateClass, totalSteps } =
    useCharacterCreationStore();

  const [mode, setMode] = useState<"browse" | "detail">(
    class_.classId ? "detail" : "browse",
  );
  const [viewingClassId, setViewingClassId] = useState<string | null>(
    class_.classId,
  );

  const viewingClass = useMemo(
    () => DND5E_CLASSES.find((c) => c.id === viewingClassId) ?? null,
    [viewingClassId],
  );

  function handleClassPress(classId: string) {
    setViewingClassId(classId);
    if (classId !== class_.classId) {
      updateClass({ classId, skills: [], featureChoices: {} });
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
    router.push(`/(app)/characters/create/${systemId}/abilities`);
  }

  return (
    <YStack flex={1} backgroundColor="$bg">
      <WizardHeader
        currentStep={3}
        totalSteps={totalSteps}
        stepLabel="Classe"
        systemId={systemId}
        onBack={handleBack}
      />

      {mode === "browse" ? (
        <FlatList
          data={DND5E_CLASSES}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingBottom: 40,
            paddingTop: 8,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ClassCard
              cls={item}
              isSelected={class_.classId === item.id}
              onPress={() => handleClassPress(item.id)}
            />
          )}
        />
      ) : viewingClass ? (
        <ClassDetail
          cls={viewingClass}
          selectedRaceId={race.raceId}
          skills={class_.skills}
          featureChoices={class_.featureChoices}
          onSkillsChange={(skills) => updateClass({ skills })}
          onFeatureChoiceChange={(choiceId, value) =>
            updateClass({
              featureChoices: {
                ...class_.featureChoices,
                [choiceId]: value,
              },
            })
          }
          onConfirm={handleConfirm}
        />
      ) : null}
    </YStack>
  );
}
