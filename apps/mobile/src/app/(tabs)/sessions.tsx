import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import { Link } from "expo-router";
import { SYSTEM_LABELS, type SupportedSystem, SessionStatus } from "@questboard/shared";

const MOCK_SESSIONS = [
  { id: "1", name: "A Maldição de Strahd", system: "dnd5e" as SupportedSystem, status: SessionStatus.LIVE, players: "4/5", gm: "DM Carlos", desc: "Campanha de horror em Barovia" },
  { id: "2", name: "O Despertar dos Deuses", system: "tormenta20" as SupportedSystem, status: SessionStatus.IDLE, players: "3/6", gm: "Mestre Ana", desc: "Aventura épica em Arton" },
  { id: "3", name: "Horror em Dunwich", system: "coc7" as SupportedSystem, status: SessionStatus.IDLE, players: "5/5", gm: "Keeper João", desc: "Horrores cósmicos" },
];

const STATUS_COLOR = {
  [SessionStatus.LIVE]: { bg: "bg-success/15", text: "text-success", label: "AO VIVO" },
  [SessionStatus.IDLE]: { bg: "bg-elevated", text: "text-text-secondary", label: "Agendada" },
  [SessionStatus.PAUSED]: { bg: "bg-warning/15", text: "text-warning", label: "Pausada" },
  [SessionStatus.ENDED]: { bg: "bg-error/15", text: "text-error", label: "Encerrada" },
};

export default function SessionsTab() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_SESSIONS.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.gm.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView className="flex-1 bg-base" contentContainerStyle={{ padding: 16 }}>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-text-primary">Sessões</Text>
        <Link href="/sessions/create" asChild>
          <TouchableOpacity className="bg-accent px-3 py-1.5 rounded-md">
            <Text className="text-text-inverse text-sm font-semibold">+ Nova</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar sessões..."
        placeholderTextColor="#5A5A6E"
        className="bg-surface border border-border-default rounded-md px-4 py-3 text-text-primary mb-4"
      />

      {filtered.map((session) => {
        const status = STATUS_COLOR[session.status];
        return (
          <Link key={session.id} href={`/sessions/${session.id}`} asChild>
            <TouchableOpacity className="bg-surface border border-border-default rounded-lg p-4 mb-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-base font-semibold text-text-primary flex-1 mr-2" numberOfLines={1}>
                  {session.name}
                </Text>
                <View className={`px-2 py-0.5 rounded-sm ${status.bg}`}>
                  <Text className={`text-xs font-medium ${status.text}`}>{status.label}</Text>
                </View>
              </View>
              <Text className="text-xs text-text-muted mb-1">{session.desc}</Text>
              <Text className="text-xs text-text-secondary">
                {SYSTEM_LABELS[session.system]} • {session.players} • {session.gm}
              </Text>
            </TouchableOpacity>
          </Link>
        );
      })}

      {filtered.length === 0 && (
        <Text className="text-text-muted text-center py-12">Nenhuma sessão encontrada</Text>
      )}
    </ScrollView>
  );
}
