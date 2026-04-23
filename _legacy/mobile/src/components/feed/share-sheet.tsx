import { Alert, Modal, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import type { LucideIcon } from "lucide-react-native";
import {
  Castle,
  ChevronRight,
  ExternalLink,
  Link,
  MessageSquare,
  Quote,
  Repeat2,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";

interface ShareOption {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const OPTIONS: ShareOption[] = [
  {
    key: "repost",
    icon: Repeat2,
    title: "Repostar",
    description: "Compartilhar no seu perfil",
    color: "#00CEC9",
  },
  {
    key: "quote",
    icon: Quote,
    title: "Citar Post",
    description: "Adicionar seu comentario",
    color: "#6C5CE7",
  },
  {
    key: "dm",
    icon: MessageSquare,
    title: "Enviar por Mensagem",
    description: "Enviar para um amigo",
    color: "#FDCB6E",
  },
  {
    key: "session",
    icon: Castle,
    title: "Enviar na Sessao",
    description: "Compartilhar na sessao",
    color: "#00B894",
  },
  {
    key: "link",
    icon: Link,
    title: "Copiar Link",
    description: "Copiar link da publicacao",
    color: "#5A5A6E",
  },
  {
    key: "external",
    icon: ExternalLink,
    title: "Compartilhar",
    description: "WhatsApp, Twitter, etc",
    color: "#5A5A6E",
  },
];

interface ShareSheetProps {
  visible: boolean;
  postId: string;
  onClose: () => void;
  onRepost: () => void;
  onQuote: () => void;
}

export function ShareSheet({
  visible,
  postId,
  onClose,
  onRepost,
  onQuote,
}: ShareSheetProps) {
  async function handleOption(key: string) {
    onClose();

    if (key === "repost") {
      onRepost();
      return;
    }
    if (key === "quote") {
      onQuote();
      return;
    }
    if (key === "link") {
      await Clipboard.setStringAsync(`https://questboard.gg/p/${postId}`);
      Alert.alert("Link copiado!");
      return;
    }
    if (key === "external") {
      await Share.share({
        message: `Confira este post no QuestBoard! https://questboard.gg/p/${postId}`,
      });
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

          <YStack paddingHorizontal={24}>
            <Text fontSize={20} fontWeight="700" color="$textPrimary">
              Compartilhar
            </Text>

            <YStack marginTop={20} gap={10}>
              {OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <XStack
                    key={option.key}
                    height={64}
                    borderRadius={14}
                    backgroundColor="#1C1C24"
                    alignItems="center"
                    paddingHorizontal={14}
                    gap={12}
                    onPress={() => handleOption(option.key)}
                    pressStyle={{ backgroundColor: "$border" }}
                  >
                    <YStack
                      height={40}
                      width={40}
                      borderRadius={12}
                      backgroundColor={`${option.color}26`}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon size={20} color={option.color} />
                    </YStack>
                    <YStack flex={1}>
                      <Text
                        fontSize={15}
                        fontWeight="600"
                        color="$textPrimary"
                      >
                        {option.title}
                      </Text>
                      <Text fontSize={12} color="$textMuted" marginTop={1}>
                        {option.description}
                      </Text>
                    </YStack>
                    <ChevronRight size={16} color="#5A5A6E" />
                  </XStack>
                );
              })}
            </YStack>

            <Stack onPress={onClose} alignSelf="center" marginTop={20}>
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
