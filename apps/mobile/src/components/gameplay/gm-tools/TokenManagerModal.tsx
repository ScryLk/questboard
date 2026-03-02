import { memo, useCallback, useMemo, useState } from "react";
import { StyleSheet, View, TextInput } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import {
  Plus,
  Search,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { SubModalSheet } from "./SubModalSheet";
import { FilterPills } from "./FilterPills";
import { TokenCreateForm } from "./TokenCreateForm";
import { TokenIcon } from "../token-icon";
import { useGameplayStore } from "../../../lib/gameplay-store";
import type { TokenState, TokenLayerFilter } from "../../../lib/gameplay-store";

const FILTER_OPTIONS: { key: TokenLayerFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "character", label: "Jogadores" },
  { key: "npc", label: "NPCs" },
  { key: "object", label: "Objetos" },
];

// ─── Token Row ────────────────────────────────────────────

const TokenRow = memo(function TokenRow({
  token,
  onToggleVisibility,
  onRemove,
  onPress,
}: {
  token: TokenState;
  onToggleVisibility: (id: string) => void;
  onRemove: (id: string) => void;
  onPress: (id: string) => void;
}) {
  const hpText = token.hp
    ? `HP ${token.hp.current}/${token.hp.max}`
    : null;

  const typeLabel =
    token.layer === "character" ? "Jogador" :
    token.hostility === "hostile" ? "NPC Hostil" :
    token.hostility === "friendly" ? "NPC Aliado" :
    token.hostility === "neutral" ? "NPC Neutro" :
    token.layer === "npc" ? "NPC" :
    "Objeto";

  const borderColor =
    token.layer === "character" ? token.color :
    token.hostility === "hostile" ? "#FF6B6B" :
    token.hostility === "friendly" ? "#00B894" :
    token.hostility === "neutral" ? "#FDCB6E" :
    token.color;

  return (
    <XStack
      height={64}
      paddingHorizontal={16}
      alignItems="center"
      gap={12}
      borderBottomWidth={1}
      borderBottomColor="#1E1E2A"
      pressStyle={{ backgroundColor: "rgba(108, 92, 231, 0.05)" }}
      onPress={() => onPress(token.id)}
    >
      {/* Token icon */}
      <Stack
        width={40}
        height={40}
        borderRadius={20}
        backgroundColor="#1A1A24"
        borderWidth={2}
        borderColor={borderColor}
        alignItems="center"
        justifyContent="center"
        opacity={token.visible ? 1 : 0.5}
      >
        <TokenIcon name={token.icon} size={18} color="#E8E8ED" />
      </Stack>

      {/* Info */}
      <YStack flex={1} gap={2}>
        <Text fontSize={14} fontWeight="600" color="#E8E8ED" numberOfLines={1}>
          {token.name}
        </Text>
        <Text fontSize={11} color="#5A5A6E" numberOfLines={1}>
          {typeLabel}
          {hpText ? ` · ${hpText}` : ""}
          {token.ac ? ` · CA ${token.ac}` : ""}
        </Text>
      </YStack>

      {/* Actions */}
      <XStack gap={4}>
        <Stack
          width={28}
          height={28}
          borderRadius={6}
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.6 }}
          onPress={() => onToggleVisibility(token.id)}
        >
          {token.visible ? (
            <Eye size={16} color="#9090A0" />
          ) : (
            <EyeOff size={16} color="#5A5A6E" />
          )}
        </Stack>
        <Stack
          width={28}
          height={28}
          borderRadius={6}
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.6 }}
          onPress={() => onRemove(token.id)}
        >
          <Trash2 size={16} color="#FF6B6B" />
        </Stack>
      </XStack>
    </XStack>
  );
});

// ─── Token Manager Modal ──────────────────────────────────

