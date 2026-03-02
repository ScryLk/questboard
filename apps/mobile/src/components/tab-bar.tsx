import { Stack, Text, XStack } from "tamagui";

export type TabId = "novidades" | "sessoes" | "forum";

const TABS: { id: TabId; label: string }[] = [
  { id: "novidades", label: "Novidades" },
  { id: "sessoes", label: "Sessões" },
  { id: "forum", label: "Fórum" },
];

interface TabBarProps {
  active: TabId;
  onSelect: (id: TabId) => void;
}

export function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <XStack marginBottom={12} borderBottomWidth={1} borderBottomColor="$border">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <Stack
            key={tab.id}
            onPress={() => onSelect(tab.id)}
            flex={1}
            alignItems="center"
            paddingBottom={12}
            paddingTop={8}
          >
            <Text
              fontSize={14}
              fontWeight="600"
              color={isActive ? "$accent" : "$textMuted"}
            >
              {tab.label}
            </Text>
            {isActive && (
              <Stack
                position="absolute"
                bottom={0}
                height={2}
                width={48}
                borderRadius={9999}
                backgroundColor="$accent"
              />
            )}
          </Stack>
        );
      })}
    </XStack>
  );
}
