import { memo, useCallback, useEffect, useState } from "react";
import { TextInput, StyleSheet, ScrollView } from "react-native";
import {
  BookmarkPlus,
  Send,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Play,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { SubModalSheet } from "./SubModalSheet";
import { SceneCardPreview } from "./SceneCardPreview";
import { useGameplayStore } from "../../../lib/gameplay-store";
import {
  SCENE_TYPE_META,
  SCENE_TYPE_ORDER,
  DEFAULT_ATMOSPHERE,
  DEFAULT_TIMING,
  PARTICLE_OPTIONS,
  ATMOSPHERE_TAGS,
} from "../../../constants/sceneConfig";
import type {
  SceneType,
  SceneCard,
  ParticleEffect,
} from "../../../types/scene";

// ─── Component ──────────────────────────────────────────

function SceneCardModalInner({ isOpen }: { isOpen: boolean }) {
  const closeGMToolView = useGameplayStore((s) => s.closeGMToolView);
  const showSceneCard = useGameplayStore((s) => s.showSceneCard);
  const saveSceneCardDraft = useGameplayStore((s) => s.saveSceneCardDraft);
  const sceneCardDrafts = useGameplayStore((s) => s.sceneCardDrafts);
  const sceneHistory = useGameplayStore((s) => s.sceneHistory);
  const reshowScene = useGameplayStore((s) => s.reshowScene);

  const [sceneType, setSceneType] = useState<SceneType>("cinematic");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [chapter, setChapter] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [particles, setParticles] = useState<ParticleEffect | null>(null);
  const [holdDuration, setHoldDuration] = useState(5);
  const [showHistory, setShowHistory] = useState(false);

  // Reset defaults when type changes
  useEffect(() => {
    const atm = DEFAULT_ATMOSPHERE[sceneType];
    const tim = DEFAULT_TIMING[sceneType];
    setParticles(atm.particles);
    setHoldDuration(tim.holdDuration);
  }, [sceneType]);

  const handleDismiss = useCallback(() => {
    useGameplayStore.setState({ activeGMToolView: null });
  }, []);

  const resetForm = useCallback(() => {
    setTitle("");
    setSubtitle("");
    setChapter("");
    setSelectedTags([]);
  }, []);

  const buildCard = useCallback((): SceneCard => {
    return {
      id: `scene-${Date.now()}`,
      type: sceneType,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      chapter: chapter.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      atmosphere: {
        ...DEFAULT_ATMOSPHERE[sceneType],
        particles,
      },
      timing: {
        ...DEFAULT_TIMING[sceneType],
        holdDuration,
      },
      reactions: [],
      createdAt: new Date(),
    };
  }, [sceneType, title, subtitle, chapter, selectedTags, particles, holdDuration]);

  const handleSend = useCallback(() => {
    if (!title.trim()) return;
    showSceneCard(buildCard());
    resetForm();
    useGameplayStore.setState({ activeGMToolView: null });
  }, [title, buildCard, showSceneCard, resetForm]);

  const handleSaveDraft = useCallback(() => {
    if (!title.trim()) return;
    const card = buildCard();
    saveSceneCardDraft({
      id: `draft-${Date.now()}`,
      label: title.trim().slice(0, 20),
      card: {
        type: card.type,
        title: card.title,
        subtitle: card.subtitle,
        chapter: card.chapter,
        tags: card.tags,
        atmosphere: card.atmosphere,
        timing: card.timing,
      },
    });
  }, [title, buildCard, saveSceneCardDraft]);

  const handleLoadDraft = useCallback(
    (draftId: string) => {
      const draft = sceneCardDrafts.find((d) => d.id === draftId);
      if (!draft) return;
      setSceneType(draft.card.type);
      setTitle(draft.card.title);
      setSubtitle(draft.card.subtitle ?? "");
      setChapter(draft.card.chapter ?? "");
      setSelectedTags(draft.card.tags ?? []);
      setParticles(draft.card.atmosphere.particles);
      setHoldDuration(draft.card.timing.holdDuration);
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

  const previewCard = {
    type: sceneType,
    title,
    subtitle,
    chapter,
    tags: selectedTags,
    atmosphere: { ...DEFAULT_ATMOSPHERE[sceneType], particles },
    timing: { ...DEFAULT_TIMING[sceneType], holdDuration },
  };

  const showTags = sceneType === "location" || sceneType === "weather";

  // Placeholders per type
  const titlePlaceholder: Record<SceneType, string> = {
    cinematic: "Título dramático...",
    chapter: "Título do capítulo...",
    location: "Nome da locação...",
    mystery: "O que se revela...",
    danger: "EMBOSCADA! / ARMADILHA!...",
    flashback: "Três anos antes...",
    weather: "TEMPESTADE SE APROXIMA...",
  };

  const subtitlePlaceholder: Record<SceneType, string> = {
    cinematic: "Narração curta...",
    chapter: "Subtítulo do capítulo...",
    location: "Uma floresta densa e sombria...",
    mystery: "Descrição do mistério...",
    danger: "O que está acontecendo...",
    flashback: "A memória que retorna...",
    weather: "+2 dificuldade em percepção...",
  };

  return (
    <SubModalSheet
      isOpen={isOpen}
      snapPoints={["55%", "92%"]}
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
                Disparar para Todos
              </Text>
            </XStack>
          </Stack>
        </XStack>
      }
    >
      <YStack gap={16}>
        {/* Draft pills */}
        {sceneCardDrafts.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

        {/* Type selector — 2 rows */}
        <YStack gap={8}>
          <XStack gap={8} justifyContent="center" flexWrap="wrap">
            {SCENE_TYPE_ORDER.map((type) => {
              const meta = SCENE_TYPE_META[type];
              const isActive = sceneType === type;
              const Icon = meta.icon;
              return (
                <Stack
                  key={type}
                  width={75}
                  height={70}
                  borderRadius={12}
                  backgroundColor={isActive ? meta.bgColor : "#1C1C24"}
                  borderWidth={1}
                  borderColor={isActive ? meta.color : "#2A2A35"}
                  alignItems="center"
                  justifyContent="center"
                  gap={4}
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => setSceneType(type)}
                >
                  <Icon size={20} color={isActive ? meta.color : "#9090A0"} />
                  <Text
                    fontSize={9}
                    fontWeight="600"
                    color={isActive ? meta.color : "#9090A0"}
                    textAlign="center"
                  >
                    {meta.label}
                  </Text>
                </Stack>
              );
            })}
          </XStack>
        </YStack>

        {/* Chapter number (chapter type only) */}
        {sceneType === "chapter" && (
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

        {/* Title (all types) */}
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
              placeholder={titlePlaceholder[sceneType]}
              placeholderTextColor="#5A5A6E"
              style={styles.input}
              maxLength={60}
            />
          </Stack>
        </YStack>

        {/* Subtitle / Description */}
        <YStack gap={6}>
          <Text fontSize={12} fontWeight="600" color="#9090A0">
            {sceneType === "location" || sceneType === "weather"
              ? "Descrição"
              : "Subtítulo"}
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
              placeholder={subtitlePlaceholder[sceneType]}
              placeholderTextColor="#5A5A6E"
              style={[styles.input, { minHeight: 40, textAlignVertical: "top" }]}
              multiline
              maxLength={200}
            />
          </Stack>
        </YStack>

        {/* Particle picker */}
        <YStack gap={6}>
          <Text fontSize={12} fontWeight="600" color="#9090A0">
            Partículas
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap={6}>
              {PARTICLE_OPTIONS.map((opt) => {
                const isActive =
                  opt.key === "none" ? particles === null : particles === opt.key;
                return (
                  <Stack
                    key={opt.key}
                    paddingHorizontal={12}
                    paddingVertical={6}
                    borderRadius={8}
                    backgroundColor={
                      isActive
                        ? `${SCENE_TYPE_META[sceneType].color}20`
                        : "#1C1C24"
                    }
                    borderWidth={1}
                    borderColor={
                      isActive ? SCENE_TYPE_META[sceneType].color : "#2A2A35"
                    }
                    pressStyle={{ opacity: 0.7 }}
                    onPress={() =>
                      setParticles(opt.key === "none" ? null : opt.key)
                    }
                  >
                    <Text
                      fontSize={11}
                      color={
                        isActive ? SCENE_TYPE_META[sceneType].color : "#5A5A6E"
                      }
                    >
                      {opt.label}
                    </Text>
                  </Stack>
                );
              })}
            </XStack>
          </ScrollView>
        </YStack>

        {/* Timing */}
        <YStack gap={6}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={12} fontWeight="600" color="#9090A0">
              Duração
            </Text>
            <Text fontSize={10} color="#5A5A6E">
              {DEFAULT_TIMING[sceneType].autoDismiss
                ? "Auto-dismiss"
                : "Manual (GM encerra)"}
            </Text>
          </XStack>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap={6}>
              {[3, 4, 5, 6, 7, 8, 10, 12, 15].map((sec) => {
                const isActive = holdDuration === sec;
                return (
                  <Stack
                    key={sec}
                    paddingHorizontal={12}
                    paddingVertical={6}
                    borderRadius={8}
                    backgroundColor={
                      isActive
                        ? `${SCENE_TYPE_META[sceneType].color}20`
                        : "#1C1C24"
                    }
                    borderWidth={1}
                    borderColor={
                      isActive ? SCENE_TYPE_META[sceneType].color : "#2A2A35"
                    }
                    pressStyle={{ opacity: 0.7 }}
                    onPress={() => setHoldDuration(sec)}
                  >
                    <Text
                      fontSize={12}
                      fontWeight="600"
                      color={
                        isActive ? SCENE_TYPE_META[sceneType].color : "#5A5A6E"
                      }
                    >
                      {sec}s
                    </Text>
                  </Stack>
                );
              })}
            </XStack>
          </ScrollView>
        </YStack>

        {/* Atmosphere tags (location & weather) */}
        {showTags && (
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
                    backgroundColor={
                      isActive
                        ? `${SCENE_TYPE_META[sceneType].color}20`
                        : "#1C1C24"
                    }
                    borderWidth={1}
                    borderColor={
                      isActive ? SCENE_TYPE_META[sceneType].color : "#2A2A35"
                    }
                    pressStyle={{ opacity: 0.7 }}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text
                      fontSize={11}
                      color={
                        isActive ? SCENE_TYPE_META[sceneType].color : "#5A5A6E"
                      }
                    >
                      {tag}
                    </Text>
                  </Stack>
                );
              })}
            </XStack>
          </YStack>
        )}

        {/* Preview + Test button */}
        <YStack gap={6}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={12} fontWeight="600" color="#9090A0">
              Preview
            </Text>
            {title.trim() ? (
              <Stack
                paddingHorizontal={10}
                paddingVertical={5}
                borderRadius={8}
                backgroundColor={`${SCENE_TYPE_META[sceneType].color}20`}
                borderWidth={1}
                borderColor={`${SCENE_TYPE_META[sceneType].color}60`}
                pressStyle={{ opacity: 0.7 }}
                onPress={() => {
                  showSceneCard(buildCard());
                }}
              >
                <XStack alignItems="center" gap={4}>
                  <Play size={10} color={SCENE_TYPE_META[sceneType].color} />
                  <Text
                    fontSize={11}
                    fontWeight="600"
                    color={SCENE_TYPE_META[sceneType].color}
                  >
                    Testar Agora
                  </Text>
                </XStack>
              </Stack>
            ) : null}
          </XStack>
          <SceneCardPreview card={previewCard} />
        </YStack>

        {/* Scene History */}
        {sceneHistory.length > 0 && (
          <YStack gap={8}>
            <Stack
              pressStyle={{ opacity: 0.7 }}
              onPress={() => setShowHistory(!showHistory)}
            >
              <XStack alignItems="center" justifyContent="space-between">
                <Text fontSize={12} fontWeight="600" color="#9090A0">
                  Cenas anteriores ({sceneHistory.length})
                </Text>
                {showHistory ? (
                  <ChevronUp size={14} color="#9090A0" />
                ) : (
                  <ChevronDown size={14} color="#9090A0" />
                )}
              </XStack>
            </Stack>

            {showHistory && (
              <YStack gap={6}>
                {sceneHistory
                  .slice()
                  .reverse()
                  .map((scene) => {
                    const meta = SCENE_TYPE_META[scene.type];
                    const Icon = meta.icon;
                    const reactionCount = scene.reactions.length;
                    return (
                      <XStack
                        key={scene.id}
                        backgroundColor="#1C1C24"
                        borderRadius={8}
                        paddingHorizontal={10}
                        paddingVertical={8}
                        alignItems="center"
                        gap={8}
                      >
                        <Stack
                          width={28}
                          height={28}
                          borderRadius={6}
                          backgroundColor={meta.bgColor}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon size={14} color={meta.color} />
                        </Stack>
                        <YStack flex={1} gap={2}>
                          <Text
                            fontSize={12}
                            fontWeight="600"
                            color="#E8E8ED"
                            numberOfLines={1}
                          >
                            {scene.title}
                          </Text>
                          <Text fontSize={10} color="#5A5A6E">
                            {meta.label}
                            {reactionCount > 0 && ` · ${reactionCount} reações`}
                          </Text>
                        </YStack>
                        <Stack
                          paddingHorizontal={8}
                          paddingVertical={4}
                          borderRadius={6}
                          backgroundColor="#0F0F12"
                          pressStyle={{ opacity: 0.7 }}
                          onPress={() => {
                            reshowScene(scene.id);
                            useGameplayStore.setState({ activeGMToolView: null });
                          }}
                        >
                          <XStack alignItems="center" gap={4}>
                            <RotateCcw size={10} color="#9090A0" />
                            <Text fontSize={10} color="#9090A0">
                              Redisparar
                            </Text>
                          </XStack>
                        </Stack>
                      </XStack>
                    );
                  })}
              </YStack>
            )}
          </YStack>
        )}
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