function TokenManagerModalInner({ isOpen }: { isOpen: boolean }) {
  const closeGMToolView = useGameplayStore((s) => s.closeGMToolView);
  const tokens = useGameplayStore((s) => s.tokens);
  const toggleTokenVisibility = useGameplayStore((s) => s.toggleTokenVisibility);
  const removeToken = useGameplayStore((s) => s.removeToken);
  const centerOnToken = useGameplayStore((s) => s.centerOnToken);

  const [mode, setMode] = useState<"list" | "create">("list");
  const [filter, setFilter] = useState<TokenLayerFilter>("all");
  const [search, setSearch] = useState("");

  const handleDismiss = useCallback(() => {
    useGameplayStore.setState({ activeGMToolView: null });
    setMode("list");
  }, []);

  const handleBack = useCallback(() => {
    if (mode === "create") {
      setMode("list");
    } else {
      closeGMToolView();
    }
  }, [mode, closeGMToolView]);

  const handleTokenPress = useCallback(
    (tokenId: string) => {
      centerOnToken(tokenId);
    },
    [centerOnToken],
  );

  const filteredTokens = useMemo(() => {
    let list = Object.values(tokens);
    if (filter !== "all") {
      list = list.filter((t) => t.layer === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    return list;
  }, [tokens, filter, search]);

  const title = mode === "create" ? "Criar Token" : "Gerenciar Tokens";

  const headerRight = mode === "list" ? (
    <Stack
      width={32}
      height={32}
      borderRadius={8}
      backgroundColor="rgba(108, 92, 231, 0.15)"
      alignItems="center"
      justifyContent="center"
      pressStyle={{ opacity: 0.7 }}
      onPress={() => setMode("create")}
    >
      <Plus size={18} color="#6C5CE7" />
    </Stack>
  ) : undefined;

  const renderItem = useCallback(
    ({ item }: { item: TokenState }) => (
      <TokenRow
        token={item}
        onToggleVisibility={toggleTokenVisibility}
        onRemove={removeToken}
        onPress={handleTokenPress}
      />
    ),
    [toggleTokenVisibility, removeToken, handleTokenPress],
  );

  const keyExtractor = useCallback((item: TokenState) => item.id, []);

  return (
    <SubModalSheet
      isOpen={isOpen}
      snapPoints={["45%", "88%"]}
      title={title}
      onBack={handleBack}
      onDismiss={handleDismiss}
      headerRight={headerRight}
      useFlatList={mode === "list"}
      footer={
        mode === "list" ? (
          <Stack
            height={40}
            borderRadius={10}
            backgroundColor="#6C5CE7"
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.85 }}
            onPress={() => setMode("create")}
          >
            <XStack alignItems="center" gap={6}>
              <Plus size={16} color="white" />
              <Text fontSize={13} fontWeight="600" color="white">
                Criar Novo Token
              </Text>
            </XStack>
          </Stack>
        ) : undefined
      }
    >
      {mode === "create" ? (
        <TokenCreateForm
          onCancel={() => setMode("list")}
          onCreated={() => setMode("list")}
        />
      ) : (
        <>
          {/* Search + Filter header */}
          <View style={styles.searchSection}>
            <Stack
              marginHorizontal={16}
              marginBottom={8}
              backgroundColor="#0F0F12"
              borderRadius={8}
              borderWidth={1}
              borderColor="#2A2A35"
              paddingHorizontal={10}
              paddingVertical={8}
            >
              <XStack alignItems="center" gap={8}>
                <Search size={16} color="#5A5A6E" />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Buscar token..."
                  placeholderTextColor="#5A5A6E"
                  style={styles.searchInput}
                />
              </XStack>
            </Stack>
            <View style={styles.filterRow}>
              <FilterPills
                options={FILTER_OPTIONS}
                selected={filter}
                onChange={setFilter}
              />
            </View>
          </View>

          {/* Token list */}
          <BottomSheetFlatList
            data={filteredTokens}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            style={styles.listFlex}
            nestedScrollEnabled={true}
            ListEmptyComponent={
              <YStack padding={24} alignItems="center">
                <Text fontSize={13} color="#5A5A6E">
                  Nenhum token encontrado
                </Text>
              </YStack>
            }
          />
        </>
      )}
    </SubModalSheet>
  );
}

export const TokenManagerModal = memo(TokenManagerModalInner);

const styles = StyleSheet.create({
  searchSection: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  searchInput: {
    flex: 1,
    color: "#E8E8ED",
    fontSize: 14,
    padding: 0,
  },
  filterRow: {
    paddingHorizontal: 16,
  },
  listFlex: {
    flex: 1,
  },
});
