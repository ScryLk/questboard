import { Stack, Text, XStack } from "tamagui";

export type ProfileTabId = "adventurer" | "posts" | "gm";

interface ProfileTabsProps {
  activeTab: ProfileTabId;
  onChangeTab: (tab: ProfileTabId) => void;
  showGMTab: boolean;
}

const TABS: { id: ProfileTabId; label: string }[] = [
  { id: "adventurer", label: "Aventureiro" },
  { id: "posts", label: "Posts" },
  { id: "gm", label: "Mestre" },
];

export function ProfileTabs({
  activeTab,
  onChangeTab,
  showGMTab,
}: ProfileTabsProps) {
  const visibleTabs = showGMTab ? TABS : TABS.filter((t) => t.id !== "gm");

  return (
    <XStack
      backgroundColor="#0F0F12"
      borderBottomWidth={1}
      borderBottomColor="rgba(255,255,255,0.06)"
      paddingHorizontal={24}
      gap={24}
    >
      {visibleTabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Stack
            key={tab.id}
            paddingVertical={14}
            borderBottomWidth={2}
            borderBottomColor={isActive ? "$accent" : "transparent"}
            onPress={() => onChangeTab(tab.id)}
            pressStyle={{ opacity: 0.6 }}
          >
            <Text
              fontSize={14}
              fontWeight="600"
              color={isActive ? "$accent" : "$textMuted"}
            >
              {tab.label}
            </Text>
          </Stack>
        );
      })}
    </XStack>
  );
}
