import { memo, useCallback, useState } from "react";
import { TextInput, StyleSheet, ScrollView } from "react-native";
import { Clapperboard, BookOpen, MapPin, BookmarkPlus, Send } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { SubModalSheet } from "./SubModalSheet";
import { SceneCardPreview } from "./SceneCardPreview";
import { useGameplayStore } from "../../../lib/gameplay-store";
import type { SceneCardData } from "../../../lib/gameplay-store";

type SceneVariant = SceneCardData["variant"];

const VARIANT_OPTIONS: {
  key: SceneVariant;
  label: string;
  Icon: typeof Clapperboard;
}[] = [
  { key: "cinematic", label: "Cinemático", Icon: Clapperboard },
  { key: "title", label: "Capítulo", Icon: BookOpen },
  { key: "location", label: "Locação", Icon: MapPin },
];

const ATMOSPHERE_TAGS = [
  "Névoa", "Escuridão", "Frio", "Calor", "Chuva", "Vento",
  "Silêncio", "Sons de batalha", "Música distante", "Gritos",
  "Cheiro de morte", "Flores", "Pó", "Maresia",
];

function SceneCardModalInner({ isOpen }: { isOpen: boolean }) {
  const closeGMToolView = useGameplayStore((s) => s.closeGMToolView);
  const showSceneCard = useGameplayStore((s) => s.showSceneCard);
  const saveSceneCardDraft = useGameplayStore((s) => s.saveSceneCardDraft);
  const sceneCardDrafts = useGameplayStore((s) => s.sceneCardDrafts);

  const [variant, setVariant] = useState<SceneVariant>("cinematic");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [chapter, setChapter] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleDismiss = useCallback(() => {
    useGameplayStore.setState({ activeGMToolView: null });
  }, []);

  const resetForm = useCallback(() => {
    setTitle("");
    setSubtitle("");
    setChapter("");
    setSelectedTags([]);
  }, []);

  const buildCard = useCallback((): SceneCardData => {
    return {
      variant,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      chapter: chapter.trim() || undefined,
      details: selectedTags.length > 0 ? selectedTags : undefined,
    };
  }, [variant, title, subtitle, chapter, selectedTags]);

  const handleSend = useCallback(() => {
    if (!title.trim()) return;
    showSceneCard(buildCard());
    resetForm();
    useGameplayStore.setState({ activeGMToolView: null });
  }, [title, buildCard, showSceneCard, resetForm]);

  const handleSaveDraft = useCallback(() => {
    if (!title.trim()) return;
    saveSceneCardDraft({
      id: `draft-${Date.now()}`,
      label: title.trim().slice(0, 20),
      card: buildCard(),
    });
  }, [title, buildCard, saveSceneCardDraft]);

  const handleLoadDraft = useCallback(
    (draftId: string) => {
      const draft = sceneCardDrafts.find((d) => d.id === draftId);
      if (!draft) return;
      setVariant(draft.card.variant);
      setTitle(draft.card.title);
      setSubtitle(draft.card.subtitle ?? "");
      setChapter(draft.card.chapter ?? "");
      setSelectedTags(draft.card.details ?? []);
    },
    [sceneCardDrafts],
  );

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 4) return prev;
      return [...prev, tag];
    });
  }, []);

  const previewCard = { variant, title, subtitle, chapter, details: selectedTags };

  return (
    <SubModalSheet
      isOpen={isOpen}
      snapPoints={["45%", "75%"]}
      title="Nova Cena"
      onBack={closeGMToolView}
      onDismiss={handleDismiss}
      footer={
        <XStack gap={8}>
          <Stack
            flex={1}
            height={40}
            borderRadius={10}
            borderWidth={1}
            borderColor="#2A2A35"
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={handleSaveDraft}
          >
            <XStack alignItems="center" gap={4}>
              <BookmarkPlus size={14} color="#9090A0" />
              <Text fontSize={12} fontWeight="600" color="#9090A0">
                Rascunho
              </Text>
            </XStack>
          </Stack>
          <Stack
            flex={2}
            height={40}
            borderRadius={10}
            backgroundColor={title.trim() ? "#6C5CE7" : "#2A2A35"}
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.85 }}
            onPress={handleSend}
            disabled={!title.trim()}
          >
            <XStack alignItems="center" gap={6}>
              <Send size={14} color="white" />
              <Text fontSize={13} fontWeight="600" color="white">
                Enviar para Todos
              </Text>
            </XStack>
          </Stack>
        </XStack>
      }
    >
      <YStack gap={16}>
        {/* Draft pills */}
        {sceneCardDrafts.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <XStack gap={6}>
              {sceneCardDrafts.map((draft) => (
                <Stack
                  key={draft.id}
                  paddingHorizontal={10}
                  paddingVertical={5}
                  borderRadius={6}
                  backgroundColor="#1C1C24"
                  borderWidth={1}
                  borderColor="#2A2A35"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => handleLoadDraft(draft.id)}
                >
                  <Text fontSize={11} color="#9090A0">
                    {draft.label}
                  </Text>
                </Stack>
              ))}
            </XStack>
          </ScrollView>
        )}

        {/* Variant selector */}
        <XStack gap={8} justifyContent="center">
          {VARIANT_OPTIONS.map((opt) => {
            const isActive = variant === opt.key;
            return (
              <Stack
                key={opt.key}
                width={100}
                height={80}
                borderRadius={12}
                backgroundColor={isActive ? "rgba(108, 92, 231, 0.1)" : "#1C1C24"}
                borderWidth={1}
                borderColor={isActive ? "#6C5CE7" : "#2A2A35"}
                alignItems="center"
                justifyContent="center"
                gap={6}
                pressStyle={{ opacity: 0.7 }}
                onPress={() => setVariant(opt.key)}
              >
                <opt.Icon size={24} color={isActive ? "#6C5CE7" : "#9090A0"} />
                <Text fontSize={11} color={isActive ? "#6C5CE7" : "#9090A0"}>
                  {opt.label}
                </Text>
              </Stack>
            );
          })}
        </XStack>

        {/* Dynamic fields based on variant */}

        {/* Chapter number (title variant) */}
        {variant === "title" && (
          <YStack gap={6}>
            <Text fontSize={12} fontWeight="600" color="#9090A0">
              Número do capítulo
            </Text>
            <Stack
              backgroundColor="#0F0F12"
              borderRadius={8}
              borderWidth={1}
              borderColor="#2A2A35"
              paddingHorizontal={12}
              paddingVertical={10}
            >
              <TextInput
                value={chapter}
                onChangeText={setChapter}
                placeholder="Capítulo, Ato, Parte..."
                placeholderTextColor="#5A5A6E"
                style={[styles.input, { textTransform: "uppercase", fontSize: 12 }]}
              />
            </Stack>
          </YStack>
        )}

        {/* Title (all variants) */}
        <YStack gap={6}>
          <Text fontSize={12} fontWeight="600" color="#9090A0">
            Título
          </Text>
          <Stack
            backgroundColor="#0F0F12"
            borderRadius={8}
            borderWidth={1}
            borderColor="#2A2A35"
            paddingHorizontal={12}
            paddingVertical={10}
          >
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={
                variant === "cinematic" ? "Título dramático..." :
                variant === "title" ? "Título do capítulo..." :
                "Nome da locação..."
              }
              placeholderTextColor="#5A5A6E"
              style={styles.input}
              maxLength={60}
            />
          </Stack>
        </YStack>

        {/* Subtitle (cinematic + title variants) */}
        {(variant === "cinematic" || variant === "title" || variant === "location") && (
          <YStack gap={6}>
            <Text fontSize={12} fontWeight="600" color="#9090A0">
              {variant === "location" ? "Descrição" : "Subtítulo"}
            </Text>
            <Stack
              backgroundColor="#0F0F12"
              borderRadius={8}
              borderWidth={1}
              borderColor="#2A2A35"
              paddingHorizontal={12}
              paddingVertical={10}
            >
              <TextInput
                value={subtitle}
                onChangeText={setSubtitle}
                placeholder={
                  variant === "location"
                    ? "Uma floresta densa e sombria..."
                    : "Narração curta..."
                }
                placeholderTextColor="#5A5A6E"
                style={[styles.input, { minHeight: 40, textAlignVertical: "top" }]}
                multiline
                maxLength={200}
              />
            </Stack>
          </YStack>
        )}

        {/* Atmosphere tags (location variant) */}
        {variant === "location" && (
          <YStack gap={6}>
            <Text fontSize={12} fontWeight="600" color="#9090A0">
              Tags atmosféricas (max 4)
            </Text>
            <XStack flexWrap="wrap" gap={6}>
              {ATMOSPHERE_TAGS.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <Stack
                    key={tag}
                    paddingHorizontal={10}
                    paddingVertical={5}
                    borderRadius={6}
                    backgroundColor={isActive ? "rgba(108, 92, 231, 0.15)" : "#1C1C24"}
                    borderWidth={1}
                    borderColor={isActive ? "#6C5CE7" : "#2A2A35"}
                    pressStyle={{ opacity: 0.7 }}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text
                      fontSize={11}
                      color={isActive ? "#6C5CE7" : "#5A5A6E"}
                    >
                      {tag}
                    </Text>
                  </Stack>
                );
              })}
            </XStack>
          </YStack>
        )}

        {/* Preview */}
        <YStack gap={6}>
          <Text fontSize={12} fontWeight="600" color="#9090A0">
            Preview
          </Text>
          <SceneCardPreview card={previewCard} />
        </YStack>
      </YStack>
    </SubModalSheet>
  );
}

export const SceneCardModal = memo(SceneCardModalInner);

const styles = StyleSheet.create({
  input: {
    color: "#E8E8ED",
    fontSize: 14,
    padding: 0,
  },
});
