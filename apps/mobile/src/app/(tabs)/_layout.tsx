import { Tabs } from "expo-router";
import { Text } from "react-native";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{label}</Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#16161C",
          borderTopColor: "#2A2A36",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: "#6C5CE7",
        tabBarInactiveTintColor: "#5A5A6E",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        headerStyle: { backgroundColor: "#16161C" },
        headerTintColor: "#E8E8ED",
        headerTitleStyle: { fontWeight: "bold" },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon label="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: "Sessões",
          tabBarIcon: ({ focused }) => <TabIcon label="🎲" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="characters"
        options={{
          title: "Personagens",
          tabBarIcon: ({ focused }) => <TabIcon label="🧙" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Amigos",
          tabBarIcon: ({ focused }) => <TabIcon label="👥" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => <TabIcon label="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
