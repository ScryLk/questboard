import { memo } from "react";
import { TextInput } from "react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { Coins } from "../../lib/character-types";

interface CoinEditorProps {
  coins: Coins;
  onChange: (coins: Coins) => void;
}

const COIN_TYPES: { key: keyof Coins; label: string; color: string }[] = [
  { key: "pp", label: "PPl", color: "#E0E0E0" },
  { key: "gp", label: "PO", color: "#FDCB6E" },
  { key: "ep", label: "PE", color: "#B2BEC3" },
  { key: "sp", label: "PP", color: "#DFE6E9" },
  { key: "cp", label: "PC", color: "#E17055" },
];

function CoinEditorInner({ coins, onChange }: CoinEditorProps) {
  return (
    <XStack gap={6} flexWrap="wrap">
      {COIN_TYPES.map(({ key, label, color }) => (
        <YStack key={key} flex={1} minWidth={56} gap={3} alignItems="center">
          <Text fontSize={10} fontWeight="700" color={color}>
            {label}
          </Text>
          <Stack
            borderRadius={8}
            borderWidth={1}
            borderColor="#2A2A35"
            backgroundColor="#1C1C24"
            paddingHorizontal={6}
            paddingVertical={6}
            width="100%"
          >
            <TextInput
              value={String(coins[key])}
              onChangeText={(text) => {
                const num = parseInt(text, 10);
                onChange({
                  ...coins,
                  [key]: isNaN(num) || num < 0 ? 0 : num,
                });
              }}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#3A3A45"
              style={{
                color: "#E8E8ED",
                fontSize: 14,
                fontWeight: "700",
                textAlign: "center",
                padding: 0,
              }}
            />
          </Stack>
        </YStack>
      ))}
    </XStack>
  );
}

export const CoinEditor = memo(CoinEditorInner);
