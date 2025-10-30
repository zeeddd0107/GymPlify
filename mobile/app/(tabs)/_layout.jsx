import { Tabs } from "expo-router";
import { Platform } from "react-native";

import { HapticTab } from "@/src/components";
import AntDesign from "@expo/vector-icons/AntDesign";
import TabBarBackground from "@/src/components";
import { useTheme } from "@/src/context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useDashboard } from "@/src/hooks";

export default function TabLayout() {
  const { theme } = useTheme();
  const { hasActiveSubscription } = useDashboard();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: hasActiveSubscription
          ? Platform.select({
              ios: {
                // Use a transparent background on iOS to show the blur effect
                position: "absolute",
                backgroundColor: theme.background,
              },
              default: {
                backgroundColor: theme.background,
              },
            })
          : { display: "none" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Entypo name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Guide",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="play-circle-outline" color={color} />
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
