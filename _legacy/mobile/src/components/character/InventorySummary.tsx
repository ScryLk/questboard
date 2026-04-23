import { memo, useMemo } from "react";
import { Coins as CoinsIcon, Swords, Shield, Backpack } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { Coins, InventoryItem } from "../../lib/character-types";

interface InventorySummaryProps {
  coins: Coins;
  inventory: InventoryItem[];
  carryCapacity: number;
}

const COIN_LABELS: { key: keyof Coins; label: string; color: string }[] = [
  { key: "pp", label: "PPl", color: "#C0C0C0" },
  { key: "gp", label: "PO", color: "#FDCB6E" },
  { key: "ep", label: "PE", color: "#A29BFE" },
  { key: "sp", label: "PP", color: "#9090A0" },
  { key: "cp", label: "PC", color: "#CD7F32" },
];

const CATEGORY_CONFIG: Record<string, { label: string; Icon: typeof Swords }> = {
  weapon: { label: "Armas", Icon: Swords },
  armor: { label: "Armaduras", Icon: Shield },
  gear: { label: "Equipamento", Icon: Backpack },
  consumable: { label: "Consumíveis", Icon: Backpack },
  treasure: { label: "Tesouros", Icon: CoinsIcon },
};

function InventorySummaryInner({ coins, inventory, carryCapacity }: InventorySummaryProps) {
  const totalWeight = useMemo(
    () => inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0),
    [inventory],
  );

  const categories = useMemo(() => {
    const groups: Record<string, InventoryItem[]> = {};
    for (const item of inventory) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [inventory]);

  const weightPercent = carryCapacity > 0 ? Math.min(100, (totalWeight / carryCapacity) * 100) : 0;
  const isOverweight = totalWeight > carryCapacity;

  return (
    <YStack gap={10} paddingHorizontal={20}>
      {/* Coins row */}
      <XStack gap={8} flexWrap="wrap">
        {COIN_LABELS.map(({ key, label, color }) => {
          const value = coins[key];
          if (value === 0) return null;
          return (
            <XStack key={key} gap={3} alignItems="center">
              <Text fontSize={13} fontWeight="700" color={color}>
                {value}
              </Text>
              <Text fontSize={10} color="#5A5A6E">
                {label}
              </Text>
            </XStack>
          );
        })}
      </XStack>

      {/* Items by category */}
      {Object.entries(categories).map(([cat, items]) => {
        const config = CATEGORY_CONFIG[cat];
        if (!config) return null;
        return (
          <YStack key={cat} gap={4}>
            <XStack gap={4} alignItems="center">
              <config.Icon size={12} color="#5A5A6E" />
              <Text fontSize={11} fontWeight="600" color="#5A5A6E">
                {config.label}
              </Text>
            </XStack>
            {items.map((item) => (
              <XStack key={item.id} paddingLeft={16} gap={4} alignItems="baseline">
                <Text fontSize={12} color="#9090A0" flex={1} numberOfLines={1}>
                  {item.name}
                  {item.quantity > 1 ? ` \u00D7${item.quantity}` : ""}
                </Text>
                {item.damage && (
                  <Text fontSize={10} color="#5A5A6E">
                    {item.damage}
                  </Text>
                )}
                {item.armorClass && (
                  <Text fontSize={10} color="#5A5A6E">
                    CA {item.armorClass}
                  </Text>
                )}
              </XStack>
            ))}
          </YStack>
        );
      })}

      {/* Weight bar */}
      <XStack alignItems="center" gap={8}>
        <Stack flex={1} height={4} borderRadius={2} backgroundColor="#1A1A24" overflow="hidden">
          <Stack
            width={`${weightPercent}%`}
            height={4}
            borderRadius={2}
            backgroundColor={isOverweight ? "#FF6B6B" : "#5A5A6E"}
          />
        </Stack>
        <Text fontSize={10} color={isOverweight ? "#FF6B6B" : "#5A5A6E"}>
          {Math.round(totalWeight)}/{carryCapacity} lbs
        </Text>
      </XStack>
    </YStack>
  );
}

export const InventorySummary = memo(InventorySummaryInner);
