import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { Plan, AchievementRarity } from "@questboard/shared";

const PLAN_LABELS = {
  [Plan.FREE]: "Gratuito",
  [Plan.ADVENTURER]: "Aventureiro",
  [Plan.LEGENDARY]: "Lendário",
  [Plan.PLAYER_PLUS]: "Player Plus",
};

const MOCK_ACHIEVEMENTS = [
  { id: "1", name: "Primeira Aventura", icon: "⚔️", rarity: AchievementRarity.COMMON, unlocked: true },
  { id: "2", name: "Mestre de Cerimônias", icon: "🎭", rarity: AchievementRarity.UNCOMMON, unlocked: true },
  { id: "3", name: "Dado Sortudo", icon: "🎲", rarity: AchievementRarity.RARE, unlocked: true },
];

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center flex-1">
      <Text className="text-lg font-bold text-text-primary">{value}</Text>
      <Text className="text-xs text-text-muted mt-0.5">{label}</Text>
    </View>
  );
}

export default function ProfileTab() {
  const currentPlan = Plan.ADVENTURER;

  return (
    <ScrollView className="flex-1 bg-base" contentContainerStyle={{ padding: 16 }}>
      {/* Banner */}
      <View className="h-24 bg-accent/20 rounded-lg mb-4" />

      {/* Avatar + Name */}
      <View className="items-center -mt-12 mb-4">
        <View className="w-20 h-20 rounded-full bg-accent-muted items-center justify-center border-4 border-base">
          <Text className="text-accent text-2xl font-bold">A</Text>
        </View>
        <Text className="text-xl font-bold text-text-primary mt-2">Aventureiro</Text>
        <Text className="text-sm text-text-muted">@aventureiro42</Text>
        <View className="bg-accent-muted px-2 py-0.5 rounded-sm mt-1">
          <Text className="text-xs text-accent font-medium">{PLAN_LABELS[currentPlan]}</Text>
        </View>
      </View>

      {/* Quick stats */}
      <View className="flex-row bg-surface border border-border-default rounded-lg p-4 mb-4">
        <StatItem label="Sessões" value="24" />
        <StatItem label="Horas" value="86h" />
        <StatItem label="Dados" value="847" />
        <StatItem label="Streak" value="3🔥" />
      </View>

      {/* Bio */}
      <View className="bg-surface border border-border-default rounded-lg p-4 mb-4">
        <Text className="text-sm text-text-secondary">
          Mestre de D&D há 5 anos. Amo Tormenta20 e Call of Cthulhu.
        </Text>
      </View>

      {/* Recent achievements */}
      <View className="mb-4">
        <Text className="text-base font-bold text-text-primary mb-3">Conquistas Recentes</Text>
        {MOCK_ACHIEVEMENTS.map((a) => (
          <View
            key={a.id}
            className="flex-row items-center gap-3 bg-surface border border-border-default rounded-lg p-3 mb-2"
          >
            <Text className="text-2xl">{a.icon}</Text>
            <View className="flex-1">
              <Text className="text-sm font-medium text-text-primary">{a.name}</Text>
              <Text className="text-xs text-text-muted">{a.rarity}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Menu items */}
      <View className="bg-surface border border-border-default rounded-lg overflow-hidden mb-4">
        {[
          { label: "Editar Perfil", icon: "✏️" },
          { label: "Estatísticas", icon: "📊" },
          { label: "Conquistas", icon: "🏆" },
          { label: "Planos & Assinatura", icon: "⭐" },
          { label: "Configurações", icon: "⚙️" },
        ].map((item, i) => (
          <TouchableOpacity
            key={item.label}
            className={`flex-row items-center gap-3 px-4 py-3.5 ${
              i > 0 ? "border-t border-border-default" : ""
            }`}
          >
            <Text className="text-base">{item.icon}</Text>
            <Text className="text-sm text-text-primary flex-1">{item.label}</Text>
            <Text className="text-text-muted">›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity className="items-center py-4">
        <Text className="text-error text-sm font-medium">Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
