import type { ReactNode } from "react";
import { Stack, Text, YStack } from "tamagui";
import { Button } from "./button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <YStack alignItems="center" justifyContent="center" padding={32} gap={12}>
      <Stack
        height={64}
        width={64}
        borderRadius={9999}
        backgroundColor="$accentMuted"
        alignItems="center"
        justifyContent="center"
        marginBottom={4}
      >
        {icon}
      </Stack>

      <Text fontSize={18} fontWeight="600" color="$textPrimary" textAlign="center">
        {title}
      </Text>

      <Text
        fontSize={14}
        color="$textMuted"
        textAlign="center"
        lineHeight={20}
        maxWidth={280}
      >
        {message}
      </Text>

      {actionLabel && onAction && (
        <Stack marginTop={8}>
          <Button variant="primary" size="md" onPress={onAction}>
            {actionLabel}
          </Button>
        </Stack>
      )}
    </YStack>
  );
}
