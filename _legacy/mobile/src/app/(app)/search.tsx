import { useCallback, useMemo, useRef } from "react";
import { FlatList, TextInput } from "react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack as RouteStack, useRouter } from "expo-router";
import {
  ArrowLeft,
  X,
  Map as MapIcon,
  User as UserIcon,
  StickyNote,
  CalendarDays,
  Search,
  Clock,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import type { SearchResultItem, SearchType } from "@questboard/shared";
import { useGlobalSearch } from "../../hooks/use-global-search";
import { useSearchStore } from "../../lib/search-store";
import { useActiveCampaignId } from "../../lib/active-campaign";

const TYPE_META: Record<SearchType, { label: string; Icon: LucideIcon }> = {
  map: { label: "Mapas", Icon: MapIcon },
  character: { label: "Personagens", Icon: UserIcon },
  note: { label: "Notas", Icon: StickyNote },
  session: { label: "Sessões", Icon: CalendarDays },
};

interface FlatRow {
  type: "header" | "item" | "recent" | "empty";
  key: string;
  label?: string;
  item?: SearchResultItem;
}

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const { campaignId } = useActiveCampaignId();
  const { query, setQuery, results, isLoading, error } = useGlobalSearch(campaignId);
  const recent = useSearchStore((s) => s.recent);
  const addRecent = useSearchStore((s) => s.addRecent);
  const clearRecent = useSearchStore((s) => s.clearRecent);

  const showingRecent = query.trim().length < 2;

  const rows = useMemo<FlatRow[]>(() => {
    const out: FlatRow[] = [];
    if (showingRecent) {
      if (recent.length === 0) {
        out.push({
          type: "empty",
          key: "empty-hint",
          label: "Digite pelo menos 2 caracteres para buscar.",
        });
      } else {
        out.push({ type: "header", key: "h-recent", label: "Buscas recentes" });
        for (const r of recent) {
          out.push({
            type: "recent",
            key: `recent:${r.type}:${r.id}`,
            item: {
              id: r.id,
              type: r.type,
              title: r.title,
              subtitle: r.subtitle,
              url: r.url,
              score: 0,
            },
          });
        }
      }
      return out;
    }
    if (!results) return out;
    const order: SearchType[] = ["map", "character", "note", "session"];
    for (const t of order) {
      const list = results.results[`${t}s` as const] as SearchResultItem[];
      if (!list || list.length === 0) continue;
      out.push({
        type: "header",
        key: `h-${t}`,
        label: `${TYPE_META[t].label} (${list.length})`,
      });
      for (const it of list) {
        out.push({ type: "item", key: `${it.type}:${it.id}`, item: it });
      }
    }
    return out;
  }, [recent, results, showingRecent]);

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      addRecent(item);
      router.back();
      router.push(item.url as never);
    },
    [addRecent, router],
  );

  const renderItem = ({ item }: { item: FlatRow }) => {
    if (item.type === "header") {
      return (
        <Text
          fontSize={11}
          fontWeight="700"
          color="$textMuted"
          paddingHorizontal={20}
          paddingTop={16}
          paddingBottom={6}
          textTransform="uppercase"
        >
          {item.label}
        </Text>
      );
    }
    if (item.type === "empty") {
      return (
        <YStack padding={32} alignItems="center" gap={6}>
          <Text fontSize={14} color="$textMuted" textAlign="center">
            {item.label}
          </Text>
        </YStack>
      );
    }
    const data = item.item!;
    const Meta = TYPE_META[data.type];
    const isRecent = item.type === "recent";
    return (
      <Stack
        paddingHorizontal={20}
        paddingVertical={12}
        pressStyle={{ backgroundColor: "$border" }}
        onPress={() => handleSelect(data)}
      >
        <XStack alignItems="center" gap={12}>
          <Stack
            height={36}
            width={36}
            borderRadius={10}
            backgroundColor="$accentMuted"
            alignItems="center"
            justifyContent="center"
          >
            {isRecent ? (
              <Clock size={18} color="#5A5A6E" />
            ) : (
              <Meta.Icon size={18} color="#6C5CE7" />
            )}
          </Stack>
          <YStack flex={1}>
            <Text
              fontSize={15}
              fontWeight="600"
              color="$textPrimary"
              numberOfLines={1}
            >
              {data.title}
            </Text>
            {data.subtitle && (
              <Text fontSize={12} color="$textMuted" numberOfLines={1}>
                {data.subtitle}
              </Text>
            )}
          </YStack>
          <Text fontSize={10} color="$textMuted" textTransform="uppercase">
            {Meta.label.slice(0, -1)}
          </Text>
        </XStack>
      </Stack>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0A0F" }} edges={["top"]}>
      <RouteStack.Screen options={{ headerShown: false }} />
      <XStack
        alignItems="center"
        gap={8}
        paddingHorizontal={12}
        paddingVertical={10}
        borderBottomWidth={1}
        borderBottomColor="$border"
      >
        <Stack
          padding={8}
          borderRadius={10}
          pressStyle={{ backgroundColor: "$border" }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#E1E1E8" />
        </Stack>
        <XStack
          flex={1}
          alignItems="center"
          gap={8}
          backgroundColor="$border"
          borderRadius={10}
          paddingHorizontal={12}
          paddingVertical={6}
        >
          <Search size={16} color="#5A5A6E" />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder="Buscar em mapas, personagens, notas..."
            placeholderTextColor="#5A5A6E"
            style={{ flex: 1, color: "#E1E1E8", fontSize: 14, paddingVertical: 4 }}
          />
          {query.length > 0 && (
            <Stack onPress={() => setQuery("")} padding={4}>
              <X size={16} color="#5A5A6E" />
            </Stack>
          )}
        </XStack>
      </XStack>

      {!campaignId && (
        <YStack padding={32} alignItems="center">
          <Text fontSize={14} color="$textMuted" textAlign="center">
            Selecione uma campanha para buscar.
          </Text>
        </YStack>
      )}

      {campaignId && error && (
        <YStack padding={20} alignItems="center">
          <Text fontSize={13} color="#FF5C7A" textAlign="center">
            {error}
          </Text>
        </YStack>
      )}

      {campaignId && isLoading && rows.length === 0 && (
        <YStack padding={20} alignItems="center">
          <Text fontSize={13} color="$textMuted">
            Buscando…
          </Text>
        </YStack>
      )}

      {campaignId && (
        <FlatList
          data={rows}
          keyExtractor={(r) => r.key}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
          ListEmptyComponent={
            !isLoading && !showingRecent && query.trim().length >= 2 ? (
              <YStack padding={32} alignItems="center">
                <Text fontSize={14} color="$textMuted" textAlign="center">
                  Nenhum resultado para {query}
                </Text>
              </YStack>
            ) : null
          }
          ListFooterComponent={
            showingRecent && recent.length > 0 ? (
              <Stack
                paddingHorizontal={20}
                paddingTop={12}
                onPress={clearRecent}
              >
                <Text fontSize={12} color="$textMuted" textAlign="right">
                  Limpar histórico
                </Text>
              </Stack>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
