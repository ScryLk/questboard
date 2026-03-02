import { Alert, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "lucide-react-native";
import { Stack, Text, YStack } from "tamagui";
import { WizardHeader } from "../../../../components/wizard-header";
import { Button } from "../../../../components/button";
import { ToggleRow } from "../../../../components/toggle-row";
import { useSessionCreationStore } from "../../../../lib/session-creation-store";

export default function Step3Ambiance() {
  const router = useRouter();
  const store = useSessionCreationStore();
  const { ambiance } = store;

  function handleNext() {
    router.push("/(app)/sessions/create/step4");
  }

  function handleMapUpload() {
    Alert.alert("Em breve", "Upload de mapas estará disponível em breve!");
  }

  return (
    <YStack flex={1} backgroundColor="$bg">
      <WizardHeader
        currentStep={3}
        totalSteps={5}
        stepLabel="Ambientação"
        onClose={() => router.replace("/(app)/(tabs)/sessions")}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text fontSize={13} color="$textMuted" marginTop={8} marginBottom={20}>
          Tudo nesta etapa é opcional. Você pode configurar depois.
        </Text>

        {/* Map placeholder */}
        <YStack gap={6} marginBottom={24}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Mapa
          </Text>
          <Stack
            height={160}
            borderRadius={14}
            borderWidth={2}
            borderColor="$border"
            borderStyle="dashed"
            backgroundColor="$bgCard"
            alignItems="center"
            justifyContent="center"
            gap={8}
            onPress={handleMapUpload}
            pressStyle={{ opacity: 0.7 }}
          >
            <Image size={36} color="#5A5A6E" />
            <Text fontSize={13} color="$textMuted" textAlign="center">
              Toque para adicionar{"\n"}um mapa inicial
            </Text>
          </Stack>
        </YStack>

        {/* Grid toggle */}
        <YStack
          borderRadius={14}
          backgroundColor="$bgCard"
          borderWidth={1}
          borderColor="$border"
          paddingHorizontal={16}
          marginBottom={24}
        >
          <ToggleRow
            label="Grade no Mapa"
            description="Exibe grid quadrado para movimentação tática"
            value={ambiance.gridEnabled}
            onChange={(v) => store.updateAmbiance({ gridEnabled: v })}
          />
        </YStack>

        {/* GM Notes */}
        <YStack gap={6} marginBottom={24}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Notas do Mestre{" "}
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
              value={ambiance.gmNotes}
              onChangeText={(text) =>
                store.updateAmbiance({ gmNotes: text })
              }
              placeholder="Anotações privadas para você, o mestre..."
              placeholderTextColor="#5A5A6E"
              style={{
                color: "#E8E8ED",
                fontSize: 15,
                padding: 0,
                minHeight: 100,
                textAlignVertical: "top",
              }}
              multiline
              maxLength={2000}
            />
          </Stack>
          <Text fontSize={12} color="$textMuted">
            Apenas você verá estas notas
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
          {`Próximo: Convite →`}
        </Button>
      </YStack>
    </YStack>
  );
}
