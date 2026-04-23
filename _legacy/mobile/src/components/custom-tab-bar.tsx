import type { LucideIcon } from "lucide-react-native";
import { Compass, Castle, Plus, Shield, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, Text, XStack } from "tamagui";

interface TabDef {
  name: string;
  label: string;
  icon: LucideIcon;
  isCenter?: boolean;
}

const TAB_CONFIG: TabDef[] = [
  { name: "explore", label: "Explorar", icon: Compass },
  { name: "campaigns", label: "Campanhas", icon: Castle },
  { name: "create", label: "", icon: Plus, isCenter: true },
  { name: "characters", label: "Heróis", icon: Shield },
  { name: "profile", label: "Perfil", icon: User },
];

interface CustomTabBarProps {
  state: { index: number; routes: { name: string; key: string }[] };
  navigation: { navigate: (name: string) => void };
  onCreatePress?: () => void;
}

export function CustomTabBar({
  state,
  navigation,
  onCreatePress,
}: CustomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <XStack
      borderTopWidth={1}
      borderTopColor="$border"
      backgroundColor="$bg"
      paddingBottom={Math.max(insets.bottom, 8)}
      paddingTop={8}
      alignItems="flex-end"
    >
      {TAB_CONFIG.map((tab, index) => {
        const isActive = state.index === index;
        const Icon = tab.icon;

        if (tab.isCenter) {
          return (
            <Stack
              key={tab.name}
              flex={1}
              alignItems="center"
              onPress={() => {
                if (onCreatePress) {
                  onCreatePress();
                }
              }}
            >
              <Stack
                height={52}
                width={52}
                borderRadius={16}
                backgroundColor="$accent"
                alignItems="center"
                justifyContent="center"
                marginTop={-16}
                shadowColor="rgba(108, 92, 231, 0.4)"
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={1}
                shadowRadius={16}
              >
                <Icon size={26} color="white" strokeWidth={2.5} />
              </Stack>
            </Stack>
          );
        }

        return (
          <Stack
            key={tab.name}
            flex={1}
            alignItems="center"
            gap={4}
            onPress={() => {
              if (!isActive) {
                navigation.navigate(tab.name);
              }
            }}
          >
            <Icon
              size={22}
              color={isActive ? "#6C5CE7" : "#5A5A6E"}
              strokeWidth={isActive ? 2.5 : 1.8}
            />
            <Text
              fontSize={10}
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
