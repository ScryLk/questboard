import { useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, Grid3X3 } from "lucide-react-native";
import { Image, Stack, Text, XStack, YStack } from "tamagui";
import { useSessionCreationStore } from "../../../../lib/session-creation-store";
import { Button } from "../../../../components/button";

const SCREEN = Dimensions.get("window");

export default function GridAdjustScreen() {
  const router = useRouter();
  const store = useSessionCreationStore();
  const mapUrl = store.ambiance.mapUrl;

  const [cols, setCols] = useState(25);
  const [rows, setRows] = useState(25);
  const [opacity, setOpacity] = useState(60);

  if (!mapUrl) {
    router.back();
    return null;
  }

  // Fit image into available space
  const imageAreaW = SCREEN.width - 32;
  const imageAreaH = SCREEN.height * 0.5;

  const cellW = imageAreaW / cols;
  const cellH = imageAreaH / rows;

  function handleConfirm() {
    store.updateAmbiance({ gridEnabled: true });
    router.back();
  }

  return (
    <YStack flex={1} backgroundColor="$bg">
      {/* Header */}
      <XStack
        paddingHorizontal={16}
        paddingTop={56}
        paddingBottom={12}
        alignItems="center"
        gap={12}
      >
        <Stack onPress={() => router.back()} pressStyle={{ opacity: 0.7 }}>
          <ArrowLeft size={24} color="#E8E8ED" />
        </Stack>
        <Text fontSize={17} fontWeight="600" color="$textPrimary" flex={1}>
          Ajustar Grade
        </Text>
        <Stack onPress={handleConfirm} pressStyle={{ opacity: 0.7 }}>
          <Check size={24} color="#7C5BF1" />
        </Stack>
      </XStack>

      {/* Image with grid overlay */}
      <Stack
        marginHorizontal={16}
        borderRadius={12}
        overflow="hidden"
        backgroundColor="$bgCard"
      >
        <Stack position="relative">
          <Image
            source={{ uri: mapUrl }}
            width={imageAreaW}
            height={imageAreaH}
            resizeMode="cover"
          />
          {/* Grid overlay */}
          <Stack
            position="absolute"
            top={0}
            left={0}
            width={imageAreaW}
            height={imageAreaH}
            style={{ opacity: opacity / 100 }}
          >
            {/* Vertical lines */}
            {Array.from({ length: cols + 1 }).map((_, i) => (
              <Stack
                key={`v${i}`}
                position="absolute"
                left={i * cellW}
                top={0}
                width={1}
                height={imageAreaH}
                backgroundColor="rgba(255,255,255,0.3)"
              />
            ))}
            {/* Horizontal lines */}
            {Array.from({ length: rows + 1 }).map((_, i) => (
              <Stack
                key={`h${i}`}
                position="absolute"
                top={i * cellH}
                left={0}
                width={imageAreaW}
                height={1}
                backgroundColor="rgba(255,255,255,0.3)"
              />
            ))}
          </Stack>
        </Stack>
      </Stack>

      {/* Controls */}
      <YStack paddingHorizontal={16} paddingTop={20} gap={16}>
        {/* Grid dimensions */}
        <XStack gap={16} alignItems="center">
          <Grid3X3 size={18} color="#8A8A9A" />

          <YStack flex={1} gap={4}>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={12} color="$textMuted">
                Colunas: {cols}
              </Text>
            </XStack>
            <XStack alignItems="center" gap={8}>
              <Stack
                onPress={() => setCols(Math.max(5, cols - 1))}
                backgroundColor="$bgCard"
                borderRadius={8}
                width={36}
                height={36}
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.7 }}
              >
                <Text color="$textPrimary" fontSize={18}>
                  −
                </Text>
              </Stack>
              <Stack flex={1} height={4} borderRadius={2} backgroundColor="$border">
                <Stack
                  height={4}
                  borderRadius={2}
                  backgroundColor="#7C5BF1"
                  width={`${((cols - 5) / 95) * 100}%`}
                />
              </Stack>
              <Stack
                onPress={() => setCols(Math.min(100, cols + 1))}
                backgroundColor="$bgCard"
                borderRadius={8}
                width={36}
                height={36}
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.7 }}
              >
                <Text color="$textPrimary" fontSize={18}>
                  +
                </Text>
              </Stack>
            </XStack>
          </YStack>
        </XStack>

        <XStack gap={16} alignItems="center">
          <Stack width={18} />
          <YStack flex={1} gap={4}>
            <Text fontSize={12} color="$textMuted">
              Linhas: {rows}
            </Text>
            <XStack alignItems="center" gap={8}>
              <Stack
                onPress={() => setRows(Math.max(5, rows - 1))}
                backgroundColor="$bgCard"
                borderRadius={8}
                width={36}
                height={36}
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.7 }}
              >
                <Text color="$textPrimary" fontSize={18}>
                  −
                </Text>
              </Stack>
              <Stack flex={1} height={4} borderRadius={2} backgroundColor="$border">
                <Stack
                  height={4}
                  borderRadius={2}
                  backgroundColor="#7C5BF1"
                  width={`${((rows - 5) / 95) * 100}%`}
                />
              </Stack>
              <Stack
                onPress={() => setRows(Math.min(100, rows + 1))}
                backgroundColor="$bgCard"
                borderRadius={8}
                width={36}
                height={36}
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.7 }}
              >
                <Text color="$textPrimary" fontSize={18}>
                  +
                </Text>
              </Stack>
            </XStack>
          </YStack>
        </XStack>

        {/* Opacity */}
        <XStack gap={16} alignItems="center">
          <Stack width={18} />
          <YStack flex={1} gap={4}>
            <Text fontSize={12} color="$textMuted">
              Opacidade da grade: {opacity}%
            </Text>
            <XStack alignItems="center" gap={8}>
              <Stack
                onPress={() => setOpacity(Math.max(10, opacity - 10))}
                backgroundColor="$bgCard"
                borderRadius={8}
                width={36}
                height={36}
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.7 }}
              >
                <Text color="$textPrimary" fontSize={18}>
                  −
                </Text>
              </Stack>
              <Stack flex={1} height={4} borderRadius={2} backgroundColor="$border">
                <Stack
                  height={4}
                  borderRadius={2}
                  backgroundColor="#7C5BF1"
                  width={`${opacity}%`}
                />
              </Stack>
              <Stack
                onPress={() => setOpacity(Math.min(100, opacity + 10))}
                backgroundColor="$bgCard"
                borderRadius={8}
                width={36}
                height={36}
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.7 }}
              >
                <Text color="$textPrimary" fontSize={18}>
                  +
                </Text>
              </Stack>
            </XStack>
          </YStack>
        </XStack>
      </YStack>

      {/* Confirm button */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingHorizontal={24}
        paddingBottom={40}
        paddingTop={16}
        backgroundColor="$bg"
        borderTopWidth={1}
        borderTopColor="$border"
      >
        <Button variant="primary" size="lg" onPress={handleConfirm}>
          Confirmar Grade
        </Button>
      </YStack>
    </YStack>
  );
}
