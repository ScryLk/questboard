import { memo } from "react";
import { Users, Crown, EyeOff } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { LucideIcon } from "lucide-react-native";

export type DiceVisibility = "public" | "gm_only" | "private";

interface VisibilitySelectorProps {
  value: DiceVisibility;
  onChange: (v: DiceVisibility) => void;
}

const OPTIONS: { key: DiceVisibility; label: string; Icon: LucideIcon }[] = [
  { key: "public", label: "Público", Icon: Users },
  { key: "gm_only", label: "Só GM", Icon: Crown },
  { key: "private", label: "Privado", Icon: EyeOff },
];

function VisibilitySelectorInner({ value, onChange }: VisibilitySelectorProps) {
  return (
    <YStack paddingHorizontal={16} marginTop={16}>
      <Text fontSize={13} fontWeight="600" color="#9090A0" marginBottom={8}>
        Visibilidade
      </Text>
      <XStack gap={8}>
        {OPTIONS.map(({ key, label, Icon }) => {
          const isActive = value === key;
          return (
            <Stack
              key={key}
              flex={1}
              height={36}
              borderRadius={8}
              backgroundColor={
                isActive ? "rgba(108,92,231,0.12)" : "#1C1C24"
              }
              borderWidth={1}
              borderColor={isActive ? "#6C5CE7" : "#2A2A35"}
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              gap={6}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => onChange(key)}
            >
              <Icon
                size={14}
                color={isActive ? "#E8E8ED" : "#9090A0"}
              />
              <Text
                fontSize={12}
                fontWeight="500"
                color={isActive ? "#E8E8ED" : "#9090A0"}
              >
                {label}
              </Text>
            </Stack>
          );
        })}
      </XStack>
    </YStack>
  );
}

export const VisibilitySelector = memo(VisibilitySelectorInner);
