import type { ReactNode } from "react";
import { Alert, ScrollView } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  BarChart3,
  Bell,
  ChevronRight,
  FileText,
  Gamepad2,
  Globe,
  HelpCircle,
  Lock,
  LogOut,
  Package,
  Palette,
  Settings,
  Trophy,
  Users,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";


interface MenuItem {
  icon: ReactNode;
  label: string;
  value?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Conta",
    items: [
      { icon: <BarChart3 size={18} color="#6C5CE7" />, label: "Meu Plano", value: "Aventureiro" },
      { icon: <Users size={18} color="#6C5CE7" />, label: "Amigos", value: "23" },
      { icon: <Bell size={18} color="#6C5CE7" />, label: "Notificações" },
      { icon: <Trophy size={18} color="#6C5CE7" />, label: "Conquistas", value: "8/24" },
    ],
  },
  {
    title: "Preferências",
    items: [
      { icon: <Gamepad2 size={18} color="#6C5CE7" />, label: "Sistemas Favoritos", value: "D&D 5e, Tormenta20" },
      { icon: <Palette size={18} color="#6C5CE7" />, label: "Aparência", value: "Escuro" },
      { icon: <Globe size={18} color="#6C5CE7" />, label: "Idioma", value: "Português (BR)" },
    ],
  },
  {
    title: "Sobre",
    items: [
      { icon: <FileText size={18} color="#5A5A6E" />, label: "Termos de Uso" },
      { icon: <Lock size={18} color="#5A5A6E" />, label: "Política de Privacidade" },
      { icon: <HelpCircle size={18} color="#5A5A6E" />, label: "Ajuda e Suporte" },
      { icon: <Package size={18} color="#5A5A6E" />, label: "Versão", value: "1.0.0" },
    ],
  },
];

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const displayName = user?.firstName ?? user?.emailAddresses[0]?.emailAddress;

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  const SETTINGS_ITEMS = new Set(["Aparência", "Idioma", "Sistemas Favoritos"]);

  function handleMenuPress(label: string) {
    if (SETTINGS_ITEMS.has(label)) {
      router.push("/(app)/settings");
      return;
    }
    Alert.alert("Em breve", `"${label}" estará disponível em breve!`);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Profile Header */}
        <YStack paddingHorizontal={24} paddingTop={24} alignItems="center" gap={8}>
          <YStack
            height={80}
            width={80}
            borderRadius={9999}
            backgroundColor="$accentMuted"
            borderWidth={2}
            borderColor="$accent"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={32} color="$accent">
              {displayName?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </YStack>

          <Text fontSize={22} fontWeight="700" color="$textPrimary">
            {displayName ?? "Aventureiro"}
          </Text>

          {/* Plan badge */}
          <Stack
            borderRadius={9999}
            backgroundColor="$accentMuted"
            paddingHorizontal={12}
            paddingVertical={4}
          >
            <Text fontSize={12} fontWeight="600" color="$accent">
              Aventureiro
            </Text>
          </Stack>

          {/* Stats */}
          <XStack marginTop={16} gap={32}>
            <YStack alignItems="center">
              <Text fontSize={20} fontWeight="700" color="$textPrimary">
                12
              </Text>
              <Text fontSize={12} color="$textMuted">
                Sessões
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize={20} fontWeight="700" color="$textPrimary">
                4
              </Text>
              <Text fontSize={12} color="$textMuted">
                Personagens
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize={20} fontWeight="700" color="$textPrimary">
                8
              </Text>
              <Text fontSize={12} color="$textMuted">
                Conquistas
              </Text>
            </YStack>
          </XStack>
        </YStack>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section) => (
          <YStack key={section.title} marginTop={28}>
            <Text
              paddingHorizontal={24}
              marginBottom={8}
              fontSize={12}
              fontWeight="600"
              color="$textMuted"
              textTransform="uppercase"
              letterSpacing={1}
            >
              {section.title}
            </Text>

            <YStack
              marginHorizontal={16}
              borderRadius={12}
              backgroundColor="$bgCard"
              overflow="hidden"
            >
              {section.items.map((item, index) => (
                <XStack
                  key={item.label}
                  height={52}
                  alignItems="center"
                  paddingHorizontal={16}
                  gap={12}
                  borderBottomWidth={index < section.items.length - 1 ? 1 : 0}
                  borderBottomColor="$border"
                  onPress={() => handleMenuPress(item.label)}
                  pressStyle={{ backgroundColor: "$border" }}
                >
                  {item.icon}
                  <Text flex={1} fontSize={15} color="$textPrimary">
                    {item.label}
                  </Text>
                  {item.value && (
                    <Text fontSize={14} color="$textMuted">
                      {item.value}
                    </Text>
                  )}
                  <ChevronRight size={16} color="#5A5A6E" />
                </XStack>
              ))}
            </YStack>
          </YStack>
        ))}

        {/* Settings button */}
        <YStack marginTop={28} paddingHorizontal={16}>
          <Stack
            borderRadius={12}
            backgroundColor="$bgCard"
            overflow="hidden"
          >
            <XStack
              height={52}
              alignItems="center"
              paddingHorizontal={16}
              gap={12}
              pressStyle={{ backgroundColor: "$border" }}
              onPress={() => router.push("/(app)/settings")}
            >
              <Settings size={18} color="#6C5CE7" />
              <Text flex={1} fontSize={15} color="$textPrimary">
                Configurações
              </Text>
              <ChevronRight size={16} color="#5A5A6E" />
            </XStack>
          </Stack>
        </YStack>

        {/* Sign out */}
        <YStack marginTop={32} paddingHorizontal={24} gap={12}>
          <Stack
            onPress={handleSignOut}
            alignItems="center"
            justifyContent="center"
            borderRadius={12}
            backgroundColor="$dangerMuted"
            paddingVertical={16}
            pressStyle={{ opacity: 0.8 }}
          >
            <XStack alignItems="center" gap={8}>
              <LogOut size={18} color="#FF6B6B" />
              <Text fontSize={16} fontWeight="600" color="#FF6B6B">
                Sair da conta
              </Text>
            </XStack>
          </Stack>
          <Stack alignSelf="center" marginTop={4}>
            <Text
              fontSize={12}
              color="$textMuted"
              onPress={() => Alert.alert("Excluir conta", "Entre em contato com o suporte para excluir sua conta.")}
            >
              Excluir conta
            </Text>
          </Stack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
