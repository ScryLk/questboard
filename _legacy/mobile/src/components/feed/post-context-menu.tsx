import { Alert, Modal } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import {
  ChevronRight,
  Flag,
  Link,
  Pencil,
  Pin,
  Trash2,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";

interface MenuOption {
  key: string;
  icon: LucideIcon;
  title: string;
  color: string;
  destructive?: boolean;
}

const AUTHOR_OPTIONS: MenuOption[] = [
  { key: "edit", icon: Pencil, title: "Editar Publicacao", color: "#6C5CE7" },
  { key: "pin", icon: Pin, title: "Fixar no Perfil", color: "#FDCB6E" },
  {
    key: "delete",
    icon: Trash2,
    title: "Excluir Publicacao",
    color: "#FF6B6B",
    destructive: true,
  },
];

const VIEWER_OPTIONS: MenuOption[] = [
  { key: "report", icon: Flag, title: "Denunciar", color: "#FF6B6B" },
  { key: "link", icon: Link, title: "Copiar Link", color: "#5A5A6E" },
];

interface PostContextMenuProps {
  visible: boolean;
  postId: string;
  isAuthor: boolean;
  onClose: () => void;
  onDelete?: (postId: string) => void;
}

export function PostContextMenu({
  visible,
  postId,
  isAuthor,
  onClose,
  onDelete,
}: PostContextMenuProps) {
  const options = isAuthor ? AUTHOR_OPTIONS : VIEWER_OPTIONS;

  function handleOption(key: string) {
    onClose();
    if (key === "delete") {
      Alert.alert("Excluir Publicacao", "Tem certeza? Esta acao nao pode ser desfeita.", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => onDelete?.(postId),
        },
      ]);
      return;
    }
    Alert.alert("Em breve", "Esta funcionalidade estara disponivel em breve!");
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <YStack flex={1} justifyContent="flex-end">
        <Stack
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          right={0}
          backgroundColor="rgba(0,0,0,0.5)"
          onPress={onClose}
        />
        <YStack
          borderTopLeftRadius={24}
          borderTopRightRadius={24}
          borderTopWidth={1}
          borderTopColor="$border"
          backgroundColor="$bgCard"
          paddingBottom={40}
        >
          {/* Handle */}
          <YStack alignItems="center" paddingVertical={12}>
            <Stack
              height={4}
              width={40}
              borderRadius={9999}
              backgroundColor="$border"
            />
          </YStack>

          <YStack paddingHorizontal={24} gap={10}>
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <XStack
                  key={option.key}
                  height={56}
                  borderRadius={14}
                  backgroundColor="#1C1C24"
                  alignItems="center"
                  paddingHorizontal={14}
                  gap={12}
                  onPress={() => handleOption(option.key)}
                  pressStyle={{ backgroundColor: "$border" }}
                >
                  <YStack
                    height={36}
                    width={36}
                    borderRadius={10}
                    backgroundColor={`${option.color}26`}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon size={18} color={option.color} />
                  </YStack>
                  <Text
                    flex={1}
                    fontSize={15}
                    fontWeight="600"
                    color={option.destructive ? "#FF6B6B" : "$textPrimary"}
                  >
                    {option.title}
                  </Text>
                  <ChevronRight size={16} color="#5A5A6E" />
                </XStack>
              );
            })}

            <Stack onPress={onClose} alignSelf="center" marginTop={16}>
              <Text fontSize={14} color="$textMuted">
                Cancelar
              </Text>
            </Stack>
          </YStack>
        </YStack>
      </YStack>
    </Modal>
  );
}
