import { memo, useState, useCallback } from "react";
import { TextInput } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";

interface HPAdjusterProps {
  tokenId: string;
  current: number;
  max: number;
  editable: boolean;
}

function HPAdjusterInner({ tokenId, current, max, editable }: HPAdjusterProps) {
  const updateTokenHp = useGameplayStore((s) => s.updateTokenHp);
  const [editMode, setEditMode] = useState<"damage" | "heal" | null>(null);
  const [inputValue, setInputValue] = useState("5");

  const hpPercent = max > 0 ? Math.round((current / max) * 100) : 0;
  const barColor =
    hpPercent > 50 ? "#00B894" : hpPercent > 25 ? "#FDCB6E" : "#FF6B6B";

  const handleApply = useCallback(() => {
    const value = parseInt(inputValue, 10);
    if (isNaN(value) || value <= 0) {
      setEditMode(null);
      return;
    }
    const delta = editMode === "damage" ? -value : value;
    updateTokenHp(tokenId, delta);
    setEditMode(null);
    setInputValue("5");
  }, [editMode, inputValue, tokenId, updateTokenHp]);

  const handleStartEdit = useCallback((mode: "damage" | "heal") => {
    setEditMode(mode);
    setInputValue("5");
  }, []);

  return (
    <YStack gap={6}>
      <XStack alignItems="center" gap={8}>
        {/* Damage button */}
        {editable && (
          <Stack
            width={28}
            height={28}
            borderRadius={14}
            backgroundColor={editMode === "damage" ? "#FF6B6B" : "#1A1A24"}
            borderWidth={1}
            borderColor={editMode === "damage" ? "#FF6B6B" : "#2A2A35"}
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={() =>
              editMode === "damage" ? handleApply() : handleStartEdit("damage")
            }
          >
            <Minus size={14} color={editMode === "damage" ? "white" : "#FF6B6B"} />
          </Stack>
        )}

        {/* HP Bar */}
        <YStack flex={1} gap={2}>
          {editMode ? (
            <XStack
              height={28}
              borderRadius={8}
              backgroundColor="#12121A"
              borderWidth={1}
              borderColor={editMode === "damage" ? "#FF6B6B" : "#00B894"}
              alignItems="center"
              paddingHorizontal={10}
              gap={6}
            >
              <Text fontSize={11} color="#5A5A6E">
                {editMode === "damage" ? "Dano:" : "Cura:"}
              </Text>
              <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="numeric"
                autoFocus
                onSubmitEditing={handleApply}
                onBlur={() => setEditMode(null)}
                style={{
                  flex: 1,
                  color: "#E8E8ED",
                  fontSize: 14,
                  fontWeight: "700",
                  padding: 0,
                }}
                maxLength={4}
              />
            </XStack>
          ) : (
            <>
              <XStack
                height={8}
                borderRadius={4}
                backgroundColor="#2A2A35"
                overflow="hidden"
              >
                <Stack
                  height={8}
                  borderRadius={4}
                  width={`${hpPercent}%` as any}
                  backgroundColor={barColor}
                />
              </XStack>
              <Text fontSize={11} color="#E8E8ED" textAlign="center">
                {current}/{max}
              </Text>
            </>
          )}
        </YStack>

        {/* Heal button */}
        {editable && (
          <Stack
            width={28}
            height={28}
            borderRadius={14}
            backgroundColor={editMode === "heal" ? "#00B894" : "#1A1A24"}
            borderWidth={1}
            borderColor={editMode === "heal" ? "#00B894" : "#2A2A35"}
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={() =>
              editMode === "heal" ? handleApply() : handleStartEdit("heal")
            }
          >
            <Plus size={14} color={editMode === "heal" ? "white" : "#00B894"} />
          </Stack>
        )}
      </XStack>
    </YStack>
  );
}

export const HPAdjuster = memo(HPAdjusterInner);
