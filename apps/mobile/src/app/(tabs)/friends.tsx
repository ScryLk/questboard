import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";

const MOCK_FRIENDS = [
  { id: "1", name: "Carlos DM", username: "carlosdm", isOnline: true },
  { id: "2", name: "Ana Mestre", username: "anamestre", isOnline: true },
  { id: "3", name: "João Keeper", username: "joaokeeper", isOnline: false },
  { id: "4", name: "Maria Paladina", username: "mariapaladin", isOnline: false },
];

const MOCK_REQUESTS = [
  { id: "r1", name: "Pedro Bardo", username: "pedrobardo" },
];

type FriendsTab = "all" | "online" | "requests";

export default function FriendsTab() {
  const [tab, setTab] = useState<FriendsTab>("all");
  const [search, setSearch] = useState("");

  const onlineFriends = MOCK_FRIENDS.filter((f) => f.isOnline);
  const displayedFriends = (tab === "online" ? onlineFriends : MOCK_FRIENDS).filter(
    (f) => f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView className="flex-1 bg-base" contentContainerStyle={{ padding: 16 }}>
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-2xl font-bold text-text-primary">Amigos</Text>
          <Text className="text-xs text-text-muted mt-0.5">
            {MOCK_FRIENDS.length} amigos • {onlineFriends.length} online
          </Text>
        </View>
        <TouchableOpacity className="bg-accent px-3 py-1.5 rounded-md">
          <Text className="text-text-inverse text-sm font-semibold">+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar amigos..."
        placeholderTextColor="#5A5A6E"
        className="bg-surface border border-border-default rounded-md px-4 py-3 text-text-primary mb-4"
      />

      {/* Tabs */}
      <View className="flex-row gap-2 mb-4">
        {([
          { key: "all" as FriendsTab, label: `Todos (${MOCK_FRIENDS.length})` },
          { key: "online" as FriendsTab, label: `Online (${onlineFriends.length})` },
          { key: "requests" as FriendsTab, label: `Pedidos (${MOCK_REQUESTS.length})` },
        ]).map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-md ${
              tab === t.key ? "bg-accent" : "bg-elevated"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                tab === t.key ? "text-text-inverse" : "text-text-secondary"
              }`}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "requests" ? (
        MOCK_REQUESTS.map((req) => (
          <View
            key={req.id}
            className="bg-surface border border-border-default rounded-lg p-4 mb-3 flex-row items-center gap-3"
          >
            <View className="w-10 h-10 rounded-full bg-accent-muted items-center justify-center">
              <Text className="text-accent font-bold">{req.name[0]}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-text-primary">{req.name}</Text>
              <Text className="text-xs text-text-muted">@{req.username}</Text>
            </View>
            <TouchableOpacity className="bg-accent px-3 py-1.5 rounded-md mr-2">
              <Text className="text-text-inverse text-xs font-semibold">Aceitar</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-3 py-1.5 rounded-md">
              <Text className="text-text-muted text-xs">Recusar</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        displayedFriends.map((friend) => (
          <TouchableOpacity
            key={friend.id}
            className="flex-row items-center gap-3 py-3 px-2"
          >
            <View className="relative">
              <View className="w-10 h-10 rounded-full bg-accent-muted items-center justify-center">
                <Text className="text-accent font-bold">{friend.name[0]}</Text>
              </View>
              {friend.isOnline && (
                <View className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-base" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-text-primary">{friend.name}</Text>
              <Text className="text-xs text-text-muted">@{friend.username}</Text>
            </View>
            {friend.isOnline && (
              <View className="px-2 py-0.5 rounded-sm bg-success/15">
                <Text className="text-xs text-success font-medium">Online</Text>
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}
