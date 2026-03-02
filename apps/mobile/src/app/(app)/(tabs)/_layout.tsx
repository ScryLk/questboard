import { Tabs } from "expo-router";
import { CustomTabBar } from "../../../components/custom-tab-bar";
import { useCreateSheet } from "../../../lib/create-sheet-context";

export default function TabsLayout() {
  const { open } = useCreateSheet();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} onCreatePress={open} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="explore" options={{ title: "Explorar" }} />
      <Tabs.Screen name="sessions" options={{ title: "Sessões" }} />
      <Tabs.Screen name="create" options={{ title: "Criar" }} />
      <Tabs.Screen name="characters" options={{ title: "Heróis" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
