import { Stack, Text, XStack } from "tamagui";
import { SessionStatus } from "@questboard/shared";
import type { Session } from "@questboard/shared";
import { Card } from "./card";

const SYSTEM_LABELS: Record<string, string> = {
  dnd5e: "D&D 5e",
  tormenta20: "Tormenta20",
  coc7: "Call of Cthulhu 7e",
  generic: "Generico",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  [SessionStatus.IDLE]: { label: "Aguardando", color: "$textMuted" },
  [SessionStatus.LIVE]: { label: "Ao vivo", color: "$success" },
  [SessionStatus.PAUSED]: { label: "Pausada", color: "$warning" },
  [SessionStatus.ENDED]: { label: "Encerrada", color: "$danger" },
};

interface SessionCardProps {
  session: Session;
  onPress?: () => void;
}

export function SessionCard({ session, onPress }: SessionCardProps) {
  const status =
    statusConfig[session.status] ?? statusConfig[SessionStatus.IDLE];
  const systemLabel = SYSTEM_LABELS[session.system] ?? session.system;

  return (
    <Stack onPress={onPress} pressStyle={{ opacity: 0.8 }}>
      <Card marginBottom={12}>
        <XStack alignItems="center" justifyContent="space-between">
          <Text
            flex={1}
            fontSize={16}
            fontWeight="600"
            color="$textPrimary"
            numberOfLines={1}
          >
            {session.name}
          </Text>
          <XStack alignItems="center" gap={6}>
            <Stack
              height={8}
              width={8}
              borderRadius={9999}
              backgroundColor={status.color}
            />
            <Text fontSize={12} color="$textMuted">
              {status.label}
            </Text>
          </XStack>
        </XStack>

        <XStack marginTop={8} alignItems="center" gap={12}>
          <Text fontSize={14} color="$textSecondary">
            {systemLabel}
          </Text>
          <Text fontSize={14} color="$textMuted">
            {session.maxPlayers} jogadores max
          </Text>
        </XStack>

        {session.tags.length > 0 && (
          <XStack marginTop={8} flexWrap="wrap" gap={4}>
            {session.tags.slice(0, 3).map((tag) => (
              <Stack
                key={tag}
                borderRadius={6}
                borderWidth={1}
                borderColor="$border"
                paddingHorizontal={8}
                paddingVertical={2}
              >
                <Text fontSize={12} color="$textMuted">
                  {tag}
                </Text>
              </Stack>
            ))}
          </XStack>
        )}
      </Card>
    </Stack>
  );
}
