import { memo } from "react";
import { ScrollView } from "react-native";
import { Stack, Text } from "tamagui";

interface SheetTabsProps<T extends string> {
  tabs: readonly T[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

function SheetTabsInner<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: SheetTabsProps<T>) {
  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 6,
          gap: 4,
        }}
      >
        {tabs.map((tab) => (
          <Stack
            key={tab}
            paddingHorizontal={10}
            paddingVertical={4}
            borderRadius={6}
            backgroundColor={activeTab === tab ? "#6C5CE7" : "transparent"}
            pressStyle={{ opacity: 0.7 }}
            onPress={() => onTabChange(tab)}
          >
            <Text
              fontSize={12}
              fontWeight="600"
              color={activeTab === tab ? "white" : "#5A5A6E"}
            >
              {tab}
            </Text>
          </Stack>
        ))}
      </ScrollView>
      {/* Separator */}
      <Stack height={1} backgroundColor="#1E1E2A" />
    </>
  );
}

export const SheetTabs = memo(SheetTabsInner) as typeof SheetTabsInner;
