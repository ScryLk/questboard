import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { router } from "expo-router";
import { SUPPORTED_SYSTEMS, SYSTEM_LABELS, type SupportedSystem } from "@questboard/shared";

export default function CreateSessionScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [system, setSystem] = useState<SupportedSystem | null>(null);
  const [maxPlayers, setMaxPlayers] = useState("5");

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
      <Text className="text-sm font-medium text-text-secondary mb-1.5">Nome da sessão</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Ex: A Maldição de Strahd"
        placeholderTextColor="#5A5A6E"
        className="bg-surface border border-border-default rounded-md px-4 py-3 text-text-primary mb-4"
      />

      <Text className="text-sm font-medium text-text-secondary mb-1.5">Descrição</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Descreva sua sessão..."
        placeholderTextColor="#5A5A6E"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        className="bg-surface border border-border-default rounded-md px-4 py-3 text-text-primary mb-4 min-h-[80px]"
      />

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

      <Text className="text-sm font-medium text-text-secondary mb-1.5">Máx. jogadores</Text>
      <TextInput
        value={maxPlayers}
        onChangeText={setMaxPlayers}
        keyboardType="numeric"
        className="bg-surface border border-border-default rounded-md px-4 py-3 text-text-primary mb-6"
      />

      <TouchableOpacity
        onPress={handleCreate}
        className={`rounded-md py-3 items-center ${
          name.trim() && system ? "bg-accent" : "bg-accent/40"
        }`}
        disabled={!name.trim() || !system}
      >
        <Text className="text-text-inverse font-semibold">Criar Sessão</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
