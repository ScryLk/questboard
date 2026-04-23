import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, X, Search as SearchIcon, Sparkles, Users } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useCharacterCreationStore } from "../../../../lib/character-creation-store";
import { GAME_SYSTEMS, type GameSystem } from "../../../../lib/mock-data";

function SystemCard({
  system,
  onPress,
  featured,
}: {
  system: GameSystem;
  onPress: () => void;
  featured?: boolean;
}) {
  const Icon = system.icon;

  return (
    <Stack
      flex={featured ? undefined : 1}
      width={featured ? "100%" : undefined}
      height={featured ? 160 : 110}
      borderRadius={16}
      backgroundColor="$bgCard"
      borderWidth={1}
      borderColor="$border"
      overflow="hidden"
      onPress={onPress}
      pressStyle={{ opacity: 0.85, scale: 0.98 }}
    >
      {/* Background accent glow */}
      <Stack
        position="absolute"
        top={-30}
        right={-30}
        height={120}
        width={120}
        borderRadius={9999}
        backgroundColor={system.accentColor}
        opacity={0.08}
      />

      <YStack flex={1} padding={16} justifyContent="space-between">
        {/* Top row: icon + badge */}
        <XStack justifyContent="space-between" alignItems="flex-start">
          <Stack
            height={featured ? 48 : 40}
            width={featured ? 48 : 40}
            borderRadius={12}
            backgroundColor={`${system.accentColor}20`}
            alignItems="center"
            justifyContent="center"
          >
            <Icon
              size={featured ? 24 : 20}
              color={system.accentColor}
            />
          </Stack>

          {system.badge === "guided" && (
            <XStack
              backgroundColor="#F9CA2420"
              borderRadius={9999}
              paddingHorizontal={8}
              paddingVertical={3}
              alignItems="center"
              gap={4}
            >
              <Sparkles size={10} color="#F9CA24" />
              <Text fontSize={10} fontWeight="600" color="#F9CA24">
                {system.badgeLabel}
              </Text>
            </XStack>
          )}
          {system.badge === "template" && (
            <Stack
              backgroundColor="$border"
              borderRadius={9999}
              paddingHorizontal={8}
              paddingVertical={3}
            >
              <Text fontSize={10} fontWeight="500" color="$textMuted">
                {system.badgeLabel}
              </Text>
            </Stack>
          )}
          {system.badge === "creator" && (
            <Stack
              backgroundColor="$border"
              borderRadius={9999}
              paddingHorizontal={8}
              paddingVertical={3}
            >
              <Text fontSize={10} fontWeight="500" color="$textMuted">
                {system.badgeLabel}
              </Text>
            </Stack>
          )}
        </XStack>

        {/* Bottom: name, tagline, count */}
        <YStack gap={2}>
          <Text
            fontSize={featured ? 18 : 14}
            fontWeight="700"
            color="$textPrimary"
            numberOfLines={1}
          >
            {system.name}
          </Text>
          <Text
            fontSize={featured ? 13 : 11}
            color="$textMuted"
            numberOfLines={1}
          >
            {system.tagline}
          </Text>
          {system.characterCount ? (
            <XStack alignItems="center" gap={4} marginTop={featured ? 4 : 2}>
              <Users size={10} color="#5A5A6E" />
              <Text fontSize={11} color="$textMuted">
                {system.characterCount}
              </Text>
            </XStack>
          ) : null}
        </YStack>
      </YStack>
    </Stack>
  );
}

export default function SystemSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const { reset, setSystem } = useCharacterCreationStore();

  useEffect(() => {
    reset();
  }, [reset]);

  const filtered = GAME_SYSTEMS.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );
  const featured = filtered.filter((s) => s.featured);
  const others = filtered.filter((s) => !s.featured);

  function handleSelect(system: GameSystem) {
    setSystem(system.id);
    router.push(`/(app)/characters/create/${system.id}/identity`);
  }

  function handleClose() {
    reset();
    router.back();
  }

  return (
    <YStack flex={1} backgroundColor="$bg">
      {/* Header */}
      <YStack paddingTop={insets.top} backgroundColor="$bg">
        <XStack
          height={52}
          alignItems="center"
          paddingHorizontal={16}
          justifyContent="space-between"
        >
          <Stack
            onPress={() => router.back()}
            padding={8}
            hitSlop={8}
            pressStyle={{ opacity: 0.6 }}
          >
            <ArrowLeft size={22} color="#E8E8ED" />
          </Stack>

          <Text fontSize={16} fontWeight="600" color="$textPrimary">
            Novo Personagem
          </Text>

          <Stack
            onPress={handleClose}
            padding={8}
            hitSlop={8}
            pressStyle={{ opacity: 0.6 }}
          >
            <X size={22} color="#5A5A6E" />
          </Stack>
        </XStack>

        <Text
          fontSize={13}
          color="$textMuted"
          paddingHorizontal={24}
          paddingBottom={12}
        >
          Escolha o sistema de RPG
        </Text>
      </YStack>

      {/* Search */}
      <XStack
        marginHorizontal={16}
        marginBottom={16}
        height={44}
        borderRadius={12}
        backgroundColor="$bgCard"
        borderWidth={1}
        borderColor="$border"
        alignItems="center"
        paddingHorizontal={14}
        gap={10}
      >
        <SearchIcon size={16} color="#5A5A6E" />
        <Stack flex={1}>
          <Text
            fontSize={14}
            color={search ? "$textPrimary" : "$textMuted"}
            onPress={() => {
              // In a real app, focus the input
            }}
          >
            {search || "Buscar sistema..."}
          </Text>
        </Stack>
      </XStack>

      {/* Content */}
      <FlatList
        data={[{ type: "featured" as const }, { type: "others" as const }]}
        keyExtractor={(item) => item.type}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        renderItem={({ item }) => {
          if (item.type === "featured") {
            return (
              <YStack gap={12} marginBottom={24}>
                {featured.map((system) => (
                  <SystemCard
                    key={system.id}
                    system={system}
                    featured
                    onPress={() => handleSelect(system)}
                  />
                ))}
              </YStack>
            );
          }

          if (others.length === 0) return null;

          return (
            <YStack>
              <Text
                fontSize={12}
                fontWeight="600"
                color="$textMuted"
                textTransform="uppercase"
                letterSpacing={1}
                marginBottom={12}
              >
                Mais sistemas
              </Text>
              <XStack flexWrap="wrap" gap={12}>
                {others.map((system) => (
                  <Stack key={system.id} width="47%">
                    <SystemCard
                      system={system}
                      onPress={() => handleSelect(system)}
                    />
                  </Stack>
                ))}
              </XStack>
            </YStack>
          );
        }}
      />
    </YStack>
  );
}
