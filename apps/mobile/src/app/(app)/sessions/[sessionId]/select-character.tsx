import { useCallback, useState } from "react";
import { Modal, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Lock } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import { Button } from "../../../../components/button";
import { CharacterPortrait } from "../../../../components/character/character-portrait";
import { getClassColor } from "../../../../lib/class-utils";
import {
  getSessionCharacters,
  getSessionInfo,
} from "../../../../lib/session-join-data";
import type { SessionCharacter } from "../../../../lib/session-join-data";

export default function SelectCharacterScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();

  const characters = getSessionCharacters(sessionId ?? "");
  const { sessionName, campaignName } = getSessionInfo(sessionId ?? "");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const selectedChar = characters.find((c) => c.id === selectedId) ?? null;

  const handleSelect = useCallback(
    (char: SessionCharacter) => {
      if (!char.isAvailable) return;
      setSelectedId(char.id === selectedId ? null : char.id);
    },
    [selectedId],
  );

  const handleConfirm = useCallback(() => {
    if (!selectedChar || !sessionId) return;
    setShowConfirm(false);
    router.push({
      pathname: "/(app)/sessions/[sessionId]/connecting",
      params: {
        sessionId,
        characterName: selectedChar.name,
        classId: selectedChar.classId,
        classIcon: selectedChar.classIcon,
        level: String(selectedChar.level),
      },
    });
  }, [selectedChar, sessionId, router]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <XStack alignItems="center" paddingHorizontal={16} height={56}>
        <Stack
          onPress={() => router.back()}
          hitSlop={12}
          padding={8}
          borderRadius={12}
          pressStyle={{ backgroundColor: "$border" }}
        >
          <ArrowLeft size={22} color="#E8E8ED" />
        </Stack>
        <Text
          flex={1}
          textAlign="center"
          fontSize={18}
          fontWeight="600"
          color="$textPrimary"
        >
          Escolha seu Personagem
        </Text>
        <Stack width={38} />
      </XStack>

      {/* Session info */}
      <YStack paddingHorizontal={20} paddingBottom={16}>
        <Text fontSize={15} fontWeight="600" color="$textPrimary">
          {sessionName}
        </Text>
        <Text fontSize={13} color="$textMuted" marginTop={2}>
          {campaignName}
        </Text>
      </YStack>

      {/* Character grid */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <XStack flexWrap="wrap" gap={12} paddingHorizontal={16}>
          {characters.map((char) => {
            const isSelected = char.id === selectedId;
            const color = getClassColor(char.classId);

            return (
              <Stack
                key={char.id}
                width="47%"
                flexGrow={1}
                borderRadius={16}
                borderWidth={isSelected ? 1.5 : 1}
                borderColor={
                  isSelected ? color : "rgba(255,255,255,0.08)"
                }
                backgroundColor={
                  isSelected
                    ? `${color}15`
                    : "rgba(255,255,255,0.04)"
                }
                padding={16}
                alignItems="center"
                gap={10}
                opacity={char.isAvailable ? 1 : 0.5}
                onPress={() => handleSelect(char)}
                pressStyle={
                  char.isAvailable ? { opacity: 0.8, scale: 0.97 } : undefined
                }
              >
                <CharacterPortrait
                  name={char.name}
                  classId={char.classId}
                  classIcon={char.classIcon}
                  level={char.level}
                  avatarUrl={char.avatarUrl}
                  size="lg"
                  selected={isSelected}
                  unavailable={!char.isAvailable}
                />

                <YStack alignItems="center" gap={2}>
                  <Text
                    fontSize={15}
                    fontWeight="700"
                    color="$textPrimary"
                    numberOfLines={1}
                  >
                    {char.name}
                  </Text>
                  <Text fontSize={12} color="$textSecondary">
                    {char.className} Nv.{char.level}
                  </Text>
                  <Text fontSize={11} color="$textMuted">
                    {char.race}
                  </Text>
                </YStack>

                {!char.isAvailable && (
                  <XStack alignItems="center" gap={4}>
                    <Lock size={10} color="#5A5A6E" />
                    <Text fontSize={10} color="$textMuted">
                      {char.takenByName}
                    </Text>
                  </XStack>
                )}
              </Stack>
            );
          })}
        </XStack>
      </ScrollView>

      {/* Footer */}
      <YStack
        paddingHorizontal={16}
        paddingVertical={12}
        paddingBottom={36}
        borderTopWidth={1}
        borderTopColor="$border"
        backgroundColor="rgba(15,15,18,0.95)"
      >
        <Button
          variant="primary"
          size="lg"
          disabled={!selectedChar}
          onPress={() => setShowConfirm(true)}
        >
          Selecionar Personagem
        </Button>
      </YStack>

      {/* Confirm Bottom Sheet */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirm(false)}
      >
        <Stack
          flex={1}
          justifyContent="flex-end"
          backgroundColor="rgba(0,0,0,0.6)"
          onPress={() => setShowConfirm(false)}
        >
          <YStack
            backgroundColor="#16161C"
            borderTopLeftRadius={24}
            borderTopRightRadius={24}
            borderWidth={1}
            borderBottomWidth={0}
            borderColor="rgba(255,255,255,0.08)"
            paddingHorizontal={24}
            paddingTop={24}
            paddingBottom={48}
            gap={20}
            onPress={(e: { stopPropagation: () => void }) =>
              e.stopPropagation()
            }
          >
            {/* Handle */}
            <Stack
              alignSelf="center"
              width={40}
              height={4}
              borderRadius={2}
              backgroundColor="rgba(255,255,255,0.15)"
            />

            <Text
              fontSize={20}
              fontWeight="700"
              color="$textPrimary"
              textAlign="center"
            >
              Confirmar Entrada
            </Text>

            {selectedChar && (
              <YStack alignItems="center" gap={12}>
                <CharacterPortrait
                  name={selectedChar.name}
                  classId={selectedChar.classId}
                  classIcon={selectedChar.classIcon}
                  level={selectedChar.level}
                  avatarUrl={selectedChar.avatarUrl}
                  size="xl"
                />

                <YStack alignItems="center" gap={4}>
                  <Text
                    fontSize={20}
                    fontWeight="700"
                    color="$textPrimary"
                  >
                    {selectedChar.name}
                  </Text>
                  <Text fontSize={14} color="$textSecondary">
                    {selectedChar.className} Nv.{selectedChar.level}{" "}
                    · {selectedChar.race}
                  </Text>
                </YStack>

                <YStack
                  width="100%"
                  borderRadius={12}
                  backgroundColor="rgba(255,255,255,0.04)"
                  padding={14}
                  gap={6}
                >
                  <XStack justifyContent="space-between">
                    <Text fontSize={13} color="$textMuted">
                      Sessao
                    </Text>
                    <Text
                      fontSize={13}
                      fontWeight="600"
                      color="$textPrimary"
                    >
                      {sessionName}
                    </Text>
                  </XStack>
                  <XStack justifyContent="space-between">
                    <Text fontSize={13} color="$textMuted">
                      Campanha
                    </Text>
                    <Text
                      fontSize={13}
                      fontWeight="600"
                      color="$textPrimary"
                    >
                      {campaignName}
                    </Text>
                  </XStack>
                </YStack>
              </YStack>
            )}

            <XStack gap={12}>
              <Stack flex={1}>
                <Button
                  variant="outline"
                  size="lg"
                  onPress={() => setShowConfirm(false)}
                >
                  Cancelar
                </Button>
              </Stack>
              <Stack flex={1}>
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleConfirm}
                >
                  Confirmar
                </Button>
              </Stack>
            </XStack>
          </YStack>
        </Stack>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F12",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
});
