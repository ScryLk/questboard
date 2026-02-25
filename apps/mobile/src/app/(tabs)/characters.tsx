import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { SYSTEM_LABELS, type SupportedSystem } from "@questboard/shared";

const MOCK_CHARACTERS = [
  { id: "1", name: "Thorin Escudo de Ferro", system: "dnd5e" as SupportedSystem, class: "Guerreiro Nv.8", hp: { current: 72, max: 95 } },
  { id: "2", name: "Aelar Ventolivre", system: "dnd5e" as SupportedSystem, class: "Ranger Nv.5", hp: { current: 38, max: 42 } },
  { id: "3", name: "Dante Cavaleiro", system: "tormenta20" as SupportedSystem, class: "Cavaleiro Nv.6", hp: { current: 55, max: 55 } },
];

function HpBar({ current, max }: { current: number; max: number }) {
  const pct = Math.round((current / max) * 100);
  const color = pct >= 80 ? "bg-success" : pct >= 50 ? "bg-warning" : "bg-error";
  return (
    <View className="h-2 bg-elevated rounded-full overflow-hidden mt-2">
      <View className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </View>
  );
}

export default function CharactersTab() {
  return (
    <ScrollView className="flex-1 bg-base" contentContainerStyle={{ padding: 16 }}>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-text-primary">Personagens</Text>
        <Link href="/characters/create" asChild>
          <TouchableOpacity className="bg-accent px-3 py-1.5 rounded-md">
            <Text className="text-text-inverse text-sm font-semibold">+ Novo</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {MOCK_CHARACTERS.map((char) => (
        <Link key={char.id} href={`/characters/${char.id}`} asChild>
          <TouchableOpacity className="bg-surface border border-border-default rounded-lg p-4 mb-3">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-accent-muted items-center justify-center">
                <Text className="text-accent text-lg font-bold">{char.name[0]}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-text-primary" numberOfLines={1}>
                  {char.name}
                </Text>
                <Text className="text-xs text-text-muted mt-0.5">
                  {char.class} • {SYSTEM_LABELS[char.system]}
                </Text>
                <View className="flex-row items-center justify-between mt-1">
                  <Text className="text-xs text-text-secondary">
                    HP: {char.hp.current}/{char.hp.max}
                  </Text>
                </View>
                <HpBar current={char.hp.current} max={char.hp.max} />
              </View>
            </View>
          </TouchableOpacity>
        </Link>
      ))}
    </ScrollView>
  );
}
