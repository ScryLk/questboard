import { Alert, Modal } from "react-native";
import { useRouter } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import {
  Castle,
  Calendar,
  ChevronRight,
  LogIn,
  Map,
  Sparkles,
  Shield,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useCreateSheet } from "../lib/create-sheet-context";

interface Option {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor: string;
  badge?: string;
}

const OPTIONS: Option[] = [
  {
    key: "session",
    icon: Castle,
    title: "Criar Campanha",
    description: "Comece uma nova aventura",
    accentColor: "#6C5CE7",
  },
  {
    key: "join",
    icon: LogIn,
    title: "Entrar com Código",
    description: "Campanha ou sessão",
    accentColor: "#00CEC9",
  },
  {
    key: "character",
    icon: Shield,
    title: "Criar Personagem",
    description: "Novo herói para suas aventuras",
    accentColor: "#00B894",
  },
  {
    key: "schedule",
    icon: Calendar,
    title: "Agendar Sessão",
    description: "Marque a próxima sessão",
    accentColor: "#FDCB6E",
  },
  {
    key: "map",
    icon: Map,
    title: "Novo Mapa",
    description: "Faça upload ou gere com IA",
    accentColor: "#FF6B6B",
    badge: "IA",
  },
];

export function CreateActionSheet() {
  const { isOpen, close } = useCreateSheet();
  const router = useRouter();

  function handleOption(key: string) {
    close();
    if (key === "character") {
      router.push("/(app)/characters/create");
      return;
    }
    if (key === "session") {
      router.push("/(app)/sessions/create");
      return;
    }
    if (key === "join") {
      router.push("/(app)/join");
      return;
    }
    Alert.alert("Em breve", "Esta funcionalidade estará disponível em breve!");
  }

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <YStack flex={1} justifyContent="flex-end">
        <Stack
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          right={0}
          backgroundColor="rgba(0,0,0,0.5)"
          onPress={close}
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
              O que deseja fazer?
            </Text>

            <YStack marginTop={20} gap={12}>
              {OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <XStack
                    key={option.key}
                    height={72}
                    borderRadius={14}
                    backgroundColor="#1C1C24"
                    alignItems="center"
                    paddingHorizontal={16}
                    gap={14}
                    onPress={() => handleOption(option.key)}
                    pressStyle={{ backgroundColor: "$border" }}
                  >
                    <YStack
                      height={48}
                      width={48}
                      borderRadius={14}
                      backgroundColor={`${option.accentColor}26`}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon size={24} color={option.accentColor} />
                    </YStack>

                    <YStack flex={1}>
                      <XStack alignItems="center" gap={8}>
                        <Text fontSize={16} fontWeight="600" color="$textPrimary">
                          {option.title}
                        </Text>
                        {option.badge && (
                          <XStack alignItems="center" gap={3}>
                            <Sparkles size={12} color="#FDCB6E" />
                            <Text fontSize={11} fontWeight="600" color="#FDCB6E">
                              {option.badge}
                            </Text>
                          </XStack>
                        )}
                      </XStack>
                      <Text fontSize={13} color="$textMuted" marginTop={2}>
                        {option.description}
                      </Text>
                    </YStack>

                    <ChevronRight size={18} color="#5A5A6E" />
                  </XStack>
                );
              })}
            </YStack>

            <Stack onPress={close} alignSelf="center" marginTop={20}>
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
