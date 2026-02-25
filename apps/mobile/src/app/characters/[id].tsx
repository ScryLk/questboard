import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SYSTEM_LABELS, type SupportedSystem } from "@questboard/shared";

const MOCK_CHARACTER = {
  id: "1",
  name: "Thorin Escudo de Ferro",
  system: "dnd5e" as SupportedSystem,
  class: "Guerreiro",
  race: "Anão",
  level: 8,
  hp: { current: 72, max: 95 },
  ac: 18,
  backstory: "Thorin é um anão guerreiro exilado do clã Escudo de Ferro. Busca recuperar a honra perdida de seu povo enfrentando os horrores de Barovia.",
  attributes: [
    { label: "FOR", value: 18 },
    { label: "DES", value: 12 },
    { label: "CON", value: 16 },
    { label: "INT", value: 10 },
    { label: "SAB", value: 13 },
    { label: "CAR", value: 8 },
  ],
};

function AttributeBlock({ label, value }: { label: string; value: number }) {
  const modifier = Math.floor((value - 10) / 2);
  return (
    <View className="bg-elevated rounded-lg p-3 items-center flex-1 min-w-[60px]">
      <Text className="text-xs text-text-muted">{label}</Text>
      <Text className="text-xl font-bold text-text-primary">{value}</Text>
      <Text className="text-xs text-accent">
        {modifier >= 0 ? "+" : ""}{modifier}
      </Text>
    </View>
  );
}

export default function CharacterDetailScreen() {
  const { id } = useLocalSearchParams();
  const char = MOCK_CHARACTER;
  const hpPct = Math.round((char.hp.current / char.hp.max) * 100);

  return (
    <ScrollView className="flex-1 bg-base" contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View className="items-center mb-6">
        <View className="w-20 h-20 rounded-full bg-accent-muted items-center justify-center mb-3">
          <Text className="text-accent text-3xl font-bold">{char.name[0]}</Text>
        </View>
        <Text className="text-xl font-bold text-text-primary">{char.name}</Text>
        <Text className="text-sm text-text-muted mt-0.5">
          {char.race} {char.class} • Nível {char.level}
        </Text>
        <View className="bg-accent-muted px-2 py-0.5 rounded-sm mt-1">
          <Text className="text-xs text-accent font-medium">
            {SYSTEM_LABELS[char.system]}
          </Text>
        </View>
      </View>

      {/* HP / AC */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1 bg-surface border border-border-default rounded-lg p-4">
          <Text className="text-xs text-text-muted mb-1">HP</Text>
          <Text className="text-lg font-bold text-text-primary">
            {char.hp.current}/{char.hp.max}
          </Text>
          <View className="h-2 bg-elevated rounded-full overflow-hidden mt-2">
            <View
              className={`h-full rounded-full ${hpPct >= 80 ? "bg-success" : hpPct >= 50 ? "bg-warning" : "bg-error"}`}
              style={{ width: `${hpPct}%` }}
            />
          </View>
        </View>
        <View className="w-20 bg-surface border border-border-default rounded-lg p-4 items-center">
          <Text className="text-xs text-text-muted mb-1">CA</Text>
          <Text className="text-2xl font-bold text-text-primary">{char.ac}</Text>
        </View>
      </View>

      {/* Attributes */}
      <Text className="text-base font-bold text-text-primary mb-3">Atributos</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {char.attributes.map((attr) => (
          <AttributeBlock key={attr.label} label={attr.label} value={attr.value} />
        ))}
      </View>

      {/* Backstory */}
      <Text className="text-base font-bold text-text-primary mb-2">Backstory</Text>
      <View className="bg-surface border border-border-default rounded-lg p-4 mb-6">
        <Text className="text-sm text-text-secondary leading-5">{char.backstory}</Text>
      </View>

      {/* Actions */}
      <View className="flex-row gap-3">
        <TouchableOpacity className="flex-1 bg-accent rounded-md py-3 items-center">
          <Text className="text-text-inverse font-semibold">Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-surface border border-border-default rounded-md py-3 items-center">
          <Text className="text-text-secondary font-semibold">Exportar PDF</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
