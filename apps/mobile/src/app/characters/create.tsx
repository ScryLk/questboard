import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { router } from "expo-router";
import { SUPPORTED_SYSTEMS, SYSTEM_LABELS, type SupportedSystem } from "@questboard/shared";

export default function CreateCharacterScreen() {
  const [name, setName] = useState("");
  const [race, setRace] = useState("");
  const [characterClass, setCharacterClass] = useState("");
  const [system, setSystem] = useState<SupportedSystem | null>(null);
  const [level, setLevel] = useState("1");
  const [backstory, setBackstory] = useState("");

  const handleCreate = () => {
    // TODO: POST to API
    router.back();
  };

  return (
    <ScrollView
      className="flex-1 bg-base"
      contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* System selection */}
      <Text className="text-sm font-medium text-text-secondary mb-2">Sistema</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {SUPPORTED_SYSTEMS.map((sys) => (
          <TouchableOpacity
            key={sys}
            onPress={() => setSystem(sys)}
            className={`px-3 py-2 rounded-md border ${
              system === sys
                ? "border-accent bg-accent-muted"
                : "border-border-default bg-surface"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                system === sys ? "text-accent" : "text-text-secondary"
              }`}
            >
              {SYSTEM_LABELS[sys]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm font-medium text-text-secondary mb-1.5">Nome do personagem</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Ex: Thorin Escudo de Ferro"
        placeholderTextColor="#5A5A6E"
        className="bg-surface border border-border-default rounded-md px-4 py-3 text-text-primary mb-4"
      />

      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <Text className="text-sm font-medium text-text-secondary mb-1.5">Raça</Text>
          <TextInput
            value={race}
            onChangeText={setRace}
            placeholder="Ex: Anão"
            placeholderTextColor="#5A5A6E"
            className="bg-surface border border-border-default rounded-md px-4 py-3 text-text-primary"
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-medium text-text-secondary mb-1.5">Classe</Text>
          <TextInput
            value={characterClass}
            onChangeText={setCharacterClass}
            placeholder="Ex: Guerreiro"
            placeholderTextColor="#5A5A6E"
            className="bg-surface border border-border-default rounded-md px-4 py-3 text-text-primary"
          />
        </View>
      </View>

      <Text className="text-sm font-medium text-text-secondary mb-1.5">Nível</Text>
      <TextInput
        value={level}
        onChangeText={setLevel}
        keyboardType="numeric"
        className="bg-surface border border-border-default rounded-md px-4 py-3 text-text-primary mb-4"
      />

      <Text className="text-sm font-medium text-text-secondary mb-1.5">Backstory</Text>
      <TextInput
        value={backstory}
        onChangeText={setBackstory}
        placeholder="Conte a história do seu personagem..."
        placeholderTextColor="#5A5A6E"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        className="bg-surface border border-border-default rounded-md px-4 py-3 text-text-primary mb-6 min-h-[100px]"
      />

      <TouchableOpacity
        onPress={handleCreate}
        className={`rounded-md py-3 items-center ${
          name.trim() && system ? "bg-accent" : "bg-accent/40"
        }`}
        disabled={!name.trim() || !system}
      >
        <Text className="text-text-inverse font-semibold">Criar Personagem</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
