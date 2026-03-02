import { useMemo, useCallback } from "react";
import { ScrollView, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Shuffle,
  BookOpen,
  Eye,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { WizardHeader } from "../../../../../components/wizard-header";
import { Button } from "../../../../../components/button";
import { useCharacterCreationStore } from "../../../../../lib/character-creation-store";
import { DND5E_BACKGROUNDS } from "../../../../../lib/data/dnd5e/backgrounds";
import type { PersonalitySuggestion } from "../../../../../lib/data/dnd5e/backgrounds";

function SuggestionChip({
  suggestion,
  isSelected,
  onPress,
}: {
  suggestion: PersonalitySuggestion;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Stack
      borderRadius={10}
      backgroundColor={isSelected ? "rgba(108, 92, 231, 0.12)" : "$bgCard"}
      borderWidth={1}
      borderColor={isSelected ? "$accent" : "$border"}
      padding={12}
      onPress={onPress}
      pressStyle={{ opacity: 0.8 }}
    >
      <Text
        fontSize={13}
        color={isSelected ? "$accent" : "$textPrimary"}
        lineHeight={18}
      >
        {suggestion.text}
      </Text>
    </Stack>
  );
}

export default function RoleplayScreen() {
  const { systemId } = useLocalSearchParams<{ systemId: string }>();
  const router = useRouter();
  const store = useCharacterCreationStore();
  const { background, roleplay, updateRoleplay, totalSteps } = store;

  const bgData = useMemo(
    () => DND5E_BACKGROUNDS.find((b) => b.id === background.backgroundId),
    [background.backgroundId],
  );

  const toggleTrait = useCallback(
    (text: string) => {
      const current = roleplay.personalityTraits;
      if (current.includes(text)) {
        updateRoleplay({
          personalityTraits: current.filter((t) => t !== text),
        });
      } else if (current.length < 2) {
        updateRoleplay({
          personalityTraits: [...current, text],
        });
      }
    },
    [roleplay.personalityTraits, updateRoleplay],
  );

  const pickRandom = useCallback(
    (
      suggestions: PersonalitySuggestion[],
      field: "ideal" | "bond" | "flaw",
    ) => {
      const random =
        suggestions[Math.floor(Math.random() * suggestions.length)];
      updateRoleplay({ [field]: random.text });
    },
    [updateRoleplay],
  );

  const pickRandomTraits = useCallback(() => {
    if (!bgData) return;
    const shuffled = [...bgData.personalityTraits].sort(
      () => Math.random() - 0.5,
    );
    updateRoleplay({
      personalityTraits: shuffled.slice(0, 2).map((t) => t.text),
    });
  }, [bgData, updateRoleplay]);

  function handleNext() {
    router.push(`/(app)/characters/create/${systemId}/review`);
  }

  return (
    <YStack flex={1} backgroundColor="$bg">
      <WizardHeader
        currentStep={7}
        totalSteps={totalSteps}
        stepLabel="Interpretação"
        systemId={systemId}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Personality Traits (pick 2) */}
        <YStack marginTop={16} gap={8} marginBottom={20}>
          <XStack justifyContent="space-between" alignItems="center">
            <YStack>
              <Text fontSize={14} fontWeight="600" color="$textPrimary">
                Traços de Personalidade
              </Text>
              <Text fontSize={12} color="$textMuted">
                Escolha até 2 traços
              </Text>
            </YStack>
            {bgData && (
              <Stack
                borderRadius={8}
                backgroundColor="$accentMuted"
                paddingHorizontal={10}
                paddingVertical={6}
                onPress={pickRandomTraits}
                pressStyle={{ opacity: 0.7 }}
              >
                <XStack gap={4} alignItems="center">
                  <Shuffle size={12} color="#6C5CE7" />
                  <Text fontSize={11} fontWeight="600" color="$accent">
                    Aleatório
                  </Text>
                </XStack>
              </Stack>
            )}
          </XStack>

          {bgData ? (
            <YStack gap={6}>
              {bgData.personalityTraits.map((trait) => (
                <SuggestionChip
                  key={trait.id}
                  suggestion={trait}
                  isSelected={roleplay.personalityTraits.includes(trait.text)}
                  onPress={() => toggleTrait(trait.text)}
                />
              ))}
            </YStack>
          ) : (
            <Stack
              borderRadius={10}
              backgroundColor="$bgCard"
              borderWidth={1}
              borderColor="$border"
              padding={12}
            >
              <TextInput
                value={roleplay.personalityTraits.join("\n")}
                onChangeText={(text) =>
                  updateRoleplay({
                    personalityTraits: text ? text.split("\n").slice(0, 2) : [],
                  })
                }
                placeholder="Descreva os traços de personalidade do seu personagem..."
                placeholderTextColor="#5A5A6E"
                style={{
                  color: "#E8E8ED",
                  fontSize: 14,
                  padding: 0,
                  minHeight: 60,
                  textAlignVertical: "top",
                }}
                multiline
              />
            </Stack>
          )}
        </YStack>

        {/* Ideal */}
        <YStack gap={8} marginBottom={20}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={14} fontWeight="600" color="$textPrimary">
              Ideal
            </Text>
            {bgData && (
              <Stack
                borderRadius={8}
                backgroundColor="$accentMuted"
                paddingHorizontal={10}
                paddingVertical={6}
                onPress={() => pickRandom(bgData.ideals, "ideal")}
                pressStyle={{ opacity: 0.7 }}
              >
                <XStack gap={4} alignItems="center">
                  <Shuffle size={12} color="#6C5CE7" />
                  <Text fontSize={11} fontWeight="600" color="$accent">
                    Aleatório
                  </Text>
                </XStack>
              </Stack>
            )}
          </XStack>

          {bgData ? (
            <YStack gap={6}>
              {bgData.ideals.map((ideal) => (
                <SuggestionChip
                  key={ideal.id}
                  suggestion={ideal}
                  isSelected={roleplay.ideal === ideal.text}
                  onPress={() => updateRoleplay({ ideal: ideal.text })}
                />
              ))}
            </YStack>
          ) : (
            <Stack
              borderRadius={10}
              backgroundColor="$bgCard"
              borderWidth={1}
              borderColor="$border"
              padding={12}
            >
              <TextInput
                value={roleplay.ideal}
                onChangeText={(text) => updateRoleplay({ ideal: text })}
                placeholder="Qual princípio guia seu personagem?"
                placeholderTextColor="#5A5A6E"
                style={{
                  color: "#E8E8ED",
                  fontSize: 14,
                  padding: 0,
                }}
                maxLength={200}
              />
            </Stack>
          )}
        </YStack>

        {/* Bond */}
        <YStack gap={8} marginBottom={20}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={14} fontWeight="600" color="$textPrimary">
              Vínculo
            </Text>
            {bgData && (
              <Stack
                borderRadius={8}
                backgroundColor="$accentMuted"
                paddingHorizontal={10}
                paddingVertical={6}
                onPress={() => pickRandom(bgData.bonds, "bond")}
                pressStyle={{ opacity: 0.7 }}
              >
                <XStack gap={4} alignItems="center">
                  <Shuffle size={12} color="#6C5CE7" />
                  <Text fontSize={11} fontWeight="600" color="$accent">
                    Aleatório
                  </Text>
                </XStack>
              </Stack>
            )}
          </XStack>

          {bgData ? (
            <YStack gap={6}>
              {bgData.bonds.map((bond) => (
                <SuggestionChip
                  key={bond.id}
                  suggestion={bond}
                  isSelected={roleplay.bond === bond.text}
                  onPress={() => updateRoleplay({ bond: bond.text })}
                />
              ))}
            </YStack>
          ) : (
            <Stack
              borderRadius={10}
              backgroundColor="$bgCard"
              borderWidth={1}
              borderColor="$border"
              padding={12}
            >
              <TextInput
                value={roleplay.bond}
                onChangeText={(text) => updateRoleplay({ bond: text })}
                placeholder="Com quem ou o que seu personagem tem conexão?"
                placeholderTextColor="#5A5A6E"
                style={{
                  color: "#E8E8ED",
                  fontSize: 14,
                  padding: 0,
                }}
                maxLength={200}
              />
            </Stack>
          )}
        </YStack>

        {/* Flaw */}
        <YStack gap={8} marginBottom={24}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={14} fontWeight="600" color="$textPrimary">
              Defeito
            </Text>
            {bgData && (
              <Stack
                borderRadius={8}
                backgroundColor="$accentMuted"
                paddingHorizontal={10}
                paddingVertical={6}
                onPress={() => pickRandom(bgData.flaws, "flaw")}
                pressStyle={{ opacity: 0.7 }}
              >
                <XStack gap={4} alignItems="center">
                  <Shuffle size={12} color="#6C5CE7" />
                  <Text fontSize={11} fontWeight="600" color="$accent">
                    Aleatório
                  </Text>
                </XStack>
              </Stack>
            )}
          </XStack>

          {bgData ? (
            <YStack gap={6}>
              {bgData.flaws.map((flaw) => (
                <SuggestionChip
                  key={flaw.id}
                  suggestion={flaw}
                  isSelected={roleplay.flaw === flaw.text}
                  onPress={() => updateRoleplay({ flaw: flaw.text })}
                />
              ))}
            </YStack>
          ) : (
            <Stack
              borderRadius={10}
              backgroundColor="$bgCard"
              borderWidth={1}
              borderColor="$border"
              padding={12}
            >
              <TextInput
                value={roleplay.flaw}
                onChangeText={(text) => updateRoleplay({ flaw: text })}
                placeholder="Qual fraqueza ou vício seu personagem possui?"
                placeholderTextColor="#5A5A6E"
                style={{
                  color: "#E8E8ED",
                  fontSize: 14,
                  padding: 0,
                }}
                maxLength={200}
              />
            </Stack>
          )}
        </YStack>

        {/* Backstory */}
        <YStack gap={8} marginBottom={20}>
          <XStack gap={8} alignItems="center">
            <BookOpen size={16} color="#6C5CE7" />
            <Text fontSize={14} fontWeight="600" color="$textPrimary">
              História de Fundo{" "}
              <Text fontSize={12} color="$textMuted">
                (opcional)
              </Text>
            </Text>
          </XStack>
          <Stack
            borderRadius={12}
            backgroundColor="$bgCard"
            borderWidth={1}
            borderColor="$border"
            paddingHorizontal={14}
            paddingVertical={12}
          >
            <TextInput
              value={roleplay.backstory}
              onChangeText={(text) => updateRoleplay({ backstory: text })}
              placeholder="Conte a história do seu personagem: de onde veio, o que aconteceu, por que se aventura..."
              placeholderTextColor="#5A5A6E"
              style={{
                color: "#E8E8ED",
                fontSize: 14,
                padding: 0,
                minHeight: 100,
                textAlignVertical: "top",
              }}
              multiline
              maxLength={2000}
            />
          </Stack>
          <Text fontSize={11} color="$textMuted" textAlign="right">
            {roleplay.backstory.length}/2000
          </Text>
        </YStack>

        {/* Appearance */}
        <YStack gap={8} marginBottom={20}>
          <XStack gap={8} alignItems="center">
            <Eye size={16} color="#00B894" />
            <Text fontSize={14} fontWeight="600" color="$textPrimary">
              Aparência{" "}
              <Text fontSize={12} color="$textMuted">
                (opcional)
              </Text>
            </Text>
          </XStack>
          <Stack
            borderRadius={12}
            backgroundColor="$bgCard"
            borderWidth={1}
            borderColor="$border"
            paddingHorizontal={14}
            paddingVertical={12}
          >
            <TextInput
              value={roleplay.appearance}
              onChangeText={(text) => updateRoleplay({ appearance: text })}
              placeholder="Descreva a aparência: altura, cor de cabelo, cicatrizes, vestimentas marcantes..."
              placeholderTextColor="#5A5A6E"
              style={{
                color: "#E8E8ED",
                fontSize: 14,
                padding: 0,
                minHeight: 80,
                textAlignVertical: "top",
              }}
              multiline
              maxLength={1000}
            />
          </Stack>
          <Text fontSize={11} color="$textMuted" textAlign="right">
            {roleplay.appearance.length}/1000
          </Text>
        </YStack>
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
        <Button variant="primary" size="lg" onPress={handleNext}>
          {`Próximo: Revisão \u2192`}
        </Button>
      </YStack>
    </YStack>
  );
}
