import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Plus, LayoutTemplate } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, YStack } from "tamagui";
import { SegmentedControl } from "../../../components/segmented-control";
import { CharacterCard } from "../../../components/character-card";
import { EmptyState } from "../../../components/empty-state";
import { MY_CHARACTERS, type MockCharacter } from "../../../lib/mock-data";

const SEGMENTS = [
  { key: "mine", label: "Meus Personagens" },
  { key: "templates", label: "Templates" },
];

// CTA placeholder item to render "create" card
const CREATE_PLACEHOLDER = { id: "__create__" } as MockCharacter;

export default function CharactersScreen() {
  const router = useRouter();
  const [activeSegment, setActiveSegment] = useState("mine");

  const data = activeSegment === "mine" ? [...MY_CHARACTERS, CREATE_PLACEHOLDER] : [];

  const renderItem = useCallback(
    ({ item }: { item: MockCharacter }) => {
      if (item.id === "__create__") {
        return (
          <Stack flex={1} padding={6} maxWidth="50%">
            <YStack
              height={200}
              borderRadius={14}
              borderWidth={2}
              borderColor="$border"
              borderStyle="dashed"
              alignItems="center"
              justifyContent="center"
              gap={8}
              onPress={() => router.push("/(app)/characters/create")}
            >
              <Plus size={32} color="#5A5A6E" />
              <Text fontSize={12} color="$textMuted">
                Criar personagem
              </Text>
            </YStack>
          </Stack>
        );
      }
      return <CharacterCard character={item} />;
    },
    [],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
      <YStack paddingHorizontal={20} paddingTop={16} paddingBottom={12}>
        <Text fontSize={24} fontWeight="700" color="$textPrimary">
          Heróis
        </Text>
      </YStack>

      <SegmentedControl
        segments={SEGMENTS}
        activeKey={activeSegment}
        onChange={setActiveSegment}
      />

      {data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          icon={<LayoutTemplate size={28} color="#6C5CE7" />}
          title="Templates em breve"
          message="Templates prontos de personagens estarão disponíveis em breve."
        />
      )}
    </SafeAreaView>
  );
}
