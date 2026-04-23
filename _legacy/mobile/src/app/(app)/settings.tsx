import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Gamepad2,
  Globe,
  Grid3x3,
  Image as ImageIcon,
  Minus,
  Moon,
  Palette,
  Plus,
  Sun,
  Trash2,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Stack, Text, XStack, YStack } from "tamagui";

// ─── Local preferences store (simple useState for now) ───

interface AppPreferences {
  theme: "dark" | "light" | "auto";
  language: "pt-BR" | "en-US";
  favoriteSystems: string[];
  defaultGridSize: number;
  defaultGridVisible: boolean;
  defaultGridType: "SQUARE" | "HEX" | "NONE";
  defaultMapImage: { url: string; width: number; height: number } | null;
}

const DEFAULT_PREFS: AppPreferences = {
  theme: "dark",
  language: "pt-BR",
  favoriteSystems: ["D&D 5e", "Tormenta20"],
  defaultGridSize: 50,
  defaultGridVisible: true,
  defaultGridType: "SQUARE",
  defaultMapImage: null,
};

export default function SettingsScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<AppPreferences>(DEFAULT_PREFS);

  function update(partial: Partial<AppPreferences>) {
    setPrefs((p) => ({ ...p, ...partial }));
  }

  async function handleImportImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      update({
        defaultMapImage: {
          url: asset.uri,
          width: asset.width ?? 800,
          height: asset.height ?? 600,
        },
      });
    }
  }

  function handleRemoveImage() {
    Alert.alert("Remover Imagem", "Remover a imagem padrão do mapa?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Remover", style: "destructive", onPress: () => update({ defaultMapImage: null }) },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
      {/* Header */}
      <XStack
        height={52}
        alignItems="center"
        paddingHorizontal={16}
        gap={12}
        borderBottomWidth={StyleSheet.hairlineWidth}
        borderBottomColor="$border"
      >
        <Stack
          width={36}
          height={36}
          borderRadius={10}
          backgroundColor="$bgCard"
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={18} color="#9090A0" />
        </Stack>
        <Text fontSize={17} fontWeight="700" color="$textPrimary">
          Configurações
        </Text>
      </XStack>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Aparência ─── */}
        <SectionHeader label="Aparência" />
        <YStack marginHorizontal={16} borderRadius={12} backgroundColor="$bgCard" overflow="hidden">
          {/* Theme */}
          <YStack paddingHorizontal={16} paddingVertical={14} gap={10}>
            <Text fontSize={14} color="$textPrimary">Tema</Text>
            <XStack gap={8}>
              {([
                { key: "dark" as const, label: "Escuro", Icon: Moon },
                { key: "light" as const, label: "Claro", Icon: Sun },
                { key: "auto" as const, label: "Sistema", Icon: Palette },
              ]).map((opt) => {
                const active = prefs.theme === opt.key;
                return (
                  <Stack
                    key={opt.key}
                    flex={1}
                    paddingVertical={10}
                    borderRadius={10}
                    backgroundColor={active ? "$accentMuted" : "$bg"}
                    borderWidth={1}
                    borderColor={active ? "$accent" : "$border"}
                    alignItems="center"
                    gap={4}
                    pressStyle={{ opacity: 0.7 }}
                    onPress={() => update({ theme: opt.key })}
                  >
                    <opt.Icon size={16} color={active ? "#6C5CE7" : "#5A5A6E"} />
                    <Text
                      fontSize={12}
                      fontWeight={active ? "700" : "500"}
                      color={active ? "$accent" : "$textMuted"}
                    >
                      {opt.label}
                    </Text>
                  </Stack>
                );
              })}
            </XStack>
          </YStack>

          <Divider />

          {/* Language */}
          <XStack
            paddingHorizontal={16}
            paddingVertical={14}
            alignItems="center"
            justifyContent="space-between"
          >
            <XStack alignItems="center" gap={10}>
              <Globe size={16} color="#6C5CE7" />
              <Text fontSize={14} color="$textPrimary">Idioma</Text>
            </XStack>
            <XStack alignItems="center" gap={6}>
              <Text fontSize={13} color="$textMuted">
                {prefs.language === "pt-BR" ? "Português (BR)" : "English (US)"}
              </Text>
              <ChevronRight size={14} color="#5A5A6E" />
            </XStack>
          </XStack>
        </YStack>

        {/* ─── Sistemas Favoritos ─── */}
        <SectionHeader label="Sistemas Favoritos" />
        <YStack marginHorizontal={16} borderRadius={12} backgroundColor="$bgCard" overflow="hidden">
          <XStack
            paddingHorizontal={16}
            paddingVertical={14}
            alignItems="center"
            justifyContent="space-between"
            pressStyle={{ backgroundColor: "$border" }}
            onPress={() => Alert.alert("Em breve", "Edição de sistemas favoritos em breve!")}
          >
            <XStack alignItems="center" gap={10}>
              <Gamepad2 size={16} color="#6C5CE7" />
              <Text fontSize={14} color="$textPrimary">Sistemas</Text>
            </XStack>
            <XStack alignItems="center" gap={6}>
              <Text fontSize={13} color="$textMuted">
                {prefs.favoriteSystems.join(", ")}
              </Text>
              <ChevronRight size={14} color="#5A5A6E" />
            </XStack>
          </XStack>
        </YStack>

        {/* ─── Mapa & Grade ─── */}
        <SectionHeader label="Mapa & Grade (Padrão)" />
        <YStack marginHorizontal={16} borderRadius={12} backgroundColor="$bgCard" overflow="hidden">
          {/* Default map image */}
          <YStack paddingHorizontal={16} paddingVertical={14} gap={10}>
            <Text fontSize={14} color="$textPrimary">Imagem de Fundo Padrão</Text>
            {prefs.defaultMapImage ? (
              <YStack
                borderRadius={10}
                borderWidth={1}
                borderColor="$border"
                overflow="hidden"
              >
                <Image
                  source={{ uri: prefs.defaultMapImage.url }}
                  width="100%"
                  height={100}
                  resizeMode="cover"
                />
                <XStack padding={10} gap={8} alignItems="center">
                  <Text fontSize={11} color="$textMuted" flex={1}>
                    {prefs.defaultMapImage.width} x {prefs.defaultMapImage.height}px
                  </Text>
                  <Stack
                    paddingHorizontal={10}
                    paddingVertical={5}
                    borderRadius={6}
                    backgroundColor="$bg"
                    pressStyle={{ opacity: 0.7 }}
                    onPress={handleImportImage}
                  >
                    <Text fontSize={11} color="$textMuted">Trocar</Text>
                  </Stack>
                  <Stack
                    width={28}
                    height={28}
                    borderRadius={6}
                    backgroundColor="rgba(255,59,48,0.1)"
                    alignItems="center"
                    justifyContent="center"
                    pressStyle={{ opacity: 0.7 }}
                    onPress={handleRemoveImage}
                  >
                    <Trash2 size={12} color="#FF3B30" />
                  </Stack>
                </XStack>
              </YStack>
            ) : (
              <Stack
                height={80}
                borderRadius={10}
                borderWidth={2}
                borderColor="$border"
                borderStyle="dashed"
                backgroundColor="$bg"
                alignItems="center"
                justifyContent="center"
                gap={6}
                pressStyle={{ opacity: 0.7, borderColor: "$accent" }}
                onPress={handleImportImage}
              >
                <ImageIcon size={22} color="#5A5A6E" />
                <Text fontSize={12} color="$textMuted">Importar imagem</Text>
              </Stack>
            )}
          </YStack>

          <Divider />

          {/* Grid visible */}
          <XStack
            paddingHorizontal={16}
            paddingVertical={14}
            alignItems="center"
            justifyContent="space-between"
            pressStyle={{ backgroundColor: "$border" }}
            onPress={() => update({ defaultGridVisible: !prefs.defaultGridVisible })}
          >
            <XStack alignItems="center" gap={10}>
              {prefs.defaultGridVisible ? (
                <Eye size={16} color="#6C5CE7" />
              ) : (
                <EyeOff size={16} color="#5A5A6E" />
              )}
              <Text fontSize={14} color="$textPrimary">Grade visível</Text>
            </XStack>
            <Toggle active={prefs.defaultGridVisible} />
          </XStack>

          <Divider />

          {/* Grid size */}
          <XStack
            paddingHorizontal={16}
            paddingVertical={14}
            alignItems="center"
            justifyContent="space-between"
          >
            <XStack alignItems="center" gap={10}>
              <Grid3x3 size={16} color="#6C5CE7" />
              <Text fontSize={14} color="$textPrimary">Tamanho da célula</Text>
            </XStack>
            <XStack alignItems="center" gap={10}>
              <Stack
                width={28}
                height={28}
                borderRadius={7}
                backgroundColor="$bg"
                borderWidth={1}
                borderColor="$border"
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.7 }}
                onPress={() => update({ defaultGridSize: Math.max(20, prefs.defaultGridSize - 5) })}
                opacity={prefs.defaultGridSize <= 20 ? 0.3 : 1}
              >
                <Minus size={12} color="#9090A0" />
              </Stack>
              <Text fontSize={14} fontWeight="600" color="$textPrimary" width={32} textAlign="center">
                {prefs.defaultGridSize}
              </Text>
              <Stack
                width={28}
                height={28}
                borderRadius={7}
                backgroundColor="$bg"
                borderWidth={1}
                borderColor="$border"
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.7 }}
                onPress={() => update({ defaultGridSize: Math.min(100, prefs.defaultGridSize + 5) })}
                opacity={prefs.defaultGridSize >= 100 ? 0.3 : 1}
              >
                <Plus size={12} color="#9090A0" />
              </Stack>
            </XStack>
          </XStack>

          <Divider />

          {/* Grid type */}
          <YStack paddingHorizontal={16} paddingVertical={14} gap={8}>
            <Text fontSize={14} color="$textPrimary">Tipo de grade</Text>
            <XStack gap={8}>
              {([
                { key: "SQUARE" as const, label: "Quadrado" },
                { key: "HEX" as const, label: "Hexagonal" },
                { key: "NONE" as const, label: "Nenhum" },
              ]).map((opt) => {
                const active = prefs.defaultGridType === opt.key;
                return (
                  <Stack
                    key={opt.key}
                    flex={1}
                    paddingVertical={8}
                    borderRadius={8}
                    backgroundColor={active ? "$accentMuted" : "$bg"}
                    borderWidth={1}
                    borderColor={active ? "$accent" : "$border"}
                    alignItems="center"
                    pressStyle={{ opacity: 0.7 }}
                    onPress={() => update({ defaultGridType: opt.key })}
                  >
                    <Text
                      fontSize={12}
                      fontWeight={active ? "700" : "500"}
                      color={active ? "$accent" : "$textMuted"}
                    >
                      {opt.label}
                    </Text>
                  </Stack>
                );
              })}
            </XStack>
          </YStack>
        </YStack>

        <YStack height={40} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Small helpers ───

function SectionHeader({ label }: { label: string }) {
  return (
    <Text
      paddingHorizontal={24}
      marginTop={28}
      marginBottom={8}
      fontSize={12}
      fontWeight="600"
      color="$textMuted"
      textTransform="uppercase"
      letterSpacing={1}
    >
      {label}
    </Text>
  );
}

function Divider() {
  return <Stack height={StyleSheet.hairlineWidth} backgroundColor="$border" />;
}

function Toggle({ active }: { active: boolean }) {
  return (
    <Stack
      width={44}
      height={26}
      borderRadius={13}
      backgroundColor={active ? "#6C5CE7" : "#2A2A35"}
      justifyContent="center"
      paddingHorizontal={2}
    >
      <Stack
        width={22}
        height={22}
        borderRadius={11}
        backgroundColor="#fff"
        alignSelf={active ? "flex-end" : "flex-start"}
      />
    </Stack>
  );
}
