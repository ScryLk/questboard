import { Alert, ScrollView, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera } from "lucide-react-native";
import { Stack, Text, YStack } from "tamagui";
import { WizardHeader } from "../../../../../components/wizard-header";
import { LevelStepper } from "../../../../../components/level-stepper";
import { AlignmentGrid } from "../../../../../components/alignment-grid";
import { Button } from "../../../../../components/button";
import { useCharacterCreationStore } from "../../../../../lib/character-creation-store";

export default function IdentityScreen() {
  const { systemId } = useLocalSearchParams<{ systemId: string }>();
  const router = useRouter();
  const { identity, updateIdentity, totalSteps } =
    useCharacterCreationStore();

  const canProceed = identity.name.trim().length >= 2;

  function handleNext() {
    router.push(`/(app)/characters/create/${systemId}/race`);
  }

  function handlePortraitPress() {
    Alert.alert("Em breve", "Upload de retrato estará disponível em breve!");
  }

  return (
    <YStack flex={1} backgroundColor="$bg">
      <WizardHeader
        currentStep={1}
        totalSteps={totalSteps}
        stepLabel="Identidade"
        systemId={systemId}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Portrait Placeholder */}
        <YStack alignItems="center" marginTop={20} marginBottom={28}>
          <Stack
            height={140}
            width={120}
            borderRadius={16}
            borderWidth={2}
            borderColor="$border"
            borderStyle="dashed"
            backgroundColor="$bgCard"
            alignItems="center"
            justifyContent="center"
            gap={8}
            onPress={handlePortraitPress}
            pressStyle={{ opacity: 0.7 }}
          >
            <Camera size={32} color="#5A5A6E" />
            <Text fontSize={11} color="$textMuted" textAlign="center">
              Adicionar{"\n"}retrato
            </Text>
          </Stack>
        </YStack>

        {/* Name */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Nome do Personagem{" "}
            <Text fontSize={14} color="$danger">
              *
            </Text>
          </Text>
          <Stack
            borderRadius={12}
            borderWidth={1}
            borderColor={identity.name.length > 0 && identity.name.length < 2 ? "$danger" : "$border"}
            backgroundColor="$bgCard"
            paddingHorizontal={14}
            paddingVertical={12}
          >
            <TextInput
              value={identity.name}
              onChangeText={(text) => updateIdentity({ name: text })}
              placeholder="Ex: Eldrin, o Andarilho"
              placeholderTextColor="#5A5A6E"
              style={{
                color: "#E8E8ED",
                fontSize: 15,
                padding: 0,
              }}
              maxLength={60}
            />
          </Stack>
          <Text fontSize={12} color="$textMuted">
            Seu nome pode incluir um título ou epíteto
          </Text>
        </YStack>

        {/* Concept */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Conceito{" "}
            <Text fontSize={12} color="$textMuted">
              (opcional)
            </Text>
          </Text>
          <Stack
            borderRadius={12}
            borderWidth={1}
            borderColor="$border"
            backgroundColor="$bgCard"
            paddingHorizontal={14}
            paddingVertical={12}
          >
            <TextInput
              value={identity.concept}
              onChangeText={(text) => updateIdentity({ concept: text })}
              placeholder="Ex: Mago exilado buscando redenção pelos erros do passado"
              placeholderTextColor="#5A5A6E"
              style={{
                color: "#E8E8ED",
                fontSize: 15,
                padding: 0,
                minHeight: 60,
                textAlignVertical: "top",
              }}
              multiline
              maxLength={500}
            />
          </Stack>
          <Text fontSize={12} color="$textMuted">
            Ajuda o mestre e jogadores a entender sua história
          </Text>
        </YStack>

        {/* Level */}
        <YStack gap={6} marginBottom={24}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Nível Inicial
          </Text>
          <LevelStepper
            value={identity.level}
            onChange={(level) => updateIdentity({ level })}
          />
        </YStack>

        {/* Alignment (D&D 5e only) */}
        {systemId === "dnd5e" && (
          <YStack gap={8} marginBottom={24}>
            <Text fontSize={14} fontWeight="600" color="$textPrimary">
              Alinhamento
            </Text>
            <Text fontSize={12} color="$textMuted" marginBottom={4}>
              Descreve a postura moral e ética do personagem
            </Text>
            <AlignmentGrid
              selected={identity.alignment}
              onSelect={(key) => updateIdentity({ alignment: key })}
            />
          </YStack>
        )}
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
          disabled={!canProceed}
          onPress={handleNext}
        >
          Próximo: Raça →
        </Button>
      </YStack>
    </YStack>
  );
}
