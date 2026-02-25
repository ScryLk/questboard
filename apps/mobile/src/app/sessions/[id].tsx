import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SYSTEM_LABELS, type SupportedSystem } from "@questboard/shared";

// Mock — will be replaced with API fetch
const SESSION = {
  id: "1",
  name: "A Maldição de Strahd",
  system: "dnd5e" as SupportedSystem,
  status: "LIVE",
  description: "Campanha de horror em Barovia. Os heróis precisam encontrar os artefatos sagrados e derrotar o Conde Strahd von Zarovich.",
  gmName: "DM Carlos",
  maxPlayers: 5,
  players: [
    { id: "p1", name: "Thorin (Guerreiro)", isOnline: true },
    { id: "p2", name: "Aelar (Ranger)", isOnline: true },
    { id: "p3", name: "Luna (Maga)", isOnline: false },
    { id: "p4", name: "Kael (Ladino)", isOnline: true },
  ],
};

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ScrollView className="flex-1 bg-base" contentContainerStyle={{ padding: 16 }}>
      {/* Banner */}
      <View className="h-32 bg-accent/20 rounded-lg mb-4 items-center justify-center">
        <Text className="text-4xl">🎲</Text>
      </View>

      {/* Title + Status */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xl font-bold text-text-primary flex-1 mr-2">{SESSION.name}</Text>
        <View className={`px-2 py-1 rounded-sm ${SESSION.status === "LIVE" ? "bg-success/15" : "bg-elevated"}`}>
          <Text className={`text-xs font-semibold ${SESSION.status === "LIVE" ? "text-success" : "text-text-secondary"}`}>
            {SESSION.status === "LIVE" ? "AO VIVO" : "Agendada"}
          </Text>
        </View>
      </View>

      <Text className="text-sm text-text-muted mb-1">
        {SYSTEM_LABELS[SESSION.system]} • GM: {SESSION.gmName}
      </Text>
      <Text className="text-sm text-text-secondary mb-6">{SESSION.description}</Text>

      {/* Actions */}
      <View className="flex-row gap-3 mb-6">
        <TouchableOpacity className="flex-1 bg-accent rounded-md py-3 items-center">
          <Text className="text-text-inverse font-semibold">Entrar na Sessão</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-surface border border-border-default rounded-md px-4 py-3">
          <Text className="text-text-secondary">⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Players */}
      <Text className="text-base font-bold text-text-primary mb-3">
        Jogadores ({SESSION.players.length}/{SESSION.maxPlayers})
      </Text>
      {SESSION.players.map((player) => (
        <View
          key={player.id}
          className="flex-row items-center gap-3 py-2.5 border-b border-border-default"
        >
          <View className="relative">
            <View className="w-8 h-8 rounded-full bg-accent-muted items-center justify-center">
              <Text className="text-accent text-sm font-bold">{player.name[0]}</Text>
            </View>
            {player.isOnline && (
              <View className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-base" />
            )}
          </View>
          <Text className="text-sm text-text-primary flex-1">{player.name}</Text>
          {player.isOnline && (
            <Text className="text-xs text-success">Online</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
