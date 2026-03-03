import { useCallback } from "react";
import { Alert, ScrollView, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useCharacterStore } from "../../../../../lib/character-store";
import { EditScreenHeader } from "../../../../../components/character/EditScreenHeader";
import { LevelStepper } from "../../../../../components/level-stepper";
import { AlignmentGrid } from "../../../../../components/alignment-grid";

export default function EditBasicsScreen() {
  const { characterId } = useLocalSearchParams<{ characterId: string }>();
  const router = useRouter();
  const draft = useCharacterStore((s) => s.editDraft);
  const updateDraft = useCharacterStore((s) => s.updateDraft);
  const saveDraft = useCharacterStore((s) => s.saveDraft);
  const discardDraft = useCharacterStore((s) => s.discardDraft);

  const handleSave = useCallback(() => {
    router.back();
    setTimeout(saveDraft, 100);
  }, [saveDraft, router]);

  const handleCancel = useCallback(() => {
    router.back();
    setTimeout(discardDraft, 100);
  }, [discardDraft, router]);

  const handlePortraitPress = useCallback(() => {
    Alert.alert("Em breve", "Upload de retrato estará disponível em breve!");
  }, []);

  if (!draft) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
        <Text color="#5A5A6E" fontSize={14} padding={20}>
          Nenhum rascunho ativo
        </Text>
      </SafeAreaView>
    );
  }

  const canSave = draft.name.trim().length >= 2;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
      <EditScreenHeader
        title="Editar Básico"
        onSave={handleSave}
        onCancel={handleCancel}
        canSave={canSave}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Portrait */}
        <YStack alignItems="center" marginTop={16} marginBottom={24}>
          <Stack
            height={140}
            width={120}
            borderRadius={16}
            borderWidth={2}
            borderColor="#2A2A35"
            borderStyle="dashed"
            backgroundColor="#1C1C24"
            alignItems="center"
            justifyContent="center"
            gap={8}
            onPress={handlePortraitPress}
            pressStyle={{ opacity: 0.7 }}
          >
            <Camera size={32} color="#5A5A6E" />
            <Text fontSize={11} color="#5A5A6E" textAlign="center">
              Alterar{"\n"}retrato
            </Text>
          </Stack>
        </YStack>

        {/* Name */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="#E8E8ED">
            Nome do Personagem
          </Text>
          <Stack
            borderRadius={12}
            borderWidth={1}
            borderColor={draft.name.length > 0 && draft.name.length < 2 ? "#FF6B6B" : "#2A2A35"}
            backgroundColor="#1C1C24"
            paddingHorizontal={14}
            paddingVertical={12}
          >
            <TextInput
              value={draft.name}
              onChangeText={(text) => updateDraft({ name: text })}
              placeholder="Nome do personagem"
              placeholderTextColor="#5A5A6E"
              style={{ color: "#E8E8ED", fontSize: 15, padding: 0 }}
              maxLength={60}
            />
          </Stack>
        </YStack>

        {/* Player Name */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="#E8E8ED">
            Nome do Jogador
          </Text>
          <Stack
            borderRadius={12}
            borderWidth={1}
            borderColor="#2A2A35"
            backgroundColor="#1C1C24"
            paddingHorizontal={14}
            paddingVertical={12}
          >
            <TextInput
              value={draft.playerName}
              onChangeText={(text) => updateDraft({ playerName: text })}
              placeholder="Seu nome"
              placeholderTextColor="#5A5A6E"
              style={{ color: "#E8E8ED", fontSize: 15, padding: 0 }}
              maxLength={60}
            />
          </Stack>
        </YStack>

        {/* Race */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="#E8E8ED">
            Raça
          </Text>
          <Stack
            borderRadius={12}
            borderWidth={1}
            borderColor="#2A2A35"
            backgroundColor="#1C1C24"
            paddingHorizontal={14}
            paddingVertical={12}
          >
            <TextInput
              value={draft.raceName}
              onChangeText={(text) => updateDraft({ raceName: text })}
              placeholder="Raça do personagem"
              placeholderTextColor="#5A5A6E"
              style={{ color: "#E8E8ED", fontSize: 15, padding: 0 }}
              maxLength={40}
            />
          </Stack>
        </YStack>

        {/* Class */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="#E8E8ED">
            Classe
          </Text>
          <Stack
            borderRadius={12}
            borderWidth={1}
            borderColor="#2A2A35"
            backgroundColor="#1C1C24"
            paddingHorizontal={14}
            paddingVertical={12}
          >
            <TextInput
              value={draft.className}
              onChangeText={(text) => updateDraft({ className: text })}
              placeholder="Classe do personagem"
              placeholderTextColor="#5A5A6E"
              style={{ color: "#E8E8ED", fontSize: 15, padding: 0 }}
              maxLength={40}
            />
          </Stack>
        </YStack>

        {/* Level */}
        <YStack gap={6} marginBottom={24}>
          <Text fontSize={14} fontWeight="600" color="#E8E8ED">
            Nível
          </Text>
          <LevelStepper
            value={draft.level}
            onChange={(level) => updateDraft({ level })}
          />
        </YStack>

        {/* XP */}
        <YStack gap={6} marginBottom={24}>
          <Text fontSize={14} fontWeight="600" color="#E8E8ED">
            Experiência (XP)
          </Text>
          <Stack
            borderRadius={12}
            borderWidth={1}
            borderColor="#2A2A35"
            backgroundColor="#1C1C24"
            paddingHorizontal={14}
            paddingVertical={12}
          >
            <TextInput
              value={String(draft.xp)}
              onChangeText={(text) => {
                const num = parseInt(text, 10);
                if (!isNaN(num) && num >= 0) updateDraft({ xp: num });
                else if (text === "") updateDraft({ xp: 0 });
              }}
              placeholder="0"
              placeholderTextColor="#5A5A6E"
              keyboardType="number-pad"
              style={{ color: "#E8E8ED", fontSize: 15, padding: 0 }}
            />
          </Stack>
        </YStack>

        {/* Alignment */}
        <YStack gap={8} marginBottom={24}>
          <Text fontSize={14} fontWeight="600" color="#E8E8ED">
            Alinhamento
          </Text>
          <AlignmentGrid
            selected={draft.alignment}
            onSelect={(key) => updateDraft({ alignment: key })}
          />
        </YStack>

        {/* Speed */}
        <XStack gap={12} marginBottom={24}>
          <YStack flex={1} gap={6}>
            <Text fontSize={14} fontWeight="600" color="#E8E8ED">
              Velocidade (pés)
            </Text>
            <Stack
              borderRadius={12}
              borderWidth={1}
              borderColor="#2A2A35"
              backgroundColor="#1C1C24"
              paddingHorizontal={14}
              paddingVertical={12}
            >
              <TextInput
                value={String(draft.speed)}
                onChangeText={(text) => {
                  const num = parseInt(text, 10);
                  if (!isNaN(num) && num >= 0) updateDraft({ speed: num });
                  else if (text === "") updateDraft({ speed: 0 });
                }}
                placeholder="30"
                placeholderTextColor="#5A5A6E"
                keyboardType="number-pad"
                style={{ color: "#E8E8ED", fontSize: 15, padding: 0 }}
              />
            </Stack>
          </YStack>

          <YStack flex={1} gap={6}>
            <Text fontSize={14} fontWeight="600" color="#E8E8ED">
              Dados de Vida
            </Text>
            <Stack
              borderRadius={12}
              borderWidth={1}
              borderColor="#2A2A35"
              backgroundColor="#1C1C24"
              paddingHorizontal={14}
              paddingVertical={12}
            >
              <Text fontSize={15} color="#9090A0">
                {draft.hitDice.current}d{draft.hitDice.die}
              </Text>
            </Stack>
          </YStack>
        </XStack>
      </ScrollView>
    </SafeAreaView>
  );
}
