import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Castle, Gamepad2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";
import { SegmentedControl } from "../../../components/segmented-control";
import { SessionListItem } from "../../../components/session-list-item";
import { EmptyState } from "../../../components/empty-state";
import {
  MY_SESSIONS_GM,
  MY_SESSIONS_PLAYER,
  SYSTEM_LABELS,
  type UserSession,
} from "../../../lib/mock-data";

const SEGMENTS = [
  { key: "gm", label: "Minhas Mesas" },
  { key: "player", label: "Jogando" },
];

export default function SessionsScreen() {
  const router = useRouter();
  const [activeSegment, setActiveSegment] = useState("gm");

  const sessions = activeSegment === "gm" ? MY_SESSIONS_GM : MY_SESSIONS_PLAYER;

  const renderSession = useCallback(
    ({ item }: { item: UserSession }) => (
      <YStack>
        <SessionListItem
          session={item}
          onPress={() =>
            router.push(`/(app)/sessions/${item.id}/gameplay`)
          }
        />
        {item.nextSchedule && (
          <XStack
            marginHorizontal={16}
            marginTop={-4}
            marginBottom={8}
            paddingHorizontal={12}
            alignItems="center"
            justifyContent="space-between"
          >
            <Text fontSize={12} color="$textMuted">
              Próxima: {item.nextSchedule}
            </Text>
            <Text fontSize={12} color="$accent">
              {SYSTEM_LABELS[item.system]} · Sessão #{item.sessionNumber}
            </Text>
          </XStack>
        )}
      </YStack>
    ),
    [],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
      <YStack paddingHorizontal={20} paddingTop={16} paddingBottom={12}>
        <Text fontSize={24} fontWeight="700" color="$textPrimary">
          Sessões
        </Text>
      </YStack>

      <SegmentedControl
        segments={SEGMENTS}
        activeKey={activeSegment}
        onChange={setActiveSegment}
      />

      {sessions.length > 0 ? (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          icon={activeSegment === "gm" ? <Castle size={28} color="#6C5CE7" /> : <Gamepad2 size={28} color="#6C5CE7" />}
          title={activeSegment === "gm" ? "Nenhuma mesa criada" : "Nenhuma sessão como jogador"}
          message={
            activeSegment === "gm"
              ? "Crie sua primeira mesa e convide jogadores."
              : "Entre em uma sessão com um código de convite."
          }
          actionLabel={activeSegment === "gm" ? "Criar sessão" : "Entrar com código"}
        />
      )}
    </SafeAreaView>
  );
}
