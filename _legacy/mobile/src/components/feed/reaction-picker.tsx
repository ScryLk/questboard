import { Modal } from "react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { ReactionType } from "@questboard/types";
import { REACTIONS } from "../../lib/feed-constants";

interface ReactionPickerProps {
  visible: boolean;
  currentReaction: ReactionType | null;
  onSelect: (type: ReactionType | null) => void;
  onClose: () => void;
}

export function ReactionPicker({
  visible,
  currentReaction,
  onSelect,
  onClose,
}: ReactionPickerProps) {
  function handleSelect(type: ReactionType) {
    if (type === currentReaction) {
      onSelect(null);
    } else {
      onSelect(type);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Stack
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          right={0}
          backgroundColor="rgba(0,0,0,0.4)"
          onPress={onClose}
        />

        <XStack
          backgroundColor="#2A2A35"
          borderRadius={16}
          padding={12}
          gap={4}
          shadowColor="rgba(0,0,0,0.5)"
          shadowOffset={{ width: 0, height: 8 }}
          shadowOpacity={1}
          shadowRadius={24}
        >
          {REACTIONS.map((r) => {
            const isSelected = r.type === currentReaction;
            const Icon = r.icon;
            return (
              <YStack
                key={r.type}
                alignItems="center"
                gap={4}
                paddingHorizontal={10}
                paddingVertical={8}
                borderRadius={12}
                borderWidth={isSelected ? 2 : 0}
                borderColor={isSelected ? r.color : "transparent"}
                backgroundColor={
                  isSelected ? `${r.color}1A` : "transparent"
                }
                onPress={() => handleSelect(r.type)}
                pressStyle={{ scale: 0.9 }}
              >
                <Icon size={28} color={r.color} />
                <Text
                  fontSize={10}
                  fontWeight="600"
                  color={isSelected ? r.color : "$textMuted"}
                >
                  {r.label}
                </Text>
              </YStack>
            );
          })}
        </XStack>
      </YStack>
    </Modal>
  );
}
