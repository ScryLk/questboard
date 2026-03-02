import { memo, useMemo } from "react";
import { Clock } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";

interface DiceHistoryProps {
  onReroll: (formula: string, label?: string) => void;
}

function DiceHistoryInner({ onReroll }: DiceHistoryProps) {
  const messages = useGameplayStore((s) => s.messages);

  const recentRolls = useMemo(() => {
    return messages
      .filter((m) => m.type === "dice_roll" && m.diceResult)
      .slice(-5)
      .reverse();
  }, [messages]);

  return (
    <YStack paddingHorizontal={16} marginTop={16}>
      <XStack gap={6} alignItems="center" marginBottom={8}>
        <Clock size={14} color="#9090A0" />
        <Text fontSize={13} fontWeight="600" color="#9090A0">
          Recentes
        </Text>
      </XStack>

      {recentRolls.length === 0 ? (
        <Text fontSize={12} color="#5A5A6E">
          Nenhuma rolagem recente
        </Text>
      ) : (
        <YStack gap={2}>
          {recentRolls.map((msg) => {
            const dr = msg.diceResult!;
            const resultColor = dr.isNat20
              ? "#FDCB6E"
              : dr.isNat1
                ? "#FF6B6B"
                : "#E8E8ED";

            return (
              <XStack
                key={msg.id}
                height={32}
                alignItems="center"
                pressStyle={{ opacity: 0.7 }}
                onPress={() => onReroll(dr.formula, dr.label)}
              >
                <Text
                  flex={1}
                  fontSize={12}
                  color="#9090A0"
                  numberOfLines={1}
                >
                  {msg.senderName} · {dr.label || dr.formula}
                </Text>
                <Text fontSize={12} fontWeight="700" color={resultColor}>
                  = {dr.total}
                </Text>
              </XStack>
            );
          })}
        </YStack>
      )}
    </YStack>
  );
}

export const DiceHistory = memo(DiceHistoryInner);
