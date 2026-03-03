import { useCallback } from "react";
import { ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useCharacterStore } from "../../../../../lib/character-store";
import { EditScreenHeader } from "../../../../../components/character/EditScreenHeader";
import type { CharacterBackstory } from "../../../../../lib/character-types";

export default function EditBackstoryScreen() {
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

  const updateBackstory = useCallback(
    (updates: Partial<CharacterBackstory>) => {
      if (!draft) return;
      updateDraft({ backstory: { ...draft.backstory, ...updates } });
    },
    [draft, updateDraft],
  );

  if (!draft) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
        <Text color="#5A5A6E" fontSize={14} padding={20}>
          Nenhum rascunho ativo
        </Text>
      </SafeAreaView>
    );
  }

  const bs = draft.backstory;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
      <EditScreenHeader
        title="Editar História"
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Background */}
        <YStack gap={6} marginTop={8} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="#E8E8ED">
            Antecedente
          </Text>
          <InputBox
            value={bs.backgroundName}
            onChange={(text) => updateBackstory({ backgroundName: text })}
            placeholder="Sábio, Soldado, Artesão..."
            maxLength={40}
          />
        </YStack>

        {/* Personality Traits */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="#E8E8ED">
            Traço de Personalidade
          </Text>
          <InputBox
            value={bs.personalityTraits[0] ?? ""}
            onChange={(text) => updateBackstory({ personalityTraits: [text] })}
            placeholder="Descreva um traço marcante..."
            multiline
            maxLength={200}
          />
        </YStack>

        {/* Ideal */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="#E8E8ED">
            Ideal
          </Text>
          <InputBox
            value={bs.ideal}
            onChange={(text) => updateBackstory({ ideal: text })}
            placeholder="O que motiva seu personagem?"
            multiline
            maxLength={200}
          />
        </YStack>

        {/* Bond */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="#E8E8ED">
            Vínculo
          </Text>
          <InputBox
            value={bs.bond}
            onChange={(text) => updateBackstory({ bond: text })}
            placeholder="A que ou quem seu personagem é leal?"
            multiline
            maxLength={200}
          />
        </YStack>

        {/* Flaw */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="#E8E8ED">
            Fraqueza
          </Text>
          <InputBox
            value={bs.flaw}
            onChange={(text) => updateBackstory({ flaw: text })}
            placeholder="Qual é o ponto fraco do personagem?"
            multiline
            maxLength={200}
          />
        </YStack>

        {/* Backstory */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="#E8E8ED">
            Backstory
          </Text>
          <InputBox
            value={bs.backstory}
            onChange={(text) => updateBackstory({ backstory: text })}
            placeholder="Conte a história de fundo do personagem..."
            multiline
            tall
            maxLength={5000}
          />
        </YStack>

        {/* Appearance */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="#E8E8ED">
            Aparência
          </Text>
          <InputBox
            value={bs.appearance}
            onChange={(text) => updateBackstory({ appearance: text })}
            placeholder="Descreva a aparência do personagem..."
            multiline
            maxLength={500}
          />
        </YStack>

        {/* Physical attributes */}
        <Text fontSize={12} fontWeight="700" color="#5A5A6E" marginBottom={10}>
          DADOS FÍSICOS
        </Text>
        <XStack gap={10} flexWrap="wrap" marginBottom={20}>
          <SmallField
            label="Idade"
            value={bs.age}
            onChange={(text) => updateBackstory({ age: text })}
            placeholder="25"
          />
          <SmallField
            label="Altura"
            value={bs.height}
            onChange={(text) => updateBackstory({ height: text })}
            placeholder="1,80m"
          />
          <SmallField
            label="Peso"
            value={bs.weight}
            onChange={(text) => updateBackstory({ weight: text })}
            placeholder="75kg"
          />
          <SmallField
            label="Olhos"
            value={bs.eyes}
            onChange={(text) => updateBackstory({ eyes: text })}
            placeholder="Azuis"
          />
          <SmallField
            label="Cabelo"
            value={bs.hair}
            onChange={(text) => updateBackstory({ hair: text })}
            placeholder="Prateado"
          />
          <SmallField
            label="Pele"
            value={bs.skin}
            onChange={(text) => updateBackstory({ skin: text })}
            placeholder="Clara"
          />
        </XStack>

        {/* Notes */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="#E8E8ED">
            Notas
          </Text>
          <InputBox
            value={draft.notes}
            onChange={(text) => updateDraft({ notes: text })}
            placeholder="Notas livres sobre o personagem..."
            multiline
            tall
            maxLength={5000}
          />
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

function InputBox({
  value,
  onChange,
  placeholder,
  multiline,
  tall,
  maxLength,
}: {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  tall?: boolean;
  maxLength?: number;
}) {
  return (
    <Stack
      borderRadius={12}
      borderWidth={1}
      borderColor="#2A2A35"
      backgroundColor="#1C1C24"
      paddingHorizontal={14}
      paddingVertical={12}
    >
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#5A5A6E"
        multiline={multiline}
        style={{
          color: "#E8E8ED",
          fontSize: 14,
          padding: 0,
          ...(multiline ? { minHeight: tall ? 120 : 60, textAlignVertical: "top" as const } : {}),
        }}
        maxLength={maxLength}
      />
    </Stack>
  );
}

function SmallField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
}) {
  return (
    <YStack width="30%" minWidth={90} gap={4}>
      <Text fontSize={11} color="#5A5A6E">
        {label}
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
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#3A3A45"
          style={{ color: "#E8E8ED", fontSize: 13, padding: 0 }}
          maxLength={20}
        />
      </Stack>
    </YStack>
  );
}
