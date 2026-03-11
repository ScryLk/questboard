import { Alert, Modal, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import type { LucideIcon } from "lucide-react-native";
import {
  Ban,
  ChevronRight,
  ExternalLink,
  Flag,
  Link,
  Lock,
  Settings,
  Share2,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";

interface MenuOption {
  key: string;
  icon: LucideIcon;
  title: string;
  color: string;
  destructive?: boolean;
}

const OWN_OPTIONS: MenuOption[] = [
  { key: "link", icon: Link, title: "Copiar Link do Perfil", color: "#5A5A6E" },
  { key: "share", icon: Share2, title: "Compartilhar Perfil", color: "#5A5A6E" },
  { key: "privacy", icon: Lock, title: "Privacidade", color: "#6C5CE7" },
  { key: "settings", icon: Settings, title: "Configuracoes", color: "#6C5CE7" },
];

const OTHER_OPTIONS: MenuOption[] = [
  { key: "external", icon: ExternalLink, title: "Ver Perfil Completo", color: "#5A5A6E" },
  { key: "link", icon: Link, title: "Copiar Link do Perfil", color: "#5A5A6E" },
  { key: "share", icon: Share2, title: "Compartilhar Perfil", color: "#5A5A6E" },
  { key: "block", icon: Ban, title: "Bloquear", color: "#FF6B6B", destructive: true },
  { key: "report", icon: Flag, title: "Denunciar", color: "#FF6B6B", destructive: true },
];

interface ProfileContextMenuProps {
  visible: boolean;
  username: string;
  isOwnProfile: boolean;
  onClose: () => void;
}

export function ProfileContextMenu({
  visible,
  username,
  isOwnProfile,
  onClose,
}: ProfileContextMenuProps) {
  const options = isOwnProfile ? OWN_OPTIONS : OTHER_OPTIONS;

  async function handleOption(key: string) {
    onClose();
    if (key === "link") {
      await Clipboard.setStringAsync(`https://questboard.gg/u/${username}`);
      Alert.alert("Link copiado!");
      return;
    }
    if (key === "share") {
      await Share.share({
        message: `Confira o perfil de @${username} no QuestBoard! https://questboard.gg/u/${username}`,
      });
      return;
    }
    if (key === "block") {
      Alert.alert(
        `Bloquear @${username}`,
        "Voce nao vera mais publicacoes desta pessoa.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Bloquear", style: "destructive" },
        ],
      );
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
