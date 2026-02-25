import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { SYSTEM_LABELS, type SupportedSystem } from "@questboard/shared";

const MOCK_SESSIONS = [
  { id: "1", name: "A Maldição de Strahd", system: "dnd5e" as const, status: "LIVE", players: "4/5", gm: "DM Carlos" },
  { id: "2", name: "O Despertar dos Deuses", system: "tormenta20" as const, status: "IDLE", players: "3/6", gm: "Mestre Ana" },
  { id: "3", name: "Horror em Dunwich", system: "coc7" as const, status: "IDLE", players: "5/5", gm: "Keeper João" },
];

const QUICK_STATS = [
  { label: "Sessões", value: "24", icon: "🎲" },
  { label: "Horas", value: "86h", icon: "⏱️" },
  { label: "Personagens", value: "7", icon: "🧙" },
  { label: "Conquistas", value: "12", icon: "🏆" },
];

export default function HomeTab() {
  return (
    <ScrollView className="flex-1 bg-base" contentContainerStyle={{ padding: 16 }}>
      {/* Greeting */}
      <Text className="text-2xl font-bold text-text-primary">Olá, Aventureiro! 👋</Text>
      <Text className="text-text-secondary mt-1 mb-6">Pronto para a próxima aventura?</Text>

      {/* Quick stats */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        {QUICK_STATS.map((stat) => (
          <View
            key={stat.label}
            className="flex-1 min-w-[70px] bg-surface border border-border-default rounded-lg p-3 items-center"
          >
            <Text className="text-xl">{stat.icon}</Text>
            <Text className="text-lg font-bold text-text-primary mt-1">{stat.value}</Text>
            <Text className="text-xs text-text-muted">{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Sessions header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-text-primary">Suas Sessões</Text>
        <Link href="/sessions/create" asChild>
          <TouchableOpacity className="bg-accent px-3 py-1.5 rounded-md">
            <Text className="text-text-inverse text-sm font-semibold">+ Nova</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Session cards */}
      {MOCK_SESSIONS.map((session) => (
        <Link key={session.id} href={`/sessions/${session.id}`} asChild>
          <TouchableOpacity className="bg-surface border border-border-default rounded-lg p-4 mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-semibold text-text-primary flex-1" numberOfLines={1}>
                {session.name}
              </Text>
              <View
                className={`px-2 py-0.5 rounded-sm ${
                  session.status === "LIVE" ? "bg-success/15" : "bg-elevated"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    session.status === "LIVE" ? "text-success" : "text-text-secondary"
                  }`}
                >
                  {session.status === "LIVE" ? "AO VIVO" : "Agendada"}
                </Text>
              </View>
            </View>
            <Text className="text-xs text-text-muted">
              {SYSTEM_LABELS[session.system]} • {session.players} jogadores • {session.gm}
            </Text>
          </TouchableOpacity>
        </Link>
      ))}
    </ScrollView>
  );
}
