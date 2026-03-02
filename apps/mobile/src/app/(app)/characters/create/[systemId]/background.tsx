import { useState, useMemo } from "react";
import { FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { YStack } from "tamagui";
import { WizardHeader } from "../../../../../components/wizard-header";
import { BackgroundCard } from "../../../../../components/background-card";
import { BackgroundDetail } from "../../../../../components/background-detail";
import { useCharacterCreationStore } from "../../../../../lib/character-creation-store";
import { DND5E_BACKGROUNDS } from "../../../../../lib/data/dnd5e/backgrounds";

export default function BackgroundScreen() {
  const { systemId } = useLocalSearchParams<{ systemId: string }>();
  const router = useRouter();
  const { background, updateBackground, totalSteps } =
    useCharacterCreationStore();

  const [mode, setMode] = useState<"browse" | "detail">(
    background.backgroundId ? "detail" : "browse",
  );
  const [viewingBgId, setViewingBgId] = useState<string | null>(
    background.backgroundId,
  );

  const viewingBg = useMemo(
    () => DND5E_BACKGROUNDS.find((b) => b.id === viewingBgId) ?? null,
    [viewingBgId],
  );

  function handleBgPress(bgId: string) {
    setViewingBgId(bgId);
    if (bgId !== background.backgroundId) {
      updateBackground({ backgroundId: bgId });
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
    router.push(`/(app)/characters/create/${systemId}/equipment`);
  }

  return (
    <YStack flex={1} backgroundColor="$bg">
      <WizardHeader
        currentStep={5}
        totalSteps={totalSteps}
        stepLabel="Antecedente"
        systemId={systemId}
        onBack={handleBack}
      />

      {mode === "browse" ? (
        <FlatList
          data={DND5E_BACKGROUNDS}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingBottom: 40,
            paddingTop: 8,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <BackgroundCard
              background={item}
              isSelected={background.backgroundId === item.id}
              onPress={() => handleBgPress(item.id)}
            />
          )}
        />
      ) : viewingBg ? (
        <BackgroundDetail
          background={viewingBg}
          onConfirm={handleConfirm}
        />
      ) : null}
    </YStack>
  );
}
