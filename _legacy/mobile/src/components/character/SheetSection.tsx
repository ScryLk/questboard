import { memo, type ReactNode } from "react";
import { Pencil } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";

interface SheetSectionProps {
  title: string;
  onEdit?: () => void;
  children: ReactNode;
}

function SheetSectionInner({ title, onEdit, children }: SheetSectionProps) {
  return (
    <YStack marginBottom={16}>
      <XStack
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal={20}
        marginBottom={10}
      >
        <Text fontSize={14} fontWeight="700" color="#E8E8ED">
          {title}
        </Text>
        {onEdit && (
          <Stack
            width={28}
            height={28}
            borderRadius={6}
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.6 }}
            onPress={onEdit}
          >
            <Pencil size={14} color="#5A5A6E" />
          </Stack>
        )}
      </XStack>
      {children}
    </YStack>
  );
}

export const SheetSection = memo(SheetSectionInner);
