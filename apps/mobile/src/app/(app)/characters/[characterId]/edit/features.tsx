import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useCharacterStore } from "../../../../../lib/character-store";
import { EditScreenHeader } from "../../../../../components/character/EditScreenHeader";
import { FeatureEditCard } from "../../../../../components/character/FeatureEditCard";
import type { CharacterFeature, FeatureSource } from "../../../../../lib/character-types";

const SOURCE_ORDER: FeatureSource[] = ["race", "class", "background", "feat", "custom"];
const SOURCE_LABELS: Record<FeatureSource, string> = {
  race: "Raciais",
  class: "Classe",
  background: "Antecedente",
  feat: "Talentos",
  custom: "Customizados",
};

export default function EditFeaturesScreen() {
  const router = useRouter();
  const draft = useCharacterStore((s) => s.editDraft);
  const updateDraft = useCharacterStore((s) => s.updateDraft);
  const saveDraft = useCharacterStore((s) => s.saveDraft);
  const discardDraft = useCharacterStore((s) => s.discardDraft);

  const [addingSource, setAddingSource] = useState<FeatureSource | null>(null);
  const [newName, setNewName] = useState("");

  const handleSave = useCallback(() => {
    router.back();
    setTimeout(saveDraft, 100);
  }, [saveDraft, router]);

  const handleCancel = useCallback(() => {
    router.back();
    setTimeout(discardDraft, 100);
  }, [discardDraft, router]);

  // Update a feature
  const handleUpdateFeature = useCallback(
    (featureId: string, updates: Partial<CharacterFeature>) => {
      if (!draft) return;
      updateDraft({
        features: draft.features.map((f) =>
          f.id === featureId ? { ...f, ...updates } : f,
        ),
      });
    },
    [draft, updateDraft],
  );

  // Remove a feature
  const handleRemoveFeature = useCallback(
    (featureId: string) => {
      if (!draft) return;
      Alert.alert("Remover habilidade?", "Essa ação não pode ser desfeita.", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () =>
            updateDraft({ features: draft.features.filter((f) => f.id !== featureId) }),
        },
      ]);
    },
    [draft, updateDraft],
  );

  // Add new feature
  const handleAddFeature = useCallback(() => {
    if (!draft || !addingSource || newName.trim().length < 2) return;
    const feature: CharacterFeature = {
      id: `feat-${Date.now()}`,
      name: newName.trim(),
      source: addingSource,
      description: "",
      uses: null,
    };
    updateDraft({ features: [...draft.features, feature] });
    setNewName("");
    setAddingSource(null);
  }, [draft, addingSource, newName, updateDraft]);

  // Group features by source
  const groupedFeatures = useMemo(() => {
    if (!draft) return [];
    return SOURCE_ORDER
      .map((source) => ({
        source,
        features: draft.features.filter((f) => f.source === source),
      }))
      .filter((g) => g.features.length > 0);
  }, [draft]);

  if (!draft) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
        <Text color="#5A5A6E" fontSize={14} padding={20}>
          Nenhum rascunho ativo
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
      <EditScreenHeader
        title="Editar Habilidades"
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Feature groups */}
        {groupedFeatures.map(({ source, features }) => (
          <YStack key={source} gap={6} marginBottom={16} marginTop={8}>
            <Text fontSize={12} fontWeight="700" color="#5A5A6E">
              {SOURCE_LABELS[source].toUpperCase()} ({features.length})
            </Text>
            <YStack gap={6}>
              {features.map((feature) => (
                <FeatureEditCard
                  key={feature.id}
                  feature={feature}
                  onUpdate={(updates) => handleUpdateFeature(feature.id, updates)}
                  onRemove={() => handleRemoveFeature(feature.id)}
                />
              ))}
            </YStack>
          </YStack>
        ))}

        {/* Add feature */}
        {addingSource ? (
          <YStack
            backgroundColor="#16161C"
            borderRadius={10}
            borderWidth={1}
            borderColor="#2A2A35"
            padding={12}
            gap={10}
            marginTop={8}
          >
            <Text fontSize={12} fontWeight="700" color="#5A5A6E">
              NOVA HABILIDADE ({SOURCE_LABELS[addingSource]})
            </Text>

            <Stack
              borderRadius={8}
              borderWidth={1}
              borderColor="#2A2A35"
              backgroundColor="#1C1C24"
              paddingHorizontal={10}
              paddingVertical={8}
            >
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Nome da habilidade"
                placeholderTextColor="#3A3A45"
                autoFocus
                style={{ color: "#E8E8ED", fontSize: 13, padding: 0 }}
                maxLength={60}
              />
            </Stack>

            <XStack gap={8} justifyContent="flex-end">
              <Stack
                paddingHorizontal={12}
                paddingVertical={6}
                pressStyle={{ opacity: 0.7 }}
                onPress={() => {
                  setAddingSource(null);
                  setNewName("");
                }}
              >
                <Text fontSize={12} color="#5A5A6E">Cancelar</Text>
              </Stack>
              <Stack
                paddingHorizontal={14}
                paddingVertical={6}
                borderRadius={8}
                backgroundColor={newName.trim().length >= 2 ? "#6C5CE7" : "#2A2A35"}
                pressStyle={newName.trim().length >= 2 ? { opacity: 0.7 } : undefined}
                onPress={handleAddFeature}
              >
                <Text
                  fontSize={12}
                  fontWeight="600"
                  color={newName.trim().length >= 2 ? "#FFFFFF" : "#5A5A6E"}
                >
                  Adicionar
                </Text>
              </Stack>
            </XStack>
          </YStack>
        ) : (
          <YStack gap={8} marginTop={8}>
            <Text fontSize={11} color="#5A5A6E">Adicionar habilidade:</Text>
            <XStack gap={6} flexWrap="wrap">
              {SOURCE_ORDER.map((source) => (
                <Stack
                  key={source}
                  paddingHorizontal={12}
                  paddingVertical={8}
                  borderRadius={8}
                  borderWidth={1}
                  borderColor="#2A2A35"
                  borderStyle="dashed"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => setAddingSource(source)}
                >
                  <XStack gap={4} alignItems="center">
                    <Plus size={12} color="#6C5CE7" />
                    <Text fontSize={11} color="#6C5CE7">
                      {SOURCE_LABELS[source]}
                    </Text>
                  </XStack>
                </Stack>
              ))}
            </XStack>
          </YStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
