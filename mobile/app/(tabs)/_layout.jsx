import { Tabs } from "expo-router";
import { Platform } from "react-native";

import { HapticTab } from "@/src/components";
import { IconSymbol } from "@/src/components";
import TabBarBackground from "@/src/components";
import { useTheme } from "@/src/context";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
            backgroundColor: theme.background,
          },
          default: {
            backgroundColor: theme.background,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Learn",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="school" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="sessions"
        options={{
          title: "Sessions",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="event" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
