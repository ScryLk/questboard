import { Modal } from "react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { Button } from "./button";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "primary",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="rgba(0,0,0,0.6)"
      >
        <YStack
          width="85%"
          maxWidth={340}
          borderRadius={16}
          backgroundColor="$bgCard"
          borderWidth={1}
          borderColor="$border"
          padding={24}
        >
          <Text fontSize={18} fontWeight="700" color="$textPrimary">
            {title}
          </Text>
          <Text marginTop={8} fontSize={14} color="$textSecondary" lineHeight={20}>
            {message}
          </Text>

          <XStack marginTop={20} gap={12}>
            <Stack flex={1}>
              <Button variant="outline" size="md" onPress={onCancel}>
                {cancelLabel}
              </Button>
            </Stack>
            <Stack flex={1}>
              <Button
                variant={variant === "danger" ? "danger" : "primary"}
                size="md"
                onPress={onConfirm}
                loading={loading}
              >
                {confirmLabel}
              </Button>
            </Stack>
          </XStack>
        </YStack>
      </YStack>
    </Modal>
  );
}
