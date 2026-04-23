import { memo } from "react";
import { ArrowLeft } from "lucide-react-native";
import { Stack, Text, XStack } from "tamagui";

interface EditScreenHeaderProps {
  title: string;
  onSave: () => void;
  onCancel: () => void;
  canSave?: boolean;
}

function EditScreenHeaderInner({
  title,
  onSave,
  onCancel,
  canSave = true,
}: EditScreenHeaderProps) {
  return (
    <XStack
      paddingHorizontal={16}
      paddingVertical={10}
      alignItems="center"
      gap={12}
    >
      <Stack
        width={36}
        height={36}
        borderRadius={10}
        backgroundColor="#1C1C24"
        alignItems="center"
        justifyContent="center"
        pressStyle={{ opacity: 0.7 }}
        onPress={onCancel}
      >
        <ArrowLeft size={20} color="#9090A0" />
      </Stack>

      <Text flex={1} fontSize={16} fontWeight="700" color="#E8E8ED" numberOfLines={1}>
        {title}
      </Text>

      <Stack
        paddingHorizontal={16}
        paddingVertical={8}
        borderRadius={10}
        backgroundColor={canSave ? "#6C5CE7" : "#2A2A35"}
        pressStyle={canSave ? { opacity: 0.7 } : undefined}
        onPress={canSave ? onSave : undefined}
      >
        <Text
          fontSize={13}
          fontWeight="600"
          color={canSave ? "#FFFFFF" : "#5A5A6E"}
        >
          Salvar
        </Text>
      </Stack>
    </XStack>
  );
}

export const EditScreenHeader = memo(EditScreenHeaderInner);
