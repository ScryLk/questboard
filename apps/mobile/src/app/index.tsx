import { View, Text, ScrollView } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-[#1A1A2E]">
      <View className="px-6 py-12">
        <Text className="text-center text-3xl font-bold text-[#E94560]">
          QuestBoard
        </Text>
        <Text className="mt-4 text-center text-lg text-gray-400">
          Sua mesa de RPG, online
        </Text>

        <View className="mt-8 rounded-xl bg-[#16213E] p-6">
          <Text className="text-lg font-semibold text-white">
            Bem-vindo ao QuestBoard
          </Text>
          <Text className="mt-2 text-gray-400">
            Crie sessões, gerencie personagens e role dados — tudo em um só
            lugar.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
