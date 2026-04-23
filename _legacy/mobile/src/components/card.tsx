import type { ReactNode } from "react";
import { YStack, type YStackProps } from "tamagui";

interface CardProps extends YStackProps {
  children: ReactNode;
}

export function Card({ children, ...rest }: CardProps) {
  return (
    <YStack
      borderRadius={12}
      backgroundColor="$bgCard"
      borderWidth={1}
      borderColor="$border"
      padding={16}
      {...rest}
    >
      {children}
    </YStack>
  );
}
